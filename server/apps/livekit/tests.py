from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
import json
from unittest.mock import patch

class LiveKitTokenViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = "/api/livekit/token/"
        self.mock_api_key = "test_api_key"
        self.mock_api_secret = "test_api_secret"

    @patch("livekit.api.AccessToken.to_jwt", return_value="mocked_jwt_token")
    def test_generate_livekit_token_success(self, mock_jwt):
        response = self.client.post(self.url, {"questions": ["What is your feedback?"]}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("token", response.data)
        self.assertIn("metadata", response.data)
        self.assertEqual(response.data["metadata"]["questions"], ["What is your feedback?"])

    def test_missing_api_credentials(self):
        with patch("livekit.api.AccessToken", side_effect=Exception("Missing API credentials")):
            response = self.client.post(self.url, {}, format="json")
            self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
            self.assertIn("error", response.data)

class LLMSummarizeViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = "/api/llm/summarize/"

    @patch("groq.Client.chat.completions.create")
    def test_summarization_success(self, mock_groq_response):
        mock_groq_response.return_value = type("MockResponse", (object,), {
            "choices": [
                type("MockChoice", (object,), {
                    "message": type("MockMessage", (object,), {"content": "This is a summarized feedback."})
                })()
            ]
        })()

        response = self.client.post(self.url, {"text": "This is a long feedback that needs summarization."}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("summary", response.data)
        self.assertEqual(response.data["summary"], "This is a summarized feedback.")

    def test_summarization_no_text_provided(self):
        response = self.client.post(self.url, {"text": ""}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    @patch("groq.Client.chat.completions.create", side_effect=Exception("Groq API error"))
    def test_summarization_failure(self, mock_groq_error):
        response = self.client.post(self.url, {"text": "Some feedback"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn("error", response.data)
        self.assertIn("LLM processing failed", response.data["error"])
