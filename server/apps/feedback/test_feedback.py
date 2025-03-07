import pytest
import requests

BASE_URL = "http://localhost:8001/feedback"

@pytest.fixture
def setup_feedback_data():
    # Setup code to create test data
    # This could involve creating a user, feedback, etc.
    yield
    # Teardown code to clean up test data

def test_create_feedback(setup_feedback_data):
    response = requests.post(f"{BASE_URL}/create-feedback/", json={
        "giver_id": "string_id_1",
        "receiver_id": "string_id_2",
        "content": "Test feedback"
    })
    assert response.status_code == 201
    assert response.json().get("is_submitted") is False

def test_get_pending_feedback(setup_feedback_data):
    response = requests.get(f"{BASE_URL}/pending-feedback/?user_id=string_id_1")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_submit_answers(setup_feedback_data):
    response = requests.post(f"{BASE_URL}/submit-answers/", json={
        "feedback_id": "string_id_3",
        "answers": ["Answer 1", "Answer 2"]
    })
    assert response.status_code == 200
    assert response.json().get("success") is True