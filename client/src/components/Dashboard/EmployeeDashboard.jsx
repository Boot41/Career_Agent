import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { MessageSquareText, FileText, Send } from 'lucide-react';

const EmployeeDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [pendingFeedback, setPendingFeedback] = useState([]);
  const [submittedFeedback, setSubmittedFeedback] = useState([]);
  const [selfReflection, setSelfReflection] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showQuestions, setShowQuestions] = useState(null); // Track which feedback questions to show
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [responses, setResponses] = useState({});

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  useEffect(() => {
    const fetchPendingFeedback = async () => {
      if (userData && userData.id) {
        try {
          const response = await fetch(`http://localhost:8001/feedback/pending-feedback/?user_id=${userData.id}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          console.log('Fetched pending feedback:', data); // Log the fetched data
          setPendingFeedback(data);
        } catch (error) {
          console.error('Error fetching pending feedback:', error);
          alert(`Failed to fetch pending feedback. Error: ${error.message}. Please check your network connection and server status.`);
        }
      }
    };

    if (userData) {
      fetchPendingFeedback(); // Call fetch function only when userData is available
    }
  }, [userData]); // Dependency array includes userData

  const handleResponseChange = (requestId, questionId, value) => {
    setSelfReflection(prev => ({
      ...prev,
      [requestId]: {
        ...(prev[requestId] || {}),
        [questionId]: value
      }
    }));
  };

  /**
   * Submit feedback for the employee
   */
  const handleSubmit = async () => {
    const feedbackId = selectedFeedback.id; // Get the selected feedback ID
    const answers = responses; // Use the responses state for answers

    // Log the feedback ID and answers
    console.log('Submitting Feedback ID:', feedbackId);
    console.log('Answers:', answers);

    // Validate data before sending
    if (!feedbackId) {
      console.error('Error: No feedback ID provided');
      return;
    }

    if (!answers || Object.keys(answers).length === 0) {
      console.error('Error: No answers provided');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8001/feedback/submit-answers/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedback_id: feedbackId,
          answers: answers
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Server error details:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle the response
      const result = await response.json();
      console.log('Feedback submitted successfully:', result);
      
      // Update UI state
      setSubmitted(true);
      
      // Remove the submitted feedback from the pending list
      setPendingFeedback(prevFeedback => 
        prevFeedback.filter(feedback => feedback.id !== feedbackId)
      );
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleFormSubmit = () => {
    handleSubmit();
    setIsFormOpen(false);
  };

  const handleFormOpen = (requestId) => {
    const selectedRequest = pendingFeedback.find(req => req.id === requestId);
    setSelectedFeedback(selectedRequest);
    setIsFormOpen(true);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userType="employee" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Employee Dashboard" 
          userName={userData ? `${userData.name} (${userData.role})` : 'Loading...'} 
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Pending Feedback Requests</h2>
          {pendingFeedback.length > 0 ? (
            <div>
              {pendingFeedback.map((request) => (
                <button key={request.id} className="border border-gray-200 rounded-lg p-5 mb-4 w-full text-left" onClick={() => handleFormOpen(request.id)}>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium">
                        {request.receiver_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">Feedback for: {request.receiver_name}</h4>
                        <p className="text-sm text-gray-500">Type: {request.feedback_type}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">Created: {new Date(request.created_at).toLocaleDateString()}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p>No pending feedback requests.</p>
          )}
          {isFormOpen && selectedFeedback && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Questions for {selectedFeedback.receiver_name}</h3>
                {selectedFeedback.questions.map((question, index) => (
                  <div key={index} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {index + 1}. {question}
                    </label>
                    <textarea
                      value={responses[`${selectedFeedback.id}-${index}`] || ''}
                      onChange={(e) => setResponses(prev => ({ ...prev, [`${selectedFeedback.id}-${index}`]: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                      placeholder="Provide your feedback here..."
                    />
                  </div>
                ))}
                <div className="flex justify-end">
                  <button onClick={handleFormSubmit} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    <Send size={18} />
                    <span>Submit Feedback</span>
                  </button>
                  <button onClick={() => setIsFormOpen(false)} className="ml-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          {submittedFeedback.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Submitted Feedback
              </h3>
              {submittedFeedback.map(submission => (
                <div key={submission.id} className="border border-gray-200 rounded-lg p-5 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="font-medium text-gray-800">{submission.title}</h4>
                      <p className="text-sm text-gray-500">Submitted on: {submission.submitted_on}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      Status: {submission.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 mt-6">No submitted feedback found.</p>
          )}
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
