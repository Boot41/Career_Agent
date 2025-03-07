def create_users():
    # Create HR User First with NULL organization
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

    # Create Organization and Associate with HR
    org = Organization.objects.create(
        id=uuid.uuid4(),
        name="Tech Corp",
        created_by=hr_user,
        created_at=datetime(2025, 3, 3, 10, 0)
    )

    # Create Manager
    manager = AuthUser.objects.create(
        id=uuid.uuid4(),
        username='hr_admin',
        name='HR Manager',
        email='hr_manager@example.com',
        role='Manager',
        organization_id=org.id
    )
    manager.set_password('hr_manager_password')
    manager.save()

    # Create 3 employees under the created manager
    for i in range(3):
        employee = AuthUser.objects.create(
            id=uuid.uuid4(),
            username=f'employee_{i+1}',
            name=f'Employee {i+1}',
            email=f'employee_{i+1}@example.com',
            role='Employee',
            organization_id=org.id,
            manager=manager
        )
        employee.set_password('employee_password')
        employee.save()

    print("✅ Users, Organization, and Manager-Employee relations created successfully!")