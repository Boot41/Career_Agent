from django.test import TestCase, Client
from django.urls import reverse
from apps.authentication.models import AuthUser
import json
import uuid

class AuthenticationViewsTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = AuthUser.objects.create(
            username="testuser",
            name="Test User",
            email="test@example.com",
            role="Employee",
            organization_id=uuid.uuid4()
        )
        self.user.set_password("password123")
        self.user.save()

        self.login_url = reverse('login')
        self.check_user_url = reverse('check_user_exists')

    def test_login_successful(self):
        """Test successful login"""
        data = {
            "username": "testuser",
            "password": "password123"
        }
        response = self.client.post(self.login_url, json.dumps(data), content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.content)
        self.assertTrue(response_data['success'])
        self.assertEqual(response_data['user']['username'], 'testuser')
        self.assertEqual(response_data['user']['name'], 'Test User')
        self.assertEqual(response_data['user']['role'], 'Employee')
        self.assertIsNotNone(response_data['user']['organization_id'])

    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        data = {
            "username": "testuser",
            "password": "wrongpassword"
        }
        response = self.client.post(self.login_url, json.dumps(data), content_type='application/json')
        
        self.assertEqual(response.status_code, 401)
        response_data = json.loads(response.content)
        self.assertFalse(response_data['success'])
        self.assertEqual(response_data['message'], 'Invalid credentials')

    def test_check_user_exists_by_username_found(self):
        """Test checking if user exists by username (found)"""
        data = {
            "username": "testuser"
        }
        response = self.client.post(self.check_user_url, json.dumps(data), content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.content)
        self.assertTrue(response_data['exists'])