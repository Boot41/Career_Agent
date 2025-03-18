from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view
from livekit import api
import json
import os
import requests
import groq

class LiveKitTokenView(APIView):
    permission_classes = [AllowAny]  # Allow anyone to access this API
    LIVEKIT_API_KEY = "APIhg5odtGHviT8"
    LIVEKIT_API_SECRET = "W0CrJ73lC759EiY7O9PWCPv0xQNEBECjtLk76HImf4D"

    def post(self, request):
        if not self.LIVEKIT_API_KEY or not self.LIVEKIT_API_SECRET:
            return Response({"error": "Missing API credentials"}, status=500)

        room_name = request.GET.get("room", "default-room")  # Get room name from frontend
        questions = request.data.get("questions", [])

        metadata_str = json.dumps({"questions": questions})
        # print("🚀 Sending Metadata:", metadata_str)

        token = api.AccessToken(self.LIVEKIT_API_KEY, self.LIVEKIT_API_SECRET) \
            .with_identity("user-" + room_name) \
            .with_name("User") \
            .with_grants(api.VideoGrants(room_join=True, room=room_name))\
            .with_metadata(metadata_str)

        jwt_token = token.to_jwt()  # ✅ Generate JWT once
        # print("Generated Token:", jwt_token)  # Debugging
        return Response({"token": jwt_token, "metadata": {"questions": questions}})


client = groq.Groq(api_key="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")

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
import logging
from groq import Client

logger = logging.getLogger(__name__)

# Initialize Groq Client
client = Client(api_key="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")

class LLMSummarizeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            feedback_text = request.data.get("text", "").strip()
            if not feedback_text:
                return Response({"error": "No text provided"}, status=400)

            # Groq API request
            chat_completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",  # Ensure this model exists
                messages=[
                    {"role": "system", "content": "Summarize the following employee feedback in a **single paragraph**, avoiding bullet points or lists."},
                    {"role": "user", "content": feedback_text}
                ],
                temperature=0.7,
                max_tokens=500  
            )

            logger.info(f"Raw Groq API Response: {chat_completion}")

            # Validate response structure
            if not hasattr(chat_completion, "choices") or not chat_completion.choices:
                return Response({"error": "Invalid response from Groq API", "details": str(chat_completion)}, status=500)

            # Extracting the response safely
            summary = None
            for choice in chat_completion.choices:
                if hasattr(choice, "message") and hasattr(choice.message, "content"):
                    summary = choice.message.content
                    break  # Stop at the first valid response

            if summary is None:
                return Response({"error": "Failed to extract summary from Groq API response"}, status=500)

            return Response({"summary": summary})

        except Exception as e:
            logger.error(f"Error in LLMSummarizeView: {str(e)}", exc_info=True)
            return Response({"error": "LLM processing failed", "details": str(e)}, status=500)