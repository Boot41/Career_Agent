import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const Chatbot = ({ isOpen, setIsOpen, userList}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  console.log(userList)
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await axios.post('http://localhost:8001/chatbot/ask/', {
        message: input,
        user_list: userList
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
    <div className="fixed bottom-6 right-6 w-96 bg-white border border-gray-300 rounded-lg shadow-xl flex flex-col h-[500px]">
      {/* Header */}
      <div className="flex justify-between items-center bg-indigo-600 text-white p-4">
        <h2 className="text-lg font-semibold">AI Chatbot</h2>
        <button onClick={() => setIsOpen(false)} className="text-white text-xl font-bold hover:text-gray-200">
          ✕
        </button>
      </div>

      {/* Messages Container (Fixed Height) */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.length === 0 && (
          <p className="text-center text-gray-500 mt-4">How can I help you today?</p>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-[80%] p-3 text-sm rounded-lg shadow-sm mb-2 ${
              msg.sender === 'user' ? 'ml-auto bg-indigo-500 text-white rounded-br-none' : 'mr-auto bg-gray-200 text-gray-800 rounded-bl-none'
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input and Send Button (Fixed at Bottom) */}
      <div className="p-3 border-t bg-white flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-400"
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          className="ml-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
