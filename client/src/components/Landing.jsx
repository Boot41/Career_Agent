import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  ArrowRight, 
  MessageSquareText, 
  BarChart2, 
  Users,
  Brain,
  TrendingUp,
  FileCheck,
  Link as LinkIcon,
  ChevronRight
} from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <h1 className="text-5xl font-bold text-gray-900 leading-tight animate-slide-up">
                Automate Feedback.
                <span className="text-indigo-600 block">Empower Growth.</span>
              </h1>
              <p className="text-xl text-gray-600 animate-slide-up animation-delay-200">
                AI-driven performance reviews that save time, reduce bias, and generate actionable insights.
              </p>
              <div className="flex items-center space-x-4 animate-slide-up animation-delay-300">
                <Link
                  to="/signup"
                  className="px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center group"
                >
                  Create Organisation
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/demo"
                  className="px-8 py-4 text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Watch Demo
                </Link>
              </div>
            </div>
            <div className="relative animate-fade-in animation-delay-500">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl rotate-3 blur-xl opacity-20 animate-pulse"></div>
              <img
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Dashboard Preview"
                className="rounded-2xl shadow-2xl relative z-10 hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 animate-fade-in">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <MessageSquareText className="w-8 h-8" />,
                title: "AI Collects Feedback",
                description: "Automated outreach to colleagues & managers"
              },
              {
                icon: <Brain className="w-8 h-8" />,
                title: "AI Analyzes & Summarizes",
                description: "Extracts key themes & sentiment insights"
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Actionable Insights",
                description: "Generates detailed performance reports"
              }
            ].map((item, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow animate-slide-up"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 animate-fade-in">Key Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Users />,
                title: "AI-Powered Feedback",
                description: "Automated outreach to teams"
              },
              {
                icon: <BarChart2 />,
                title: "Sentiment Analysis",
                description: "Understand performance trends"
              },
              {
                icon: <FileCheck />,
                title: "Automated Scorecards",
                description: "Instant AI-generated reports"
              },
              {
                icon: <LinkIcon />,
                title: "HR Integration",
                description: "Works with various HR systems"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 animate-fade-in">What Our Clients Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "This tool has revolutionized our performance review process. It's more efficient and insightful than ever.",
                author: "Sarah Johnson",
                role: "HR Director, Tech Corp"
              },
              {
                quote: "The AI-generated insights have helped us identify and nurture top talent more effectively.",
                author: "Michael Chen",
                role: "CEO, StartupX"
              },
              {
                quote: "Implementation was smooth, and the results were immediate. Our teams love the feedback process now.",
                author: "Emily Rodriguez",
                role: "People Ops Manager"
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className="p-6 bg-gray-50 rounded-xl animate-slide-up"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <p className="text-gray-600 italic mb-4">"{testimonial.quote}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium">
                    {testimonial.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-8 animate-fade-in">
            Ready to transform performance management?
          </h2>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/demo"
              className="px-8 py-4 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition-colors inline-flex items-center group animate-slide-up"
            >
              Get a Free Demo
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/contact"
              className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-indigo-600 transition-colors animate-slide-up animation-delay-100"
            >
              Talk to Our Experts
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Connect</h3>
              <p className="mb-4">Get in touch for support or inquiries.</p>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">
                Chat with Us
              </button>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p> 2025 FeedbackAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
