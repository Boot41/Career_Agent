from django.db import models
import uuid
from apps.authentication.models import AuthUser
from apps.organizations.models import Organization

class ManagerEmployee(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    manager = models.ForeignKey(AuthUser, on_delete=models.CASCADE, related_name='managed_employees')
    employee = models.ForeignKey(AuthUser, on_delete=models.CASCADE, related_name='managers')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='manager_employee_relations')

    class Meta:
        db_table = "manager_employee"
        unique_together = ('manager', 'employee')


class Feedback(models.Model):
    """Model for storing feedback data."""
    FEEDBACK_TYPE_CHOICES = [
        ('Manager', 'Manager'),
        ('Peer', 'Peer'),
        ('Self', 'Self'),
    ]
    
    id = models.AutoField(primary_key=True)
    giver = models.CharField(max_length=100)
    receiver = models.CharField(max_length=100)
    organization_id = models.CharField(max_length=100)
    feedback_type = models.CharField(max_length=20, choices=FEEDBACK_TYPE_CHOICES)
    questions = models.JSONField()
    answers = models.JSONField(null=True, blank=True)
    is_submitted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f'Feedback from {self.giver} to {self.receiver}'

    @property
    def is_completed(self):
        """Check if feedback has been completed."""
        return self.is_submitted and self.answers is not None

    @classmethod
    def create_feedback(cls, giver, receiver, organization_id, feedback_type, questions):
        # Ensure all IDs are strings
        giver = str(giver)
        receiver = str(receiver)
        organization_id = str(organization_id)
        
        feedback = cls(giver=giver, receiver=receiver, organization_id=organization_id,
                      feedback_type=feedback_type, questions=questions)
        feedback.save()
        return feedback

    @classmethod
    def get_pending_feedback(cls, receiver):
        return cls.objects.filter(receiver=receiver, answers__isnull=True)

    @classmethod
    def submit_answers(cls, feedback_id, answers):
        feedback = cls.objects.get(id=feedback_id)
        feedback.answers = answers
        feedback.is_submitted = True
        feedback.save()
        return feedback
