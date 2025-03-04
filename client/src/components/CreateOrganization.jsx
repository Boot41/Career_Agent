import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateOrganization() {
  const [organizationName, setOrganizationName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Dummy validation
    if (organizationName.trim()) {
      // Simulate successful organization creation with dummy data
      console.log('Organization created', organizationName);
      
      // Store organization data in localStorage (you'd typically use context or state management)
      localStorage.setItem('organizationData', JSON.stringify({ 
        name: organizationName,
        id: Math.random().toString(36).substr(2, 9) // Generate a dummy ID
      }));
      
      // Navigate to a dummy dashboard (you'll create this later)
      navigate('/dashboard');
    } else {
      alert('Please enter an organization name');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create Your Organization
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            This is the organization where your team will collaborate
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="organization-name" className="sr-only">Organization Name</label>
              <input
                id="organization-name"
                name="organization-name"
                type="text"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter Organization Name"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Organization
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateOrganization;
