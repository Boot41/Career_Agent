import requests
import json
import sys

BASE_URL = "http://localhost:8001/feedback"

def test_create_feedback():
    """Test the create feedback API endpoint."""
    url = f"{BASE_URL}/api/create-feedback/"
    
    # Test data
    data = {
        "giver_id": 1,  # Replace with actual user ID
        "feedback_type": "Manager",  # Options: Manager, Peer, Self
        "organization_id": 101  # Replace with actual organization ID
    }
    
    # Make the request
    response = requests.post(url, json=data)
    
    # Print the response
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    return response.json()

def test_pending_feedback(user_id):
    """Test the pending feedback API endpoint."""
    url = f"{BASE_URL}/pending-feedback/?user_id={user_id}"
    
    # Make the request
    response = requests.get(url)
    
    # Print the response
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    return response.json()

def test_submit_answers(feedback_id):
    """Test the submit answers API endpoint."""
    url = f"{BASE_URL}/submit-answers/"
    
    # Test data
    data = {
        "feedback_id": feedback_id,
        "answers": [
            "This is an answer to question 1",
            "This is an answer to question 2",
            "This is an answer to question 3",
            "This is an answer to question 4",
            "This is an answer to question 5"
        ]
    }
    
    # Make the request
    response = requests.post(url, json=data)
    
    # Print the response
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    return response.json()

if __name__ == "__main__":
    # Test create feedback
    print("\n=== Testing Create Feedback API ===")
    feedback = test_create_feedback()
    
    if "id" in feedback:
        feedback_id = feedback["id"]
        
        # Test pending feedback
        print("\n=== Testing Pending Feedback API ===")
        test_pending_feedback(1)  # Replace with actual user ID
        
        # Test submit answers
        print("\n=== Testing Submit Answers API ===")
        test_submit_answers(feedback_id)
    else:
        print("Failed to create feedback. Cannot continue with other tests.")
