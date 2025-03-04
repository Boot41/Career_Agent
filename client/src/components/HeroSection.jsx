import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden py-20 bg-gradient-to-br from-indigo-700 via-purple-600 to-pink-500 text-white">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center">
        {/* Left Side */}
        <div className="md:w-1/2 mb-10 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Automate Feedback. Empower Growth.
          </h1>
          <p className="text-xl mb-8">
            AI-driven performance reviews that save time, reduce bias, and generate actionable insights.
          </p>
          <div className="flex space-x-4">
            <button 
              onClick={() => navigate('/signup')}
              className="
                bg-green-500 hover:bg-green-600 text-white 
                font-bold py-3 px-6 rounded-full 
                transition duration-300 transform 
                hover:scale-105 hover:shadow-lg flex items-center space-x-2
              "
            >
              <span>Create Organisation</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Right Side */}
        <div className="md:w-1/2 flex justify-center">
          <div className="glass-morphism p-6 rounded-xl shadow-lg bg-white/10">
            <div className="bg-white p-4 rounded-lg shadow-2xl transform hover:scale-105 transition duration-300">
              <img 
                src="https://source.unsplash.com/600x400/?technology,ai,analytics" 
                alt="Career Agent Dashboard" 
                className="rounded-lg w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Organisation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl max-w-md w-full shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              Create Organisation
            </h2>
            <form className="space-y-4">
              <input 
                type="text" 
                placeholder="Organisation Name" 
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input 
                type="text" 
                placeholder="Organisation Domain"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex space-x-4">
                <button 
                  type="submit"
                  className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
                >
                  Create
                </button>
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSection;
