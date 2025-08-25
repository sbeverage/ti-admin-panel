import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Donors from './components/Donors';
import Vendor from './components/Vendor';
import Beneficiaries from './components/Beneficiaries';
import Tenants from './components/Tenants';
import Discounts from './components/Discounts';
import Leaderboard from './components/Leaderboard';
import Events from './components/Events';
import Settings from './components/Settings';
import NewsfeedManagement from './components/NewsfeedManagement';
import PendingApprovals from './components/PendingApprovals';
import ReferralAnalytics from './components/ReferralAnalytics';
import GeographicAnalytics from './components/GeographicAnalytics';
import ApiRateLimiting from './components/ApiRateLimiting';

import './App.css';

function App() {
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
          <Route path="/events" element={<Events />} />
          <Route path="/newsfeed-management" element={<NewsfeedManagement />} />
          <Route path="/pending-approvals" element={<PendingApprovals />} />
          <Route path="/referral-analytics" element={<ReferralAnalytics />} />
          <Route path="/geographic-analytics" element={<GeographicAnalytics />} />
          <Route path="/api-rate-limiting" element={<ApiRateLimiting />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
