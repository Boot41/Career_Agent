import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios'; 

function Signin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
    // Basic client-side validation
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

      // Make API call to backend login endpoint
      const response = await axios.post('http://localhost:8001/auth/login/', {
        username,
        password
      });

      console.log('Login Response:', response.data);

      // If login is successful
      if (response.data.success) {
        const userData = response.data.user;

        // Validate user data
        if (!userData) {
          setError('No user data received');
          return;
        }

        // Log user data for verification
        console.log('User Data:', userData);

        // Validate required user fields
        if (!userData.id || !userData.username || !userData.role) {
          setError('Incomplete user data received');
          return;
        }

        // Clear existing user data in localStorage
        localStorage.clear();

        // Store FULL user data in localStorage
        localStorage.setItem('userData', JSON.stringify({
          id: userData.id,
          username: userData.username,
          role: userData.role,
          name: userData.name,
          email: userData.email,
          organization_id: userData.organization_id
        }));

        // Navigate based on user role
        switch(userData.role) {
          case 'HR':
            navigate('/dashboard/hr', { state: { userData } });
            break;
          case 'Employee':
            navigate('/dashboard/employee', { state: { userData } });
            break;
          case 'Manager':
            navigate('/dashboard/manager', { state: { userData } });
            break;
          default:
            navigate('/dashboard', { state: { userData } });
        }
      } else {
        // Handle unsuccessful login
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      // Handle network or unexpected errors
      console.error('Login Error:', err);

      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(err.response.data.message || 'Invalid username or password');
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your network connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('An unexpected error occurred during sign in');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <form 
          onSubmit={handleSubmit} 
          className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4"
        >
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Sign In
          </h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label 
              htmlFor="username" 
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="mb-6">
            <label 
              htmlFor="password" 
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              Sign In
            </button>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="text-indigo-600 hover:text-indigo-800"
              >
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signin;
