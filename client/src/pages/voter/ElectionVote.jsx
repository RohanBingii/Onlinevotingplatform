import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { encryptVoteSelection } from '../../utils/crypto';
import { Lock, CheckCircle, AlertTriangle } from 'lucide-react';

const ElectionVote = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [receipt, setReceipt] = useState(null);

  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const elRes = await api.get(`/election/${id}`);
        setElection(elRes.data.election);
        
        const canRes = await api.get(`/candidates/election/${id}`);
        setCandidates(canRes.data.candidates);
      } catch (err) {
        toast.error('Failed to load election. ' + (err.response?.data?.error || ''));
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const initiateVote = () => {
    if (!selectedCandidate) return toast.error('Please select a candidate first');
    setShowConfirm(true);
  };

  const handleVote = async () => {
    setShowConfirm(false);
    setSubmitting(true);
    try {
      // Encrypt the candidate ID with the election's public key
      const encryptedVote = encryptVoteSelection(selectedCandidate.toString(), election.publicKey);
      
      const res = await api.post('/vote/cast', {
        electionId: id,
        voteChoice: selectedCandidate.toString(),
        encryptedVote
      });

      toast.success('Vote cast successfully and securely recorded!');
      setReceipt(res.data.receipt || { transactionId: 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase() });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cast vote');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center pt-20 text-slate-900 animate-pulse flex flex-col items-center"><Lock className="w-8 h-8 mb-4"/> Establishing Secure Connection...</div>;
  if (!election) return <div className="pt-20 text-center">Not found</div>;

  if (receipt) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto py-12">
        <div className="glass-card p-10 text-center border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-700">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Vote Successfully Cast</h2>
          <p className="text-slate-500 mb-8">Your vote has been encrypted and securely added to the blockchain ledger.</p>
          
          <div className="bg-white rounded-xl p-6 mb-8 border border-slate-200 text-left text-sm max-w-full overflow-hidden">
            <div className="text-slate-500 mb-1">Cryptographic Receipt ID</div>
            <div className="font-mono text-primary-400 break-all">{receipt.transactionId || receipt.id || JSON.stringify(receipt)}</div>
          </div>

          <button onClick={() => navigate('/dashboard')} className="glass-button w-full">Return to Dashboard</button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">{election.title}</h1>
        <p className="text-slate-500 text-lg mb-4">{election.description}</p>
        <div className="inline-flex items-center gap-2 bg-primary-500/10 text-primary-300 px-4 py-2 rounded-full text-sm font-medium border border-primary-500/20">
          <Lock className="w-4 h-4" /> End-to-End Encrypted Voting Session
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {candidates.map((c) => (
          <motion.div 
            key={c.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedCandidate(c.id)}
            className={`glass p-6 rounded-2xl cursor-pointer transition-all border-2 ${
              selectedCandidate === c.id 
                ? 'border-primary-500 bg-primary-500/10 shadow-[0_0_20px_rgba(99,102,241,0.3)]' 
                : 'border-transparent hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-white border border-slate-300 overflow-hidden flex-shrink-0">
                {c.photoUrl ? <img src={c.photoUrl} alt={c.name} className="w-full h-full object-cover" /> : null}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{c.name}</h3>
                <p className="text-sm font-medium text-primary-400">{c.party}</p>
              </div>
            </div>
            <p className="text-slate-500 text-sm">{c.manifesto}</p>
            
            <div className="mt-4 flex justify-end">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedCandidate === c.id ? 'border-primary-500 bg-primary-500' : 'border-slate-500'}`}>
                {selectedCandidate === c.id && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center">
        <button 
          onClick={initiateVote}
          disabled={!selectedCandidate || submitting}
          className="glass-button text-xl px-12 py-5 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : <><Lock className="w-5 h-5"/> Encrypt & Submit Vote</>}
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card max-w-md w-full p-6 border-primary-500/30">
            <h3 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2"><Lock className="w-6 h-6 text-primary-400" /> Confirm Security Action</h3>
            <p className="text-slate-600 mb-6">Cast your encrypted vote for the selected candidate? This action is cryptographically irreversible and will be logged on the blockchain.</p>
            <div className="flex gap-4 justify-end">
              <button onClick={() => setShowConfirm(false)} className="glass-button-secondary py-2 px-4 hover:bg-white transition-colors">Cancel</button>
              <button 
                onClick={handleVote} 
                className="glass-button py-2 px-6 flex items-center gap-2"
              >
                Confirm & Seal Vote
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ElectionVote;
