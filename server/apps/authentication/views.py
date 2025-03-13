from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import check_password
from .models import AuthUser
from apps.organizations.models import Organization
import json

@csrf_exempt
@require_http_methods(["POST"])
def login(request):
    """
    Simple login API that checks username and password against the database.
    
    Request should be a POST request with 'username' and 'password' in the body.
    Returns a JSON response indicating login status.
    """
    try:
        # Parse request body
        data = json.loads(request.body)
        
        # Extract username and password
        username = data.get('username')
        password = data.get('password')
        
        # Validate input
        if not username or not password:
            return JsonResponse({
                "success": False,
                "message": "Username and password are required"
            }, status=400)

        # Check if user exists
        user = AuthUser.objects.filter(username=username).first()
        if not user or not check_password(password, user.password):
            return JsonResponse({
                "success": False,
                "message": "Invalid credentials"
            }, status=401)

        # Fetch organization name if organization_id exists
        organization_name = None
        if user.organization_id:
            organization = Organization.objects.filter(id=user.organization_id).first()
            organization_name = organization.name if organization else None

        # Return success response
        return JsonResponse({
            "success": True,
            "user": {
                "id": str(user.id),
                "username": user.username,
                "role": user.role,
                "organization_id": str(user.organization_id) if user.organization_id else None,
                "organization_name": organization_name,  # Added organization name
                "name": user.name
            }
        })

    except json.JSONDecodeError:
        return JsonResponse({"success": False, "message": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def check_user_exists(request):
    """
    Check if a user exists based on the provided username or email.
    
    Request should be a POST request with either 'username' or 'email' in the body.
    Returns a JSON response indicating whether the user exists.
    """
    try:
        # Parse request body
        data = json.loads(request.body)

        # Extract username or email
        username = data.get('username')
        email = data.get('email')

        # Validate input
        if not username and not email:
            return JsonResponse({
                "error": "Please provide either username or email",
                "exists": False
            }, status=400)

        # Check if user exists
        user_exists = AuthUser.objects.filter(username=username).exists() if username else AuthUser.objects.filter(email=email).exists()
        
        return JsonResponse({"exists": user_exists})

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON", "exists": False}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e), "exists": False}, status=500)
