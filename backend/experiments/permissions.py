from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsCollaboratorWithProperRole(BasePermission):
    def has_object_permission(self, request, view, obj):
        try:
            collab = obj.collaborators.get(user=request.user)
            if request.method in SAFE_METHODS: 
                return True 
            return collab.role in ['owner', 'editor'] 
        except:
            return False
