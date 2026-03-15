from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth.models import User

from .models import Experiment, Collaboration, Attachment, ChangeLog, SectionImage
from .serializers import (
    ExperimentSerializer,
    CollaborationSerializer,
    AttachmentSerializer,
    ChangeLogSerializer,
    SectionImageSerializer,
)
from .permissions import IsCollaboratorWithProperRole

from .models import Comment
from .serializers import CommentSerializer



class ExperimentViewSet(viewsets.ModelViewSet):
    serializer_class = ExperimentSerializer
    permission_classes = [permissions.IsAuthenticated, IsCollaboratorWithProperRole]

    def get_queryset(self):
        return Experiment.objects.filter(collaborators__user=self.request.user)

    def perform_create(self, serializer):
        experiment = serializer.save()
        Collaboration.objects.create(user=self.request.user, experiment=experiment, role='owner')

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)

        try:
            collaboration = Collaboration.objects.get(user=request.user, experiment=instance)
            role = collaboration.role
        except Collaboration.DoesNotExist:
            role = "viewer"

        data = serializer.data
        data["current_user_role"] = role
        return Response(data)

    def perform_update(self, serializer):
        experiment = self.get_object()
        old_data = {
            'name': experiment.name,
            'objective': experiment.objective,
            'procedure': experiment.procedure,
            'results': experiment.results,
            'tags': experiment.tags,
        }

        updated_experiment = serializer.save()

        for field, old_value in old_data.items():
            new_value = getattr(updated_experiment, field)
            if old_value != new_value:
                ChangeLog.objects.create(
                    experiment=experiment,
                    field_name=field,
                    old_value=old_value,
                    new_value=new_value,
                    edited_by=self.request.user
                )

