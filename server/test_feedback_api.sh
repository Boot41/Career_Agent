#!/bin/bash

# Test creating feedback
echo "Creating feedback from user 1 to user 2..."
CREATE_RESPONSE=$(curl -s -X POST http://localhost:8001/feedback/create-feedback/ -H "Content-Type: application/json" -d '{"giver": 1, "receiver": 2, "organization_id": 101, "feedback_type": "manager", "questions": ["How well did the employee perform this quarter?", "What strengths did the employee demonstrate?", "What areas need improvement?"]}')
FEEDBACK_ID=$(echo $CREATE_RESPONSE | grep -o '"id": [0-9]*' | cut -d' ' -f2)
echo "Created feedback with ID: $FEEDBACK_ID"

# Test getting pending feedback
echo -e "\nChecking pending feedback for user 2..."
curl -s -X GET http://localhost:8001/feedback/pending-feedback/?user_id=2 | python3 -m json.tool

# Test submitting answers
echo -e "\nSubmitting answers for feedback ID: $FEEDBACK_ID..."
curl -s -X POST http://localhost:8001/feedback/submit-answers/ -H "Content-Type: application/json" -d "{\"feedback_id\": $FEEDBACK_ID, \"answers\": [\"The employee performed exceptionally well this quarter.\", \"Strong communication skills and technical expertise.\", \"Time management could be improved.\"]}" | python3 -m json.tool

# Verify feedback is no longer pending
echo -e "\nVerifying feedback is no longer pending for user 2..."
curl -s -X GET http://localhost:8001/feedback/pending-feedback/?user_id=2 | python3 -m json.tool

echo -e "\nAll tests completed!"
