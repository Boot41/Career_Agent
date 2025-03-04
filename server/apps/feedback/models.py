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
