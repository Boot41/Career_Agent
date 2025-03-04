from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import check_password
from .models import AuthUser
import json

@csrf_exempt
@require_http_methods(["POST"])
def login(request):
    """
    Simple login API that checks username and password against the database.
    
    Request should be a POST request with 'username' and 'password' in the body.
    Returns a JSON response indicating login status.
    
    Example request body:
    {
        "username": "example_user",
        "password": "password123"
    }
    """
    # Parse request body 
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({
            "success": False,
            "message": "Invalid JSON"
        }, status=400)
    
    # Extract username and password
    username = data.get('username')
    password = data.get('password')
    
    # Validate input
    if not username or not password:
        return JsonResponse({
            "success": False,
            "message": "Username and password are required"
        }, status=400)
    
    try:
        # Try to find the user
        try:
            user = AuthUser.objects.get(username=username)
        except AuthUser.DoesNotExist:
            return JsonResponse({
                "success": False,
                "message": "Invalid credentials"
            }, status=404)
        
        # Check password
        if check_password(password, user.password):
            return JsonResponse({
                "success": True,
                "user": {
                    "id": str(user.id),
                    "username": user.username,
                    "role": user.role,
                    "organization_id": str(user.organization_id) if user.organization_id else None
                }
            })
        else:
            return JsonResponse({
                "success": False,
                "message": "Invalid credentials"
            }, status=401)
    
    except Exception as e:
        return JsonResponse({
            "success": False,
            "message": str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def check_user_exists(request):
    """
    Check if a user exists based on the provided username or email.
    
    Request should be a POST request with either 'username' or 'email' in the body.
    Returns a JSON response indicating whether the user exists.
    
    Example request body:
    {
        "username": "example_user" 
        # OR
        "email": "user@example.com"
    }
    """
    # Parse request body 
    import json
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({
            "error": "Invalid JSON",
            "exists": False
        }, status=400)
    
    # Check for username or email
    username = data.get('username')
    email = data.get('email')
    
    # Validate input
    if not username and not email:
        return JsonResponse({
            "error": "Please provide either username or email",
            "exists": False
        }, status=400)
    
    # Check user existence
    try:
        if username:
            user_exists = AuthUser.objects.filter(username=username).exists()
        else:
            user_exists = AuthUser.objects.filter(email=email).exists()
        
        return JsonResponse({
            "exists": user_exists
        })
    
    except Exception as e:
        return JsonResponse({
            "error": str(e),
            "exists": False
        }, status=500)
