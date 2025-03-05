import { useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * Feedback Generator Component
 * Allows HR to generate AI-driven feedback questions
 */
const FeedbackGenerator = ({ handleGenerateQuestions }) => {
  const [role, setRole] = useState(""); // Role input by HR
  const [feedbackType, setFeedbackType] = useState(""); // Feedback type input by HR
  const [feedbackReceiver, setFeedbackReceiver] = useState("Manager"); // Who is providing the feedback (default: Manager)
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Function to generate feedback questions
  const handleGenerateFeedback = async () => {
    if (!role.trim() || !feedbackType.trim()) return;

    try {
      setIsGenerating(true);
      setError(null);

      // Call parent component's generate questions method
      await handleGenerateQuestions({
        role,
        feedbackType,
        feedbackReceiver
      });
    } catch (err) {
      setError(err.message || "Failed to generate feedback questions");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white shadow">
      <h2 className="text-lg font-semibold text-gray-800">Generate Feedback Questions</h2>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Role Input */}
      <input
        type="text"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        placeholder="Employee Role (e.g., Software Engineer)"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {/* Feedback Type Input */}
      <input
        type="text"
        value={feedbackType}
        onChange={(e) => setFeedbackType(e.target.value)}
        placeholder="Feedback Type (e.g., Performance Review)"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {/* Feedback Receiver Selection */}
      <select
        value={feedbackReceiver}
        onChange={(e) => setFeedbackReceiver(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="Manager">Manager Feedback</option>
        <option value="Peer">Peer Feedback</option>
        <option value="Self">Self Assessment</option>
      </select>

      {/* Generate Button */}
      <button
        onClick={handleGenerateFeedback}
        disabled={isGenerating || !role.trim() || !feedbackType.trim()}
        className={`w-full px-4 py-2 text-white rounded-md transition ${
          isGenerating || !role.trim() || !feedbackType.trim()
            ? 'bg-indigo-300 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        {isGenerating ? (
          <span className="flex items-center justify-center">
            <Loader2 className="animate-spin mr-2" size={18} />
            Generating...
          </span>
        ) : (
          'Generate Questions'
        )}
      </button>
    </div>
  );
};

export default FeedbackGenerator;
