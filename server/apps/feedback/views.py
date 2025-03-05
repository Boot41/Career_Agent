from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Feedback
import json

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