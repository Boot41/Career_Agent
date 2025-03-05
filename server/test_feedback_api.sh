#!/bin/bash

# Test creating feedback
echo "Creating feedback with dynamic receiver selection..."
CREATE_RESPONSE=$(curl -s -X POST http://localhost:8002/feedback/create-feedback/ -H "Content-Type: application/json" -d '{"giver_id": "1", "feedback_type": "Manager", "organization_id": "101"}')
echo $CREATE_RESPONSE | python3 -m json.tool

echo -e "\nCreating peer feedback with dynamic receiver selection..."
CREATE_PEER_RESPONSE=$(curl -s -X POST http://localhost:8002/feedback/create-feedback/ -H "Content-Type: application/json" -d '{"giver_id": "2", "feedback_type": "Peer", "organization_id": "101"}')
echo $CREATE_PEER_RESPONSE | python3 -m json.tool

echo -e "\nCreating self feedback..."
CREATE_SELF_RESPONSE=$(curl -s -X POST http://localhost:8002/feedback/create-feedback/ -H "Content-Type: application/json" -d '{"giver_id": "3", "feedback_type": "Self", "organization_id": "101"}')
SELF_FEEDBACK_ID=$(echo $CREATE_SELF_RESPONSE | grep -o '"id": "[^"]*"' | cut -d'"' -f4)
echo $CREATE_SELF_RESPONSE | python3 -m json.tool

# Test getting pending feedback
echo -e "\nChecking pending feedback for user 3..."
curl -s -X GET http://localhost:8002/feedback/pending-feedback/?user_id=3 | python3 -m json.tool

# Test submitting answers
echo -e "\nSubmitting answers for feedback ID: $SELF_FEEDBACK_ID..."
curl -s -X POST http://localhost:8002/feedback/submit-answers/ -H "Content-Type: application/json" -d "{\"feedback_id\": \"$SELF_FEEDBACK_ID\", \"answers\": [\"I performed well this quarter.\", \"My communication skills are strong.\", \"I need to improve my time management.\", \"I communicate effectively with my team.\", \"I want to learn a new programming language in the next six months.\"]}" | python3 -m json.tool

# Verify feedback is no longer pending
echo -e "\nVerifying feedback is no longer pending for user 3..."
curl -s -X GET http://localhost:8002/feedback/pending-feedback/?user_id=3 | python3 -m json.tool

# Test generating questions
echo -e "\nGenerating questions for Manager feedback type..."
curl -s -X POST http://localhost:8002/feedback/generate-questions/ -H "Content-Type: application/json" -d '{"feedback_type": "Manager"}' | python3 -m json.tool

echo -e "\nAll tests completed!"
