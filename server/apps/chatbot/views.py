import os
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class ChatbotView(APIView):
    """Chatbot API for Employee/Manager Dashboard using Groq API"""

    def post(self, request):
        """Handles chatbot queries and fetches responses from Groq AI"""
        user_message = request.data.get("message", "").strip()
        user_id = request.data.get("user_id")  # Get user ID from request

        logger.info(f"Received message from user {user_id}: {user_message}")

        # Initial message to guide the user
        if user_message.lower() == "how can you help me?":
            swot_analysis = self._get_user_swot_analysis(user_id)
            return Response({"response": f"I can assist you with your SWOT analysis by providing insights into your strengths, weaknesses, opportunities, and threats based on your input. Here is your SWOT analysis: {swot_analysis}. Feel free to ask me any questions related to your SWOT analysis or any other topic!"}, status=status.HTTP_200_OK)

        if not user_message:
            logger.error("Empty message received")
            return Response({"error": "Message cannot be empty"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Fetch response from Groq API
            swot_analysis = self._get_user_swot_analysis(user_id)
            logger.info(f"SWOT analysis for user {user_id}: {swot_analysis}")
            response_text = self._fetch_groq_response(user_message, str(swot_analysis))
            return Response({"response": response_text}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Chatbot error: {str(e)}", exc_info=True)
            return Response({"error": "Chatbot service is currently unavailable"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _fetch_groq_response(self, message, swot_analysis):
        """Connects to Groq API and fetches response"""
        api_key = "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"  # Keep as is

        if not api_key:
            raise ValueError("Groq API key is missing! Set GROQ_API_KEY in .env")

        try:
            client = Groq(api_key=api_key)
            response = client.chat.completions.create(
                messages=[{"role": "user", "content": f"{message} {swot_analysis}"}],
                model="llama3-70b-8192"
            )

            if response and hasattr(response, "choices") and response.choices:
                return response.choices[0].message.content.strip()  
            else:
                return "I'm sorry, but I couldn't process your request."

        except Exception as e:
            logger.error(f"Groq API error: {str(e)}", exc_info=True)
            return "Chatbot service is currently unavailable"

    def _get_user_swot_analysis(self, user_id):
        """Fetches SWOT analysis for the given user ID"""
        # Implement logic to fetch user's SWOT analysis from the database or other data source
        try:
            # Placeholder: Replace with actual database query or API call to retrieve SWOT analysis
            swot_analysis = {
                "strengths": ["Strong communication skills", "Team player"],
                "weaknesses": ["Public speaking", "Time management"],
                "opportunities": ["Training programs", "Mentorship"],
                "threats": ["High competition", "Market changes"]
            }
            return swot_analysis
        except Exception as e:
            logger.error(f"Error fetching SWOT analysis for user {user_id}: {str(e)}", exc_info=True)
            return "Unable to fetch SWOT analysis at this time."
