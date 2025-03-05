from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Feedback, ManagerEmployee, SwotAnalysis
import json
import os
from groq import Groq
from rest_framework import status
from .serializers import FeedbackPromptSerializer, FeedbackCreateSerializer, FeedbackSerializer
from apps.authentication.models import AuthUser
from apps.organizations.models import Organization
import openai
import datetime
from django.contrib.auth.models import User
import re
import dotenv
import re

# openai is used with Groq API key for compatibility
openai.api_key = os.environ.get('GROQ_API_KEY')
print(openai.api_key)

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

class PendingFeedbackView(APIView):
    """API view to retrieve pending feedback for a user."""
    
    def get(self, request):
        """Retrieves pending feedback for a user."""
        print("=== PendingFeedbackView.get() called ===")

        # Get user_id from query parameters
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure user_id is a string
        user_id = str(user_id)

        # Fetch pending feedback where giver matches and is_submitted is False
        pending_feedback = Feedback.objects.filter(
            giver=user_id,
            is_submitted=False
        )

        # Get receiver names from AuthUser model
        feedback_data = []
        for feedback in pending_feedback:
            try:
                receiver_user = AuthUser.objects.get(id=feedback.receiver)
                receiver_name = receiver_user.name
            except AuthUser.DoesNotExist:
                receiver_name = feedback.receiver  # Fallback to receiver ID if user not found

            feedback_data.append({
                'id': feedback.id,
                'receiver': feedback.receiver,
                'receiver_name': receiver_name,
                'feedback_type': feedback.feedback_type,
                'questions': feedback.questions,
                'created_at': feedback.created_at
            })

        print(f"Found {len(feedback_data)} pending feedback items for user {user_id}")
        return Response(feedback_data)

