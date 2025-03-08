import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import LandingPage from './components/Landing'
import Signup from './components/Signup'
import Signin from './components/Signin'
import CreateOrganization from './components/CreateOrganization'
import Dashboard from './components/Dashboard'
import HRDashboard from './components/Dashboard/HRDashboard'
import EmployeeDashboard from './components/Dashboard/EmployeeDashboard'
import ManagerDashboard from './components/Dashboard/ManagerDashboard'
import NotFound from './components/NotFound'

// Protected Route component to handle role-based access
function ProtectedRoute({ children, requiredRole }) {
  // Use useLocation inside the component
  const location = useLocation();
  const userData = location.state?.userData;

  // If no user data, redirect to signin
  if (!userData) {
    return <Navigate to="/signin" replace />;
  }

  // If role doesn't match, redirect to appropriate dashboard
  if (requiredRole && userData.role !== requiredRole) {
    switch(userData.role) {
      case 'HR':
        return <Navigate to="/dashboard/hr" state={{ userData }} replace />;
      case 'Employee':
        return <Navigate to="/dashboard/employee" state={{ userData }} replace />;
      case 'Manager':
        return <Navigate to="/dashboard/manager" state={{ userData }} replace />;
      default:
        return <Navigate to="/dashboard" state={{ userData }} replace />;
    }
  }

  // If role matches or no specific role required, render children
  return React.cloneElement(children, { userData });
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="*" element={<LandingPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/create-organization" element={<CreateOrganization />} />
          
          {/* Role-based protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/hr" 
            element={
              <ProtectedRoute requiredRole="HR">
                <HRDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/employee" 
            element={
              <ProtectedRoute requiredRole="Employee">
                <EmployeeDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/manager" 
            element={
              <ProtectedRoute requiredRole="Manager">
                <ManagerDashboard />
              </ProtectedRoute>
            } 
          />
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </div>
    </Router>
  )
}

export default App
