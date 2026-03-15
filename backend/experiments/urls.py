from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ChangeLogView, 
    CommentListCreateAPIView, 
    ExperimentViewSet, 
    AddCollaboratorView, 
    RemoveCollaboratorView, 
    SectionImageView, 
    UploadAttachmentView,
    CommentDetailAPIView
)

router = DefaultRouter()
router.register('experiments', ExperimentViewSet, basename='experiment')

urlpatterns = [
    path('', include(router.urls)),
    path('experiments/<int:pk>/collaborators/', AddCollaboratorView.as_view(), name='add-collaborator'),
    path('experiments/<int:pk>/attachments/', UploadAttachmentView.as_view(), name='upload-attachment'),
    path('experiments/<int:pk>/collaborators/<int:user_id>/remove/', RemoveCollaboratorView.as_view(), name='remove-collaborator'),
    path('experiments/<int:pk>/changelog/', ChangeLogView.as_view(), name='experiment-changelog'),
    path('experiments/<int:pk>/change-logs/', ChangeLogView.as_view(), name='experiment-change-logs'),
    path('experiments/<int:pk>/comments/', CommentListCreateAPIView.as_view(), name='experiment-comments'),
    path('experiments/<int:pk>/comments/<int:comment_id>/', CommentDetailAPIView.as_view(), name='experiment-comment-detail'),
    path('experiments/<int:pk>/section-images/', SectionImageView.as_view(), name='section-images'),
    path('experiments/<int:pk>/section-images/<int:image_id>/', SectionImageView.as_view(), name='section-image-detail'),
]