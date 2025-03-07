import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Users, MessageSquareText, Star, Send, Activity } from 'lucide-react';
import axios from 'axios';
import Modal from 'react-modal';
import Chatbot from './Chatbot'; // Import the Chatbot component

const ManagerDashboard = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [responses, setResponses] = useState({});
  const [ratings, setRatings] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [mockFeedbackRequests, setMockFeedbackRequests] = useState([]);
  const [pendingFeedback, setPendingFeedback] = useState([]);
  const [activeTab, setActiveTab] = useState('team'); // Default to 'team'
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false); // Centralized chatbot state
  const [userData, setUserData] = useState(null); // Define setUserData function here
  // SWOT Analysis State
  const [isSwotModalOpen, setIsSwotModalOpen] = useState(false);
  const [swotData, setSwotData] = useState(null);
  const [swotLoading, setSwotLoading] = useState(false);
  const [swotError, setSwotError] = useState(null);

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      const userData = JSON.parse(storedUserData);
      console.log('User Data:', userData);  // Log user data
      setUserData(userData);
      const userId = userData.id;  // Fetch the user ID
      console.log('User ID:', userId);  // Log user ID

      // Fetch SWOT analysis for the user
      const fetchSwotAnalysis = async () => {
        try {
          const response = await axios.post('http://localhost:8001/chatbot/ask/', {
            message: 'Get my SWOT analysis',
            user_id: userId
          });
          console.log('SWOT Analysis:', response.data);
        } catch (error) {
          console.error('Error fetching SWOT analysis:', error);
        }
      };
      fetchSwotAnalysis();
    }

    const fetchTeamMembers = async () => {
      try {
        const storedUserData = localStorage.getItem('userData');
        if (!storedUserData) {
          console.error('No user data found in localStorage.');
          return;
        }
    
        const userData = JSON.parse(storedUserData);
        const userId = userData.id;
    
        if (!userId) {
          console.error('User ID is missing in user data.');
          return;
        }
    
        console.log('Fetching team members for manager ID:', userId);
    
        const response = await fetch(`http://localhost:8001/feedback/managed-employees/?manager_id=${userId}`);
    
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        const data = await response.json();
        
        if (!Array.isArray(data) || data.length === 0) {
          console.warn('No team members found for this manager.');
        }
    
        console.log('Fetched team members:', data);
        setTeamMembers(data); // Update state with the team members
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
    };
    

    const fetchPendingFeedback = async () => {
      const userId = 'd46f5ded-f660-4e52-aa98-077278c33d7b';
      try {
        const response = await fetch(`http://localhost:8001/feedback/pending-feedback/?user_id=${userId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPendingFeedback(data);
      } catch (error) {
        console.error('Error fetching pending feedback:', error);
      }
    };

    fetchTeamMembers();
    fetchPendingFeedback();
  }, []);

  /**
   * Handle response change for a specific question
   * @param {string} questionId 
   * @param {string} value 
   */
  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  /**
   * Handle rating change for a specific question
   * @param {string} questionId 
   * @param {number} rating 
   */
  const handleRatingChange = (questionId, rating) => {
    setRatings(prev => ({
      ...prev,
      [questionId]: rating
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

  const handleOpenFeedbackForm = (feedback) => {
    setIsFormOpen(true);
    setSelectedFeedback(feedback);
  };

  // Function to check SWOT analysis availability for an employee
  const checkSWOTAvailability = async (employeeId) => {
    console.log('Checking SWOT availability for employee ID:', employeeId);
    
    setSwotLoading(true);
    setSwotError(null);
    
    try {
      // Use the employeeId parameter directly for the API call
      const response = await axios.get(`http://localhost:8001/feedback/swot-analysis/availability/?user_id=${employeeId}`);
      
      // Log the complete response for debugging
      console.log('SWOT Analysis API Response:', response);
      console.log('SWOT Analysis Data:', response.data);
      
      if (response.status === 200) {
        if (response.data && response.data.length > 0) {
          console.log('SWOT analyses found:', response.data.length);
          console.log('SWOT data details:', JSON.stringify(response.data, null, 2));
          setSwotData(response.data);
          setIsSwotModalOpen(true);
        } else {
          console.log('No SWOT analyses found in the response data');
          alert('No SWOT analysis available for this employee.');
        }
      } else {
        console.error('Error checking SWOT availability:', response.statusText);
        setSwotError('Failed to check SWOT availability');
      }
    } catch (error) {
      console.error('Error checking SWOT availability:', error);
      console.error('Error response:', error.response);
      
      // Check if it's a 404 error (No SWOT analyses found)
      if (error.response && error.response.status === 404) {
        console.log('404 response received. Message:', error.response.data.message);
        alert('No SWOT analysis found for this employee.');
      } else {
        setSwotError('Failed to check SWOT availability');
      }
    } finally {
      setSwotLoading(false);
    }
  };

  // SWOT Analysis Modal Component
  const SwotModal = () => {
    return (
      <Modal 
        isOpen={isSwotModalOpen} 
        onRequestClose={() => setIsSwotModalOpen(false)}
        className="bg-white p-6 rounded-lg shadow-xl max-w-4xl mx-auto mt-20 max-h-[80vh] overflow-y-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">SWOT Analysis</h2>
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
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}
        
        {swotError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            <h4 className="font-bold mb-2">Error</h4>
            <p>{swotError}</p>
          </div>
        )}
        
        {swotData && swotData.length > 0 ? (
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
          <div className="text-center py-8">
            <p className="text-gray-600">No SWOT analysis found for this employee.</p>
          </div>
        )}
      </Modal>
    );
  };

  const renderFeedbackForm = () => {
    return (
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
                onChange={(e) => handleResponseChange(`${selectedFeedback.id}-${index}`, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                placeholder="Provide your feedback here..."
              />
            </div>
          ))}
          <div className="flex justify-end">
            <button onClick={handleSubmit} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              <Send size={18} />
              <span>Submit Feedback</span>
            </button>
            <button onClick={() => setIsFormOpen(false)} className="ml-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userType="manager" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Manager Dashboard" userName={userData ? userData.name : 'Manager'} />
        <main className="flex-1 overflow-y-auto p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Welcome, {userData ? userData.name : 'Manager'}</h2>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <Users size={20} />
                </div>
                <h3 className="font-medium text-gray-800">Team Members</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">{teamMembers.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                  <MessageSquareText size={20} />
                </div>
                <h3 className="font-medium text-gray-800">Pending Reviews</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">{pendingFeedback.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <Star size={20} />
                </div>
                <h3 className="font-medium text-gray-800">Team Performance</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">4.5/5</p>
            </div>
          </div>
          <div className="flex space-x-4 mb-6 border-b border-gray-200">
            <button 
                onClick={() => setActiveTab('team')} 
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'team' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Team Members
            </button>
            <button 
                onClick={() => setActiveTab('pendingRequests')} 
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'pendingRequests' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Pending Feedback Requests
            </button>
          </div>
          <div className="mt-6">
            {activeTab === 'team' && (
              <div>
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Your Team</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Employee
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Position
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Review
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {teamMembers.map(member => (
                          <tr key={member.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium">
                                  {member.avatar}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{member.position}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                member.status === 'pending' 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>{member.status === 'pending' ? 'Review Pending' : 'Active'}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.lastReview}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => checkSWOTAvailability(member.id)}
                                className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md"
                              >
                                View SWOT
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'pendingRequests' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Pending Feedback Requests</h3>
                {submitted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-4">
                      <MessageSquareText size={32} />
                    </div>
                    <h3 className="text-xl font-medium text-gray-800 mb-2">Feedback Submitted</h3>
                    <p className="text-gray-600">Thank you for submitting your feedback.</p>
                  </div>
                ) : (
                  <div>
                    {pendingFeedback.length > 0 ? (
                      <div className="space-y-4">
                        {pendingFeedback.map(feedback => (
                          <div key={feedback.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-800">{feedback.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">For: {feedback.for}</p>
                                <p className="text-xs text-gray-500 mt-1">Due: {feedback.dueDate}</p>
                              </div>
                              <button 
                                onClick={() => openFeedbackForm(feedback)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                              >
                                <Send size={16} />
                                Submit
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-600">No pending feedback requests.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Render the feedback form modal */}
          {isFormOpen && selectedFeedback && renderFeedbackForm()}
        </main>
      </div>
      
      {/* Render the SWOT Modal */}
      <SwotModal />
      
      {/* Chatbot Toggle Button */}
      <button 
        className="fixed bottom-6 right-6 bg-indigo-600 text-white rounded-full p-4 hover:bg-indigo-700 transition"
        onClick={() => setIsChatbotOpen(!isChatbotOpen)}
      >
        <MessageSquareText size={24} />
      </button>

      {/* Chatbot Component */}
      <Chatbot isOpen={isChatbotOpen} setIsOpen={setIsChatbotOpen} />
    </div>
  );
};

export default ManagerDashboard;
