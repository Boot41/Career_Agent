import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import axios from 'axios';
import VoiceFeedbackForm from './VoiceFeedbackForm';
import { FaTrash } from "react-icons/fa";

const HRFeedback = () => {
    const [pendingFeedback, setPendingFeedback] = useState([]);
    const [hierarchicalPendingFeedback, setHierarchicalPendingFeedback] = useState([]);
    const [hierarchicalSubmittedFeedback, setHierarchicalSubmittedFeedback] = useState([]);
    const [activeTab, setActiveTab] = useState('pendingRequests'); // Default: Pending Feedback
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [expandedFeedback, setExpandedFeedback] = useState({});
    const [checkedFeedbacks, setCheckedFeedbacks] = useState({});

    // Retrieve user data from local storage
    const userData = JSON.parse(localStorage.getItem('userData'));
    const organizationName = userData?.organization_name || 'Organization Name';
    const userName = userData?.name || 'User';
    const userId = userData?.id || null;
    const organization_Id = userData?.organization_id || null;

    useEffect(() => {
        if (!userId) return;

        const fetchPendingFeedback = async () => {
            try {
                const response = await axios.get(`http://localhost:8001/feedback/pending-feedback/?user_id=${userId}`);
                setPendingFeedback(response.data || []);
            } catch (error) {
                console.error('Error fetching pending feedback:', error);
            }
        };  
        console.log(pendingFeedback)
        const fetchHierarchicalPendingFeedback = async () => {
            try {
                const response = await axios.get(`http://localhost:8001/feedback/get-pending-feedbacks/`, {
                    params: { organization_id: organization_Id },
                });

                console.log("API Response:", response.data);
                setHierarchicalPendingFeedback(response.data.pending_feedbacks || []);
            } catch (error) {
                console.error('Error fetching hierarchical pending feedback:', error);
            }
        };

        const fetchHierarchicalSubmittedFeedback = async () => {
            try {
                const response = await axios.get(`http://localhost:8001/feedback/get-submitted-feedbacks/`, {
                    params: { organization_id: organization_Id }
                });

                console.log("Submitted Feedback (Hierarchical):", response.data.submitted_feedbacks);
                setHierarchicalSubmittedFeedback(response.data.submitted_feedbacks || []);
            } catch (error) {
                console.error("Error fetching hierarchical submitted feedback:", error);
            }
        };

        fetchPendingFeedback();
        fetchHierarchicalPendingFeedback();
        fetchHierarchicalSubmittedFeedback();
    }, [userId]);

    // Handle feedback form opening
    const handlePendingFeedback = (feedback) => {
        setSelectedFeedback(feedback);
        setIsFormOpen(true);
    };

    const toggleFeedbackDetails = (receiverName) => {
        setExpandedFeedback((prevExpandedFeedback) => ({
            ...prevExpandedFeedback,
            [receiverName]: !prevExpandedFeedback[receiverName],
        }));
    };

    const [selectedFeedbackIds, setSelectedFeedbackIds] = useState([]); // Store multiple selected feedback IDs

    const handleCheckboxChange = (id) => {
        // console.log(id);
        setSelectedFeedbackIds((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter(feedbackId => feedbackId !== id) // Deselect if already selected
                : [...prevSelected, id] // Add new selection
        );
    };


const handleNotif = async (giver) => {
    console.log("Sending email to:", giver);

    try {
        const response = await axios.post("http://localhost:8001/auth/send-mail/", {
            email: giver,  // Ensure this is the correct recipient's email
        });

        if (response.status === 200) {
            console.log("Notification sent:", response.data);
        } else {
            console.error("Failed to send notification:", response.data);
        }
    } catch (error) {
        console.error("Error sending notification:", error.response ? error.response.data : error.message);
    }
};


    const handleDeleteFeedback = async () => {
        try {
            const response = await axios.delete(`http://localhost:8001/feedback/api/delete-feedbacks/`, {
                data: { feedback_ids: selectedFeedbackIds },
            });
            console.log("Deleted Feedback:", response.data);
            setSelectedFeedbackIds([]);
            const fetchHierarchicalSubmittedFeedback = async () => {
                try {
                    const response = await axios.get(`http://localhost:8001/feedback/get-submitted-feedbacks/`, {
                        params: { organization_id: organization_Id }
                    });

                    console.log("Submitted Feedback (Hierarchical):", response.data.submitted_feedbacks);
                    setHierarchicalSubmittedFeedback(response.data.submitted_feedbacks || []);
                } catch (error) {
                    console.error("Error fetching hierarchical submitted feedback:", error);
                }
            };
            fetchHierarchicalSubmittedFeedback();
        } catch (error) {
            console.error("Error deleting feedback:", error);
        }
    };

    console.log(selectedFeedbackIds);

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
                            Pending Feedbacks
                        </button>
                        <button
                            onClick={() => setActiveTab('submitted')}
                            className={`px-4 py-2 text-sm font-medium ${activeTab === 'submitted' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Submitted Feedbacks
                        </button>
                        <button
                            onClick={() => setActiveTab('otherFeedbacks')}
                            className={`px-4 py-2 text-sm font-medium ${activeTab === 'otherFeedbacks' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Other's Pending Feedbacks
                        </button>
                    </div>

                    {/* Pending Feedback */}
                    {activeTab === 'pendingRequests' && (
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
                                            <h4 className="font-medium text-gray-800">Feedback for: {request.receiver_name}</h4>
                                            <span className="text-sm text-gray-500">Created: {new Date(request.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <p className="text-gray-500">No pending feedback available.</p>
                            )}
                        </div>
                    )}

                    {/* Other's Feedback */}
                    {activeTab === 'otherFeedbacks' && (
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Other's Pending Feedback</h2>
                            {hierarchicalPendingFeedback.length > 0 ? (
                                hierarchicalPendingFeedback.map((giver) => (
                                    <div key={giver.giver_id} className="border border-gray-200 rounded-lg p-5 mb-4 w-full flex flex-col">
                                        {/* Top Section: Name and Notify Button */}
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-medium text-gray-800">{giver.giver_name} → {giver.receiver_name}</h4>
                                            <button className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600" onClick={()=>handleNotif(giver.giver_email)}>
                                                Notify
                                            </button>
                                        </div>

                                        {/* Bottom Section: Created Date (aligned left) */}
                                        <span className="text-sm text-gray-500 mt-2">{`Created: ${new Date(giver.created_at).toLocaleDateString()}`}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No hierarchical pending feedback available.</p>
                            )}
                        </div>
                    )}


                   {/* Submitted Feedback */}
{activeTab === 'submitted' && (
    <div className="bg-white shadow-lg rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Submitted Feedback</h2>
            {selectedFeedbackIds.length > 0 && (
                <button
                    className="p-2 rounded-full bg-red-100 hover:bg-red-200 transition duration-200 shadow-sm"
                    onClick={handleDeleteFeedback}
                >
                    <FaTrash className="text-red-600 text-lg" />
                </button>
            )}
        </div>
        {hierarchicalSubmittedFeedback.length > 0 ? (
            <div className="space-y-4">
                {hierarchicalSubmittedFeedback.map((receiver) => (
                    <div key={receiver.receiver_name} className="p-5 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
                        <div
                            className="flex justify-between items-center cursor-pointer py-2 px-3 bg-white rounded-lg shadow-sm hover:bg-gray-100 transition"
                            onClick={() => toggleFeedbackDetails(receiver.receiver_name)}
                        >
                            <h3 className="text-lg font-semibold text-gray-800">Receiver: {receiver.receiver_name}</h3>
                            <span className="text-indigo-600 font-bold text-lg">{expandedFeedback[receiver.receiver_name] ? "▲" : "▼"}</span>
                        </div>
                        {expandedFeedback[receiver.receiver_name] && (
                            <ul className="mt-3 space-y-3">
                                {receiver.feedbacks.map((feedback, index) => (
                                    <li key={index} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm text-gray-600 font-medium">Giver: {feedback.giver_name}</p>
                                            <input
                                                type="checkbox"
                                                className="form-checkbox h-5 w-5 text-indigo-600 rounded-md focus:ring-2 focus:ring-indigo-500"
                                                checked={selectedFeedbackIds.includes(feedback.feedback_id)}
                                                onChange={() => handleCheckboxChange(feedback.feedback_id)}
                                            />
                                        </div>
                                        <div className="mt-3">
                                            {feedback.answers && Object.keys(feedback.answers).length > 0 ? (
                                                <ul className="list-disc pl-5 text-sm text-gray-700">
                                                    {Object.values(feedback.answers).map((answer, idx) => (
                                                        <li key={idx} className="flex items-center space-x-2">
                                                            <span className="font-medium">{answer}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-sm text-gray-500 italic">No Answers Provided</p>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>
        ) : (
            <p className="text-gray-500 text-center py-4">No submitted feedback available.</p>
        )}
    </div>
)}


                    {isFormOpen && selectedFeedback && (
                        <VoiceFeedbackForm selectedFeedback={selectedFeedback} setIsFormOpen={setIsFormOpen} />
                    )}
                </main>
            </div>
        </div>
    );
};

export default HRFeedback;
