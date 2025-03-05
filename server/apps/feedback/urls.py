from django.urls import path
from .views import (
    CreateFeedbackAPI, 
    PendingFeedbackView, 
    SubmitAnswersView, 
    GenerateQuestionsView,
    GenerateFeedbackView,
    ManagedEmployeesView,
    SwotAnalysisView,
    DeleteSwotAnalysisView,
    SwotAnalysisAvailabilityView
)

urlpatterns = [
    path('create-feedback/', CreateFeedbackAPI.as_view(), name='create_feedback'),
    path('pending-feedback/', PendingFeedbackView.as_view(), name='pending_feedback'),
    path('submit-answers/', SubmitAnswersView.as_view(), name='submit_answers'),
    path('generate-questions/', GenerateQuestionsView.as_view(), name='generate_questions'),
    path('generate-feedback/', GenerateFeedbackView.as_view(), name='generate_feedback'),
    path('managed-employees/', ManagedEmployeesView.as_view(), name='managed_employees'),
    path('generate/', SwotAnalysisView.as_view(), name='generate_swot'),
    path('delete-swot/', DeleteSwotAnalysisView.as_view(), name='delete_swot'),
    path('swot-analysis/availability/', SwotAnalysisAvailabilityView.as_view(), name='swot-availability'),
    # Legacy endpoints for backward compatibility
    path('generate-ai-feedback/', GenerateFeedbackView.as_view(), name='generate_ai_feedback'),
    path('api/create-feedback/', CreateFeedbackAPI.as_view(), name='api_create_feedback'),
]
