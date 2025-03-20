import os
import logging
import uuid
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from groq import Groq
from apps.feedback.models import SwotAnalysis
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class ChatbotView(APIView):
    """Chatbot API for Employee/Manager Dashboard using Groq API"""

    def post(self, request):
        """Handles chatbot queries and fetches responses from Groq AI"""
        user_message = request.data.get("message", "").strip()
        user_id = request.data.get("user_id")  # Get user ID
        user_list = request.data.get("user_list", [])  # List of {id, name} objects

        logger.info(f"New message from user {user_id}: '{user_message}'")

        if not user_message:
            logger.warning("Oops! The message is empty.")
            return Response({"error": "Looks like you forgot to type a message! Please try again."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Fetch SWOT analysis for all users using IDs but return names
            swot_analysis = self._get_users_swot_analysis(user_list)
            logger.info(f"Fetched SWOT analysis for users: {swot_analysis}")

            # Send user message along with SWOT analysis to Groq AI
            response_text = self._fetch_groq_response(user_message, swot_analysis)

            return Response({"response": response_text}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Oh no! Something went wrong: {str(e)}", exc_info=True)
            return Response({"error": "Sorry! I'm having a bit of trouble right now. Please try again soon."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _fetch_groq_response(self, message, swot_analysis):
        """Connects to Groq API and fetches response"""
        api_key = os.getenv("GROQ_API_KEY")  # Use API key from environment

        if not api_key:
            raise ValueError("Oops! Groq API key is missing. Make sure to set GROQ_API_KEY in your .env file.")

        try:
            client = Groq(api_key=api_key)
            response = client.chat.completions.create(
                messages=[{"role": "user", "content": f"Message: {message} \nSWOT Analysis: {swot_analysis}"}],
                model="llama3-70b-8192"
            )

            if response and hasattr(response, "choices") and response.choices:
                return response.choices[0].message.content.strip()
            else:
                return "Hmm, I couldn't quite process that. Could you try rephrasing?"

        except Exception as e:
            logger.error(f"Groq API error: {str(e)}", exc_info=True)
            return "Sorry, I'm having trouble connecting to my AI brain right now. Please try again later!"

    def _get_users_swot_analysis(self, user_list):
        """Fetches SWOT analysis for all users in the given list, using their names instead of UUIDs"""
        swot_data = {}

        for user in user_list:
            try:
                user_id = user.get("id")  # Extract user ID
                user_name = user.get("name", f"Unknown-{user_id}")  # Extract name or fallback

                # Convert user_id to UUID
                user_uuid = uuid.UUID(user_id)

                # Fetch SWOT analysis using .filter() to avoid exceptions
                swot_analysis = SwotAnalysis.objects.filter(receiver__id=user_uuid).first()

                if swot_analysis:
                    swot_data[user_name] = {  # Use username instead of user_id
                        "strengths": swot_analysis.strengths,
                        "weaknesses": swot_analysis.weaknesses,
                        "opportunities": swot_analysis.opportunities,
                        "threats": swot_analysis.threats,
                        "performance_rating": swot_analysis.performance_rating
                    }
                else:
                    logger.info(f"No SWOT analysis found for {user_name} (ID: {user_id}).")
                    swot_data[user_name] = "No SWOT analysis available yet."

            except ValueError:
                logger.warning(f"Oops! The provided user ID isn't a valid UUID: {user_id}")
                swot_data[f"Invalid-{user_id}"] = "Invalid user ID provided."

        return swot_data  # Return SWOT data with names as keys
    