import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
        {/* Company Info */}
        <div>
          <h3 className="text-xl font-bold mb-4">Career Agent</h3>
          <nav className="space-y-2">
            <a href="#" className="block hover:text-blue-400">About Us</a>
            <a href="#" className="block hover:text-blue-400">Features</a>
            <a href="#" className="block hover:text-blue-400">Pricing</a>
            <a href="#" className="block hover:text-blue-400">Contact</a>
          </nav>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-xl font-bold mb-4">Legal</h3>
          <nav className="space-y-2">
            <a href="#" className="block hover:text-blue-400">Privacy Policy</a>
            <a href="#" className="block hover:text-blue-400">Terms of Service</a>
          </nav>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-xl font-bold mb-4">Support</h3>
          <nav className="space-y-2">
            <a href="#" className="block hover:text-blue-400">FAQ</a>
            <a href="#" className="block hover:text-blue-400">Help Center</a>
            <a href="#" className="block hover:text-blue-400">Live Chat</a>
          </nav>
        </div>
      </div>
      
      {/* Chatbot */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition duration-300">
          💬 Chat Support
        </button>
      </div>

      {/* Copyright */}
      <div className="text-center mt-8 text-gray-400">
        © {new Date().getFullYear()} Career Agent. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
