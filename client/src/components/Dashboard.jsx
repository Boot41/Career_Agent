import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [organizationData, setOrganizationData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve user and organization data from localStorage
    const storedUserData = localStorage.getItem('userData');
    const storedOrgData = localStorage.getItem('organizationData');

    if (storedUserData && storedOrgData) {
      setUserData(JSON.parse(storedUserData));
      setOrganizationData(JSON.parse(storedOrgData));
    } else {
      // If no data is found, redirect back to signup
      navigate('/signup');
    }
  }, [navigate]);

  const handleLogout = () => {
    // Clear stored data
    localStorage.removeItem('userData');
    localStorage.removeItem('organizationData');
    
    // Redirect to landing page
    navigate('/');
  };

  if (!userData || !organizationData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome to {organizationData.name}
          </h1>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">User Details</h2>
            <p><strong>Name:</strong> {userData.name}</p>
            <p><strong>Email:</strong> {userData.email}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Organization Details</h2>
            <p><strong>Name:</strong> {organizationData.name}</p>
            <p><strong>Organization ID:</strong> {organizationData.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
