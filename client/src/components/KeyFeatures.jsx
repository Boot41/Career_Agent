import React, { useState } from 'react';

const KeyFeatures = () => {
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const features = [
    {
      title: 'AI-Powered Feedback Collection',
      description: 'Automated outreach to teams',
      icon: '🤖',
      image: 'https://source.unsplash.com/400x250/?technology,ai',
      color: 'from-blue-500 to-blue-700'
    },
    {
      title: 'Sentiment & Trend Analysis',
      description: 'Understand employee performance over time',
      icon: '📈',
      image: 'https://source.unsplash.com/400x250/?data,analytics',
      color: 'from-purple-500 to-purple-700'
    },
    {
      title: 'Automated Scorecards',
      description: 'Instant AI-generated reports',
      icon: '📋',
      image: 'https://source.unsplash.com/400x250/?report,document',
      color: 'from-green-500 to-green-700'
    },
    {
      title: 'HR System Integration',
      description: 'Works with Workday, BambooHR, SAP',
      icon: '🔗',
      image: 'https://source.unsplash.com/400x250/?business,teamwork',
      color: 'from-red-500 to-red-700'
    }
  ];

  return (
    <section className="container mx-auto px-6 py-20">
      <h2 className="text-center text-4xl font-bold mb-12 text-white">
        Key Features
      </h2>
      <div className="grid md:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <div 
            key={index}
            className={`
              bg-gradient-to-br ${feature.color} text-white
              rounded-xl p-6 shadow-xl transition-all duration-300 
              transform ${hoveredFeature === index ? 'scale-110 shadow-2xl' : 'scale-100'}
              cursor-pointer relative overflow-hidden group
            `}
            onMouseEnter={() => setHoveredFeature(index)}
            onMouseLeave={() => setHoveredFeature(null)}
          >
            <div className="text-5xl mb-4 opacity-80">{feature.icon}</div>
            <h3 className="font-bold text-xl mb-2">{feature.title}</h3>
            <p className="opacity-90">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default KeyFeatures;
