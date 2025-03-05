from django.test import TestCase
from django.urls import reverse
from .models import Feedback

class FeedbackAPITests(TestCase):

    def setUp(self):
        # Set up initial data for tests
        self.feedback_data = {
            "giver": 5,
            "receiver": 10,
            "organization_id": 101,
            "feedback_type": "manager",
            "questions": [
                "How well did the employee perform this quarter?",
                "What strengths did the employee demonstrate?",
                "What areas need improvement?"
            ]
        }
        self.create_feedback_url = reverse('create_feedback')
        self.pending_feedback_url = reverse('pending_feedback')
        self.submit_answers_url = reverse('submit_answers')

    def test_create_feedback(self):
        response = self.client.post(self.create_feedback_url, self.feedback_data, content_type='application/json')
        self.assertEqual(response.status_code, 201)
        self.assertIn('id', response.json())

    def test_view_pending_feedback(self):
        # First, create feedback to ensure there is pending feedback to view
        self.client.post(self.create_feedback_url, self.feedback_data, content_type='application/json')
        response = self.client.get(self.pending_feedback_url)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)

    def test_submit_answers(self):
        # First, create feedback to submit answers for
        response = self.client.post(self.create_feedback_url, self.feedback_data, content_type='application/json')
        feedback_id = response.json()['id']
        
        answers_data = {
            "feedback_id": feedback_id,
            "answers": [
                "They performed very well.",
                "Strong leadership skills."
            ]
        }
        response = self.client.post(self.submit_answers_url, answers_data, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertIn('id', response.json())
