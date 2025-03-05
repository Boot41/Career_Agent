from django.urls import path
from .views import CreateFeedbackView, PendingFeedbackView, SubmitAnswersView

urlpatterns = [
    path('create-feedback/', CreateFeedbackView.as_view(), name='create_feedback'),
    path('pending-feedback/', PendingFeedbackView.as_view(), name='pending_feedback'),
    path('submit-answers/', SubmitAnswersView.as_view(), name='submit_answers'),
]
