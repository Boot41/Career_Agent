from django.urls import path
from .views import CreateFeedbackView, PendingFeedbackView, SubmitAnswersView, GenerateQuestionsView, GenerateFeedbackView

urlpatterns = [
    path('create-feedback/', CreateFeedbackView.as_view(), name='create_feedback'),
    path('pending-feedback/', PendingFeedbackView.as_view(), name='pending_feedback'),
    path('submit-answers/', SubmitAnswersView.as_view(), name='submit_answers'),
    path('generate-feedback/', GenerateQuestionsView.as_view(), name='generate_feedback'),
    path('generate-ai-feedback/', GenerateFeedbackView.as_view(), name='generate_ai_feedback'),
]
