import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Donors from './components/Donors';
import Vendor from './components/Vendor';
import Beneficiaries from './components/Beneficiaries';
import Tenants from './components/Tenants';
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
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
