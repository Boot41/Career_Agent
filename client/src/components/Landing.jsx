import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from './HeroSection';
import ProblemSolution from './ProblemSolution';
import HowItWorks from './HowItWorks';
import KeyFeatures from './KeyFeatures';
import Testimonials from './Testimonials';
import CTASection from './CTASection';
import Footer from './Footer';

function LandingPage() {
  const navigate = useNavigate();

  const handleSignup = () => {
    navigate('/signup');
  };

  return (
    <div>
      <HeroSection />
      <ProblemSolution />
      <HowItWorks />
      <KeyFeatures />
      <Testimonials />
      <CTASection />
      <div className="bg-white">
      </div>
      <Footer />
    </div>
  );
}

export default LandingPage;
