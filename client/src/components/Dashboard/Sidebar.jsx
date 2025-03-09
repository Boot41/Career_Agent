import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useNavigate as useHistory } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  BarChart2, 
  Users, 
  Settings, 
  LogOut 
} from 'lucide-react';

/**
 * @typedef {'hr' | 'employee' | 'manager'} UserType
 */

/**
 * Sidebar component for navigation
 * @param {Object} props
 * @param {UserType} props.userType
 * @param {function} props.onToggleView
 * @returns {React.ReactElement}
 */
const Sidebar = ({ userType, onToggleView }) => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const location = useLocation();
  const navigate = useNavigate();
  const history = useHistory();

  useEffect(() => {
    // Determine active menu based on current path
    const path = location.pathname;
    if (path.includes('/dashboard')) setActiveMenu('dashboard');
    else if (path.includes('/feedback')) setActiveMenu('feedback');
    else if (path.includes('/performance')) setActiveMenu('performance');
    else if (path.includes('/team')) setActiveMenu('team');
  }, [location]);

  // Navigation items based on user type
  const getNavItems = () => {
    const commonItems = [
      {
        icon: LayoutDashboard,
        label: 'Dashboard',
        path: '/dashboard',
        key: 'dashboard'
      },
      {
        icon: FileText,
        label: 'Feedback',
        path: '/feedback',
        key: 'feedback'
      }
    ];

    const employeeItems = [
      ...commonItems,
      {
        icon: BarChart2,
        label: 'Performance',
        path: '/performance',
        key: 'performance'
      }
    ];

    const hrItems = [
      ...commonItems,
      {
        icon: Users,
        label: 'Team',
        path: '/team',
        key: 'team'
      }
    ];

    const navMap = {
      'employee': employeeItems,
      'hr': hrItems,
      'manager': hrItems
    };

    return navMap[userType] || commonItems;
  };

  const handleNavigation = (item) => {
    setActiveMenu(item.key);
    
    // Special handling for feedback toggle if on dashboard
    if (item.key === 'feedback' && activeMenu === 'dashboard' && onToggleView) {
      onToggleView();
      return; // Don't navigate away from dashboard
    }
    
    navigate(item.path);
  };

  const handleLogout = () => {
    // Implement logout logic
    localStorage.removeItem('token');
    navigate('*');
  };

  const navItems = getNavItems();

  return (
    <div className="w-64 bg-white border-r border-gray-200 py-6 flex flex-col">
      <div className="px-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          {userType === 'employee' ? 'Employee Portal' : 
           userType === 'hr' ? 'HR Dashboard' : 
           'Manager Dashboard'}
        </h1>
      </div>

      <nav className="flex-1 px-4">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => handleNavigation(item)}
            className={`flex items-center px-4 py-3 rounded-lg mb-2 transition-colors duration-200 w-full text-left ${
              activeMenu === item.key 
                ? 'bg-indigo-50 text-indigo-600' 
                : 'text-gray-600 hover:bg-gray-100'
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
