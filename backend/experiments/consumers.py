import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import Experiment, Collaboration, Comment, ActiveCollaborator
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

class ExperimentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.experiment_id = self.scope['url_route']['kwargs']['experiment_id']
        self.room_group_name = f'experiment_{self.experiment_id}'
        
        logger.info(f"WebSocket connection attempt for experiment {self.experiment_id}")
        
        # Get token from query string
        query_string = self.scope['query_string'].decode()
        token = None
        for param in query_string.split('&'):
            if param.startswith('token='):
                token = param[6:]
                break
        
        if not token:
            logger.error("No token provided")
            await self.close(code=4001)
            return
        
        # Authenticate user
        self.user = await self.get_user_from_token(token)
        
        if not self.user or self.user.is_anonymous:
            logger.error("Authentication failed")
            await self.close(code=4002)
            return
        
        logger.info(f"User authenticated: {self.user.username}")
        
        # Check if user is collaborator
        is_collab = await self.is_collaborator()
        if not is_collab:
            logger.error(f"User {self.user.username} is not a collaborator")
            await self.close(code=4003)
            return
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        # Add to active collaborators
        await self.add_to_active_collaborators()
        
        # Accept the connection
        await self.accept()
        logger.info(f"WebSocket connection accepted for {self.user.username}")
        
        # Send current active collaborators
        await self.send_active_collaborators()
        
        # Broadcast user joined
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'collaborator_joined',
                'user_id': self.user.id,
                'username': self.user.username,
                'email': self.user.email
            }
        )

    async def disconnect(self, close_code):
        logger.info(f"WebSocket disconnected with code: {close_code}")
        
        if hasattr(self, 'user') and self.user and not self.user.is_anonymous:
            # Remove from active collaborators
            await self.remove_from_active_collaborators()
            
            # Broadcast user left
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'collaborator_left',
                    'user_id': self.user.id,
                    'username': self.user.username
                }
            )
        
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            logger.info(f"Received message type: {message_type}")
            
            if message_type == 'new_comment':
                comment = await self.save_comment(data['content'])
                if comment:
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'new_comment',
                            'comment': comment
                        }
                    )
            
            elif message_type == 'typing':
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'user_typing',
                        'user_id': self.user.id,
                        'username': self.user.username,
                        'is_typing': data['is_typing']
                    }
                )
            
            elif message_type == 'presence_ping':
                await self.update_presence()
                await self.send(text_data=json.dumps({
                    'type': 'presence_pong'
                }))
                
        except json.JSONDecodeError:
            logger.error("Invalid JSON received")
        except Exception as e:
            logger.error(f"Error in receive: {str(e)}")

    # Message handlers
    async def new_comment(self, event):
        await self.send(text_data=json.dumps({
            'type': 'new_comment',
            'comment': event['comment']
        }))

    async def user_typing(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_typing',
            'user_id': event['user_id'],
            'username': event['username'],
            'is_typing': event['is_typing']
        }))

    async def collaborator_joined(self, event):
        await self.send(text_data=json.dumps({
            'type': 'collaborator_joined',
            'user_id': event['user_id'],
            'username': event['username'],
            'email': event['email']
        }))

    async def collaborator_left(self, event):
        await self.send(text_data=json.dumps({
            'type': 'collaborator_left',
            'user_id': event['user_id'],
            'username': event['username']
        }))

    # Database helpers
    @database_sync_to_async
    def get_user_from_token(self, token):
        try:
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            return User.objects.get(id=user_id)
        except Exception as e:
            logger.error(f"Token authentication error: {str(e)}")
            return AnonymousUser()

    @database_sync_to_async
    def is_collaborator(self):
        try:
            experiment = Experiment.objects.get(id=self.experiment_id)
            return Collaboration.objects.filter(
                user=self.user, 
                experiment=experiment
            ).exists()
        except Experiment.DoesNotExist:
            logger.error(f"Experiment {self.experiment_id} not found")
            return False
        except Exception as e:
            logger.error(f"Error checking collaborator: {str(e)}")
            return False

    @database_sync_to_async
    def save_comment(self, content):
        try:
            experiment = Experiment.objects.get(id=self.experiment_id)
            comment = Comment.objects.create(
                experiment=experiment,
                user=self.user,
                content=content
            )
            
            # Get user role
            collaboration = Collaboration.objects.get(
                user=self.user, 
                experiment=experiment
            )
            
            return {
                'id': comment.id,
                'content': comment.content,
                'user': comment.user.username,
                'user_email': comment.user.email,
                'user_role': collaboration.role,
                'created_at': comment.created_at.isoformat()
            }
        except Exception as e:
            logger.error(f"Error saving comment: {str(e)}")
            return None

    @database_sync_to_async
    def add_to_active_collaborators(self):
        try:
            experiment = Experiment.objects.get(id=self.experiment_id)
            ActiveCollaborator.objects.update_or_create(
                experiment=experiment,
                user=self.user,
                defaults={'last_seen': timezone.now()}
            )
        except Exception as e:
            logger.error(f"Error adding to active collaborators: {str(e)}")

    @database_sync_to_async
    def remove_from_active_collaborators(self):
        try:
            ActiveCollaborator.objects.filter(
                experiment_id=self.experiment_id,
                user=self.user
            ).delete()
        except Exception as e:
            logger.error(f"Error removing from active collaborators: {str(e)}")

    @database_sync_to_async
    def update_presence(self):
        try:
            ActiveCollaborator.objects.filter(
                experiment_id=self.experiment_id,
                user=self.user
            ).update(last_seen=timezone.now())
        except Exception as e:
            logger.error(f"Error updating presence: {str(e)}")

    @database_sync_to_async
    def send_active_collaborators(self):
        try:
            active_users = ActiveCollaborator.objects.filter(
                experiment_id=self.experiment_id
            ).exclude(user=self.user).select_related('user')
            
            collaborators = []
            for active in active_users:
                collaborators.append({
                    'user_id': active.user.id,
                    'username': active.user.username,
                    'email': active.user.email,
                })
            
            if collaborators:
                self.send(text_data=json.dumps({
                    'type': 'active_collaborators',
                    'collaborators': collaborators
                }))
        except Exception as e:
            logger.error(f"Error sending active collaborators: {str(e)}")