// In src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';

// Your component imports are correct
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import CustomerDashboard from './components/CustomerDashboard';
import AgentDashboard from './components/AgentDashboard';

// --- THIS IS WHERE THE FIX IS ---
// ProtectedRoute component...
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Change this line to get 'user' instead of 'isAuthenticated'
  const { user } = useApp();
  
  // Change the check to see if the 'user' object exists
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};
// ------------------------------

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          <Route 
            path="/customer-dashboard" 
            element={
              <ProtectedRoute>
                <CustomerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/agent-dashboard" 
            element={
              <ProtectedRoute>
                <AgentDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;