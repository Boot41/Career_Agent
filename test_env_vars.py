#!/usr/bin/env python3
import os
import dotenv

# Load environment variables from .env file
dotenv.load_dotenv('/home/sukriti/C_Agent/server/.env')

# Check if GROQ_API_KEY is set
groq_api_key = os.environ.get('GROQ_API_KEY')
if groq_api_key:
    print("GROQ_API_KEY is set")
    # Print first few characters to verify it's not empty
    print(f"Key starts with: {groq_api_key[:5]}...")
else:
    print("GROQ_API_KEY is not set")

# List all environment variables (excluding their values for security)
print("\nAll environment variables:")
for key in os.environ.keys():
    print(f"- {key}")
