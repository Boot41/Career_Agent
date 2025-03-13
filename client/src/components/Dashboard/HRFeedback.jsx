import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import axios from 'axios';
import VoiceFeedbackForm from './VoiceFeedbackForm';

const HRFeedback = () => {
    const [pendingFeedback, setPendingFeedback] = useState([]);
    const [hierarchicalPendingFeedback, setHierarchicalPendingFeedback] = useState([]);
    const [submittedFeedback, setSubmittedFeedback] = useState([]);
    const [activeTab, setActiveTab] = useState('pendingRequests'); // Default: Pending Feedback
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);

    // Retrieve user data from local storage
    const userData = JSON.parse(localStorage.getItem('userData'));
    const organizationName = userData?.organization_name || 'Organization Name';
    const userName = userData?.name || 'User';
    const userId = userData?.id || null;
    const organization_Id = userData?.organization_id || null;

    useEffect(() => {
        // if (!userId) return;

        const fetchPendingFeedback = async () => {
            try {
                const response = await axios.get(`http://localhost:8001/feedback/pending-feedback/?user_id=${userId}`);
                setPendingFeedback(response.data || []);
            } catch (error) {
                console.error('Error fetching pending feedback:', error);
            }
        };

        const fetchHierarchicalPendingFeedback = async () => {
            try {
                const organizationId = organization_Id;
                const response = await axios.get(`http://localhost:8001/feedback/get-pending-feedbacks/`, {
                    params: { organization_id: organizationId },
                });

                console.log("API Response:", response.data);
                setHierarchicalPendingFeedback(response.data.pending_feedbacks || []);
            } catch (error) {
                console.error('Error fetching hierarchical pending feedback:', error);
            }
        };

        const fetchSubmittedFeedback = async () => {
            try {
                const response = await axios.get(`http://localhost:8001/feedback/submitted-feedback/?user_id=${userId}`);
                setSubmittedFeedback(response.data || []);
            } catch (error) {
                console.error('Error fetching submitted feedback:', error);
            }
        };

        fetchPendingFeedback();
        fetchHierarchicalPendingFeedback();
        fetchSubmittedFeedback();
    }, [userId]);
    console.log(hierarchicalPendingFeedback)

    // Handle feedback form opening
    const handlePendingFeedback = (feedback) => {
        setSelectedFeedback(feedback);
        setIsFormOpen(true);
    };

    const handleSubmit = () => {
        setIsFormOpen(false);
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar userType="hr" />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title={organizationName} userName={userName} />
                <main className="flex-1 overflow-y-auto p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Feedback Overview</h2>

                    {/* Tabs */}
                    <div className="flex space-x-4 mb-4">
                        <button
                            onClick={() => setActiveTab('pendingRequests')}
                            className={`px-4 py-2 text-sm font-medium ${activeTab === 'pendingRequests' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Pending Feedback Requests
                        </button>
                        <button
                            onClick={() => setActiveTab('submitted')}
                            className={`px-4 py-2 text-sm font-medium ${activeTab === 'submitted' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Submitted Feedback
                        </button>
                        <button
                            onClick={() => setActiveTab('otherFeedbacks')}
                            className={`px-4 py-2 text-sm font-medium ${activeTab === 'otherFeedbacks' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Other Feedbacks
                        </button>
                    </div>

                    {/* Conditional Rendering for Tabs */}
                    {activeTab === 'pendingRequests' ? (
                        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Pending Feedback</h2>
                            {pendingFeedback.length > 0 ? (
                                pendingFeedback.map((request) => (
                                    <button
                                        key={request.id}
                                        className="border border-gray-200 rounded-lg p-5 mb-4 w-full text-left"
                                        onClick={() => handlePendingFeedback(request)}
                                    >
                                        <div className="flex justify-between items-center mb-4">
                                            <div>
                                                <h4 className="font-medium text-gray-800">Feedback for: {request.receiver_name}</h4>
                                            </div>
                                            <span className="text-sm text-gray-500">Created: {new Date(request.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <p className="text-gray-500">No pending feedback available.</p>
                            )}
                        </div>
                    ) : activeTab === 'otherFeedbacks' ? (
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Other's Pending Feedback</h2>
                            {hierarchicalPendingFeedback.length > 0 ? (
                                hierarchicalPendingFeedback.map((giver) => (
                                    <div key={giver.giver_id} className="border border-gray-200 rounded-lg p-5 mb-4 w-full text-left">
                                        <h4 className="font-medium text-gray-800 mb-2">{giver.giver_name} → {giver.receiver_name}</h4>
                                        <span className="text-sm text-gray-500">Created: {new Date(giver.created_at).toLocaleDateString()}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No hierarchical pending feedback available.</p>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Submitted Feedback</h2>
                            {submittedFeedback.length > 0 ? (
                                <ul className="space-y-2">
                                    {submittedFeedback.map((feedback) => (
                                        <li key={feedback.id} className="p-4 border border-gray-200 rounded-md">
                                            <p className="font-medium text-gray-800">{feedback.question}</p>
                                            <p className="text-sm text-gray-500">Submitted on: {new Date(feedback.submittedDate).toLocaleDateString()}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500">No submitted feedback available.</p>
                            )}
                        </div>
                    )}

                    {isFormOpen && selectedFeedback && (
                        <VoiceFeedbackForm selectedFeedback={selectedFeedback} setIsFormOpen={setIsFormOpen} handleFormSubmit={handleSubmit} />
                    )}
                </main>
            </div>
        </div>
    );
};

export default HRFeedback;
