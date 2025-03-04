import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { 
  MessageSquareText, 
  Star, 
  BarChart3, 
  FileText, 
  Award 
} from 'lucide-react';

// Mock employee performance data
const performanceData = {
  overallRating: 4.3,
  recentReviews: [
    {
      id: 1,
      title: "Q1 2025 Performance Review",
      date: "2025-03-15",
      reviewerName: "Alex Thompson",
      status: "Completed"
    }
  ],
  skillProgress: [
    { skill: "React Development", progress: 85 },
    { skill: "Backend Integration", progress: 70 },
    { skill: "Communication", progress: 90 }
  ]
};

// Mock feedback requests
const feedbackRequests = [
  {
    id: 1,
    title: "Quarterly Self-Reflection",
    description: "Please provide insights into your recent work and personal growth.",
    deadline: "2025-03-20",
    questions: [
      "What are your key achievements in the last quarter?",
      "What challenges did you face, and how did you overcome them?",
      "What skills would you like to develop further?",
      "How do you see yourself contributing to the team's goals in the next quarter?"
    ]
  }
];

const EmployeeDashboard = () => {
  const [selfReflection, setSelfReflection] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleResponseChange = (questionId, value) => {
    setSelfReflection(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = () => {
    // In a real app, you would submit the self-reflection to the backend
    console.log('Self Reflection:', selfReflection);
    setSubmitted(true);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userType="employee" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Employee Dashboard" userName="Emily Brown (Software Engineer)" />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome, Emily</h2>
            <p className="text-gray-600">
              Stay updated with your performance, feedback, and professional growth.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <Star size={20} />
                </div>
                <h3 className="font-medium text-gray-800">Performance Rating</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">{performanceData.overallRating}/5</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                  <MessageSquareText size={20} />
                </div>
                <h3 className="font-medium text-gray-800">Pending Feedback</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">{feedbackRequests.length}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <Award size={20} />
                </div>
                <h3 className="font-medium text-gray-800">Recent Reviews</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">{performanceData.recentReviews.length}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Skill Progress</h3>
            
            {performanceData.skillProgress.map((skill, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{skill.skill}</span>
                  <span className="text-sm font-medium text-gray-700">{skill.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full" 
                    style={{ width: `${skill.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
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
                <h4 className="text-xl font-medium text-gray-800 mb-2">Self-Reflection Submitted Successfully!</h4>
                <p className="text-gray-600 max-w-md mx-auto">
                  Thank you for completing your self-reflection. Your insights will be reviewed by your manager.
                </p>
              </div>
            ) : (
              feedbackRequests.map(request => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-5 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="font-medium text-gray-800">{request.title}</h4>
                      <p className="text-sm text-gray-500">{request.description}</p>
                    </div>
                    <span className="text-sm text-gray-500">Due: {request.deadline}</span>
                  </div>
                  
                  <div className="space-y-6 mb-6">
                    {request.questions.map((question, index) => {
                      const questionId = `${request.id}-${index}`;
                      return (
                        <div key={index} className="border-b border-gray-200 pb-6">
                          <p className="text-gray-800 mb-3">{index + 1}. {question}</p>
                          
                          <textarea
                            value={selfReflection[questionId] || ''}
                            onChange={(e) => handleResponseChange(questionId, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                            placeholder="Share your thoughts..."
                          />
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={handleSubmit}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      <FileText size={18} />
                      <span>Submit Self-Reflection</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
