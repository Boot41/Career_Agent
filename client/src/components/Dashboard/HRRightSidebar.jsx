import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Users, TrendingUp, Mail, AlertTriangle } from 'lucide-react';

/**
 * Right sidebar for HR Dashboard with employee management functionalities
 * @param {Object} props - Component props
 * @param {Function} props.onEmployeeSelect - Callback when an employee is selected
 * @param {Function} props.onInviteEmployee - Callback to open employee invitation modal
 * @param {Object} props.organizationHierarchy - Organization hierarchy data
 */
const HRRightSidebar = ({ 
  onEmployeeSelect, 
  onInviteEmployee, 
  organizationHierarchy = { managers: [], unassignedEmployees: [] } 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Transform organization hierarchy into a flat list of employees
  const employees = [
    ...organizationHierarchy.managers.flatMap(manager => [
      { ...manager, role: 'manager' },
      ...(manager.team || []).map(employee => ({ ...employee, role: 'employee' }))
    ]),
    ...organizationHierarchy.unassignedEmployees.map(emp => ({ 
      ...emp, 
      role: 'employee', 
      department: 'Unassigned' 
    }))
  ];

  const pendingInvitations = [
    { id: 1, name: 'Alex Brown', email: 'alex@company.com', sentDate: '2024-02-15' },
    { id: 2, name: 'Sarah Lee', email: 'sarah@company.com', sentDate: '2024-02-20' }
  ];

  const performanceTrends = {
    completionRate: `${Math.round(employees.length * 0.85)}%`,
    topPerformers: Math.min(3, employees.length),
    flaggedIssues: Math.round(employees.length * 0.1)
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedFilter === 'all' || emp.role.toLowerCase() === selectedFilter)
  );

  return (
    <div className="w-72 bg-white border-l shadow-md p-4 overflow-y-auto">
      {/* Employee Search */}
      <div className="mb-4">
        <div className="relative mb-2">
          <input 
            type="text" 
            placeholder="Search employees..." 
            className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-2 top-3 text-gray-400" size={18} />
        </div>
        <select 
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="employee">Employees</option>
          <option value="manager">Managers</option>
        </select>
      </div>

      {/* Invite Employee Button */}
      <button 
        onClick={onInviteEmployee}
        className="w-full flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition mb-4"
      >
        <UserPlus className="mr-2" /> Invite Employee
      </button>

      {/* Employee List */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-2">
          <Users className="mr-2 text-indigo-600" /> Employee List
        </h3>
        <div className="space-y-2">
          {filteredEmployees.map(emp => (
            <div 
              key={emp.id} 
              className="flex justify-between items-center p-2 bg-gray-50 hover:bg-gray-100 cursor-pointer rounded-md transition"
              onClick={() => onEmployeeSelect(emp)}
            >
              <div>
                <div className="font-medium text-gray-800">{emp.name}</div>
                <div className="text-xs text-gray-500">{emp.department || 'No Department'}</div>
              </div>
              
            </div>
          ))}
        </div>
      </div>

      {/* Pending Invitations */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-2">
          <Mail className="mr-2 text-yellow-600" /> Pending Invitations
        </h3>
        <div className="space-y-2">
          {pendingInvitations.map(invite => (
            <div key={invite.id} className="flex justify-between items-center p-2 bg-yellow-50 border border-yellow-200 rounded-md">
              <div>
                <div className="font-medium text-gray-800">{invite.name}</div>
                <div className="text-xs text-gray-500">{invite.email}</div>
              </div>
              <div className="flex space-x-1">
                <button className="text-xs bg-indigo-500 text-white px-2 py-1 rounded-md hover:bg-indigo-600">Resend</button>
                <button className="text-xs bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600">Revoke</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Trends */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-2">
          <TrendingUp className="mr-2 text-green-600" /> Performance Trends
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gray-50 p-3 rounded-md text-center border border-gray-200">
            <div className="font-bold text-indigo-600 text-lg">{performanceTrends.completionRate}</div>
            <div className="text-xs text-gray-600">Completion</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-md text-center border border-gray-200">
            <div className="font-bold text-green-600 text-lg">{performanceTrends.topPerformers}</div>
            <div className="text-xs text-gray-600">Top Performers</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-md text-center border border-gray-200">
            <div className="font-bold text-red-600 text-lg">{performanceTrends.flaggedIssues}</div>
            <div className="text-xs text-gray-600">Flagged</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRRightSidebar;
