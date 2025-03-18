import { useEffect, useState, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import "@livekit/components-styles";
import {
  LiveKitRoom,
  useVoiceAssistant,
  BarVisualizer,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
} from "@livekit/components-react";
import { RoomEvent } from "livekit-client";
import { useMaybeRoomContext } from "@livekit/components-react";

const VoiceFeedbackForm = ({ selectedFeedback, setIsFormOpen }) => {
  const [token, setToken] = useState(null);
  const [answers, setAnswers] = useState({});
  const [transcriptions, setTranscriptions] = useState("");
  const feedbackId = selectedFeedback?.id;
  const questions = selectedFeedback?.questions || [];

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch("http://localhost:8001/livekit/getToken/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ room: "room", questions }),
        });
        const data = await response.json();
        if (data.token) setToken(data.token);
        else console.error("Token not received");
      } catch (error) {
        console.error("Error fetching token:", error);
      }
    };
    if (questions.length) fetchToken();
  }, [questions]);

  const handleSubmit = async (finalAnswers) => {
    if (!feedbackId || Object.keys(finalAnswers).length === 0) {
      console.error("Invalid feedback submission");
      return;
    }
    try {
      const response = await fetch("http://localhost:8001/feedback/submit-answers/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback_id: feedbackId, answers: finalAnswers }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      console.log("Feedback submitted successfully");
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  const handleRoomDisconnect = async (fullTranscription) => {
    if (!fullTranscription.trim()) return;
    try {
      const response = await fetch("http://localhost:8001/livekit/llmapi/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: fullTranscription }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log("Summarization response:", data.summary);
        const confirmSubmit = window.confirm(`Summary:\n\n${data.summary}\n\nDo you want to submit this feedback?`);
        if (confirmSubmit) {
          handleSubmit({ summary: data.summary });
        } else {
          console.log("Feedback submission canceled.");
        }
      }
    } catch (error) {
      console.error("Failed to send transcription to API:", error);
    }
  };

  return token ? (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-[450px] shadow-xl relative">
        <button onClick={() => setIsFormOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <FaTimes size={18} />
        </button>
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          🎤 Voice Feedback for <span className="text-blue-500">{selectedFeedback.receiver_name}</span>
        </h3>
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-100">
          <LiveKitRoom audio token={token} serverUrl="wss://app-gk63q26e.livekit.cloud">
            <Transcriptions setTranscriptions={setTranscriptions} handleRoomDisconnect={handleRoomDisconnect} />
            <SimpleVoiceAssistant />
            <VoiceAssistantControlBar />
            <RoomAudioRenderer />
          </LiveKitRoom>
        </div>
      </div>
    </div>
  ) : (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] text-center">
        <p className="text-gray-700 text-lg">Fetching voice session...</p>
      </div>
    </div>
  );
};

function SimpleVoiceAssistant() {
  const { state } = useVoiceAssistant();
  return (
    <div className="h-80">
      <BarVisualizer state={state} barCount={5} />
      <p className="text-center">{state}</p>
    </div>
  );
}

function Transcriptions({ setTranscriptions, handleRoomDisconnect }) {
  const room = useMaybeRoomContext();
  const disconnectedCalled = useRef(false);
  const fullTranscriptionRef = useRef("");

  useEffect(() => {
    if (!room) return;

    const updateTranscriptions = (segments, participant) => {
      if (participant?.identity === "user-default-room") {
        fullTranscriptionRef.current += " " + segments.map((s) => s.text).join(" ");
        fullTranscriptionRef.current = fullTranscriptionRef.current.trim();
        setTranscriptions(fullTranscriptionRef.current);
      }
    };

    const handleDisconnect = () => {
      if (!disconnectedCalled.current) {
        disconnectedCalled.current = true;
        handleRoomDisconnect(fullTranscriptionRef.current);
      }
    };

    room.on(RoomEvent.TranscriptionReceived, updateTranscriptions);
    room.on(RoomEvent.Disconnected, handleDisconnect);

    return () => {
      room.off(RoomEvent.TranscriptionReceived, updateTranscriptions);
      room.off(RoomEvent.Disconnected, handleDisconnect);
      disconnectedCalled.current = false;
    };
  }, [room, setTranscriptions, handleRoomDisconnect]);
  return null;
}

export default VoiceFeedbackForm;