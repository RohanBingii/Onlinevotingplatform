import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../../api/axios';
import { Lock, Plus, Users, Award, AlertTriangle, ShieldCheck } from 'lucide-react';

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
        const resRes = await api.get(`/election/results/${id}`);
        setResults(resRes.data.results);
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
      toast.success('Election records verified securely');
    } catch (err) {
      toast.error('Election integrity check failed');
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

  if (loading) return <div className="text-center pt-20 animate-pulse text-white">Loading securely...</div>;
  if (!election) return <div className="text-center pt-20 text-red-400">Election not found</div>;

  return (
    <div className="py-8">
      <button onClick={() => navigate('/admin/dashboard')} className="text-slate-400 hover:text-white mb-6 flex items-center gap-2 transition-colors">
        &larr; Back to Dashboard
      </button>

      <div className="glass-card p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-primary-500/10 pointer-events-none">
          <Lock className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{election.title}</h1>
              <p className="text-slate-400 max-w-2xl">{election.description}</p>
            </div>
            <div className="text-right flex flex-col items-end gap-3">
              <span className={`px-4 py-2 rounded-full font-bold text-sm ${election.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}`}>
                {election.status.toUpperCase()}
              </span>
              <button 
                onClick={handleVerifyElection}
                disabled={verifying}
                className="text-xs flex items-center gap-1.5 bg-primary-500/20 hover:bg-primary-500/40 text-primary-100 border border-primary-500/50 px-3 py-2 rounded-lg transition-all"
              >
                {verifying ? <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-200"></div> : <ShieldCheck className="w-4 h-4" />}
                Verify Integrity
              </button>
            </div>
          </div>

          {integrityStatus && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`mb-6 p-4 rounded-xl border ${integrityStatus.integrity ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
              <div className="flex items-center gap-2 font-medium">
                <ShieldCheck className="w-5 h-5 flex-shrink-0" /> <span className="text-sm">{integrityStatus.message}</span>
              </div>
            </motion.div>
          )}

          {election.status === 'active' && (
            <button onClick={handleCloseElection} className="bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/50 px-6 py-3 rounded-xl transition-all font-medium flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> End Election & Decrypt Tally
            </button>
          )}
        </div>
      </div>

      {results ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Award className="w-6 h-6 text-yellow-400"/> Cryptographic Results</h2>
          <div className="h-80 w-full mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={results} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                <Bar dataKey="totalVotes" radius={[4, 4, 0, 0]}>
                  {results.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#6366f1', '#a855f7', '#ec4899', '#3b82f6'][index % 4]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      ) : (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Users className="w-6 h-6"/> Candidates</h2>
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
              <p className="text-slate-400 col-span-3">No candidates added yet.</p>
            ) : (
              candidates.map(c => (
                <div key={c.id} className="glass-card p-6 flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-full bg-primary-900 border border-primary-500 overflow-hidden flex-shrink-0">
                    {c.photoUrl ? <img src={c.photoUrl} alt={c.name} className="w-full h-full object-cover" /> : <Users className="w-8 h-8 m-4 text-primary-400" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{c.name}</h3>
                    <p className="text-sm text-primary-400 font-medium mb-1">{c.party}</p>
                    <p className="text-xs text-slate-400 line-clamp-2">{c.manifesto}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectionDetails;
