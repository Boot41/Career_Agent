import React from 'react';

const ProblemSolution = () => {
  const problems = [
    { text: "HR spends hours chasing responses", icon: "⏰" },
    { text: "Performance reviews lack structured insights", icon: "📊" },
    { text: "Employees don't get actionable feedback", icon: "🚫" }
  ];

  return (
    <section className="container mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
      {/* Problem Section */}
      <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Manual Feedback is Broken</h2>
        <div className="space-y-3">
          {problems.map((item, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg">
              <span className="text-xl">{item.icon}</span>
              <p className="text-gray-700">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Solution Illustration */}
      <div className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition">
        <img 
          src="https://source.unsplash.com/600x400/?technology,solution" 
          alt="AI Performance Solution" 
          className="w-full h-auto rounded-lg"
        />
      </div>
    </section>
  );
};

export default ProblemSolution;
