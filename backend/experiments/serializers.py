from rest_framework import serializers
from .models import ChangeLog, Experiment, Collaboration, Attachment, SectionImage
from django.contrib.auth.models import User
from .models import Comment

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class CollaborationSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Collaboration
        fields = ['user_id', 'user_email', 'role']

class SectionImageSerializer(serializers.ModelSerializer):
    uploaded_by_email = serializers.EmailField(source='uploaded_by.email', read_only=True)
    
    class Meta:
        model = SectionImage
        fields = ['id', 'section', 'image', 'description', 'uploaded_at', 'uploaded_by_email']

class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ['id', 'image', 'uploaded_at']

class ChangeLogSerializer(serializers.ModelSerializer):
    edited_by = serializers.StringRelatedField()
    edited_by_role = serializers.SerializerMethodField()

    class Meta:
        model = ChangeLog
        fields = ['id', 'field_name', 'old_value', 'new_value', 'edited_by', 'edited_by_role', 'timestamp']

    def get_edited_by_role(self, obj):
        try:
            collab = Collaboration.objects.get(user=obj.edited_by, experiment=obj.experiment)
            return collab.role.capitalize()
        except Collaboration.DoesNotExist:
            return "Viewer"

class ExperimentSerializer(serializers.ModelSerializer):
    collaborators = CollaborationSerializer(many=True, read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)
    section_images = SectionImageSerializer(many=True, read_only=True)

    class Meta:
        model = Experiment
        fields = [
            'id', 'name', 'objective', 'procedure', 'results', 'tags',
            'created_at', 'updated_at', 'collaborators', 'attachments', 'section_images',
        ]

class CommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    user_role = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'user', 'content', 'created_at', 'user_role']
        read_only_fields = ['id', 'user', 'user_role', 'created_at']

    def get_user_role(self, obj):
        try:
            collaboration = Collaboration.objects.get(
                user=obj.user, 
                experiment=obj.experiment
            )
            return collaboration.role
        except Collaboration.DoesNotExist:
            return 'viewer'