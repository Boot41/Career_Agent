from django.urls import path
from .views import LiveKitTokenView
from .views import LLMSummarizeView

urlpatterns = [
    path("getToken/", LiveKitTokenView.as_view(), name="getToken"),
    path("llmapi/", LLMSummarizeView.as_view(), name="llmapi"),
]
