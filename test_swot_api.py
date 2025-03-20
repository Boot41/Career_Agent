import requests
import json
import sys

# Test the SWOT analysis API
user_id = "887e524c-7365-4f91-a703-4cdb645179cb"
year = 2025

print("=" * 50)
print("SWOT Analysis API Test")
print("=" * 50)

# Use force_new=true to force a new SWOT analysis generation
print(f"Testing SWOT analysis API for user_id: {user_id}, year: {year}, force_new: true")

try:
    response = requests.get(f"http://0.0.0.0:8001/feedback/generate/?user_id={user_id}&year={year}&force_new=true")
    
    print(f"Status code: {response.status_code}")
    print(f"Response headers: {response.headers}")
    
    if response.status_code == 200:
        data = response.json()
        print("\nSWOT Analysis Results:")
        print("-" * 30)
        print(f"ID: {data.get('id')}")
        print(f"Receiver ID: {data.get('receiver_id')}")
        print(f"Year: {data.get('year')}")
        print(f"Created at: {data.get('created_at')}")
        
        print("\nSummary:")
        print(data.get('summary'))
        
        print("\nStrengths:")
        print(data.get('strengths'))
        
        print("\nWeaknesses:")
        print(data.get('weaknesses'))
        
        print("\nOpportunities:")
        print(data.get('opportunities'))
        
        print("\nThreats:")
        print(data.get('threats'))
        
        # Check if there was an API error
        if "API error" in data.get('summary', ''):
            print("\n ERROR: API error detected in the response")
            print(f"Error details: {data.get('summary')}")
            sys.exit(1)
        else:
            print("\n SUCCESS: SWOT analysis generated successfully")
    else:
        print(f"\n ERROR: Unexpected status code: {response.status_code}")
        print(f"Response body: {response.text}")
        sys.exit(1)
        
except Exception as e:
    print(f"\n ERROR: Exception occurred: {str(e)}")
    sys.exit(1)
