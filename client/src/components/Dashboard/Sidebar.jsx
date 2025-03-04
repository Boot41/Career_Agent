import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquareText, 
  BarChart3, 
  LogOut 
} from 'lucide-react';

/**
 * @typedef {'hr' | 'employee' | 'manager'} UserType
 */

/**
 * Sidebar component for navigation
 * @param {Object} props
 * @param {UserType} props.userType
 * @returns {React.ReactElement}
 */
const Sidebar = ({ userType }) => {
  const getNavItems = () => {
    switch (userType) {
      case 'hr':
        return [
          { icon: <LayoutDashboard size={20} />, text: 'Dashboard Overview', path: '/dashboard/hr' },
          { icon: <Users size={20} />, text: 'Employee Management', path: '/dashboard/hr/employees' },
          // { icon: <MessageSquareText size={20} />, text: 'Feedback Generation', path: '/dashboard/hr/feedback' },
          { icon: <BarChart3 size={20} />, text: 'Reports & Insights', path: '/dashboard/hr/reports' },
        ];
      case 'employee':
        return [
          { icon: <LayoutDashboard size={20} />, text: 'Dashboard', path: '/dashboard/employee' },
          // { icon: <MessageSquareText size={20} />, text: 'Feedback Requests', path: '/dashboard/employee/feedback' },
          { icon: <BarChart3 size={20} />, text: 'Performance', path: '/dashboard/employee/performance' },
        ];
      case 'manager':
        return [
          { icon: <LayoutDashboard size={20} />, text: 'Dashboard', path: '/dashboard/manager' },
          { icon: <Users size={20} />, text: 'Team Members', path: '/dashboard/manager/team' },
          { icon: <MessageSquareText size={20} />, text: 'Feedback Requests', path: '/dashboard/manager/feedback' },
          { icon: <BarChart3 size={20} />, text: 'Team Performance', path: '/dashboard/manager/performance' },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="h-screen w-64 bg-indigo-800 text-white flex flex-col">
      <div className="p-5 border-b border-indigo-700">
        <h2 className="text-xl font-bold">HR Feedback System</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-3">
          {getNavItems().map((item, index) => (
            <li key={index}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => 
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-indigo-700 text-white' 
                      : 'text-indigo-100 hover:bg-indigo-700'
                  }`
                }
              >
                {item.icon}
                <span>{item.text}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="p-4 border-t border-indigo-700">
        <button className="flex items-center gap-3 text-indigo-100 hover:text-white w-full px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
