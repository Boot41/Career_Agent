import os
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def test_feedback_endpoint():
    # Base URL for the feedback endpoint
    base_url = "http://localhost:8000/feedback/generate-feedback/"

    # Test scenarios
    test_scenarios = [
        {
            "role": "Software Engineer", 
            "feedback_type": "Performance Review", 
            "feedback_receiver": "Manager"
        },
        {
            "role": "Sales Representative", 
            "feedback_type": "Quarterly Assessment", 
            "feedback_receiver": "Peer"
        }
    ]

    for scenario in test_scenarios:
        print(f"\nTesting with: {scenario}")
        
        try:
            # Make the API request
            response = requests.post(base_url, json=scenario)
            
            # Check response status
            if response.status_code == 200:
                # The response is now a direct list of questions
                result = response.json()
                
                print("Successful Response:")
                print("Generated Questions:")
                for q in result:
                    print(f"- {q}")
            else:
                print(f"Error: {response.status_code}")
                print(response.text)
        
        except Exception as e:
            print(f"Exception occurred: {e}")

if __name__ == "__main__":
    test_feedback_endpoint()
