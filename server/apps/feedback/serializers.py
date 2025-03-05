from rest_framework import serializers
from .models import Feedback

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ['id', 'giver', 'receiver', 'organization_id', 'feedback_type', 'questions', 'answers', 'is_submitted', 'created_at']

class FeedbackPromptSerializer(serializers.Serializer):
    role = serializers.CharField(max_length=255)
    feedback_type = serializers.CharField(max_length=255, required=False)
    feedback_receiver = serializers.ChoiceField(
        choices=["Manager", "Peer", "Employee", "Self"]
    )

class FeedbackCreateSerializer(serializers.Serializer):
    giver_id = serializers.CharField(max_length=255)
    feedback_type = serializers.ChoiceField(choices=["Manager", "Peer", "Self"])
    organization_id = serializers.CharField(max_length=255)
