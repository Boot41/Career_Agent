import json
from django.test import TestCase
from django.urls import reverse
from apps.authentication.models import AuthUser
from django.contrib.auth.hashers import make_password

class TestLoginView(TestCase):
    """Test cases for the login API."""

    def setUp(self):
        """Set up test data before each test."""
        self.username = "testuser"
        self.password = "Test@1234"
        self.email = "testuser@example.com"

        # Create a test user in the database
        self.user = AuthUser.objects.create(
            username=self.username,
            name="Test User",
            email=self.email,
            password=make_password(self.password),  # Hash password
            role="Employee",
            is_active=True
        )

        # Define the login URL
        self.login_url = reverse("login")

    def test_login_success(self):
        """Test successful login with valid credentials."""
        data = {
            "username": self.username,
            "password": self.password
        }
        response = self.client.post(self.login_url, json.dumps(data), content_type="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json().get("success"))

    def test_login_invalid_credentials(self):
        """Test login with incorrect credentials."""
        data = {
            "username": "wronguser",
            "password": "wrongpassword"
        }
        response = self.client.post(self.login_url, json.dumps(data), content_type="application/json")
        self.assertEqual(response.status_code, 404)  # User not found
        self.assertFalse(response.json().get("success"))

    def test_login_special_characters(self):
        """Test login with special characters in username."""
        special_username = "test@user!"
        self.user.username = special_username
        self.user.save()

        data = {
            "username": special_username,
            "password": self.password
        }
        response = self.client.post(self.login_url, json.dumps(data), content_type="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json().get("success"))

    def test_login_empty_fields(self):
        """Test login with empty username and password."""
        data = {
            "username": "",
            "password": ""
        }
        response = self.client.post(self.login_url, json.dumps(data), content_type="application/json")
        self.assertEqual(response.status_code, 400)  # Bad Request
        self.assertFalse(response.json().get("success"))

    def test_login_inactive_user(self):
        """Test login with an inactive user."""
        self.user.is_active = False
        self.user.save()

        data = {
            "username": self.username,
            "password": self.password
        }
        response = self.client.post(self.login_url, json.dumps(data), content_type="application/json")
        self.assertEqual(response.status_code, 401)  # Unauthorized
        self.assertFalse(response.json().get("success"))


class TestCheckUserExistsView(TestCase):
    """Test cases for checking if a user exists."""

    def setUp(self):
        """Set up test data before each test."""
        self.username = "existinguser"
        self.email = "existinguser@example.com"

        # Create a test user
        self.user = AuthUser.objects.create(
            username=self.username,
            name="Existing User",
            email=self.email,
            password=make_password("Password123"),  # Hash password
            role="Manager",
            is_active=True
        )

        # Define the check user URL
        self.check_user_url = reverse("check_user_exists")

    def test_check_user_exists_by_username(self):
        """Test checking if a user exists by username."""
        data = {"username": self.username}
        response = self.client.post(self.check_user_url, json.dumps(data), content_type="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json().get("exists"))

    def test_check_user_exists_by_email(self):
        """Test checking if a user exists by email."""
        data = {"email": self.email}
        response = self.client.post(self.check_user_url, json.dumps(data), content_type="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json().get("exists"))

    def test_check_user_does_not_exist(self):
        """Test checking a user that does not exist."""
        data = {"username": "nonexistentuser"}
        response = self.client.post(self.check_user_url, json.dumps(data), content_type="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.json().get("exists"))

    def test_check_user_no_data_provided(self):
        """Test checking user existence with no data."""
        data = {}
        response = self.client.post(self.check_user_url, json.dumps(data), content_type="application/json")
        self.assertEqual(response.status_code, 400)  # Bad Request
        self.assertFalse(response.json().get("exists"))
