import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Users, MessageSquareText, Star, Send } from 'lucide-react';

const ManagerDashboard = ({ userData }) => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [responses, setResponses] = useState({});
  const [ratings, setRatings] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [mockFeedbackRequests, setMockFeedbackRequests] = useState([]);
  const [pendingFeedback, setPendingFeedback] = useState([]);
  const [activeTab, setActiveTab] = useState('team');

  useEffect(() => {
    const fetchTeamMembers = async () => {
      const userId = 'd46f5ded-f660-4e52-aa98-077278c33d7b'; // Use the actual user ID
      try {
        const response = await fetch(`http://localhost:8001/feedback/managed-employees/?manager_id=${userId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTeamMembers(data); // Assuming data is an array of team members
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
    };

    const fetchMockFeedbackRequests = async () => {
      try {
        const response = await fetch('http://localhost:8001/feedback/pending-feedback/?user_id=X'); // Replace X with actual user ID
        const data = await response.json();
        setMockFeedbackRequests(data); // Assuming data is an array of feedback requests
      } catch (error) {
        console.error('Error fetching feedback requests:', error);
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
        console.log('Received pending feedback data:', data);
        setPendingFeedback(data);
      } catch (error) {
        console.error('Error fetching pending feedback:', error);
      }
    };

    fetchTeamMembers();
    fetchMockFeedbackRequests();
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
  const handleSubmit = () => {
    // In a real app, you would submit the responses to the backend here
    console.log('Responses:', responses);
    console.log('Ratings:', ratings);
    setSubmitted(true);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userType="manager" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Manager Dashboard" userName={userData.name} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Team Overview</h2>
            <p className="text-gray-600">
              Manage your team and provide feedback on performance reviews.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
          
          <div className="tabs">
            <button onClick={() => setActiveTab('team')}>Team Members</button>
            <button onClick={() => setActiveTab('feedback')}>Pending Feedback</button>
          </div>
          <div className="content">
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Pending Feedback Requests
                  </h3>
                  
                  {submitted ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-4">
                        <MessageSquareText size={32} />
                      </div>
                      <h4 className="text-xl font-medium text-gray-800 mb-2">Feedback Submitted Successfully!</h4>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Thank you for submitting your feedback. Your responses have been recorded and will be shared with the employee and HR.
                      </p>
                    </div>
                  ) : (
                    pendingFeedback.map(feedback => (
                      <div key={feedback.id} className="border border-gray-200 rounded-lg p-5 mb-4">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium">
                              {feedback.receiver_name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">Feedback for: {feedback.receiver_name}</h4>
                              <p className="text-sm text-gray-500">Type: {feedback.feedback_type}</p>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">Created: {new Date(feedback.created_at).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="space-y-6 mb-6">
                          {feedback.questions.map((question, index) => {
                            const questionId = `${feedback.id}-${index}`;
                            return (
                              <div key={index} className="border-b border-gray-200 pb-6">
                                <p className="text-gray-800 mb-3">{index + 1}. {question}</p>
                                
                                <div className="mb-4">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Your Feedback:
                                  </label>
                                  <textarea
                                    value={responses[questionId] || ''}
                                    onChange={(e) => handleResponseChange(questionId, e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                                    placeholder="Provide your feedback here..."
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Performance Rating:
                                  </label>
                                  <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(rating => (
                                      <button
                                        key={rating}
                                        type="button"
                                        onClick={() => handleRatingChange(questionId, rating)}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                          ratings[questionId] === rating
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                      >
                                        {rating}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="flex justify-end">
                          <button
                            onClick={handleSubmit}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                          >
                            <Send size={18} />
                            <span>Submit Feedback</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            {activeTab === 'feedback' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Pending Feedback</h3>
                
                {pendingFeedback.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No pending feedback requests found.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingFeedback.map(feedback => (
                      <div key={feedback.id} className="border border-gray-200 rounded-lg p-5">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h4 className="font-medium text-gray-800">Feedback for: {feedback.receiver_name}</h4>
                            <p className="text-sm text-gray-500">Type: {feedback.feedback_type}</p>
                          </div>
                          <span className="text-sm text-gray-500">Created: {new Date(feedback.created_at).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="space-y-4 mb-4">
                          <h5 className="font-medium text-gray-700">Questions:</h5>
                          <ul className="list-disc pl-5 space-y-2">
                            {feedback.questions.map((question, index) => (
                              <li key={index} className="text-gray-700">{question}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="flex justify-end">
                          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                            <Send size={18} />
                            <span>Complete Feedback</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManagerDashboard;
