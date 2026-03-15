import uuid
from django.db import models
from django.contrib.auth.models import User

class Experiment(models.Model):
    name = models.CharField(max_length=255)
    objective = models.TextField()
    procedure = models.TextField()
    results = models.TextField()
    tags = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class SectionImage(models.Model):
    SECTION_CHOICES = (
        ('objective', 'Objective'),
        ('procedure', 'Procedure'),
        ('results', 'Results'),
    )
    
    experiment = models.ForeignKey(Experiment, on_delete=models.CASCADE, related_name='section_images')
    section = models.CharField(max_length=20, choices=SECTION_CHOICES)
    image = models.ImageField(upload_to='section_images/')
    description = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        ordering = ['uploaded_at']

class Collaboration(models.Model):
    ROLE_CHOICES = (
        ('owner', 'Owner'),
        ('editor', 'Editor'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='collaborations')
    experiment = models.ForeignKey(Experiment, on_delete=models.CASCADE, related_name='collaborators')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)

    class Meta:
        unique_together = ('user', 'experiment')

class Attachment(models.Model):
    experiment = models.ForeignKey(Experiment, on_delete=models.CASCADE, related_name='attachments')
    image = models.ImageField(upload_to='attachments/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

class Version(models.Model):
    experiment = models.ForeignKey(
        Experiment, 
        on_delete=models.CASCADE,
        related_name='versions'  # or 'experiment_versions' (must be unique)
    )
    changes = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


class ChangeLog(models.Model):
    experiment = models.ForeignKey(
        Experiment,
        on_delete=models.CASCADE,
        related_name='change_logs'  # <-- use a unique related_name
    )
    field_name = models.CharField(max_length=100)
    old_value = models.TextField(blank=True, null=True)
    new_value = models.TextField(blank=True, null=True)
    edited_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)


class Comment(models.Model):
    experiment = models.ForeignKey('Experiment', on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

from django.utils import timezone

class ActiveCollaborator(models.Model):
    experiment = models.ForeignKey(Experiment, on_delete=models.CASCADE, related_name='active_collaborators')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    last_seen = models.DateTimeField(default=timezone.now)
    
    class Meta:
        unique_together = ('experiment', 'user')