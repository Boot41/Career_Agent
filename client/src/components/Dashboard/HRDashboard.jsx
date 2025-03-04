import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

const HRDashboard = () => {
  // Organization Hierarchy State
  const [organizationHierarchy, setOrganizationHierarchy] = useState({
    managers: [],
    unassignedEmployees: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  // Mock data - to be replaced with actual backend data
  const employees = [
    { id: 1, name: 'John Doe', role: 'Employee', department: 'Engineering', email: 'john@company.com' },
    { id: 2, name: 'Jane Smith', role: 'Manager', department: 'Product', email: 'jane@company.com' },
    { id: 3, name: 'Mike Johnson', role: 'Employee', department: 'Sales', email: 'mike@company.com' },
    { id: 4, name: 'Emily Brown', role: 'HR', department: 'HR', email: 'emily@company.com' },
    { id: 5, name: 'David Lee', role: 'Manager', department: 'Engineering', email: 'david@company.com' }
  ];

  const pendingInvitations = [
    { id: 1, name: 'Alex Brown', email: 'alex@company.com', sentDate: '2024-02-15' },
    { id: 2, name: 'Sarah Lee', email: 'sarah@company.com', sentDate: '2024-02-20' }
  ];

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteFormData, setInviteFormData] = useState({
    name: '',
    email: '',
    role: 'employee'
  });

  // Feedback Generation State
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedFeedbackEmployee, setSelectedFeedbackEmployee] = useState(null);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch Organization Hierarchy
  useEffect(() => {
    // Retrieve user data from localStorage
    const storedUserData = localStorage.getItem('userData');
    
    if (storedUserData) {
      try {
        const parsedUserData = JSON.parse(storedUserData);
        setUserData(parsedUserData);

        const fetchOrganizationHierarchy = async () => {
          try {
            // Validate organization_id
            if (!parsedUserData.organization_id) {
              throw new Error('No organization ID found in user data');
            }

            console.log('Fetching organization hierarchy with ID:', parsedUserData.organization_id);

            const response = await axios.get('/org/hierarchy/', {
              params: { organization_id: parsedUserData.organization_id }
            });

            console.log('Full API Response:', response);

            // Check if response contains expected data
            if (response.data && response.data.success) {
              setOrganizationHierarchy({
                managers: response.data.managers || [],
                unassignedEmployees: response.data.unassigned_employees || []
              });
            } else {
              throw new Error('Invalid response format');
            }
          } catch (err) {
            console.error('Detailed Error Fetching Organization Hierarchy:', {
              message: err.message,
              response: err.response ? err.response.data : 'No response',
              config: err.config,
              code: err.code
            });
            
            // More specific error handling
            if (err.response) {
              // The request was made and the server responded with a status code
              // that falls out of the range of 2xx
              setError(`Server Error: ${err.response.status} - ${err.response.data.message || 'Unknown error'}`);
            } else if (err.request) {
              // The request was made but no response was received
              setError('No response received from server. Check network connection.');
            } else {
              // Something happened in setting up the request that triggered an Error
              setError(`Request Setup Error: ${err.message}`);
            }
          } finally {
            setIsLoading(false);
          }
        };

        fetchOrganizationHierarchy();
      } catch (parseError) {
        console.error('Error parsing user data:', parseError);
        setError('Invalid user data stored');
        setIsLoading(false);
      }
    } else {
      setError('No user data found. Please log in again.');
      setIsLoading(false);
    }
  }, []);

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
  };

  const handleInviteEmployee = () => {
    setIsInviteModalOpen(true);
  };

  const handleInviteFormChange = (e) => {
    const { name, value } = e.target;
    setInviteFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const submitInvitation = () => {
    // TODO: Implement actual invitation logic
    console.log('Sending invitation:', inviteFormData);
    setInviteFormData({
      name: '',
      email: '',
      role: 'employee'
    });
    setIsInviteModalOpen(false);
  };

  const handleGenerateQuestions = async (params) => {
    setIsGenerating(true);
    setGeneratedQuestions([]);
    
    try {
      // Call backend to generate feedback questions
      const response = await axios.post("/feedback/generate-feedback/", {
        role: params.role,
        feedback_type: params.feedbackType,
        feedback_receiver: params.feedbackReceiver
      });

      // Set generated questions from API response
      setGeneratedQuestions(response.data);
    } catch (error) {
      console.error('Error generating custom questions:', error);
      
      // More detailed error logging
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
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
              <UserCircle2 className={`mr-4 ${
                selectedFeedbackEmployee.type === 'manager' 
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
          />

          {/* Generated Questions */}
          {generatedQuestions.length > 0 && (
            <div className="mt-6 bg-white shadow-md rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Generated Feedback Questions
              </h3>
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
            </div>
          )}
        </div>
      </div>
    );
  };

  const headerUserName = userData ? userData.name : 'HR User';

  return (
    <div className="flex h-screen">
      <Sidebar userType="hr" />
      
      <div className="flex-grow flex flex-col">
        <Header 
          title="HR Dashboard" 
          userName={headerUserName} 
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Main Content Area */}
          <div className="flex-grow bg-gray-50 p-6 overflow-y-auto">
            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview' 
                      ? 'border-indigo-500 text-indigo-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('hierarchy')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'hierarchy' 
                      ? 'border-indigo-500 text-indigo-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Organization Hierarchy
                </button>
                <button
                  onClick={() => setActiveTab('feedback')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'feedback' 
                      ? 'border-indigo-500 text-indigo-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Feedback Generation
                </button>
              </nav>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'overview' ? (
              selectedEmployee ? (
                <div className="bg-white shadow-md rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                      <Users className="mr-3 text-indigo-600" /> 
                      Employee Profile
                    </h2>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Personal Information</h3>
                      <div className="space-y-2">
                        <p><strong>Name:</strong> {selectedEmployee.name}</p>
                        <p><strong>Department:</strong> {selectedEmployee.department}</p>
                        <p><strong>Current Role:</strong> {selectedEmployee.role}</p>
                        <p><strong>Email:</strong> {selectedEmployee.email}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Performance Snapshot</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-indigo-50 p-3 rounded-md text-center">
                          <TrendingUp className="mx-auto mb-2 text-indigo-600" />
                          <div className="font-bold text-indigo-700">85%</div>
                          <div className="text-xs text-gray-600">Feedback Completion</div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-md text-center">
                          <Star className="mx-auto mb-2 text-green-600" />
                          <div className="font-bold text-green-700">4.2/5</div>
                          <div className="text-xs text-gray-600">Performance Rating</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white shadow-md rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                    <Users className="mr-3 text-indigo-600" /> 
                    Employee Overview
                  </h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-indigo-50 p-4 rounded-md">
                      <Users className="text-indigo-600 mb-2" />
                      <div className="font-bold text-xl text-indigo-800">{employees.length}</div>
                      <div className="text-sm text-gray-600">Total Employees</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-md">
                      <UserPlus className="text-green-600 mb-2" />
                      <div className="font-bold text-xl text-green-800">{pendingInvitations.length}</div>
                      <div className="text-sm text-gray-600">Pending Invitations</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-md">
                      <MessageSquareText className="text-yellow-600 mb-2" />
                      <div className="font-bold text-xl text-yellow-800">42</div>
                      <div className="text-sm text-gray-600">Feedback Requests</div>
                    </div>
                  </div>
                </div>
              )
            ) : activeTab === 'hierarchy' ? (
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
                      <li>Contact system administrator if problem persists</li>
                    </ul>
                  </div>
                </div>
              ) : (
                renderOrganizationHierarchy()
              )
            ) : (
              renderFeedbackGeneration()
            )}
          </div>

          {/* Right Sidebar */}
          <HRRightSidebar 
            onEmployeeSelect={handleEmployeeSelect} 
            onInviteEmployee={handleInviteEmployee}
            organizationHierarchy={organizationHierarchy}
          />
        </div>
      </div>
      
      {/* Invite Employee Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96">
            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
              <UserPlus className="mr-2 text-indigo-600" /> Invite Employee
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text"
                  name="name"
                  value={inviteFormData.name}
                  onChange={handleInviteFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter employee name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email"
                  name="email"
                  value={inviteFormData.email}
                  onChange={handleInviteFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select 
                  name="role"
                  value={inviteFormData.role}
                  onChange={handleInviteFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button 
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={submitInvitation}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                >
                  Send Invitation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRDashboard;
