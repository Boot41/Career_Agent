import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const Chatbot = ({ isOpen, setIsOpen, userId }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await axios.post('http://localhost:8001/chatbot/ask/', {
        message: input,
        user_id: userId
      });
      const botMessage = { text: response.data.response, sender: 'bot' };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message to chatbot:', error);
      const errorMessage = { text: "Sorry, I'm having trouble responding.", sender: 'bot' };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setInput('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-20 right-6 bg-white border border-gray-300 rounded-lg shadow-lg w-96 ${isOpen ? 'open' : 'closed'}`}>
      {/* Header */}
      <div className="flex justify-between items-center bg-blue-600 text-white p-3 rounded-t-lg">
        <h2 className="text-lg font-semibold">Chatbot</h2>
        <button onClick={() => setIsOpen(false)} className="text-white font-bold text-lg">✕</button>
      </div>

      {/* Messages Container */}
      <div className="p-3 overflow-y-auto max-h-64 space-y-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 max-w-[80%] text-sm rounded-lg ${msg.sender === 'user' 
              ? 'bg-blue-500 text-white self-end ml-auto' 
              : 'bg-gray-200 text-gray-800 self-start mr-auto'}`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input and Send Button */}
      <div className="flex items-center p-3 border-t border-gray-300">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button onClick={handleSend} className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
