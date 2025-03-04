from django.db import models
import uuid
from django.contrib.auth.hashers import make_password, check_password

class AuthUser(models.Model):
    ROLE_CHOICES = [
        ('HR', 'HR'),
        ('Manager', 'Manager'), 
        ('Employee', 'Employee')
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=150, unique=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    organization_id = models.UUIDField(null=True, blank=True)
    manager = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='team')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "auth_users"
        
    def __str__(self):
        return f"{self.name} ({self.get_role_display()})"
    
    def set_password(self, raw_password):
        """
        Hashes and sets the user's password
        """
        self.password = make_password(raw_password)
    
    def check_password(self, raw_password):
        """
        Checks if the provided password is correct
        """
        return check_password(raw_password, self.password)
