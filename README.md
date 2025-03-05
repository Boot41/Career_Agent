# SWOT Analysis System

This system generates SWOT (Strengths, Weaknesses, Opportunities, Threats) analyses for employees based on feedback data.

## Setup Instructions

### 1. Groq API Key Setup

The SWOT analysis generation requires a valid Groq API key. Follow these steps to set it up:

1. Get a Groq API key from [https://console.groq.com/keys](https://console.groq.com/keys)
2. Run the setup script with your API key:
   ```bash
   ./setup_groq_api.sh YOUR_GROQ_API_KEY
   ```
   
   This will:
   - Set the GROQ_API_KEY environment variable in your current shell
   - Create a .env file in the server directory with your API key
   - Restart the server

### 2. Manual Setup (Alternative)

If you prefer to set up the API key manually:

1. Create a .env file in the server directory:
   ```bash
   echo "GROQ_API_KEY=your_api_key_here" > server/.env
   ```

2. Set the environment variable:
   ```bash
   export GROQ_API_KEY=your_api_key_here
   ```

3. Restart the server:
   ```bash
   kill -9 $(lsof -t -i:8001) 2>/dev/null || true
   cd server && python3 manage.py runserver 0.0.0.0:8001
   ```

## Troubleshooting

If you encounter API errors when generating SWOT analyses:

1. Verify that your Groq API key is valid
2. Check that the environment variable is set correctly:
   ```bash
   echo $GROQ_API_KEY
   ```
3. Ensure the .env file exists in the server directory:
   ```bash
   cat server/.env
   ```
4. Try forcing a new SWOT analysis generation by adding `force_new=true` to the API request:
   ```
   http://localhost:8001/feedback/generate/?user_id=YOUR_USER_ID&force_new=true
   ```