@method_decorator(csrf_exempt, name='dispatch')
class SubmitAnswersView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            print("Received data:", data)  # Log incoming data
            
            feedback_id = data.get('feedback_id')
            answers = data.get('answers')
            
            if not feedback_id:
                return JsonResponse({'error': 'feedback_id is required'}, status=400)
            
            if not answers:
                return JsonResponse({'error': 'answers are required'}, status=400)
            
            try:
                # Submit answers and mark as completed
                feedback = Feedback.submit_answers(
                    feedback_id=feedback_id,
                    answers=answers
                )
                
                # Mark the feedback as submitted
                feedback.is_submitted = True
                feedback.save()

                return JsonResponse({'id': feedback.id}, status=200)
            except Feedback.DoesNotExist:
                return JsonResponse({'error': f'Feedback with id {feedback_id} does not exist'}, status=404)
            
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {str(e)}")
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        except Exception as e:
            print(f"Error in SubmitAnswersView: {str(e)}")
            return JsonResponse({'error': str(e)}, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class GenerateQuestionsView(APIView):
    """API view to generate feedback questions based on role and feedback type."""
    
    def post(self, request):
        """Generates feedback questions based on role and feedback perspective."""
        try:
            # Extract input data
            role = request.data.get('role', '')
            feedback_type = request.data.get('feedback_type', '')
            feedback_receiver = request.data.get('feedback_receiver', '')
            
            # Generate questions based on role and feedback type
            questions = self._generate_questions(role, feedback_type, feedback_receiver)
            
            return Response({"questions": questions}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def _generate_questions(self, role, feedback_type, feedback_receiver):
        """Generates predefined questions based on role and feedback type."""
        # Simple implementation - you might want to replace this with
        # more sophisticated logic or AI-based generation
        if feedback_type == 'Manager':
            return [
                f"How effectively has the employee performed in the {role} position?",
                f"What specific strengths has the employee demonstrated as a {role}?",
                f"What areas of improvement would you suggest for the employee in the {role} role?",
                f"How well does the employee communicate and collaborate with the team?",
                f"What impact has the employee made in their role and within the organization?"
            ]
        elif feedback_type == 'Peer':
            return [
                f"How effectively does the employee collaborate with the team as a {role}?",
                f"What strengths has the employee demonstrated in teamwork?",
                f"How has the employee contributed to group projects?",
                f"What specific feedback would help the employee improve performance?",
                f"How well does the employee communicate with colleagues?"
            ]
        elif feedback_type == 'Self':
            return [
                "What challenges have you faced in your current position?",
                "What accomplishments are you most proud of in this review period?",
                "What skills would you like to develop further to excel in your role?",
                "How effectively have you managed your responsibilities and workload?",
                "What strategies could you implement to improve your overall performance?"
            ]
        else:
            return [
                f"How would you rate the performance in the {role} position?",
                f"What specific strengths have you observed?",
                f"What areas of improvement would you suggest?",
                f"How effectively does communication happen in various scenarios?",
                f"What impact has been made in the role and organization?"
            ]

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

class CreateFeedbackAPI(APIView):
    """API to create feedback and determine receiver based on feedback type."""

    def post(self, request):
        """Handles feedback creation by determining the receiver dynamically."""
        print("=== CreateFeedbackAPI.post() called ===")
        print(f"Request data: {request.data}")

        # Validate request data using serializer
        serializer = FeedbackCreateSerializer(data=request.data)
        if not serializer.is_valid():
            print(f"Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Extract data from the request
        giver_id = serializer.validated_data["giver_id"]
        feedback_type = serializer.validated_data["feedback_type"]
        organization_id = serializer.validated_data["organization_id"]
        
        print(f"Validated data: giver_id={giver_id}, feedback_type={feedback_type}, organization_id={organization_id}")

        # Determine the receiver based on feedback_type
        receiver_id = self._get_receiver(giver_id, feedback_type, organization_id)
        
        # Check if receiver_id is valid
        if not receiver_id or receiver_id.startswith("Error"):
            print(f"No receiver found for giver_id={giver_id}, feedback_type={feedback_type}")
            return Response({"error": "Receiver not found for this feedback type."}, status=status.HTTP_400_BAD_REQUEST)
        
        print(f"Receiver determined: receiver_id={receiver_id}")
        print(f"IMPORTANT: Storing RECEIVER ID (not name): {receiver_id}")

        # Generate AI-based questions or fallback to predefined ones
        questions = self._generate_questions(feedback_type)
        
        if not questions:
            return Response({"error": "Failed to generate questions."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        try:
            # Create feedback entry
            feedback = Feedback.create_feedback(
                giver=giver_id,
                receiver=receiver_id,
                organization_id=organization_id,
                feedback_type=feedback_type,
                questions=questions
            )
            
            # Verify that the ID was stored correctly
            print(f"VERIFICATION: Created feedback with receiver ID: {feedback.receiver}")
            
            # Return feedback data
            return Response({
                "id": feedback.id,
                "giver": feedback.giver,
                "receiver": feedback.receiver,
                "organization_id": feedback.organization_id,
                "feedback_type": feedback.feedback_type,
                "questions": feedback.questions,
                "created_at": feedback.created_at
            })
            
        except Exception as e:
            print(f"Error creating feedback: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _get_receiver(self, giver_id, feedback_type, organization_id):
        """
        Determines the receiver ID based on feedback type.
        - Manager Feedback → Finds the manager of the giver
        - Peer Feedback → Finds a peer from the same organization
        - Self Feedback → Receiver is the same as the giver
        """
        print(f"Finding receiver for giver_id={giver_id}, feedback_type={feedback_type}")
        
        if feedback_type == "Self":
            print(f"Self feedback: receiver_id={giver_id}")
            return str(giver_id)
        
        elif feedback_type == "Manager":
            return self._get_manager(giver_id, organization_id)
            
        elif feedback_type == "Peer":
            return self._get_peer(giver_id, organization_id)
            
        else:
            print(f"Invalid feedback_type: {feedback_type}")
            return "Invalid feedback type"

    def _get_manager(self, giver_id, organization_id):
        """
        Fetch manager ID from ManagerEmployee model.
        """
        try:
            # Find the manager for this employee
            manager_relation = ManagerEmployee.objects.get(
                employee_id=giver_id,
                organization_id=organization_id
            )
            print(f"Found manager: {manager_relation.manager_id}")
            return str(manager_relation.manager_id)
        except ManagerEmployee.DoesNotExist:
            print(f"No manager found for employee {giver_id} in organization {organization_id}")
            # For testing purposes, return a default manager ID
            return "1"  # Default manager ID for testing
        except Exception as e:
            print(f"Error finding manager: {e}")
            return "Error finding manager"

    def _get_peer(self, giver_id, organization_id):
        """
        Fetch a peer's ID from the same organization.
        For employees, peers are other employees with the same manager.
        For managers, peers are other managers in the organization.
        """
        try:
            # Check if the user is a manager
            is_manager = ManagerEmployee.objects.filter(
                manager_id=giver_id,
                organization_id=organization_id
            ).exists()
            
            if is_manager:
                # If user is a manager, peers are other managers
                print(f"User {giver_id} is a manager, finding peer managers")
                peer_managers = ManagerEmployee.objects.filter(
                    organization_id=organization_id
                ).exclude(manager_id=giver_id).values_list('manager_id', flat=True).distinct()
                
                if peer_managers.exists():
                    # Return the first peer manager
                    peer_id = str(peer_managers.first())
                    print(f"Found peer manager: {peer_id}")
                    return peer_id
                else:
                    print(f"No peer managers found for manager {giver_id}")
                    # For testing purposes, return a default peer ID
                    return "2"  # Default peer ID for testing
            else:
                # If user is an employee, peers are other employees with the same manager
                try:
                    # Find the manager for this employee
                    manager_relation = ManagerEmployee.objects.get(
                        employee_id=giver_id,
                        organization_id=organization_id
                    )
                    
                    # Find other employees with the same manager
                    peer_employees = ManagerEmployee.objects.filter(
                        manager_id=manager_relation.manager_id,
                        organization_id=organization_id
                    ).exclude(employee_id=giver_id).values_list('employee_id', flat=True)
                    
                    if peer_employees.exists():
                        # Return the first peer employee
                        peer_id = str(peer_employees.first())
                        print(f"Found peer employee: {peer_id}")
                        return peer_id
                    else:
                        print(f"No peer employees found for employee {giver_id}")
                        # For testing purposes, return a default peer ID
                        return "3"  # Default peer ID for testing
                except ManagerEmployee.DoesNotExist:
                    print(f"No manager relation found for employee {giver_id}")
                    # For testing purposes, return a default peer ID
                    return "3"  # Default peer ID for testing
        except Exception as e:
            print(f"Error finding peer: {e}")
            return "Error finding peer"

    def _generate_questions(self, feedback_type):
        """Generates AI-based feedback questions or falls back to predefined ones."""
        print(f"Generating questions for feedback type: {feedback_type}")
        
        # For now, return predefined questions based on feedback type
        if feedback_type == "Manager":
            return [
                "How effectively does this person communicate with the team?",
                "How well does this person handle conflicts within the team?",
                "How would you rate their technical skills?",
                "How well do they prioritize tasks and manage time?",
                "What areas do you think they could improve in as a manager?"
            ]
        elif feedback_type == "Peer":
            return [
                "How well does this person collaborate with others?",
                "What strengths has this person demonstrated in teamwork?",
                "How reliable are they in completing their tasks on time?",
                "How would you describe their problem-solving abilities?",
                "What do you think are their strengths and areas for improvement?"
            ]
        elif feedback_type == "Self":
            return [
                "What do you consider to be your greatest strengths?",
                "What areas do you think you need to improve in?",
                "How well do you manage your time and prioritize tasks?",
                "How effectively do you communicate with your team and manager?",
                "What goals would you like to achieve in the next six months?"
            ]
        else:
            return [
                "How would you rate their overall performance?",
                "What are their strengths?",
                "What areas could they improve in?",
                "How well do they collaborate with others?",
                "Any additional comments or feedback?"
            ]

    def _fetch_questions_from_groq(self, feedback_type):
        """Calls Groq API to generate questions dynamically."""
        prompt = f"Generate 5 structured feedback questions for a {feedback_type} review."
        try:
            client = Groq(api_key=os.environ["GROQ_API_KEY"])
            response = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama3-70b-8192"
            )
            return [q.strip() for q in response.choices[0].message.content.strip().split("\n") if q.endswith("?")][:5]
        except Exception as e:
            print(f"Error calling Groq API: {e}")
            return None  # Return None if API call fails

    def _fallback_questions(self, feedback_type):
        """Returns predefined fallback questions if AI fails."""
        fallback = {
            "Manager": [
                "How effectively has this employee contributed to team goals?",
                "What leadership qualities does this employee demonstrate?",
                "How does this employee handle responsibility and accountability?",
                "What are the employee's key strengths?",
                "What areas should this employee improve in?"
            ],
            "Peer": [
                "How well does the employee collaborate with teammates?",
                "What strengths has the employee demonstrated in teamwork?",
                "How has the employee contributed to group projects?",
                "What specific feedback would help the employee improve performance?",
                "How well does the employee communicate with colleagues?"
            ],
            "Self": [
                "What challenges have you faced in your role?",
                "What accomplishments are you most proud of?",
                "What skills would you like to develop further to excel in your role?",
                "How have you grown in your role over the past year?",
                "What support do you need to enhance your performance?"
            ]
        }
        return fallback.get(feedback_type, ["What are your strengths and weaknesses?"] * 5)

class ManagedEmployeesView(APIView):
    """API view to retrieve all employees managed by a specific manager."""
    
    def get(self, request):
        """Retrieves all employees managed by the specified manager."""
        manager_id = request.query_params.get('manager_id')
        if not manager_id:
            return Response({"error": "manager_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Fetch employees managed by the specified manager
        managed_employees = ManagerEmployee.objects.filter(manager_id=manager_id).select_related('employee')
        
        # Serialize the employee data
        employee_data = [
            {
                "id": str(emp.employee.id),
                "name": emp.employee.name,
                "email": emp.employee.email,
                "role": emp.employee.role,
                "username": emp.employee.username
            }
            for emp in managed_employees
        ]
        
        return Response(employee_data)

class SwotAnalysisView(APIView):
    """API to generate and store SWOT analysis using Groq."""

    def get(self, request):
        """Generate a SWOT analysis for a user based on feedback."""
        # Get the user_id from the request
        user_id = request.query_params.get("user_id")
        year = request.query_params.get("year", datetime.datetime.now().year)
        force_new = request.query_params.get("force_new", "false").lower() == "true"
        
        if not user_id:
            return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Convert user_id to string for comparison with receiver field
        user_id_str = str(user_id)
        print(f"VERIFICATION: Using user_id as string for comparison: {user_id_str}")
        
        # Check if a SWOT analysis already exists for this user and year
        existing_swot = SwotAnalysis.objects.filter(receiver_id=user_id_str, year=year).first()
        
        if existing_swot and not force_new:
            print(f"Found existing SWOT analysis for user {user_id} for year {year}")
            return Response({
                "id": str(existing_swot.id),
                "receiver_id": existing_swot.receiver_id,
                "year": existing_swot.year,
                "summary": existing_swot.summary,
                "strengths": existing_swot.strengths,
                "weaknesses": existing_swot.weaknesses,
                "opportunities": existing_swot.opportunities,
                "threats": existing_swot.threats,
                "created_at": existing_swot.created_at.isoformat(),
            })
        
        # Collect all feedback for this user
        feedback_data = []
        
        # Filter feedback entries where the receiver field matches the user_id
        feedback_entries = Feedback.objects.filter(receiver=user_id_str, is_submitted=True)
        
        print(f"Found {feedback_entries.count()} feedback entries for user {user_id}")
        print(f"VERIFICATION: Querying feedback with receiver ID (not name): {user_id_str}")
        
        if not feedback_entries.exists():
            print(f"No feedback found for user {user_id}")
            return Response({"error": "No feedback found for this user"}, status=status.HTTP_404_NOT_FOUND)

        for feedback in feedback_entries:
            # Ensure questions and answers are properly handled
            questions = feedback.questions
            answers = feedback.answers if feedback.answers else {}
            
            print(f"Feedback ID: {feedback.id}, Type: {feedback.feedback_type}")
            print(f"VERIFICATION: Feedback receiver ID: {feedback.receiver}")
            print(f"Questions: {questions}")
            print(f"Answers: {answers}")
            
            feedback_data.append({
                "questions": questions,
                "answers": answers,
                "feedback_type": feedback.feedback_type
            })
        
        # Generate SWOT analysis
        try:
            print(f"Generating SWOT analysis for user {user_id}")
            swot_data = self.perform_swot_analysis(feedback_data)
            
            # Get the user object
            try:
                user = AuthUser.objects.get(id=user_id)
                
                # Store SWOT analysis with user object
                swot_entry = SwotAnalysis.objects.create(
                    receiver=user,
                    year=year,
                    summary=swot_data.get("Summary", ""),
                    strengths=swot_data.get("Strengths", ""),
                    weaknesses=swot_data.get("Weaknesses", ""),
                    opportunities=swot_data.get("Opportunities", ""),
                    threats=swot_data.get("Threats", ""),
                )
                
                receiver_id = str(user.id)
            except AuthUser.DoesNotExist:
                # For testing purposes, create a mock entry
                # In production, you would want to handle this differently
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # Return the SWOT analysis
            return Response({
                "id": str(swot_entry.id),
                "receiver_id": receiver_id,
                "year": swot_entry.year,
                "summary": swot_entry.summary,
                "strengths": swot_entry.strengths,
                "weaknesses": swot_entry.weaknesses,
                "opportunities": swot_entry.opportunities,
                "threats": swot_entry.threats,
                "created_at": swot_entry.created_at.isoformat(),
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"Error generating SWOT analysis: {str(e)}")
            return Response({"error": f"Error generating SWOT analysis: {str(e)}"}, 
                           status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def perform_swot_analysis(self, feedback_data):
        """Generates a SWOT analysis dynamically using Groq API."""
        try:
            input_text = "Generate a detailed SWOT analysis based on the following employee feedback:\n\n"
            
            for entry in feedback_data:
                feedback_type = entry.get("feedback_type", "Unknown")
                input_text += f"## {feedback_type} Feedback:\n"
                
                questions = entry["questions"]
                answers = entry["answers"]

                # Format questions and answers properly
                if isinstance(questions, list) and isinstance(answers, list):
                    for q, a in zip(questions, answers):
                        input_text += f"**Q:** {q}\n**A:** {a}\n\n"
                elif isinstance(questions, list) and isinstance(answers, dict):
                    for i, q in enumerate(questions):
                        answer = answers.get(str(i), "No answer provided")
                        input_text += f"**Q:** {q}\n**A:** {answer}\n\n"

            # Use the API key directly
            api_key = "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"
            print("Using hardcoded API key")

            # Initialize Groq client
            client = Groq(api_key=api_key)

            # Call Groq API
            print("Calling Groq API for SWOT analysis")
            response = client.chat.completions.create(
                model="mixtral-8x7b-32768",
                messages=[
                    {"role": "system", "content": 
                     "You are an expert HR performance analyst. Based on employee feedback, generate a detailed SWOT analysis "
                     "(Strengths, Weaknesses, Opportunities, and Threats) for this employee. Format the response in markdown-style "
                     "headings: '## Summary', '## Strengths', '## Weaknesses', '## Opportunities', and '## Threats'."},
                    {"role": "user", "content": input_text}
                ]
            )

            # Extract AI response
            swot_text = response.choices[0].message.content
            return self.parse_swot_response(swot_text)

        except Exception as e:
            print(f"Error in perform_swot_analysis: {str(e)}")
            return {
                "Summary": f"Error generating SWOT analysis: {str(e)}",
                "Strengths": "N/A",
                "Weaknesses": "N/A",
                "Opportunities": "N/A",
                "Threats": "N/A"
            }

    def parse_swot_response(self, response_text):
        """Parses AI-generated SWOT response into structured data."""
        swot_data = {"Summary": "", "Strengths": "", "Weaknesses": "", "Opportunities": "", "Threats": ""}

        for section in swot_data.keys():
            pattern = rf"(?i)## {section}\n(.*?)(?=\n## |\Z)"
            match = re.search(pattern, response_text, re.DOTALL)
            swot_data[section] = match.group(1).strip() if match else f"No {section.lower()} identified."

        return swot_data

class DeleteSwotAnalysisView(APIView):
    """API view to delete a SWOT analysis for a user."""
    
    def delete(self, request):
        """Deletes a SWOT analysis for a user."""
        user_id = request.GET.get('user_id')
        year = request.GET.get('year', datetime.datetime.now().year)
        
        print(f"Delete SWOT Analysis requested for user_id: {user_id}, year: {year}")
        
        if not user_id:
            return Response({"error": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            # Convert year to integer
            year = int(year)
        except ValueError:
            return Response({"error": "Year must be a valid integer"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            # Get the user object
            try:
                user = AuthUser.objects.get(id=user_id)
                print(f"Found user: {user.name} (ID: {user.id})")
            except AuthUser.DoesNotExist:
                print(f"User with ID {user_id} not found")
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
                
            # Delete all SWOT analyses for this user and year
            deleted_count, _ = SwotAnalysis.objects.filter(receiver=user, year=year).delete()
            
            if deleted_count > 0:
                print(f"Deleted {deleted_count} SWOT analyses for user {user.id} and year {year}")
                return Response({"message": f"Successfully deleted {deleted_count} SWOT analyses"}, status=status.HTTP_200_OK)
            else:
                print(f"No SWOT analyses found for user {user.id} and year {year}")
                return Response({"message": "No SWOT analyses found to delete"}, status=status.HTTP_404_NOT_FOUND)
                
        except Exception as e:
            print(f"Error deleting SWOT analysis: {str(e)}")
            return Response({"error": f"Error deleting SWOT analysis: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SwotAnalysisAvailabilityView(APIView):
    """API view to check SWOT analysis availability for a specific employee."""

    def get(self, request):
        """Retrieves all SWOT analysis data for a specific employee."""
        user_id = request.query_params.get('user_id')

        if not user_id:
            return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Fetch all SWOT analyses for the specific user
            swot_analyses = SwotAnalysis.objects.filter(receiver_id=user_id)

            if not swot_analyses.exists():
                return Response({"message": "No SWOT analyses found for this user"}, status=status.HTTP_404_NOT_FOUND)

            # Prepare the response data
            response_data = [
                {
                    "id": str(swot.id),
                    "receiver_id": swot.receiver_id,
                    "year": swot.year,
                    "summary": swot.summary,
                    "strengths": swot.strengths,
                    "weaknesses": swot.weaknesses,
                    "opportunities": swot.opportunities,
                    "threats": swot.threats,
                    "created_at": swot.created_at.isoformat(),
                }
                for swot in swot_analyses
            ]

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": f"Error retrieving SWOT analyses: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)