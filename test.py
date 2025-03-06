import unittest
from django.test import TestCase, Client
from django.urls import reverse
from apps.feedback.models import Feedback, ManagerEmployee, SwotAnalysis
from apps.authentication.models import AuthUser
from apps.organizations.models import Organization
import json
import uuid

class FeedbackTestCase(TestCase):
    def setUp(self):
        # Create test organization
        self.organization = Organization.objects.create(
            name="Test Organization",
            description="Test Description"
        )
        
        # Create test users
        self.manager = AuthUser.objects.create(
            username="manager@test.com",
            email="manager@test.com",
            name="Test Manager",
            password="testpass123"
        )
        
        self.employee = AuthUser.objects.create(
            username="employee@test.com",
            email="employee@test.com",
            name="Test Employee",
            password="testpass123"
        )
        
        # Create manager-employee relationship
        self.manager_employee = ManagerEmployee.objects.create(
            manager=self.manager,
            employee=self.employee,
            organization=self.organization
        )
        
        # Create test feedback
        self.feedback = Feedback.objects.create(
            giver=str(self.manager.id),
            receiver=str(self.employee.id),
            organization_id=str(self.organization.id),
            feedback_type='Manager',
            questions=[
                "How effectively has the employee performed?",
                "What are the employee's strengths?"
            ]
        )
        
        self.client = Client()

    def test_create_feedback(self):
        """Test creating new feedback"""
        url = reverse('create_feedback')
        data = {
            'giver': str(self.manager.id),
            'receiver': str(self.employee.id),
            'organization_id': str(self.organization.id),
            'feedback_type': 'Manager',
            'questions': ["Test question 1", "Test question 2"]
        }
        response = self.client.post(url, json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue('id' in response.json())

    def test_pending_feedback(self):
        """Test retrieving pending feedback"""
        url = reverse('pending_feedback')
        response = self.client.get(f"{url}?user_id={self.manager.id}")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(isinstance(response.json(), list))

    def test_submit_answers(self):
        """Test submitting answers to feedback"""
        url = reverse('submit_answers')
        data = {
            'feedback_id': self.feedback.id,
            'answers': ["Answer 1", "Answer 2"]
        }
        response = self.client.post(url, json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        
        # Verify feedback is marked as submitted
        updated_feedback = Feedback.objects.get(id=self.feedback.id)
        self.assertTrue(updated_feedback.is_submitted)
        self.assertEqual(updated_feedback.answers, ["Answer 1", "Answer 2"])

class SwotAnalysisTestCase(TestCase):
    def setUp(self):
        # Create test user
        self.user = AuthUser.objects.create(
            username="test@test.com",
            email="test@test.com",
            name="Test User",
            password="testpass123"
        )
        
        # Create test SWOT analysis
        self.swot = SwotAnalysis.objects.create(
            receiver=self.user,
            year=2024,
            summary="Test summary",
            strengths="Test strengths",
            weaknesses="Test weaknesses",
            opportunities="Test opportunities",
            threats="Test threats"
        )
        
        self.client = Client()

    def test_get_swot_analysis(self):
        """Test retrieving SWOT analysis"""
        url = reverse('swot_analysis')
        response = self.client.get(f"{url}?user_id={self.user.id}&year=2024")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['summary'], "Test summary")
        self.assertEqual(data['strengths'], "Test strengths")
        self.assertEqual(data['weaknesses'], "Test weaknesses")
        self.assertEqual(data['opportunities'], "Test opportunities")
        self.assertEqual(data['threats'], "Test threats")

    def test_delete_swot_analysis(self):
        """Test deleting SWOT analysis"""
        url = reverse('delete_swot_analysis')
        response = self.client.delete(f"{url}?user_id={self.user.id}&year=2024")
        self.assertEqual(response.status_code, 200)
        
        # Verify SWOT analysis is deleted
        with self.assertRaises(SwotAnalysis.DoesNotExist):
            SwotAnalysis.objects.get(id=self.swot.id)

    def test_swot_analysis_availability(self):
        """Test checking SWOT analysis availability"""
        url = reverse('swot_analysis_availability')
        response = self.client.get(f"{url}?user_id={self.user.id}&year=2024")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['has_swot'])

if __name__ == '__main__':
    unittest.main() 