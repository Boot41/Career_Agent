import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileText, BarChart2, Users, LogOut } from "lucide-react";

/**
 * @typedef {'hr' | 'employee' | 'manager'} UserType
 */

/**
 * Sidebar component for navigation
 * @param {Object} props
 * @param {function} props.onToggleView
 * @returns {React.ReactElement}
 */
const Sidebar = ({ onToggleView }) => {
  const [userType, setUserType] = useState(null);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch user role from localStorage on mount
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData && userData.role) {
      const role = userData.role.toLowerCase();
      setUserType(role);

      // Redirect to the respective dashboard if on root
      if (location.pathname === "/" || location.pathname === "/dashboard") {
        navigate(`/dashboard/${role}`);
      }
    }
  }, [location, navigate]);

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith("/dashboard/hr/feedback")) setActiveMenu("feedback");
    else if (path.startsWith("/performance")) setActiveMenu("performance");
    else if (path.startsWith("/team")) setActiveMenu("team");
    else setActiveMenu("dashboard");
  }, [location]);

  // Define navigation items based on user role
  const getNavItems = () => {
    const commonItems = [
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        path: `/dashboard/${userType}`,
        key: "dashboard",
      },
    ];

    const employeeItems = [
      ...commonItems,
      {
        icon: BarChart2,
        label: "Performance",
        path: "/performance",
        key: "performance",
      },
    ];

    const hrItems = [
      ...commonItems,
      {
        icon: FileText,
        label: "Feedback",
        path: "/dashboard/hr/feedback",
        key: "feedback",
      },
      {
        icon: Users,
        label: "Team",
        path: "/team",
        key: "team",
      },
    ];

    const managerItems = [...commonItems];

    const navMap = {
      employee: employeeItems,
      hr: hrItems,
      manager: managerItems,
    };

    return navMap[userType] || commonItems;
  };

  const handleNavigation = (item) => {
    setActiveMenu(item.key);
    navigate(item.path);
  };

  const handleLogout = () => {
    localStorage.removeItem("userData");
    navigate("/");
  };

  if (!userType) return null; // Prevent rendering before role is determined

  const navItems = getNavItems();

  return (
    <div className="w-64 bg-white border-r border-gray-200 py-6 flex flex-col">
      <div className="px-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          {userType === "employee"
            ? "Employee Portal"
            : userType === "hr"
            ? "HR Dashboard"
            : "Manager Dashboard"}
        </h1>
      </div>

      <nav className="flex-1 px-4">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => handleNavigation(item)}
            className={`flex items-center px-4 py-3 rounded-lg mb-2 transition-colors duration-200 w-full text-left ${
              activeMenu === item.key
                ? "bg-indigo-50 text-indigo-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <item.icon className="mr-3" size={20} />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="px-4 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
        >
          <LogOut className="mr-3" size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
