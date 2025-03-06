import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">HR</span>
            </div>
            <span className="text-xl font-bold text-gray-900">FeedbackAI</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link
              to="/signin"
              className="px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
