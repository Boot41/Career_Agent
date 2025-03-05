# Feedback API Documentation

This document provides details about the Feedback API endpoints, their functionality, and how to use them.

## API Endpoints

### 1. Create Feedback

Creates a new feedback entry with dynamically determined receiver based on feedback type.

**Endpoint:** `/feedback/api/create-feedback/`  
**Method:** POST  
**Authentication:** Required

**Request Body:**
```json
{
  "giver_id": "string",
  "feedback_type": "string",
  "organization_id": "string"
}
```

**Parameters:**
- `giver_id`: ID of the user giving feedback
- `feedback_type`: Type of feedback (Options: "Manager", "Peer", "Self")
- `organization_id`: ID of the organization

**Response:**
```json
{
  "id": "integer",
  "questions": ["string"]
}
```

**Status Codes:**
- 201: Feedback created successfully
- 400: Invalid request data

**Notes:**
- The receiver is determined dynamically based on the feedback type:
  - Manager Feedback: Finds the manager of the giver
  - Peer Feedback: Finds a peer from the same organization
  - Self Feedback: Receiver is the same as the giver
- Questions are generated using AI (Groq API) or fallback to predefined questions if AI generation fails

### 2. Get Pending Feedback

Retrieves pending feedback for a specific user.

**Endpoint:** `/feedback/pending-feedback/`  
**Method:** GET  
**Authentication:** Required

**Query Parameters:**
- `user_id`: ID of the user to get pending feedback for

**Response:**
```json
[
  {
    "id": "integer",
    "giver": "integer",
    "receiver": "integer",
    "organization_id": "integer",
    "feedback_type": "string",
    "questions": ["string"],
    "created_at": "datetime"
  }
]
```

**Status Codes:**
- 200: Success
- 400: Invalid request data

### 3. Submit Answers

Submits answers for a specific feedback.

**Endpoint:** `/feedback/submit-answers/`  
**Method:** POST  
**Authentication:** Required

**Request Body:**
```json
{
  "feedback_id": "integer",
  "answers": ["string"]
}
```

**Parameters:**
- `feedback_id`: ID of the feedback to submit answers for
- `answers`: List of answers corresponding to the questions

**Response:**
```json
{
  "id": "integer",
  "giver": "integer",
  "receiver": "integer",
  "organization_id": "integer",
  "feedback_type": "string",
  "questions": ["string"],
  "answers": ["string"],
  "created_at": "datetime"
}
```

**Status Codes:**
- 200: Answers submitted successfully
- 400: Invalid request data
- 404: Feedback not found

## Testing the API

A test script (`test_feedback_api.py`) is provided to test the API endpoints. To run the test script:

```bash
python test_feedback_api.py
```

The script tests the following endpoints:
1. Create Feedback
2. Get Pending Feedback
3. Submit Answers

## Error Handling

All endpoints include error handling and will return appropriate status codes and error messages if something goes wrong.

## AI Question Generation

The API uses Groq API to generate AI-powered questions based on the feedback type. If the API call fails or the API key is not available, it falls back to predefined questions.

### Predefined Questions

#### Manager Feedback:
1. How effectively has this employee contributed to team goals?
2. What leadership qualities does this employee demonstrate?
3. How does this employee handle responsibility and accountability?
4. What are the employee's key strengths?
5. What areas should this employee improve in?

#### Peer Feedback:
1. How well does this employee collaborate with teammates?
2. What strengths have you observed in this employee's teamwork?
3. How does this employee handle communication and conflict?
4. What improvements could help this employee work better with the team?
5. What contributions has this employee made to group projects?

#### Self Feedback:
1. What challenges have you faced in your role?
2. What accomplishments are you most proud of?
3. What areas do you think you need to improve?
4. How have you grown in your role over the past year?
5. What support do you need to enhance your performance?
