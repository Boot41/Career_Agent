import React, { useState, useEffect } from 'react';

const Testimonials = () => {
  const testimonials = [
    {
      quote: "Career Agent has saved our HR team 40+ hours per review cycle!",
      author: "Jane Doe",
      role: "HR Director, XYZ Corp",
      avatar: 'https://source.unsplash.com/150x150/?woman,portrait'
    },
    {
      quote: "The AI insights are incredibly accurate and actionable.",
      author: "John Smith",
      role: "People Operations, Tech Innovations Inc.",
      avatar: 'https://source.unsplash.com/150x150/?man,portrait'
    }
  ];

  const companyLogos = [
    'https://source.unsplash.com/200x100/?business,logo1',
    'https://source.unsplash.com/200x100/?business,logo2',
    'https://source.unsplash.com/200x100/?business,logo3',
    'https://source.unsplash.com/200x100/?business,logo4'
  ];

  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        {/* Testimonial Carousel */}
        <div className="text-center mb-16">
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg transition-all duration-300">
            <div className="flex justify-center mb-6">
              <img 
                src={testimonials[currentTestimonial].avatar} 
                alt={testimonials[currentTestimonial].author}
                className="w-24 h-24 rounded-full border-4 border-blue-500"
              />
            </div>
            <blockquote className="text-2xl italic text-gray-800 mb-6 relative">
              "{testimonials[currentTestimonial].quote}"
            </blockquote>
            <div className="font-bold text-lg text-blue-600">
              {testimonials[currentTestimonial].author}
            </div>
            <div className="text-gray-600">
              {testimonials[currentTestimonial].role}
            </div>
          </div>
        </div>

        {/* Company Logos */}
        <div className="flex justify-center items-center space-x-8 opacity-70">
          {companyLogos.map((logo, index) => (
            <img 
              key={index} 
              src={logo} 
              alt={`Company Logo ${index + 1}`} 
              className="h-12 grayscale hover:grayscale-0 transition-all duration-300 transform hover:scale-110"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
