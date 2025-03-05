from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from apps.authentication.models import AuthUser
from apps.organizations.models import Organization  # Correct import for Organization model
import uuid

@csrf_exempt
@require_http_methods(["GET"])
def get_organization_hierarchy(request):
    """
    Fetch all managers and their employees for a given organization.
    
    Query Parameters:
    - organization_id: UUID of the organization
    
    Returns:
    - List of managers with their assigned employees and organization details
    """
    # Extract organization ID from query parameters
    organization_id = request.GET.get('organization_id')
    
    # Validate organization ID
    try:
        organization_id = uuid.UUID(organization_id)
    except (ValueError, TypeError):
        return JsonResponse({
            "success": False,
            "message": "Invalid organization ID"
        }, status=400)
    
    try:
        # Fetch organization details
        organization = Organization.objects.get(id=organization_id)  # Fetch organization by ID
        organization_details = {
            "name": organization.name,
            # "address": organization.address  # Assuming address field exists
        }

        # Fetch all managers in the organization
        managers = list(AuthUser.objects.filter(
            organization_id=organization_id, 
            role='Manager'
        ).values('id', 'name', 'username', 'email'))
        
        # Prepare a list to store managers with their teams
        managers_with_teams = []
        
        for manager in managers:
            # Fetch employees for each manager
            employees = list(AuthUser.objects.filter(
                organization_id=organization_id, 
                role='Employee', 
                manager_id=manager['id']
            ).values('id', 'name', 'username', 'email'))
            
            # Add employees to the manager's data
            manager['team'] = employees
            managers_with_teams.append(manager)
        
        # Fetch unassigned employees
        unassigned_employees = list(AuthUser.objects.filter(
            organization_id=organization_id, 
            role='Employee', 
            manager__isnull=True
        ).values('id', 'name', 'username', 'email'))
        
        return JsonResponse({
            "success": True,
            "managers": managers_with_teams,
            "unassigned_employees": unassigned_employees,
            "organization_name": organization_details['name'],
            "organization_details": organization_details
        })
        
    except Exception as e:
        return JsonResponse({
            "success": False,
            "message": str(e)
        }, status=500)
