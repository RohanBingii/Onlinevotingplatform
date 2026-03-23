import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Vote, Calendar, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api/axios';

const UserDashboard = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await api.get('/election');
        setElections(res.data.elections);
      } catch (err) {
        toast.error('Failed to load elections');
      } finally {
        setLoading(false);
      }
    };
    fetchElections();
  }, []);

  const activeElections = elections.filter(e => e.status === 'active');
  const closedElections = elections.filter(e => e.status === 'closed');

  if (loading) return <div className="text-center pt-20 animate-pulse text-white">Loading elections...</div>;

  return (
    <div className="py-8">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-2">Voter Dashboard</h1>
        <p className="text-slate-400">Participate in active elections securely</p>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Vote className="w-6 h-6 text-primary-400" /> Active Elections
        </h2>
        
        {activeElections.length === 0 ? (
          <div className="glass-card p-8 text-center text-slate-400">
            No active elections at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeElections.map((election, i) => (
              <motion.div 
                key={election.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 flex flex-col h-full hover:border-primary-500/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white">{election.title}</h3>
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                </div>
                <p className="text-slate-400 text-sm mb-6 flex-grow">{election.description}</p>
                
                <div className="space-y-2 mb-6 text-sm text-slate-300">
                  <div className="flex items-center gap-2 text-red-300">
                    <Calendar className="w-4 h-4" />
                    <span>Closes: {new Date(election.endTime).toLocaleDateString()}</span>
                  </div>
                </div>

                <Link 
                  to={`/vote/${election.id}`}
                  className="w-full glass-button flex justify-center items-center gap-2 text-center"
                >
                  Cast Vote
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-slate-400" /> Past Elections
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {closedElections.length === 0 ? (
            <p className="text-slate-500 col-span-3">No past elections to show.</p>
          ) : (
            closedElections.map((election, i) => (
              <motion.div key={election.id} className="glass border border-white/5 rounded-2xl p-6 opacity-70">
                 <h3 className="text-lg font-bold text-white mb-2">{election.title}</h3>
                 <p className="text-slate-400 text-xs">{election.description}</p>
                 <div className="mt-4">
                   <span className="text-xs px-2 py-1 bg-slate-800 rounded-md text-slate-300">Closed</span>
                 </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
