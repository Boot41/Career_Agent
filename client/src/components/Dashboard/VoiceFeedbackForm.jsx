import { useEffect, useState } from "react";
import { FaMicrophone, FaStop, FaArrowRight, FaTimes } from "react-icons/fa";

const VoiceFeedbackForm = ({ selectedFeedback, setIsFormOpen, handleFormSubmit }) => {
  const [responses, setResponses] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);

  const synth = window.speechSynthesis;
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

  recognition.continuous = false; // Set to false for better control
  recognition.interimResults = false;
  recognition.lang = "en-US";

  // 🔹 Update `isListening` when recognition starts/stops
  recognition.onstart = () => setIsListening(true);
  recognition.onend = () => setIsListening(false);

  useEffect(() => {
    if (selectedFeedback) {
      readQuestion(selectedFeedback.questions[currentQuestionIndex]);
    }
  }, [currentQuestionIndex, selectedFeedback]);

  const readQuestion = (question) => {
    if (synth.speaking) {
      synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(question);
    utterance.pitch = 1.2;
    utterance.rate = 1.1;
    utterance.volume = 1;

    const voices = synth.getVoices();
    const friendlyVoice = voices.find((voice) =>
      voice.name.includes("Google UK English Female") || voice.name.includes("Samantha")
    );

    if (friendlyVoice) {
      utterance.voice = friendlyVoice;
    }

    utterance.text = ` ${question} `;

    utterance.onend = () => {
      setTimeout(() => recognition.start(), 500); // Ensure mic starts after speaking
    };

    synth.speak(utterance);
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    setResponses((prev) => ({
      ...prev,
      [`${selectedFeedback.id}-${currentQuestionIndex}`]: transcript,
    }));
  };

  recognition.onerror = (event) => {
    console.error("Speech Recognition Error: ", event.error);
    setIsListening(false);
  };

  const handleNextQuestion = () => {
    recognition.stop();
    if (currentQuestionIndex < selectedFeedback.questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const feedbackId = selectedFeedback.id;
    if (!feedbackId || Object.keys(responses).length === 0) {
      console.error("Error: Missing feedback ID or responses");
      return;
    }

    console.log("Submitting voice feedback responses:", responses);
    handleFormSubmit(feedbackId, responses);
    stopFeedbackProcess();
  };

  const stopFeedbackProcess = () => {
    synth.cancel();
    recognition.stop();
    setCurrentQuestionIndex(0);
    setResponses({});
    setIsFormOpen(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-[420px] shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          🎤 Voice Feedback for <span className="text-blue-500">{selectedFeedback.receiver_name}</span>
        </h3>

        {/* Current Question */}
        <p className="text-gray-700 text-lg font-semibold mb-4 bg-gray-100 p-3 rounded-lg">
          {currentQuestionIndex + 1}. {selectedFeedback.questions[currentQuestionIndex]}
        </p>

        {/* Listening Indicator */}
        <div className="border p-4 rounded-md text-gray-600 flex items-center justify-center bg-gray-100">
          {isListening ? (
            <div className="flex items-center space-x-2 text-blue-600">
              <span className="animate-pulse">Listening...</span>
              <FaMicrophone className="text-xl animate-bounce" />
            </div>
          ) : (
            responses[`${selectedFeedback.id}-${currentQuestionIndex}`] || (
              <span className="text-gray-500">No response yet. Press Start Listening.</span>
            )
          )}
        </div>

        {/* Buttons Section */}
        <div className="flex justify-end mt-4 space-x-3">
          {isListening ? (
            <button
              onClick={() => recognition.stop()}
              className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
            >
              <FaStop className="mr-2" />
              Stop Listening
            </button>
          ) : (
            <button
              onClick={() => recognition.start()}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
            >
              <FaMicrophone className="mr-2" />
              Start Listening
            </button>
          )}

          <button
            onClick={handleNextQuestion}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200"
            disabled={!responses[`${selectedFeedback.id}-${currentQuestionIndex}`]}
          >
            <FaArrowRight className="mr-2" />
            Next
          </button>

          <button
            onClick={stopFeedbackProcess}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-200"
          >
            <FaTimes className="mr-2" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceFeedbackForm;
