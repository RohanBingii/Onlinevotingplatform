import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { Award, ShieldCheck, Lock } from 'lucide-react';

const VoterElectionResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Integrity state
  const [integrityStatus, setIntegrityStatus] = useState(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const elRes = await api.get(`/election/${id}`);
        setElection(elRes.data.election);
        
        if (elRes.data.election.status === 'closed') {
          const resRes = await api.get(`/election/results/${id}`);
          setResults(resRes.data.results);
          
          // Auto-verify integrity
          setVerifying(true);
          try {
            const auditRes = await api.get(`/audit/election/${id}/verify`);
            setIntegrityStatus(auditRes.data);
          } catch (auditErr) {
            setIntegrityStatus({
              integrity: false,
              message: 'Failed to verify election integrity'
            });
          } finally {
            setVerifying(false);
          }
        } else {
          toast.error("This election has not concluded yet.");
          navigate('/dashboard');
        }
      } catch (err) {
        toast.error('Failed to load election details');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  if (loading) return <div className="text-center pt-20 animate-pulse text-slate-900">Loading securely...</div>;
  if (!election || !results) return <div className="text-center pt-20 text-red-400">Results not available</div>;

  return (
    <div className="py-8 max-w-4xl mx-auto">
      <button onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-slate-900 mb-6 flex items-center gap-2 transition-colors">
        &larr; Back to Dashboard
      </button>

      <div className="glass-card p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-primary-500/10 pointer-events-none">
          <Lock className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">{election.title} - Results</h1>
              <p className="text-slate-500 max-w-2xl">{election.description}</p>
            </div>
            <div className="text-right flex flex-col items-end gap-3">
              <span className="px-4 py-2 rounded-full font-bold text-sm bg-slate-100 text-slate-500">
                CLOSED
              </span>
              {verifying && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-500"></div> Verifying blockchain...
                </span>
              )}
            </div>
          </div>

          {integrityStatus && !integrityStatus.integrity && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-6 rounded-xl border bg-red-500/10 border-red-500/30 text-red-500">
              <div className="flex items-center gap-3 font-bold text-lg mb-2">
                <ShieldCheck className="w-6 h-6 flex-shrink-0" /> TAMPERED ELECTION DETECTED
              </div>
              <p className="text-sm text-red-400">{integrityStatus.message}. The results shown below may be invalid or manipulated.</p>
            </motion.div>
          )}
          
          {integrityStatus && integrityStatus.integrity && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl border bg-green-500/10 border-green-500/30 text-green-700">
              <div className="flex items-center gap-2 font-medium">
                <ShieldCheck className="w-5 h-5 flex-shrink-0" /> <span className="text-sm">Election records are cryptographically secured and intact.</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2"><Award className="w-6 h-6 text-yellow-400"/> Final Tally</h2>
        <div className="flex flex-col gap-4 mb-8">
          {(() => {
            const maxVotes = Math.max(...results.map(r => r.totalVotes), 0);
            const sortedResults = [...results].sort((a, b) => b.totalVotes - a.totalVotes);

            return sortedResults.map((candidate) => {
              const isWinner = candidate.totalVotes === maxVotes && candidate.totalVotes > 0;
              return (
                <div key={candidate.id} className={`p-5 rounded-xl border flex items-center justify-between transition-colors ${isWinner ? 'bg-green-50 border-green-200 shadow-sm' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 flex items-center">
                      {candidate.name}
                      {isWinner && <span className="text-xs bg-yellow-100 text-yellow-700 border border-yellow-200 px-2.5 py-1 rounded-full font-bold ml-3 flex items-center gap-1"><Award className="w-3.5 h-3.5"/> WINNER</span>}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">{candidate.party}</p>
                  </div>
                  <div className="text-right bg-white px-5 py-3 rounded-lg border border-slate-100 shadow-sm min-w-[100px]">
                    <p className="text-3xl font-black text-primary-600 leading-none mb-1">{candidate.totalVotes}</p>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Votes</p>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </motion.div>
    </div>
  );
};

export default VoterElectionResults;
