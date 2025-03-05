from rest_framework import serializers

class FeedbackPromptSerializer(serializers.Serializer):
    role = serializers.CharField(max_length=255)
    feedback_type = serializers.CharField(max_length=255)
    feedback_receiver = serializers.ChoiceField(
        choices=["Manager", "Peer", "Employee", "Self"]
    )

class FeedbackCreateSerializer(serializers.Serializer):
    giver_id = serializers.CharField(max_length=255)
    feedback_type = serializers.ChoiceField(choices=["Manager", "Peer", "Self"])
    organization_id = serializers.CharField(max_length=255)