class SectionImageView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request, pk):
        """Get all section images for an experiment"""
        try:
            experiment = Experiment.objects.get(id=pk)
        except Experiment.DoesNotExist:
            return Response({"detail": "Experiment not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check if user is a collaborator
        if not Collaboration.objects.filter(user=request.user, experiment=experiment).exists():
            return Response({"detail": "Not a collaborator."}, status=status.HTTP_403_FORBIDDEN)

        images = SectionImage.objects.filter(experiment=experiment).order_by('section', 'uploaded_at')
        serializer = SectionImageSerializer(images, many=True)
        return Response(serializer.data)

    def post(self, request, pk):
        try:
            experiment = Experiment.objects.get(id=pk)
        except Experiment.DoesNotExist:
            return Response({"detail": "Experiment not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check if user has edit permissions
        try:
            collaboration = Collaboration.objects.get(user=request.user, experiment=experiment)
            if collaboration.role not in ['owner', 'editor']:
                return Response({"detail": "Only owners and editors can add images."}, 
                              status=status.HTTP_403_FORBIDDEN)
        except Collaboration.DoesNotExist:
            return Response({"detail": "Not a collaborator."}, status=status.HTTP_403_FORBIDDEN)

        section = request.data.get('section')
        image = request.FILES.get('image')
        description = request.data.get('description', '')

        if not section or section not in ['objective', 'procedure', 'results']:
            return Response({"detail": "Valid section is required."}, 
                          status=status.HTTP_400_BAD_REQUEST)

        if not image:
            return Response({"detail": "Image is required."}, 
                          status=status.HTTP_400_BAD_REQUEST)

        section_image = SectionImage.objects.create(
            experiment=experiment,
            section=section,
            image=image,
            description=description,
            uploaded_by=request.user
        )

        serializer = SectionImageSerializer(section_image)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def delete(self, request, pk, image_id):
        try:
            experiment = Experiment.objects.get(id=pk)
            section_image = SectionImage.objects.get(id=image_id, experiment=experiment)
        except (Experiment.DoesNotExist, SectionImage.DoesNotExist):
            return Response({"detail": "Image not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check if user has edit permissions
        try:
            collaboration = Collaboration.objects.get(user=request.user, experiment=experiment)
            if collaboration.role not in ['owner', 'editor']:
                return Response({"detail": "Only owners and editors can delete images."}, 
                              status=status.HTTP_403_FORBIDDEN)
        except Collaboration.DoesNotExist:
            return Response({"detail": "Not a collaborator."}, status=status.HTTP_403_FORBIDDEN)

        section_image.delete()
        return Response({"detail": "Image deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

class AddCollaboratorView(APIView):
    def post(self, request, pk):
        try:
            experiment = Experiment.objects.get(id=pk)
        except Experiment.DoesNotExist:
            return Response({"detail": "Experiment not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check if current user is owner
        if not Collaboration.objects.filter(user=request.user, experiment=experiment, role='owner').exists():
            return Response({"detail": "Only owners can add collaborators."}, status=status.HTTP_403_FORBIDDEN)

        email = request.data.get("email")
        role = request.data.get("role", "viewer")

        if not email:
            return Response({"detail": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Find user by email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"detail": f"No user found with email: {email}"}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if already a collaborator
        if Collaboration.objects.filter(user=user, experiment=experiment).exists():
            return Response(
                {"detail": "User is already a collaborator on this experiment."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create collaboration
        collaboration = Collaboration.objects.create(
            user=user, 
            experiment=experiment, 
            role=role
        )
        
        serializer = CollaborationSerializer(collaboration)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UploadAttachmentView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            experiment = Experiment.objects.get(id=pk)
        except Experiment.DoesNotExist:
            return Response({"detail": "Experiment not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            collaboration = Collaboration.objects.get(user=request.user, experiment=experiment)
            if collaboration.role not in ['owner', 'editor']:
                return Response({"detail": "No permission to upload."}, status=status.HTTP_403_FORBIDDEN)
        except Collaboration.DoesNotExist:
            return Response({"detail": "Not a collaborator."}, status=status.HTTP_403_FORBIDDEN)

        image = request.FILES.get('image')
        if not image:
            return Response({"detail": "Image is required."}, status=status.HTTP_400_BAD_REQUEST)

        attachment = Attachment.objects.create(experiment=experiment, image=image)
        serializer = AttachmentSerializer(attachment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class RemoveCollaboratorView(APIView):
    def delete(self, request, pk, user_id):
        try:
            experiment = Experiment.objects.get(id=pk)
        except Experiment.DoesNotExist:
            return Response({"detail": "Experiment not found."}, status=status.HTTP_404_NOT_FOUND)

        if not Collaboration.objects.filter(user=request.user, experiment=experiment, role='owner').exists():
            return Response({"detail": "Only owners can remove collaborators."}, status=status.HTTP_403_FORBIDDEN)

        if request.user.id == user_id:
            return Response({"detail": "You cannot remove yourself."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            collaboration = Collaboration.objects.get(user_id=user_id, experiment=experiment)
            collaboration.delete()
            return Response({"detail": "Collaborator removed."}, status=status.HTTP_204_NO_CONTENT)
        except Collaboration.DoesNotExist:
            return Response({"detail": "Collaborator not found."}, status=status.HTTP_404_NOT_FOUND)


class ChangeLogView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            experiment = Experiment.objects.get(id=pk)
        except Experiment.DoesNotExist:
            return Response({"detail": "Experiment not found."}, status=status.HTTP_404_NOT_FOUND)

        # Only collaborators can view change logs
        if not Collaboration.objects.filter(user=request.user, experiment=experiment).exists():
            return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

        logs = ChangeLog.objects.filter(experiment=experiment).order_by('-timestamp')  # newest first
        serializer = ChangeLogSerializer(logs, many=True)
        return Response(serializer.data)


class CommentListCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        experiment = Experiment.objects.get(pk=pk)
        if not Collaboration.objects.filter(user=request.user, experiment=experiment).exists():
            return Response({"detail": "Not a collaborator."}, status=403)
        
        comments = Comment.objects.filter(experiment=experiment)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    def post(self, request, pk):
        experiment = Experiment.objects.get(pk=pk)
        if not Collaboration.objects.filter(user=request.user, experiment=experiment).exists():
            return Response({"detail": "Not a collaborator."}, status=403)
        
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, experiment=experiment)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
class CommentDetailAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk, comment_id):
        try:
            experiment = Experiment.objects.get(pk=pk)
            comment = Comment.objects.get(id=comment_id, experiment=experiment)
            
            # Check if user owns the comment
            if comment.user != request.user:
                return Response({"detail": "You can only edit your own comments."}, 
                              status=status.HTTP_403_FORBIDDEN)
            
            # Check if user is collaborator
            if not Collaboration.objects.filter(user=request.user, experiment=experiment).exists():
                return Response({"detail": "Not a collaborator."}, 
                              status=status.HTTP_403_FORBIDDEN)
            
            serializer = CommentSerializer(comment, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except (Experiment.DoesNotExist, Comment.DoesNotExist):
            return Response({"detail": "Comment not found."}, 
                          status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk, comment_id):
        try:
            experiment = Experiment.objects.get(pk=pk)
            comment = Comment.objects.get(id=comment_id, experiment=experiment)
            
            # Check if user owns the comment
            if comment.user != request.user:
                return Response({"detail": "You can only delete your own comments."}, 
                              status=status.HTTP_403_FORBIDDEN)
            
            # Check if user is collaborator
            if not Collaboration.objects.filter(user=request.user, experiment=experiment).exists():
                return Response({"detail": "Not a collaborator."}, 
                              status=status.HTTP_403_FORBIDDEN)
            
            comment.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except (Experiment.DoesNotExist, Comment.DoesNotExist):
            return Response({"detail": "Comment not found."}, 
                          status=status.HTTP_404_NOT_FOUND)