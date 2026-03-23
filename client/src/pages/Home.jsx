import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="glass-card p-6 flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300"
  >
    <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center mb-4 text-primary-400">
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
    <p className="text-slate-400">{description}</p>
  </motion.div>
);

const Home = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-20">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-3xl"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-indigo-300">
          The Future of Secure Voting
        </h1>
        <p className="text-xl text-slate-300 mb-10 leading-relaxed">
          Experience uncompromising security, transparency, and ease-of-use with VoteChain's blockchain-inspired electronic voting platform.
        </p>
        
        <div className="flex gap-4 justify-center">
          {user ? (
            <Link to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} className="glass-button text-lg px-8 py-4">
              Enter Dashboard
            </Link>
          ) : (
            <>
              <Link to="/register" className="glass-button text-lg px-8 py-4">
                Get Started
              </Link>
              <Link to="/login" className="glass-button-secondary text-lg px-8 py-4">
                Sign In
              </Link>
            </>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 w-full max-w-5xl">
        <FeatureCard 
          icon={ShieldCheck} 
          title="Immutable Audit Log" 
          description="Every vote is recorded securely ensuring complete transparency and preventing tampering." 
          delay={0.2} 
        />
        <FeatureCard 
          icon={Lock} 
          title="End-to-End Encryption" 
          description="Advanced RSA encryption protects your vote from the moment it leaves your device." 
          delay={0.4} 
        />
        <FeatureCard 
          icon={Zap} 
          title="Real-Time Results" 
          description="Watch election results unfold instantly with our powerful real-time analytics engine." 
          delay={0.6} 
        />
      </div>
    </div>
  );
};

export default Home;
