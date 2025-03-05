# Feedback API Documentation

This document provides information about the Feedback API endpoints and how to use them.

## API Endpoints

### 1. Create Feedback

Creates a new feedback entry.

- **URL**: `/feedback/create-feedback/`
- **Method**: `POST`
- **Content Type**: `application/json`
- **Request Body**:
  ```json
  {
    "giver": 5,             // ID of the feedback giver
    "receiver": 10,         // ID of the feedback receiver
    "organization_id": 101, // Organization ID
    "feedback_type": "manager", // Type of feedback (e.g., "manager", "employee")
    "questions": [          // List of questions
      "How well did the employee perform this quarter?",
      "What strengths did the employee demonstrate?",
      "What areas need improvement?"
    ]
  }
  ```
- **Success Response**:
  - **Code**: 201
  - **Content**: `{ "id": 1 }`

### 2. Get Pending Feedback

Retrieves pending feedback for a specific user.

- **URL**: `/feedback/pending-feedback/?user_id=X`
- **Method**: `GET`
- **URL Parameters**:
  - `user_id`: ID of the user to get pending feedback for
- **Success Response**:
  - **Code**: 200
  - **Content**: 
    ```json
    [
      {
        "id": 1,
        "questions": [
          "How well did the employee perform this quarter?",
          "What strengths did the employee demonstrate?",
          "What areas need improvement?"
        ]
      }
    ]
    ```

### 3. Submit Answers

Submits answers for a specific feedback.

- **URL**: `/feedback/submit-answers/`
- **Method**: `POST`
- **Content Type**: `application/json`
- **Request Body**:
  ```json
  {
    "feedback_id": 1,       // ID of the feedback to submit answers for
    "answers": [            // List of answers
      "The employee performed exceptionally well this quarter.",
      "Strong communication skills and technical expertise.",
      "Time management could be improved."
    ]
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**: `{ "id": 1 }`

## Testing

You can test the API using the provided `test_feedback_api.sh` script:

```bash
./test_feedback_api.sh
```

This script demonstrates the full workflow of creating feedback, retrieving pending feedback, and submitting answers.

## Error Handling

All endpoints return appropriate error messages in case of failure:

```json
{
  "error": "Error message"
}
```

## Notes

- CSRF protection is disabled for testing purposes. In a production environment, you should enable CSRF protection and use proper authentication.
- The `user_id` parameter in the `pending-feedback` endpoint is provided for testing purposes. In a production environment, the authenticated user's ID should be used.
