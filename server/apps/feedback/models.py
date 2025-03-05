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
    giver = models.IntegerField()  # ID of the feedback giver
    receiver = models.IntegerField()  # ID of the feedback receiver
    organization_id = models.IntegerField()  # Organization ID
    feedback_type = models.CharField(max_length=50)  # Type of feedback
    questions = models.JSONField()  # List of questions
    answers = models.JSONField(null=True)  # List of answers, initially null
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp when feedback is created

    def __str__(self):
        return f'Feedback from {self.giver} to {self.receiver}'

    @classmethod
    def create_feedback(cls, giver, receiver, organization_id, feedback_type, questions):
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
        feedback.save()
        return feedback
