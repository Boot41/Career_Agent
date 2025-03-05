import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { MessageSquareText, FileText } from 'lucide-react';

// Dummy feedback requests
const dummyFeedbackRequests = [
  {
    id: 1,
    title: "Quarterly Self-Reflection",
    description: "Please provide insights into your recent work and personal growth.",
    deadline: "2025-03-20",
    questions: [
      "What are your key achievements in the last quarter?",
      "What challenges did you face, and how did you overcome them?",
      "What skills would you like to develop further?",
      "How do you see yourself contributing to the team's goals in the next quarter?"
    ],
    reviewed: false
  }
];

// Dummy submitted feedback
const dummySubmittedFeedback = [
  {
    id: 1,
    title: "Q4 2024 Self-Reflection",
    submitted_on: "2025-01-10",
    status: "Reviewed"
  },
  {
    id: 2,
    title: "Mid-Year Performance Review",
    submitted_on: "2024-06-15",
    status: "Pending"
  }
];

const EmployeeDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [feedbackRequests, setFeedbackRequests] = useState(dummyFeedbackRequests);
  const [submittedFeedback, setSubmittedFeedback] = useState(dummySubmittedFeedback);
  const [selfReflection, setSelfReflection] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showQuestions, setShowQuestions] = useState(null); // Track which feedback questions to show

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  const handleResponseChange = (requestId, questionId, value) => {
    setSelfReflection(prev => ({
      ...prev,
      [requestId]: {
        ...(prev[requestId] || {}),
        [questionId]: value
      }
    }));
  };

  const handleSubmit = (requestId) => {
    setSubmitted(true);
    setFeedbackRequests(prev => 
      prev.filter(request => request.id !== requestId)
    );
    
    const submittedRequest = dummyFeedbackRequests.find(req => req.id === requestId);
    if (submittedRequest) {
      const newSubmission = {
        id: Date.now(),
        title: submittedRequest.title,
        submitted_on: new Date().toISOString().split('T')[0],
        status: "Reviewed"
      };
      
      setSubmittedFeedback(prev => [...prev, newSubmission]);
    }
    
    setSelfReflection({});
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
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Welcome, {userData ? userData.name : 'Loading...'}
            </h2>
            <p className="text-gray-600">Manage your feedback and professional growth.</p>
          </div>

          {/* Show Pending Feedback if Available */}
          {feedbackRequests.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Pending Feedback Requests
              </h3>
              
              {feedbackRequests.map(request => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-5 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="font-medium text-gray-800">{request.title}</h4>
                      <p className="text-sm text-gray-500">{request.description}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      Due: {new Date(request.deadline).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowQuestions(request.id)}
                      className={`flex items-center gap-2 px-4 py-2 ${request.reviewed ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white'} rounded-lg hover:bg-indigo-700`}
                      disabled={request.reviewed}
                    >
                      <FileText size={18} />
                      <span>{request.reviewed ? 'Reviewed' : 'View Questions'}</span>
                    </button>
                  </div>

                  {/* Show questions if this request is selected */}
                  {showQuestions === request.id && (
                    <div className="mt-4">
                      {request.questions.map((question, index) => (
                        <div key={index} className="border-b border-gray-200 pb-2 mb-2">
                          <p className="text-gray-800 mb-1">{index + 1}. {question}</p>
                          <textarea
                            value={
                              (selfReflection[request.id] && 
                               selfReflection[request.id][index]) || 
                              ''
                            }
                            onChange={(e) => 
                              handleResponseChange(
                                request.id,
                                index,
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                            placeholder="Share your thoughts..."
                          />
                        </div>
                      ))}
                      <button
                        onClick={() => handleSubmit(request.id)}
                        className="mt-2 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        <FileText size={18} />
                        <span>Submit Feedback</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No pending feedback requests found.</p>
          )}

          {/* Show Submitted Feedback */}
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
