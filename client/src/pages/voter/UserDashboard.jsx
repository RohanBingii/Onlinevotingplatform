import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Vote, Calendar, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api/axios';

const UserDashboard = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [integrityStatuses, setIntegrityStatuses] = useState({});

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await api.get('/election');
        const allElections = res.data.elections;
        setElections(allElections);
        
        // Fetch integrity for closed elections in background
        const closed = allElections.filter(e => e.status === 'closed');
        closed.forEach(async (election) => {
          try {
            const auditRes = await api.get(`/audit/election/${election.id}/verify`);
            setIntegrityStatuses(prev => ({
              ...prev,
              [election.id]: auditRes.data.integrity
            }));
          } catch (err) {
            setIntegrityStatuses(prev => ({
              ...prev,
              [election.id]: false // Assume tampered if we can't verify
            }));
          }
        });
        
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

  if (loading) return <div className="text-center pt-20 animate-pulse text-slate-900">Loading elections...</div>;

  return (
    <div className="py-8">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Voter Dashboard</h1>
        <p className="text-slate-500">Participate in active elections securely</p>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Vote className="w-6 h-6 text-primary-400" /> Active Elections
        </h2>
        
        {activeElections.length === 0 ? (
          <div className="glass-card p-8 text-center text-slate-500">
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
                  <h3 className="text-xl font-bold text-slate-900">{election.title}</h3>
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                </div>
                <p className="text-slate-500 text-sm mb-6 flex-grow">{election.description}</p>
                
                <div className="space-y-2 mb-6 text-sm text-slate-600">
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
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-slate-500" /> Past Elections
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {closedElections.length === 0 ? (
            <p className="text-slate-500 col-span-3">No past elections to show.</p>
          ) : (
            closedElections.map((election, i) => {
              const isTampered = integrityStatuses[election.id] === false;
              return (
              <Link to={`/results/${election.id}`} key={election.id}>
                <motion.div className={`glass border rounded-2xl p-6 opacity-70 hover:opacity-100 transition-all cursor-pointer h-full flex flex-col ${isTampered ? 'border-red-400 bg-red-50/50 hover:border-red-500' : 'border-slate-200 hover:border-primary-300'}`}>
                   <h3 className="text-lg font-bold text-slate-900 mb-2">{election.title}</h3>
                   <p className="text-slate-500 text-xs flex-grow">{election.description}</p>
                   <div className="mt-4 flex justify-between items-center">
                     <div className="flex gap-2">
                       <span className="text-xs px-2 py-1 bg-white rounded-md text-slate-600 font-medium shadow-sm">Closed</span>
                       {isTampered && <span className="text-xs px-2 py-1 bg-red-100 text-red-700 font-bold rounded-md shadow-sm border border-red-200">TAMPERED</span>}
                     </div>
                     <span className="text-xs font-semibold text-primary-500">View Results &rarr;</span>
                   </div>
                </motion.div>
              </Link>
            )})
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
