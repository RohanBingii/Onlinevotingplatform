import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Save, Lock } from 'lucide-react';
import { toast } from 'sonner';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ProfileSettings = () => {
  const { user, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.username) {
      setUsername(user.username);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/auth/profile/update', { 
        username, 
        password: password || undefined 
      });
      
      toast.success('Profile updated successfully!');
      
      // Update local storage and context
      const updatedUser = res.data.user;
      const token = sessionStorage.getItem('token');
      login(updatedUser, token);
      
      setPassword(''); // Clear password field for aesthetic
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 max-w-2xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
          <User className="w-10 h-10 text-primary-400" /> User Profile
        </h1>
        <p className="text-slate-500">Manage your personal identification and login credentials.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Email Address (Locked)</label>
            <input 
              type="email" 
              value={user?.email || ''}
              disabled
              className="glass-input w-full opacity-50 cursor-not-allowed" 
            />
            <p className="text-xs text-slate-500 mt-1">Your email identifies your vote and cannot be altered.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="glass-input w-full !pl-12" 
                placeholder="Enter a display name"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 mt-2">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary-400" /> Update Password
            </h3>
            <label className="block text-sm font-medium text-slate-600 mb-2">New Password (Optional)</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-input w-full" 
              placeholder="Leave blank to keep current password"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="glass-button w-full flex justify-center items-center gap-2 mt-4 py-4"
          >
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <><Save className="w-5 h-5" /> Save Changes</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ProfileSettings;
