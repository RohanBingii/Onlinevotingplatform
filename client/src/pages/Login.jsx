import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.mfaRequired) {
        toast.info('MFA Required');
        navigate('/mfa-verify', { 
          state: { 
            tempToken: response.data.tempToken, 
            userId: response.data.userId 
          } 
        });
      } else {
        const { token } = response.data;
        // Fetch user profile to get roles
        const profileRes = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        login(profileRes.data, token);
        toast.success('Login successful!');
        navigate(profileRes.data.role === 'admin' ? '/admin/dashboard' : '/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-md p-8 relative overflow-hidden"
      >
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-primary-500/10 to-transparent -z-10 animate-spin-slow pointer-events-none" />
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-slate-400">Sign in to your account securely</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-input w-full" 
              placeholder="admin@votechain.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-input w-full" 
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="glass-button w-full mt-2 flex justify-center items-center"
          >
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Don't have an account? <Link to="/register" className="text-primary-400 hover:text-primary-300 transition-colors">Register here</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
