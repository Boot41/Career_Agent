import os
import django
import uuid
from datetime import datetime

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from apps.authentication.models import AuthUser
from apps.organizations.models import Organization
from apps.feedback.models import ManagerEmployee

def create_users():
    # 1️⃣ Create HR User First with NULL organization
    hr_user = AuthUser.objects.create(
        id=uuid.uuid4(),
        username="hr_admin",
        name="HR Admin",
        email="hr@example.com",
        role="HR",
        organization_id=None  # Explicitly set organization to None
    )
    hr_user.set_password("hr_admin")
    hr_user.save()

    print("🔍 HR User Initial State:")
    print(f"HR User ID: {hr_user.id}")
    print(f"HR User Organization: {hr_user.organization_id}")

    # 2️⃣ Create Organization and Associate with HR
    org = Organization.objects.create(
        id=uuid.uuid4(),
        name="Tech Corp",
        created_by=hr_user,
        created_at=datetime(2025, 3, 3, 10, 0)
    )

    print("\n🏢 Organization Created:")
    print(f"Organization ID: {org.id}")
    print(f"Organization Name: {org.name}")
    print(f"Created By: {org.created_by.username}")

    # Update HR user with the newly created organization
    hr_user.organization_id = org.id
    hr_user.save()

    print("\n👤 HR User Updated:")
    print(f"HR User Organization ID: {hr_user.organization_id}")

    # 3️⃣ User Data (Managers and Employees)
    users_data = [
        {"username": "mgr_1", "name": "Manager One", "email": "manager1@example.com", "role": "Manager"},
        {"username": "mgr_2", "name": "Manager Two", "email": "manager2@example.com", "role": "Manager"},
        {"username": "mgr_3", "name": "Manager Three", "email": "manager3@example.com", "role": "Manager"},
        {"username": "emp_1", "name": "Employee One", "email": "emp1@example.com", "role": "Employee"},
        {"username": "emp_2", "name": "Employee Two", "email": "emp2@example.com", "role": "Employee"},
        {"username": "emp_3", "name": "Employee Three", "email": "emp3@example.com", "role": "Employee"},
        {"username": "emp_4", "name": "Employee Four", "email": "emp4@example.com", "role": "Employee"},
        {"username": "emp_5", "name": "Employee Five", "email": "emp5@example.com", "role": "Employee"},
        {"username": "emp_6", "name": "Employee Six", "email": "emp6@example.com", "role": "Employee"},
        {"username": "emp_7", "name": "Employee Seven", "email": "emp7@example.com", "role": "Employee"},
        {"username": "emp_8", "name": "Employee Eight", "email": "emp8@example.com", "role": "Employee"},
        {"username": "emp_9", "name": "Employee Nine", "email": "emp9@example.com", "role": "Employee"},
    ]

    # 4️⃣ Create Managers First
    managers = []
    for user_data in users_data:
        if user_data["role"] == "Manager":
            user = AuthUser.objects.create(
                id=uuid.uuid4(),
                username=user_data["username"],
                name=user_data["name"],
                email=user_data["email"],
                role=user_data["role"],
                organization_id=org.id,
                manager=hr_user  # HR is the manager of all managers
            )
            user.set_password(user_data["username"])  # Password = Username for simplicity
            user.save()
            
            # Create Manager-HR Relationship
            ManagerEmployee.objects.create(
                id=uuid.uuid4(),
                manager=hr_user,
                employee=user,
                organization=org
            )
            
            managers.append(user)

    # 5️⃣ Create Employees and Assign Managers
    employees = []
    for i, user_data in enumerate(users_data):
        if user_data["role"] == "Employee":
            assigned_manager = managers[i // 3]  # Each manager gets 3 employees

            user = AuthUser.objects.create(
                id=uuid.uuid4(),
                username=user_data["username"],
                name=user_data["name"],
                email=user_data["email"],
                role=user_data["role"],
                organization_id=org.id,
                manager=assigned_manager
            )
            user.set_password(user_data["username"])
            user.save()
            employees.append(user)

            # 6️⃣ Create Manager-Employee Relationship
            ManagerEmployee.objects.create(
                id=uuid.uuid4(),
                manager=assigned_manager,
                employee=user,
                organization=org
            )

    print("✅ Users, Organization, and Manager-Employee relations created successfully!")

def main():
    print("🛠️ Resetting Database...")
    ManagerEmployee.objects.all().delete()
    AuthUser.objects.all().delete()
    Organization.objects.all().delete()

    print("🚀 Inserting Dummy Data...")
    create_users()

if __name__ == '__main__':
    main()
