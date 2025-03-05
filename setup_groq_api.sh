#!/bin/bash

# Script to set up Groq API key for the SWOT analysis system

# Check if an API key was provided
if [ -z "$1" ]; then
  echo "Usage: ./setup_groq_api.sh YOUR_GROQ_API_KEY"
  echo "You can get a Groq API key from https://console.groq.com/keys"
  exit 1
fi

# Set the API key in the environment
export GROQ_API_KEY="$1"
echo "GROQ_API_KEY has been set in the current shell environment."

# Create a .env file for the server
echo "GROQ_API_KEY=$1" > /home/sukriti/C_Agent/server/.env
echo "Created .env file in the server directory."

# Restart the server
echo "Restarting the server..."
kill -9 $(lsof -t -i:8001) 2>/dev/null || true
cd /home/sukriti/C_Agent/server && python3 manage.py runserver 0.0.0.0:8001
