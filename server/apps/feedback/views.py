from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Feedback
import json
import os
from groq import Groq
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .serializers import FeedbackPromptSerializer

@method_decorator(csrf_exempt, name='dispatch')
class CreateFeedbackView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            feedback = Feedback.create_feedback(
                giver=data.get('giver'),
                receiver=data.get('receiver'),
                organization_id=data.get('organization_id'),
                feedback_type=data.get('feedback_type'),
                questions=data.get('questions')
            )
            return JsonResponse({'id': feedback.id}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class PendingFeedbackView(View):
    def get(self, request):
        try:
            # For testing purposes, allow a user_id parameter
            user_id = request.GET.get('user_id')
            if user_id:
                receiver = user_id
            else:
                receiver = request.user.id if hasattr(request, 'user') and request.user.is_authenticated else None
            
            if not receiver:
                return JsonResponse({'error': 'No user specified'}, status=400)
                
            pending_feedback = Feedback.get_pending_feedback(receiver=receiver)
            feedback_list = [{'id': fb.id, 'questions': fb.questions} for fb in pending_feedback]
            return JsonResponse(feedback_list, safe=False)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class SubmitAnswersView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            feedback = Feedback.submit_answers(
                feedback_id=data.get('feedback_id'),
                answers=data.get('answers')
            )
            return JsonResponse({'id': feedback.id}, status=200)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class GenerateQuestionsView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            criteria = data.get('criteria', '')
            
            # Generate questions based on criteria
            # This is a simple implementation - you might want to replace this with
            # more sophisticated logic or AI-based generation
            questions = [
                f"How would you rate the performance of this person in {criteria}?",
                f"What specific strengths have you observed related to {criteria}?",
                f"What areas of improvement would you suggest regarding {criteria}?",
                f"How effectively does this person communicate in {criteria} scenarios?",
                f"What impact has this person made in {criteria}?"
            ]
            
            return JsonResponse({'questions': questions}, status=200)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

class GenerateFeedbackView(APIView):
    """Handles feedback question generation using Groq API."""

    def post(self, request):
        """Handles feedback question generation based on role and feedback perspective."""
        # Validate request data
        serializer = FeedbackPromptSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Extract input data
        role = serializer.validated_data["role"]
        feedback_receiver = serializer.validated_data["feedback_receiver"]

        # Generate AI prompt
        prompt = self._generate_prompt(role, feedback_receiver)

        try:
            # Fetch AI-generated questions
            questions = self._fetch_questions_from_groq(prompt) or self._fallback_questions(role, feedback_receiver)
            return Response({"questions": questions}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": f"API request failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _generate_prompt(self, role, feedback_receiver):
        """Generates a structured AI prompt for feedback question generation."""
        receiver_guidance = self._get_feedback_receiver_guidance(feedback_receiver, role)

        return f"""
Generate 5 specific feedback questions for an employee in the {role} position.
The feedback is being provided by a {feedback_receiver}.

{receiver_guidance}

Important guidelines:
- Questions should be specific to the employee being evaluated
- For Manager and Peer feedback, refer to "the employee" rather than using pronouns
- For Self feedback, use "you" to address the employee directly
- Focus on observable behaviors and specific performance aspects
- Questions should be constructive and growth-oriented

Return exactly 5 questions as a numbered list.
"""

    def _fetch_questions_from_groq(self, prompt):
        """Fetches feedback questions from Groq API."""
        groq_api_key = os.environ.get('GROQ_API_KEY')
        if not groq_api_key:
            raise ValueError("Groq API key is missing.")

        client = Groq(api_key=groq_api_key)
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama3-70b-8192"
        )

        return [q.strip() for q in response.choices[0].message.content.strip().split("\n") if q.strip().endswith("?")][:5]

    def _fallback_questions(self, role, feedback_receiver):
        """Returns predefined fallback questions if AI response is invalid."""
        fallback = {
            'Manager': [
                f"What are the key strengths demonstrated by the employee in the {role} position?",
                f"How effectively has the employee contributed to team objectives as a {role}?",
                f"What specific areas should the employee focus on improving as a {role}?",
                f"How well has the employee met performance expectations in the {role} position?",
                f"What professional development opportunities would benefit the employee in the {role} role?"
            ],
            'Peer': [
                f"How effectively does the employee collaborate with the team as a {role}?",
                f"What strengths has the employee demonstrated in teamwork while performing as a {role}?",
                f"How has the employee contributed to group projects in the {role} capacity?",
                f"What specific feedback would help the employee improve performance as a {role}?",
                f"How well does the employee communicate with colleagues in the {role} position?"
            ],
            'Self': [
                "What challenges have you faced in your current position?",
                "What accomplishments are you most proud of in this review period?",
                "What skills would you like to develop further to excel in your role?",
                "How effectively have you managed your responsibilities and workload?",
                "What strategies could you implement to improve your overall performance?"
            ]
        }
        return fallback.get(feedback_receiver, [
            f"What are the key achievements and improvement areas for the employee in the {role} position?"
        ] * 5)

    def _get_feedback_receiver_guidance(self, feedback_receiver, role):
        """
        Generate specific guidance based on the feedback receiver.

        Args:
            feedback_receiver (str): The perspective of the feedback provider
            role (str): The role of the employee being evaluated

        Returns:
            str: Specific guidance for generating questions
        """
        receiver_guidance = {
            'Manager': f"""
When providing feedback as a Manager for an employee in the {role} position, focus on:
- Assessing the employee's work performance and accountability
- Identifying the employee's key strengths and areas for improvement
- Evaluating how well the employee meets goals and expectations
- Understanding the employee's contribution to team objectives
- Providing constructive guidance for the employee's career growth

Questions should directly address the employee being evaluated, avoiding pronouns like "they" or "their".
Example: "What specific achievements has the employee accomplished in the {role} position?"
""",
            'Peer': f"""
When providing feedback as a Peer for an employee in the {role} position, focus on:
- Evaluating the employee's teamwork and collaborative skills
- Assessing the employee's professional interactions and communication
- Understanding the employee's contributions to group projects
- Identifying the employee's strengths in team dynamics
- Providing insights on the employee's interpersonal effectiveness

Questions should directly address the employee being evaluated, avoiding pronouns like "they" or "their".
Example: "How effectively does the employee collaborate with team members in the {role} position?"
""",
            'Self': f"""
When generating self-assessment questions for an employee in the {role} position, focus on:
- Encouraging reflection on personal performance in the role
- Identifying personal strengths and areas for improvement
- Assessing progress towards professional goals
- Understanding personal challenges and achievements
- Exploring opportunities for career growth

Questions should be framed in the second-person "you" perspective.
Example: "What specific achievements are you most proud of in your role as a {role}?"
"""
        }

        return receiver_guidance.get(feedback_receiver, f"""
When providing feedback for an employee in the {role} position, focus on:
- Observing the employee's professional performance
- Identifying the employee's key strengths and areas for improvement
- Understanding the employee's role-specific contributions

Questions should directly address the employee being evaluated.
""")