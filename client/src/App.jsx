import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'sonner';

import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import MfaVerify from './pages/MfaVerify';
import AdminDashboard from './pages/admin/AdminDashboard';
import ElectionDetails from './pages/admin/ElectionDetails';
import AuditLogs from './pages/admin/AuditLogs';
import UserDashboard from './pages/voter/UserDashboard';
import ElectionVote from './pages/voter/ElectionVote';
import SecuritySettings from './pages/SecuritySettings';
import ProfileSettings from './pages/ProfileSettings';
import VoterElectionResults from './pages/voter/VoterElectionResults';

const NotFound = () => <div className="text-center pt-20"><h1 className="text-4xl font-bold">404 Not Found</h1></div>;

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/mfa-verify" element={<MfaVerify />} />

            {/* Shared Authenticated Routes */}
            <Route 
              path="/security" 
              element={
                <ProtectedRoute>
                  <SecuritySettings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfileSettings />
                </ProtectedRoute>
              } 
            />

            {/* User Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/vote/:id" 
              element={
                <ProtectedRoute>
                  <ElectionVote />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/results/:id" 
              element={
                <ProtectedRoute>
                  <VoterElectionResults />
                </ProtectedRoute>
              } 
            />

            {/* Admin Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/election/:id" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <ElectionDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/audit" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AuditLogs />
                </ProtectedRoute>
              } 
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
      
      <Toaster 
        theme="dark" 
        position="top-right"
        toastOptions={{
          className: 'glass !bg-white/80 !border-slate-200 !text-slate-900'
        }}
      />
    </AuthProvider>
  );
};

export default App;
