import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import AdminLogin from './components/AdminLogin';
import Dashboard from './components/Dashboard';
import Donors from './components/Donors';
import Vendor from './components/Vendor';
import Beneficiaries from './components/Beneficiaries';
import Tenants from './components/Tenants';
import Discounts from './components/Discounts';
import Leaderboard from './components/Leaderboard';
import Settings from './components/Settings';
import NewsfeedManagement from './components/NewsfeedManagement';
import PendingApprovals from './components/PendingApprovals';
import ReferralAnalytics from './components/ReferralAnalytics';
import GeographicAnalytics from './components/GeographicAnalytics';
import ApiRateLimiting from './components/ApiRateLimiting';
import OneTimeGifts from './components/OneTimeGifts';

import './App.css';

function App() {
  const { isAuthenticated, loading, login } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="App">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <div style={{ 
            color: 'white', 
            fontSize: '18px',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '20px' }}>🔐</div>
            <div>Loading Admin Panel...</div>
          </div>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="App">
        <AdminLogin onLogin={login} />
      </div>
    );
  }

  // Show main app if authenticated
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/donors" element={<Donors />} />
          <Route path="/vendor" element={<Vendor />} />
          <Route path="/beneficiaries" element={<Beneficiaries />} />
          <Route path="/tenants" element={<Tenants />} />
          <Route path="/discounts" element={<Discounts />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/newsfeed-management" element={<NewsfeedManagement />} />
          <Route path="/pending-approvals" element={<PendingApprovals />} />
          <Route path="/referral-analytics" element={<ReferralAnalytics />} />
          <Route path="/geographic-analytics" element={<GeographicAnalytics />} />
          <Route path="/api-rate-limiting" element={<ApiRateLimiting />} />
          <Route path="/one-time-gifts" element={<OneTimeGifts />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
