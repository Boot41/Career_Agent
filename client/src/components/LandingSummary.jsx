  import React from 'react';

  const LandingSummary = () => {
    return (
      <div className="landing-summary">
        <h1 className="text-4xl font-bold mb-4">Landing Page Summary</h1>

        <h2 className="text-2xl font-semibold">1. Hero Section</h2>
        <p>Introduces the service with a catchy headline and a brief description.</p>
        <ul>
          <li>Title: "Automate Feedback. Empower Growth."</li>
          <li>Description: "AI-driven performance reviews that save time, reduce bias, and generate actionable insights."</li>
          <li>Call-to-action button: "Create Organisation" navigates to the signup page.</li>
          <li>Image showcasing the service dashboard.</li>
        </ul>

        <h2 className="text-2xl font-semibold">2. How It Works</h2>
        <p>Explains the process of how the service functions.</p>
        <ol>
          <li>AI Collects Feedback: Automated outreach to colleagues & managers.</li>
          <li>AI Analyzes & Summarizes: Extracts key themes & sentiment insights.</li>
          <li>Actionable Insights: Generates detailed performance reports.</li>
        </ol>

        <h2 className="text-2xl font-semibold">3. Key Features</h2>
        <p>Highlights the main features of the service.</p>
        <ul>
          <li>AI-Powered Feedback Collection: Automated outreach to teams.</li>
          <li>Sentiment & Trend Analysis: Understand employee performance over time.</li>
          <li>Automated Scorecards: Instant AI-generated reports.</li>
          <li>HR System Integration: Works with various HR systems.</li>
        </ul>

        <h2 className="text-2xl font-semibold">4. Testimonials</h2>
        <p>Showcases user feedback to build trust.</p>
        <p>A carousel that rotates through user testimonials, displaying quotes, authors, and their roles.</p>

        <h2 className="text-2xl font-semibold">5. Call to Action Section</h2>
        <p>Encourages users to engage further.</p>
        <ul>
          <li>Title: "Ready to transform performance management?"</li>
          <li>Buttons: "Get a Free Demo" and "Talk to Our Experts".</li>
          <li>Contact form for users to submit their details.</li>
        </ul>

        <h2 className="text-2xl font-semibold">6. Footer</h2>
        <p>Provides additional navigation and contact options.</p>
        <ul>
          <li>Company information and links to About Us, Features, Pricing, and Contact.</li>
          <li>Legal links to Privacy Policy and Terms of Service.</li>
          <li>Support links to FAQ and Help Center.</li>
          <li>Chat support button for immediate assistance.</li>
          <li>Copyright notice.</li>
        </ul>
      </div>
    );
  };

  export default LandingSummary;
