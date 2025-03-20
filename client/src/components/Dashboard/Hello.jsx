import { Sun, Moon, CloudSun, ClipboardCheck } from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";

const Hello = () => {
    const [pendingFeedbackCount, setPendingFeedbackCount] = useState(0);
    // const [hrAdminName, setHrAdminName] = useState("");
    const userData=JSON.parse(localStorage.getItem('userData'));
    const hrAdminName = userData.name;
    const id=userData.id;
    useEffect(() => {
        // Fetch pending feedback count from the backend
        axios.get(`http://localhost:8001/feedback/pending-feedback/?user_id=${id}`)
          .then((res) => {
            setPendingFeedbackCount(res.data.count);
          })
          .catch((err) => {
            console.error("Error fetching pending feedback", err);
          });
      }, []);

    const currentHour = new Date().getHours(); // Dynamically fetch current hour
    const greeting =
      currentHour < 12 ? "Good morning" :
      currentHour < 18 ? "Good afternoon" :
      "Good evening";
  
    // const hrAdminName = "HR Admin"; // Replace with actual fetch from database
    // const pendingFeedbackCount = 5; // Replace with actual fetch from database
  
    // Select an appropriate icon based on the time of day
    const GreetingIcon =
      currentHour < 12 ? Sun :
      currentHour < 18 ? CloudSun :
      Moon;
  
    return (
      <div className="bg-white shadow-md rounded-lg p-6 flex items-center space-x-4 border border-gray-200">
        <GreetingIcon className="w-12 h-12 text-indigo-600" />
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            {`${greeting}, ${hrAdminName}!`}
          </h2>
          <div className="flex items-center space-x-2 mt-2 text-gray-600">
            <ClipboardCheck className="w-5 h-5 text-green-500" />
            <p>
              You have{" "}
              <span className="font-bold text-indigo-600">
                {pendingFeedbackCount}
              </span>{" "}
              pending feedback reviews today.
            </p>
          </div>
        </div>
      </div>
    );
  }

  export default Hello;