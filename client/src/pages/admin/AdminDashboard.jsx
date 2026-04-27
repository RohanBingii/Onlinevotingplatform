import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Calendar, Settings, Activity, ShieldCheck, Key, Copy, Download } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api/axios';

const AdminDashboard = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create Form State
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [createdShares, setCreatedShares] = useState(null);

  // Edit Form State
  const [editingElection, setEditingElection] = useState(null);
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');

  const openEditModal = (election) => {
    setEditingElection(election);
    // Convert UTC to local datetime string for input
    const toLocalString = (dateString) => {
      const d = new Date(dateString);
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0,16);
    };
    setEditStart(toLocalString(election.startTime));
    setEditEnd(toLocalString(election.endTime));
  };

  const handleUpdateTiming = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/election/${editingElection.id}/time`, { startTime: editStart, endTime: editEnd });
      toast.success('Election timing updated successfully');
      setEditingElection(null);
      fetchElections();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update timing');
    }
  };

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

  useEffect(() => {
    fetchElections();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/election/create', { title, description, startTime, endTime });
      toast.success('Election created successfully');
      setShowCreate(false);
      fetchElections();
      
      if (res.data.keyShares) {
        setCreatedShares(res.data.keyShares);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create election');
    }
  };

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
          <p className="text-slate-500">Manage elections and monitor system integrity</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/audit"
            className="glass-button-secondary flex items-center gap-2"
            title="View Audit Logs"
          >
            <ShieldCheck className="w-5 h-5 text-primary-400" /> Audit Logs
          </Link>
          <button 
            onClick={() => setShowCreate(!showCreate)}
            className="glass-button flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Create Election
          </button>
        </div>
      </div>

      {editingElection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm">
          <motion.form 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 w-full max-w-md border border-primary-500/30"
            onSubmit={handleUpdateTiming}
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Edit Election Timing</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Start Time</label>
                <input type="datetime-local" required value={editStart} onChange={e=>setEditStart(e.target.value)} className="glass-input w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">End Time</label>
                <input type="datetime-local" required value={editEnd} onChange={e=>setEditEnd(e.target.value)} className="glass-input w-full" />
              </div>
            </div>
            <div className="mt-8 flex gap-4">
              <button type="submit" className="glass-button flex-1">Save Changes</button>
              <button type="button" onClick={() => setEditingElection(null)} className="glass-button-secondary flex-1">Cancel</button>
            </div>
          </motion.form>
        </div>
      )}

      {showCreate && (
        <motion.form 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass-card p-6 mb-8"
          onSubmit={handleCreate}
        >
          <h2 className="text-xl font-bold text-slate-900 mb-4">New Election</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Title" required value={title} onChange={e=>setTitle(e.target.value)} className="glass-input" />
            <input type="text" placeholder="Description" required value={description} onChange={e=>setDescription(e.target.value)} className="glass-input" />
            <div>
              <label className="block text-sm text-slate-500 mb-1">Start Time</label>
              <input type="datetime-local" required value={startTime} onChange={e=>setStartTime(e.target.value)} className="glass-input w-full" />
            </div>
            <div>
              <label className="block text-sm text-slate-500 mb-1">End Time</label>
              <input type="datetime-local" required value={endTime} onChange={e=>setEndTime(e.target.value)} className="glass-input w-full" />
            </div>
          </div>
          <div className="mt-4 flex gap-4">
            <button type="submit" className="glass-button">Submit</button>
            <button type="button" onClick={() => setShowCreate(false)} className="glass-button-secondary">Cancel</button>
          </div>
        </motion.form>
      )}

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {elections.map((election, i) => (
            <motion.div 
              key={election.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 flex flex-col h-full hover:border-primary-500/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-slate-900">{election.title}</h3>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${election.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {election.status.toUpperCase()}
                </span>
              </div>
              <p className="text-slate-500 text-sm mb-6 flex-grow">{election.description}</p>
              
              <div className="space-y-2 mb-6 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary-400" />
                  <span>Start: {new Date(election.startTime).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-red-400" />
                  <span>End: {new Date(election.endTime).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-auto pt-2">
                <Link 
                  to={`/admin/election/${election.id}`}
                  className="flex-1 glass-button-secondary flex justify-center items-center gap-2"
                >
                  <Settings className="w-4 h-4" /> Manage
                </Link>
                {election.status === 'upcoming' && (
                  <button 
                    onClick={() => openEditModal(election)}
                    className="flex-1 glass-button-secondary flex justify-center items-center gap-2 text-primary-300 hover:text-primary-100"
                  >
                    <Calendar className="w-4 h-4" /> Edit Time
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {createdShares && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 w-full max-w-2xl border border-primary-500/50 bg-white"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                <Key className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Critical: Save Key Shares</h2>
            </div>
            
            <p className="text-slate-600 mb-6">
              This election is secured using Shamir's Secret Sharing. The private key has been split into 5 shares. 
              <strong> You MUST save these shares securely. At least 3 shares will be required to decrypt the election results. </strong> 
              The system does not store the private key, so if these are lost, the votes cannot be tallied!
            </p>

            <div className="space-y-3 mb-8 max-h-[300px] overflow-y-auto pr-2">
              {createdShares.map((share, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-4">
                  <div className="flex flex-col w-full overflow-hidden">
                    <span className="text-xs font-bold text-slate-500 mb-1">SHARE {idx + 1}</span>
                    <code className="text-sm text-slate-800 break-all w-full">{share}</code>
                  </div>
                  <button 
                    onClick={() => { navigator.clipboard.writeText(share); toast.success(`Share ${idx + 1} copied!`); }}
                    className="p-2 hover:bg-slate-200 rounded transition-colors flex-shrink-0"
                    title="Copy Share"
                  >
                    <Copy className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => {
                  const formattedShares = createdShares.map((s, i) => `Share ${i + 1}:\r\n${s}\r\n`).join('\r\n');
                  const blob = new Blob([formattedShares], { type: 'text/plain' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `election-keys-${new Date().getTime()}.txt`;
                  a.click();
                }}
                className="glass-button flex-1 flex justify-center items-center gap-2"
              >
                <Download className="w-5 h-5" /> Download All Shares
              </button>
              <button 
                onClick={() => setCreatedShares(null)} 
                className="glass-button-secondary flex-1"
              >
                I Have Saved Them Securely
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
