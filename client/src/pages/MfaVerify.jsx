import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const MfaVerify = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  const { login } = useAuth();

  if (!state.tempToken) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/mfa/verify', { 
        tempToken: state.tempToken, 
        otp 
      });
      
      const { token } = response.data;
      const profileRes = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      login(profileRes.data, token);
      toast.success('MFA Verification successful!');
      navigate(profileRes.data.role === 'admin' ? '/admin/dashboard' : '/dashboard');
      
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid MFA Code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-md p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Two-Factor Authentication</h2>
          <p className="text-slate-400">Enter the 6-digit code from your authenticator app.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <input 
              type="text" 
              maxLength="6"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              className="glass-input w-full text-center text-2xl tracking-[0.5em]" 
              placeholder="000000"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading || otp.length < 6}
            className="glass-button w-full flex justify-center items-center disabled:opacity-50"
          >
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Verify'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default MfaVerify;
