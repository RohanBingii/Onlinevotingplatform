import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
// Recharts removed for simpler UI
import api from '../../api/axios';
import { Lock, Plus, Users, Award, AlertTriangle, ShieldCheck, Key } from 'lucide-react';

const ElectionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  // Integrity state
  const [integrityStatus, setIntegrityStatus] = useState(null);
  const [verifying, setVerifying] = useState(false);

  // Decryption state
  const [showDecryptModal, setShowDecryptModal] = useState(false);
  const [sharesInput, setSharesInput] = useState(['', '', '']);
  const [decrypting, setDecrypting] = useState(false);

  // New Candidate state
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [newCandidate, setNewCandidate] = useState({ name: '', party: '', manifesto: '', photoUrl: '' });

  const fetchData = async () => {
    try {
      const elRes = await api.get(`/election/${id}`);
      setElection(elRes.data.election);
      
      const canRes = await api.get(`/candidates/election/${id}`);
      setCandidates(canRes.data.candidates);

      if (elRes.data.election.status === 'closed') {
        // Results are no longer fetched automatically
      }
    } catch (err) {
      toast.error('Failed to load election details');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyElection = async () => {
    setVerifying(true);
    setIntegrityStatus(null);
    try {
      await new Promise(res => setTimeout(res, 1200));
      const res = await api.get(`/audit/election/${id}/verify`);
      setIntegrityStatus(res.data);
      if (res.data.integrity) {
        toast.success('Election records verified securely');
      } else {
        toast.error('Integrity breach detected! Records may have been tampered with.');
      }
    } catch (err) {
      toast.error('Could not reach integrity service. Please try again.');
      setIntegrityStatus({
        integrity: false,
        message: err.response?.data?.message || 'Verification Failed'
      });
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleCloseElection = async () => {
    if(!window.confirm('Are you sure you want to close this election? This cannot be undone.')) return;
    try {
      await api.post(`/election/close/${id}`);
      toast.success('Election closed securely');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to close election');
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/candidates', { ...newCandidate, electionId: id });
      toast.success('Candidate added');
      setShowAddCandidate(false);
      setNewCandidate({ name: '', party: '', manifesto: '', photoUrl: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add candidate');
    }
  };

  const handleDecrypt = async (e) => {
    e.preventDefault();
    const filledShares = sharesInput.filter(s => s.trim() !== '');
    if (filledShares.length < 3) {
      toast.error('At least 3 shares are required.');
      return;
    }
    setDecrypting(true);
    try {
      const res = await api.post(`/election/results/${id}`, { shares: filledShares });
      setResults(res.data.results);
      setShowDecryptModal(false);
      toast.success('Results decrypted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to decrypt results');
    } finally {
      setDecrypting(false);
    }
  };

  if (loading) return <div className="text-center pt-20 animate-pulse text-slate-900">Loading securely...</div>;
  if (!election) return <div className="text-center pt-20 text-red-400">Election not found</div>;

  return (
    <div className="py-8">
      <button onClick={() => navigate('/admin/dashboard')} className="text-slate-500 hover:text-slate-900 mb-6 flex items-center gap-2 transition-colors">
        &larr; Back to Dashboard
      </button>

      <div className="glass-card p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-primary-500/10 pointer-events-none">
          <Lock className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">{election.title}</h1>
              <p className="text-slate-500 max-w-2xl">{election.description}</p>
            </div>
            <div className="text-right flex flex-col items-end gap-3">
              <span className={`px-4 py-2 rounded-full font-bold text-sm ${election.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {election.status.toUpperCase()}
              </span>
              <button 
                onClick={handleVerifyElection}
                disabled={verifying}
                className="text-sm font-medium flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white shadow-sm px-4 py-2 rounded-lg transition-all"
              >
                {verifying ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <ShieldCheck className="w-4 h-4" />}
                Verify Integrity
              </button>
            </div>
          </div>

          {integrityStatus && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`mb-6 p-4 rounded-xl border ${integrityStatus.integrity ? 'bg-green-500/10 border-green-500/30 text-green-700' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
              <div className="flex items-center gap-2 font-medium">
                <ShieldCheck className="w-5 h-5 flex-shrink-0" /> <span className="text-sm">{integrityStatus.message}</span>
              </div>
            </motion.div>
          )}

          {election.status === 'active' && (
            <button onClick={handleCloseElection} className="bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/50 px-6 py-3 rounded-xl transition-all font-medium flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> End Election
            </button>
          )}

          {election.status === 'closed' && !results && (
            <button onClick={() => setShowDecryptModal(true)} className="bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/30 px-6 py-3 rounded-xl transition-all font-medium flex items-center gap-2 mt-4">
              <Key className="w-5 h-5" /> Input Key Shares to Decrypt Tally
            </button>
          )}
        </div>
      </div>

      {results ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2"><Award className="w-6 h-6 text-yellow-400"/> Cryptographic Results</h2>
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
      ) : (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Users className="w-6 h-6"/> Candidates</h2>
            <button onClick={() => setShowAddCandidate(!showAddCandidate)} className="glass-button flex items-center gap-2 text-sm px-4 py-2">
              <Plus className="w-4 h-4" /> Add Candidate
            </button>
          </div>

          {showAddCandidate && (
            <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-card p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleAddCandidate}>
              <input type="text" placeholder="Candidate Name" required value={newCandidate.name} onChange={e=>setNewCandidate({...newCandidate, name: e.target.value})} className="glass-input" />
              <input type="text" placeholder="Party / Affiliation" required value={newCandidate.party} onChange={e=>setNewCandidate({...newCandidate, party: e.target.value})} className="glass-input" />
              <input type="url" placeholder="Photo URL (Optional)" value={newCandidate.photoUrl} onChange={e=>setNewCandidate({...newCandidate, photoUrl: e.target.value})} className="glass-input" />
              <textarea placeholder="Manifesto / Bio" required value={newCandidate.manifesto} onChange={e=>setNewCandidate({...newCandidate, manifesto: e.target.value})} className="glass-input col-span-1 md:col-span-2" rows="3"></textarea>
              <div className="col-span-1 md:col-span-2">
                <button type="submit" className="glass-button">Save Candidate</button>
              </div>
            </motion.form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.length === 0 ? (
              <p className="text-slate-500 col-span-3">No candidates added yet.</p>
            ) : (
              candidates.map(c => (
                <div key={c.id} className="glass-card p-6 flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-full bg-primary-900 border border-primary-500 overflow-hidden flex-shrink-0">
                    {c.photoUrl ? <img src={c.photoUrl} alt={c.name} className="w-full h-full object-cover" /> : <Users className="w-8 h-8 m-4 text-primary-400" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{c.name}</h3>
                    <p className="text-sm text-primary-400 font-medium mb-1">{c.party}</p>
                    <p className="text-xs text-slate-500 line-clamp-2">{c.manifesto}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {showDecryptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <motion.form 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 w-full max-w-lg border border-primary-500/50 bg-white"
            onSubmit={handleDecrypt}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary-100 text-primary-600 rounded-xl">
                <Key className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Decrypt Results</h2>
            </div>
            
            <p className="text-slate-600 mb-6">
              Please provide at least 3 cryptographic key shares to reconstruct the private key and decrypt the election tally.
            </p>

            <div className="space-y-4 mb-8">
              {[0, 1, 2].map((idx) => (
                <div key={idx}>
                  <label className="block text-sm font-bold text-slate-500 mb-1">Share {idx + 1}</label>
                  <input 
                    type="text" 
                    required 
                    className="glass-input w-full font-mono text-xs p-3" 
                    placeholder={`Paste Share ${idx + 1}...`}
                    value={sharesInput[idx]}
                    onChange={(e) => {
                      const newShares = [...sharesInput];
                      newShares[idx] = e.target.value;
                      setSharesInput(newShares);
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button 
                type="submit"
                disabled={decrypting}
                className="glass-button flex-1 flex justify-center items-center gap-2 bg-primary-600 text-white disabled:opacity-50"
              >
                {decrypting ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Key className="w-5 h-5" />} 
                {decrypting ? 'Decrypting...' : 'Decrypt Tally'}
              </button>
              <button 
                type="button"
                onClick={() => setShowDecryptModal(false)} 
                className="glass-button-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        </div>
      )}
    </div>
  );
};

export default ElectionDetails;
