import React from 'react';

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: 'AI Collects Feedback',
      description: 'AI reaches out to colleagues & managers, asking structured questions.',
      icon: '📡',
      color: 'bg-blue-500 text-white'
    },
    {
      number: 2,
      title: 'AI Analyzes & Summarizes',
      description: 'Natural Language Processing extracts key themes & sentiment insights.',
      icon: '🧠',
      color: 'bg-purple-500 text-white'
    },
    {
      number: 3,
      title: 'Actionable Insights',
      description: 'AI generates a detailed performance report with strengths, gaps & recommendations.',
      icon: '📊',
      color: 'bg-green-500 text-white'
    }
  ];

  return (
    <section className="bg-gray-900 py-20 text-white">
      <div className="container mx-auto px-6">
        <h2 className="text-center text-4xl font-bold mb-12">
          How Career Agent Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div 
              key={step.number} 
              className={`
                ${step.color} p-8 rounded-xl shadow-xl
                transition-transform duration-300
                transform hover:-translate-y-2 text-center relative overflow-hidden
              `}
            >
              <div className="text-7xl mb-6">{step.icon}</div>
              <h3 className="text-2xl font-bold mb-3">Step {step.number}: {step.title}</h3>
              <p className="opacity-90">{step.description}</p>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-white opacity-30"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
