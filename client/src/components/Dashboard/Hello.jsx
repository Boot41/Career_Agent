import { Sun, Moon, CloudSun, ClipboardCheck, Users } from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";

const Hello = ({ noofEmp }) => {
    const [pendingFeedbackCount, setPendingFeedbackCount] = useState(0);
    const [submittedFeedbackCount, setSubmittedFeedbackCount] = useState(0);
    const [totalPendingFeedbacks, setTotalPendingFeedbacks] = useState(0);
    const [totalEmployees, setTotalEmployees] = useState(noofEmp);

    const userData = JSON.parse(localStorage.getItem("userData"));
    const hrAdminName = userData.name;
    // console.log(id)
    const id = userData.id;
    // console.log(orgId)
    const orgId=userData.organization_id
    // console.log(orgId)
    useEffect(() => {
      if (!id || !orgId) return; // Ensure both IDs are available
      // console.log(id) 
      // Fetch pending feedback count
      axios.get(`http://0.0.0.0:8001/feedback/pending-feedback/?user_id=${id}`)
          .then((res) => setPendingFeedbackCount(res.data.length)).then(() => {
            console.log(pendingFeedbackCount);
          })
          .catch((err) => console.error("Error fetching pending feedback", err));
  
      // Fetch submitted feedback count
      axios.get(`http://0.0.0.0:8001/feedback/total-submitted-feedbacks/?id=${orgId}`)
          .then((res) => setSubmittedFeedbackCount(res.data.submitted_feedback || 0)) // Adjusted based on backend
          .catch((err) => console.error("Error fetching submitted feedback", err));
  
      // Fetch total pending feedbacks
      axios.get(`http://0.0.0.0:8001/feedback/total-pending-feedbacks/?id=${orgId}`)
          .then((res) => setTotalPendingFeedbacks(res.data.total_pending_feedbacks || 0)) // Adjusted based on backend
          .catch((err) => console.error("Error fetching total pending feedbacks", err));
  
      // Fetch total employees
      axios.get(`http://0.0.0.0:8001/org/total-employees/?id=${orgId}`)
          .then((res) => setTotalEmployees(res.data.total_employees || 0)) // Adjusted based on backend
          .catch((err) => console.error("Error fetching total employees", err));
  }, [id, orgId]);

    const currentHour = new Date().getHours();
    const greeting = currentHour < 12 ? "Good morning" :
        currentHour < 18 ? "Good afternoon" : "Good evening";
    const GreetingIcon = currentHour < 12 ? Sun : currentHour < 18 ? CloudSun : Moon;

    return (
        <div className="w-full p-6 bg-gray-100 min-h-screen">
            {/* Greeting Section */}
            <div className="bg-white shadow-md rounded-lg p-8 border border-gray-200 flex flex-col lg:flex-row justify-between items-center w-full mb-6">
                <div className="flex items-center space-x-6">
                    <GreetingIcon className="w-16 h-16 text-indigo-600" />
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">
                            {`${greeting}, ${hrAdminName}!`}
                        </h2>
                        <p className="text-gray-600 text-lg">Here’s an overview of your company’s feedback.</p>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Pending Feedback Reviews */}
                <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 flex items-center space-x-4">
                    <ClipboardCheck className="w-12 h-12 text-green-500" />
                    <div>
                        <p className="text-gray-600 text-lg">Pending Feedbacks Today</p>
                        <h3 className="text-2xl font-bold text-indigo-600">{pendingFeedbackCount}</h3>
                    </div>
                </div>

                {/* Submitted Feedback */}
                <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 flex items-center space-x-4">
                    <ClipboardCheck className="w-12 h-12 text-blue-500" />
                    <div>
                        <p className="text-gray-600 text-lg">Total Submitted Feedback</p>
                        <h3 className="text-2xl font-bold text-blue-600">{submittedFeedbackCount}</h3>
                    </div>
                </div>

                {/* Total Pending Feedbacks */}
                <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 flex items-center space-x-4">
                    <ClipboardCheck className="w-12 h-12 text-red-500" />
                    <div>
                        <p className="text-gray-600 text-lg">Overall Pending Feedbacks</p>
                        <h3 className="text-2xl font-bold text-red-600">{totalPendingFeedbacks}</h3>
                    </div>
                </div>

                {/* Total Employees */}
                <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 flex items-center space-x-4">
                    <Users className="w-12 h-12 text-purple-500" />
                    <div>
                        <p className="text-gray-600 text-lg">Total Employees</p>
                        <h3 className="text-2xl font-bold text-purple-600">{totalEmployees}</h3>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hello;
