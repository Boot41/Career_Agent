import os
from dotenv import load_dotenv
from groq import Groq

# Load environment variables from .env file
load_dotenv()

def test_groq_api():
    # Retrieve API key from environment
    api_key = os.getenv('GROQ_API_KEY')
    
    if not api_key:
        print("Error: GROQ_API_KEY environment variable not set")
        return False

    try:
        # Initialize Groq client
        client = Groq(api_key=api_key)

        # Generate feedback questions
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": "Generate 5 specific feedback questions for a Performance Review of a Software Engineer. Focus on technical skills, collaboration, and professional growth."
                }
            ],
            model="llama3-70b-8192"
        )

        # Print and return the generated questions
        questions = chat_completion.choices[0].message.content.strip()
        print("API Call Successful!")
        print("Generated Questions:")
        print(questions)
        return True

    except Exception as e:
        print(f"Exception occurred: {e}")
        return False

if __name__ == "__main__":
    test_groq_api()
