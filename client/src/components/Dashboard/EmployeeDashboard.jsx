import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { MessageSquareText, FileText, Send, TrendingUp } from 'lucide-react';
import axios from 'axios';
import Modal from 'react-modal';
import Chatbot from './Chatbot'; // Import the Chatbot component
import VoiceFeedbackForm from './VoiceFeedbackForm';

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
  // SWOT Analysis state variables
  const [swotLoading, setSwotLoading] = useState(false);
  const [swotError, setSwotError] = useState(null);
  const [swotData, setSwotData] = useState(null);
  const [isSwotModalOpen, setIsSwotModalOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false); // New state variable to track chatbot toggle
  const user = JSON.parse(localStorage.getItem('userData'));
  const userList = [{ id: user.id, name: user.name }];
  
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      const userData = JSON.parse(storedUserData);
      console.log('User Data:', userData);  // Log user data
      setUserData(userData);
      const userId = userData.id;  // Fetch the user ID
      console.log('User ID:', userId);  // Log user ID
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
  const handleSubmit = async (feedbackId, answers) => {
    console.log("Submitting Feedback ID:", feedbackId);
    console.log("Answers:", answers);
  
    // Validate input
    if (!feedbackId) {
      console.error("Error: No feedback ID provided");
      return;
    }
    if (!answers || Object.keys(answers).length === 0) {
      console.error("Error: No answers provided");
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:8001/feedback/submit-answers/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedback_id: feedbackId,
          answers: answers,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Server error details:", errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
      console.log("Feedback submitted successfully:", result);
  
      setSubmitted(true);
      setPendingFeedback((prevFeedback) =>
        prevFeedback.filter((feedback) => feedback.id !== feedbackId)
      );
    } catch (error) {
      console.error("Error submitting feedback:", error);
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

  // Function to check SWOT analysis availability for the current user
  const checkSWOTAvailability = async () => {
    if (!userData || !userData.id) {
      console.error('User data not available');
      return;
    }

    setSwotLoading(true);
    setSwotError(null);
    
    try {
      console.log('Checking SWOT availability for user ID:', userData.id);
      const response = await axios.get(`http://localhost:8001/feedback/swot-analysis/availability/?user_id=${userData.id}`);
      
      console.log('SWOT Analysis API Response:', response);
      
      if (response.status === 200) {
        if (response.data && response.data.length > 0) {
          console.log('SWOT analyses found:', response.data.length);
          console.log('SWOT data details:', JSON.stringify(response.data, null, 2));
          setSwotData(response.data);
          setIsSwotModalOpen(true);
        } else {
          console.log('No SWOT analyses found in the response data');
          alert('No SWOT analysis available for you yet.');
        }
      } else {
        console.error('Error checking SWOT availability:', response.statusText);
        setSwotError('Failed to fetch SWOT analysis. Please try again.');
      }
    } catch (error) {
      console.error('Error checking SWOT availability:', error);
      
      // Check if it's a 404 error (No SWOT analyses found)
      if (error.response && error.response.status === 404) {
        console.log('404 response received. Message:', error.response.data.message);
        alert('No SWOT analysis available for you yet.');
      } else {
        setSwotError('Failed to fetch SWOT analysis. Please try again.');
      }
    } finally {
      setSwotLoading(false);
    }
  };

  // SWOT Modal Component
  const SwotModal = () => {
    return (
      <Modal 
        isOpen={isSwotModalOpen} 
        onRequestClose={() => setIsSwotModalOpen(false)}
        className="bg-white p-6 rounded-lg shadow-xl max-w-4xl mx-auto mt-20 max-h-[80vh] overflow-y-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My SWOT Analysis</h2>
          <button 
            onClick={() => setIsSwotModalOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {swotLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your SWOT analysis...</p>
          </div>
        )}
        
        {swotError && (
          <div className="text-center py-8">
            <p className="text-red-600">{swotError}</p>
          </div>
        )}
        
        {!swotLoading && !swotError && swotData && swotData.length > 0 ? (
          swotData.map((swot, index) => (
            <div key={swot.id} className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
              <div className="mb-4 pb-3 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-700">SWOT Analysis for Year: {swot.year}</h3>
                <p className="text-sm text-gray-500">Created: {new Date(swot.created_at).toLocaleDateString()}</p>
              </div>
              
              <div className="mb-4">
                <h4 className="font-bold text-gray-700 mb-2">Summary</h4>
                <p className="text-gray-600 whitespace-pre-line">{swot.summary}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                  <h4 className="font-bold text-green-700 mb-2">Strengths</h4>
                  <p className="text-gray-600 whitespace-pre-line">{swot.strengths}</p>
                </div>
                
                <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                  <h4 className="font-bold text-red-700 mb-2">Weaknesses</h4>
                  <p className="text-gray-600 whitespace-pre-line">{swot.weaknesses}</p>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <h4 className="font-bold text-blue-700 mb-2">Opportunities</h4>
                  <p className="text-gray-600 whitespace-pre-line">{swot.opportunities}</p>
                </div>
                
                <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
                  <h4 className="font-bold text-yellow-700 mb-2">Threats</h4>
                  <p className="text-gray-600 whitespace-pre-line">{swot.threats}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          !swotLoading && !swotError && (
            <div className="text-center py-8">
              <p className="text-gray-600">No SWOT analysis found for you.</p>
            </div>
          )
        )}
      </Modal>
    );
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
          {/* Quick Actions Section */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* SWOT Analysis Card */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-indigo-100 rounded-full mr-4">
                    <TrendingUp className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800">SWOT Analysis</h3>
                </div>
                <p className="text-gray-600 mb-4">View your strengths, weaknesses, opportunities, and threats analysis.</p>
                <button 
                  onClick={checkSWOTAvailability}
                  disabled={swotLoading}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center"
                >
                  {swotLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    'View SWOT Analysis'
                  )}
                </button>
              </div>
              
              {/* Other quick action cards can be added here */}
            </div>
          </div>

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
            <VoiceFeedbackForm 
              selectedFeedback={selectedFeedback} 
              setIsFormOpen={setIsFormOpen} 
              handleFormSubmit={handleSubmit} 
            />
          )}
          {/* {submittedFeedback.length > 0 ? (
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
          )} */}
          <button 
            className="fixed bottom-6 right-6 bg-indigo-600 text-white rounded-full p-4 hover:bg-indigo-700 transition"
            onClick={() => setIsChatbotOpen(!isChatbotOpen)}
          >
            <MessageSquareText size={24} />
          </button>
          {isChatbotOpen && (
            <Chatbot 
              isOpen={isChatbotOpen} 
              setIsOpen={setIsChatbotOpen} 
              userList={userList}
            />
          )}
        </main>
      </div>
      {/* SWOT Modal */}
      <SwotModal />
    </div>
  );
};

export default EmployeeDashboard;
