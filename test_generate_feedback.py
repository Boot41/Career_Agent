#!/usr/bin/env python3
import requests
import json

# Test the GenerateFeedbackView endpoint
def test_generate_feedback():
    url = "http://localhost:8001/feedback/generate-feedback/"
    payload = {
        "role": "Software Engineer",
        "feedback_receiver": "Manager"
    }
    
    print(f"Sending request to {url} with payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, json=payload)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("\nGenerated Questions:")
            for i, question in enumerate(data.get("questions", []), 1):
                print(f"{i}. {question}")
        else:
            print(f"Error Response: {response.text}")
    
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_generate_feedback()
