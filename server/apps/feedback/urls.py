from django.urls import path
from .views import GenerateFeedbackView

urlpatterns = [
    path("generate-feedback/", GenerateFeedbackView.as_view(), name="generate_feedback"),
]
