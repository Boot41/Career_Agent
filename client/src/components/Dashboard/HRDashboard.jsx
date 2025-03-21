import React, { useState, useEffect } from 'react';
import axios, { all } from 'axios';
import Header from './Header';
import Sidebar from './Sidebar';
import HRRightSidebar from './HRRightSidebar';
import FeedbackGenerator from './FeedbackGenerator';
import {
  Users,
  MessageSquareText,
  FileText,
  Star,
  UserPlus,
  TrendingUp,
  Send,
  CheckCircle,
  Loader2,
  UserCircle2,
  Network
} from 'lucide-react';
import Modal from 'react-modal';
import Hello from './Hello';
import Chatbot from './Chatbot';
const HRDashboard = () => {
  // Organization Hierarchy State
  const [organizationHierarchy, setOrganizationHierarchy] = useState({
    managers: [],
    unassignedEmployees: [],
    organization_name: '',
    organization_details: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [organizationId, setOrganizationId] = useState(null);
  const [showGreeting, setShowGreeting] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteFormData, setInviteFormData] = useState({
    name: '',
    email: '',
    role: 'employee'
  });
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [noofEmp, setNoofEmp] = useState(0);
  // Feedback Generation State
  const [activeTab, setActiveTab] = useState('hello');
  const [selectedFeedbackEmployee, setSelectedFeedbackEmployee] = useState(null);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [id, setId] = useState(null);
  const [selectedRole, setSelectedRole] = useState("Manager");  // Add role state
  // console.log(selectedRole )
  // New state variable for SWOT analysis employee ID
  const [swotEmployeeId, setSwotEmployeeId] = useState(null);
  const [swotLoading, setSwotLoading] = useState(false);
  const [swotError, setSwotError] = useState(null);
  const [swotData, setSwotData] = useState(null);
  const [isSwotModalOpen, setIsSwotModalOpen] = useState(false);
  const [userList, setUserList] = useState([]);
  const [selectedSwots, setSelectedSwots] = useState([]);


  const handleCheckboxChange = (id) => {
    if (selectedSwots.includes(id)) {
      setSelectedSwots(selectedSwots.filter((item) => item !== id));
    } else {
      setSelectedSwots([...selectedSwots, id]);
    }
  };

  // Log selectedRole changes
  useEffect(() => {
    console.log('Selected Role State:', selectedRole);
  }, [selectedRole]);
  // console.log('Stored User Data:', JSON.parse(localStorage.getItem('userData')));
  // Fetch Organization Hierarchy and User Data
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
    const fetchOrganizationHierarchy = async () => {
      try {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          setUserData(parsedUserData);

          if (parsedUserData) {
            if (parsedUserData.organization_id) {
              setOrganizationId(parsedUserData.organization_id);
              console.log('Organization ID:', parsedUserData.organization_id);
            }

            // Fetch organization hierarchy and details
            const response = await axios.get('http://localhost:8001/org/hierarchy/', {
              params: { organization_id: parsedUserData.organization_id }
            });

            if (response.status === 200) {
              setOrganizationHierarchy({
                managers: response.data.managers || [],
                unassignedEmployees: response.data.unassigned_employees || [],
                organization_name: response.data.organization_name || '',
                organization_details: response.data.organization_details || {}
              });
            } else {
              throw new Error('Invalid response format');
            }
          } else {
            setError('No user data found. Please log in again.');
          }
        } else {
          setError('No user data found. Please log in again.');
        }
      } catch (err) {
        console.error('Error fetching organization hierarchy:', err);
        setError('Error fetching organization hierarchy.');
      } finally {
        setIsLoading(false);
      }
    };
    function extractOrganizationMembers(hierarchy) {
      let members = [];

      function traverse(node) {
        if (!node) return;

        members.push({
          id: node.id,
          name: node.name,
          // username: node.username,
          // email: node.email
        });

        if (Array.isArray(node.team)) {
          node.team.forEach(traverse);
        }
      }

      if (hierarchy.managers && Array.isArray(hierarchy.managers)) {
        hierarchy.managers.forEach(traverse);
      }

      return members;
    }

    if (organizationHierarchy) {
      const members = extractOrganizationMembers(organizationHierarchy);
      setUserList(members); // Store in state
    }

    fetchOrganizationHierarchy();
  }, []);
  console.log(organizationHierarchy)
  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    // Store the employee ID in the id state
    if (employee && employee.id) {
      console.log('Setting employee ID:', employee.id);
      setId(employee.id);
    } else {
      console.log('Employee object or ID is missing:', employee);
      setId(null);
    }
  };
  const handleGenerateQuestions = async (params) => {
    setIsGenerating(true);
    setGeneratedQuestions([]);

    try {
      // Call backend to generate feedback questions using the AI-powered endpoint
      const response = await axios.post("http://localhost:8001/feedback/generate-feedback/", {
        role: selectedRole || params.role, // Use selectedRole if available, otherwise use params.role
        feedback_receiver: params.feedbackReceiver
      });

      if (response.status === 200) {
        // Set generated questions from API response
        setGeneratedQuestions(response.data.questions);
      } else {
        console.error('Error generating custom questions:', response.statusText);
      }
    } catch (error) {
      console.error('Error generating custom questions:', error);

      // More detailed error logging
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }

      // Fallback to default questions if generation fails
      setGeneratedQuestions([
        'How satisfied are you with your current role?',
        'What skills would you like to develop?',
        'Do you feel supported by your manager?',
        'What challenges are you currently facing?',
        'How can we improve your work experience?'
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptQuestions = async () => {
    try {
      const payload = {
        receiver_id: id,
        feedback_type: selectedRole,
        organization_id: organizationId,
        questions: generatedQuestions // Include questions from the frontend
      };

      console.log('Sending feedback data:', payload);

      // Call the API to create feedback
      const response = await axios.post("http://localhost:8001/feedback/create-feedback/", payload);

      if (response.status === 200 || response.status === 201) {
        console.log('Feedback created successfully:', response.data);
        // Clear generated questions after successful submission
        setGeneratedQuestions([]);
        alert('Feedback questions accepted and saved successfully!');
      } else {
        console.error('Error accepting questions:', response.statusText);
      }
    } catch (error) {
      console.error('Error accepting questions:', error);

      // More detailed error logging
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        alert('Failed to save feedback questions. Please try again.');
      } else if (error.request) {
        console.error('Error request:', error.request);
        alert('No response received from server. Please check your connection.');
      } else {
        console.error('Error message:', error.message);
        alert(`Error: ${error.message}`);
      }
    }
  };

  const handleRoleChange = (newRole) => {
    console.log('Setting role:', newRole);
    setSelectedRole(newRole);
  };
  const generateSWOTForMultiple = async (employeeIds) => {
    setSwotLoading(true);
    setSwotError(null);
    setSwotData([]); // Reset SWOT data before new generation
  
    for (const employeeId of employeeIds) {
      try {
        console.log("Generating SWOT for Employee ID:", employeeId);
  
        const response = await axios.post(
          "http://localhost:8001/feedback/generate/",
          { receiver_id: employeeId, force_new: true },
          { headers: { "Content-Type": "application/json" } }
        );
  
        if (response.status === 200) {
          setSwotData((prev) => [...prev, response.data]); // Append new SWOT data
        } else {
          setSwotError(`Failed to generate SWOT for Employee ID: ${employeeId}`);
        }
      } catch (error) {
        console.error("Error generating SWOT:", error);
        setSwotError(error.response?.data?.error || `Failed to generate SWOT for Employee ID: ${employeeId}`);
      }
    }
  
    setSwotLoading(false);
  };
  
  const generateSWOTAnalysis = async (employeeId) => {
    setSwotEmployeeId(employeeId);
    setSwotLoading(true);
    setSwotError(null);

    try {
      console.log("Generating SWOT for Employee ID:", employeeId);

      const response = await axios.post(
        "http://localhost:8001/feedback/generate/",
        { receiver_id: employeeId, force_new: true }, // Send data in the request body
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        setSwotData(response.data);
      } else {
        setSwotError("Failed to generate SWOT analysis");
      }
    } catch (error) {
      console.error("Error generating SWOT analysis:", error);
      setSwotError(error.response?.data?.error || "Failed to generate SWOT analysis");
    } finally {
      setSwotLoading(false);
    }
  };


  const checkSWOTAvailability = async (employeeId) => {
    // Store the employee ID in the swotEmployeeId state
    setSwotEmployeeId(employeeId);
    console.log('Setting SWOT analysis employee ID for availability check:', employeeId);

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
          alert(`SWOT analysis is available for employee ID: ${employeeId}`);
          setIsSwotModalOpen(true);
          setSwotData(response.data);
        } else {
          console.log('No SWOT analyses found in the response data');
          alert(`SWOT analysis is not available for employee ID: ${employeeId}`);
        }
      } else {
        console.error('Error checking SWOT availability:', response.statusText);
      }
    } catch (error) {
      console.error('Error checking SWOT availability:', error);
      console.error('Error response:', error.response);

      // Check if it's a 404 error (No SWOT analyses found)
      if (error.response && error.response.status === 404) {
        console.log('404 response received. Message:', error.response.data.message);
        alert(`No SWOT analyses found for employee ID: ${employeeId}`);
      } else {
        alert('Failed to check SWOT availability. Please try again.');
      }
    }
  };

  // Function to delete a SWOT analysis
  const deleteSWOTAnalysis = async (swotId) => {
    if (window.confirm("Are you sure you want to delete this SWOT analysis?")) {
      try {
        const response = await axios.delete("http://localhost:8001/feedback/delete-swot/", {
          data: { swot_id: swotId },  // Send swotId as is (string)
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("Delete Response:", response.data);
        alert("SWOT analysis deleted successfully!");
        // Refresh or update the UI after deletion
      } catch (error) {
        console.error("Error deleting SWOT analysis:", error.response?.data || error.message);
        alert("Error deleting SWOT analysis.");
      }
    }
  };


  // Organization Hierarchy Rendering
  const renderOrganizationHierarchy = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="animate-spin text-indigo-600" size={48} />
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 p-4 rounded-lg text-red-700">
          {error}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <Network className="mr-3 text-indigo-600" />
            Organization Hierarchy
          </h2>

          {organizationHierarchy.managers.map(manager => (
            <div key={manager.id} className="mb-6 border-b pb-4">
              <div className="flex items-center mb-3">
                <UserCircle2 className="mr-3 text-indigo-600" />
                <div>
                  <h3 className="font-semibold text-lg">{manager.name}</h3>
                  <p className="text-sm text-gray-500">{manager.email}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {manager.team.map(employee => (
                  <div
                    key={employee.id}
                    className="bg-gray-50 p-3 rounded-md hover:bg-gray-100 transition"
                    onClick={() => handleEmployeeSelect(employee)}
                  >
                    <div className="flex items-center">
                      <UserCircle2 className="mr-3 text-gray-500" />
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-xs text-gray-500">{employee.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {organizationHierarchy.unassignedEmployees.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                <UserPlus className="mr-3 text-yellow-600" />
                Unassigned Employees
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {organizationHierarchy.unassignedEmployees.map(employee => (
                  <div
                    key={employee.id}
                    className="bg-yellow-50 p-3 rounded-md hover:bg-yellow-100 transition"
                    onClick={() => handleEmployeeSelect(employee)}
                  >
                    <div className="flex items-center">
                      <UserCircle2 className="mr-3 text-yellow-500" />
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-xs text-gray-500">{employee.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFeedbackGeneration = () => {
    // Combine managers and their employees
    const allPeople = [
      ...organizationHierarchy.managers.map(manager => ({
        ...manager,
        type: 'manager',
        displayName: `${manager.name} (Manager)`
      })),
      ...organizationHierarchy.managers.flatMap(manager =>
        (manager.team || []).map(employee => ({
          ...employee,
          type: 'employee',
          displayName: `${employee.name} (Employee)`
        }))
      ),
      ...organizationHierarchy.unassignedEmployees.map(employee => ({
        ...employee,
        type: 'employee',
        displayName: `${employee.name} (Unassigned)`
      }))
    ];
    return (
      <div className="space-y-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <FileText className="mr-3 text-indigo-600" />
            Feedback Generation
          </h2>

          {/* Person Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Person for Feedback
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={selectedFeedbackEmployee ? selectedFeedbackEmployee.id : ''}
              onChange={(e) => {
                const selectedPerson = allPeople.find(person => person.id === e.target.value);
                setSelectedFeedbackEmployee(selectedPerson);
                // Set the id state variable when a person is selected
                if (selectedPerson && selectedPerson.id) {
                  console.log('Setting feedback employee ID:', selectedPerson.id);
                  setId(selectedPerson.id);
                }
              }}
            >
              <option value="">Select a Person</option>
              {allPeople.map(person => (
                <option key={person.id} value={person.id}>
                  {person.displayName} - {person.email}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Person Details */}
          {selectedFeedbackEmployee && (
            <div className="bg-gray-50 p-4 rounded-md mb-6 flex items-center">
              <UserCircle2 className={`mr-4 ${selectedFeedbackEmployee.type === 'manager'
                  ? 'text-indigo-600'
                  : 'text-green-600'
                }`} size={48} />
              <div>
                <h3 className="font-semibold text-lg">{selectedFeedbackEmployee.name}</h3>
                <p className="text-sm text-gray-600">
                  {selectedFeedbackEmployee.email}
                  <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">
                    {selectedFeedbackEmployee.type === 'manager' ? 'Manager' : 'Employee'}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Feedback Generator */}
          <FeedbackGenerator
            handleGenerateQuestions={handleGenerateQuestions}
            onRoleChange={handleRoleChange}
          />

          {/* Generated Questions */}
          {generatedQuestions.length > 0 && (
            <div className="mt-6 bg-white shadow-md rounded-lg p-6">
              <div className="flex justify-between">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Generated Feedback Questions</h3>
              </div>
              <ul className="space-y-3">
                {generatedQuestions.map((question, index) => (
                  <li
                    key={index}
                    className="bg-gray-50 p-3 rounded-md border border-gray-200"
                  >
                    {question}
                  </li>
                ))}
              </ul>
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleAcceptQuestions}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <CheckCircle size={18} />
                  Accept Questions
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSWOTAnalysis = () => {
    const allPeople = [
      ...organizationHierarchy.managers.map(manager => ({
        ...manager,
        type: 'manager',
        displayName: `${manager.name} (Manager)`
      })),
      ...organizationHierarchy.managers.flatMap(manager =>
        (manager.team || []).map(employee => ({
          ...employee,
          type: 'employee',
          displayName: `${employee.name} (Employee)`
        }))
      ),
      ...organizationHierarchy.unassignedEmployees.map(employee => ({
        ...employee,
        type: 'employee',
        displayName: `${employee.name} (Unassigned)`
      }))
    ];

    // Find the selected employee details if swotEmployeeId is set
    const selectedSwotEmployee = swotEmployeeId
      ? allPeople.find(person => person.id === swotEmployeeId)
      : null;

    return (
    <div className="space-y-6">
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
        <div className="flex justify-between">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <FileText className="mr-3 text-indigo-600" size={28} />
          SWOT Analysis
        </h2>
        
        {selectedSwots.length>0 && (
         <button
          onClick={() => {
            // Logic to generate SWOT for selected IDs
            console.log("Generating SWOT for selected IDs:", selectedSwots);
            // generateSWOTForMultiple(selectedSwots);
            generateSWOTForMultiple(selectedSwots);
          }}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Generate SWOT
        </button>

        )}
        </div>
        {/* List of People */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allPeople.map(person => (
            <div
              key={person.id}
              className="flex flex-col bg-white shadow-md border border-gray-200 rounded-lg p-4 transition hover:shadow-lg"
            >
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={selectedSwots.includes(person.id)}
                  onChange={() => handleCheckboxChange(person.id)}
                  className="mr-2 w-5 h-5 text-blue-600 border-gray-300 rounded"
                />
                <UserCircle2
                  className={`${person.type === 'manager' ? 'text-indigo-600' : 'text-green-600'}`}
                  size={40}
                />
                <div className="flex-grow">
                  <label className="font-semibold text-lg">{person.name}</label>
                  <p className="text-sm text-gray-600">{person.email}</p>
                  <p className="text-xs text-gray-500">ID: {person.id}</p>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  onClick={() => generateSWOTAnalysis(person.id)}
                >
                  Generate SWOT
                </button>
                <button
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  onClick={() => checkSWOTAvailability(person.id)}
                >
                  Check Availability
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

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

      {swotData && swotData.length > 0 ? (
        swotData.map((swot) => (
          <div key={swot.id} className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex justify-between items-start">
              <div className="mb-4 pb-3 border-b border-gray-200 flex-1">
                <h3 className="text-xl font-semibold text-gray-700">SWOT Analysis for Year: {swot.year}</h3>
                <p className="text-sm text-gray-500">Created: {new Date(swot.created_at).toLocaleDateString()}</p>
              </div>
              <div className="ml-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <h4 className="font-bold text-blue-700">Performance Rating</h4>
                <p className="text-gray-600">{swot.performance_rating ? swot.performance_rating : 'Not Rated'}</p>
              </div>
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

            <div className="mt-4 flex justify-end">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this SWOT analysis?')) {
                    console.log('SWOT Object:', swot);
                    console.log('SWOT ID:', swot.id);
                    deleteSWOTAnalysis(swot.id);
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600">No SWOT analysis found for this user.</p>
        </div>
      )}
    </Modal>
  );
};

  const headerUserName = userData ? `${userData.name} (${userData.role})` : 'Loading...';

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userType="hr" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={userData ? organizationHierarchy.organization_name : 'Loading...'}
          userName={headerUserName}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Welcome, {userData ? userData.name : 'Loading...'}
          </h2>
          <div className="flex flex-1 overflow-hidden">
            {/* Main Content Area */}
            <div className="flex-grow bg-gray-50 p-6 overflow-y-auto">
              {/* Tabs */}
              <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => {
                      setActiveTab('hello');
                    }}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'hello'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    Home
                  </button>
                  <button
                    onClick={() => setActiveTab('hierarchy')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'hierarchy'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    Organization Hierarchy
                  </button>
                  <button
                    onClick={() => setActiveTab('feedback')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'feedback'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    Feedback Generation
                  </button>
                  <button
                    onClick={() => setActiveTab('swot')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'swot'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    SWOT Analysis
                  </button>
                </nav>
              </div>

              {/* Content based on active tab */}
              {activeTab === 'hierarchy' ? (
                isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="animate-spin text-indigo-600" size={48} />
                  </div>
                ) : error ? (
                  <div className="bg-red-50 p-6 rounded-lg text-red-700 space-y-4">
                    <h2 className="text-2xl font-bold flex items-center">
                      <CheckCircle className="mr-3 text-red-500" />
                      Error Fetching Organization Data
                    </h2>
                    <p className="text-lg">{error}</p>
                    <div className="bg-red-100 p-4 rounded-md">
                      <h3 className="font-semibold mb-2">Troubleshooting Tips:</h3>
                      <ul className="list-disc list-inside">
                        <li>Verify your network connection</li>
                        <li>Check if you are logged in correctly</li>
                        <li>Ensure your organization is properly configured</li>
                        <li>Contact system administrator if the problem persists</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  renderOrganizationHierarchy()
                )
              ) : activeTab === 'feedback' ? (
                renderFeedbackGeneration()
              ) : activeTab === 'swot' ? (
                renderSWOTAnalysis()
              ) : (
                <Hello noofEmp={noofEmp} />
              )}
            </div>
          </div>
        </main>
      </div>
      <SwotModal />
      {/* Chatbot Toggle Button */}
      <button
        className="fixed bottom-6 right-6 bg-indigo-600 text-white rounded-full p-4 hover:bg-indigo-700 transition"
        onClick={() => setIsChatbotOpen(!isChatbotOpen)}
      >
        <MessageSquareText size={24} />
      </button>

      {/* Chatbot Component */}
      <Chatbot isOpen={isChatbotOpen} setIsOpen={setIsChatbotOpen} userList={userList} />
    </div>
  );
};

export default HRDashboard;
