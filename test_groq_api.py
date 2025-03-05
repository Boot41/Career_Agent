#!/usr/bin/env python3
import os
import dotenv
from groq import Groq

# Load environment variables
dotenv.load_dotenv('/home/sukriti/C_Agent/server/.env')

# Get the API key
groq_api_key = os.environ.get('GROQ_API_KEY')
print(f"API Key: {groq_api_key[:5]}..." if groq_api_key else "API Key not found")

try:
    # Initialize the Groq client
    client = Groq(api_key=groq_api_key)
    
    # Make a simple API call
    response = client.chat.completions.create(
        messages=[{"role": "user", "content": "Hello, how are you?"}],
        model="llama3-70b-8192"
    )
    
    # Print the response
    print("\nAPI Response:")
    print(response.choices[0].message.content)
    print("\nAPI call successful!")
    
except Exception as e:
    print(f"\nAPI Error: {str(e)}")
