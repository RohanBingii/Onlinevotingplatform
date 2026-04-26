import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Search, RefreshCw, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api/axios';

const ACTION_COLORS = {
  VOTE_CAST:       'bg-blue-500/20 text-blue-400 border-blue-500/30',
  LOGIN:           'bg-green-100 text-green-700 border-green-500/30',
  LOGOUT:          'bg-slate-100 text-slate-500 border-slate-200',
  ELECTION_CREATED:'bg-purple-500/20 text-purple-400 border-purple-500/30',
  ELECTION_UPDATED:'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

const ActionBadge = ({ action }) => {
  const cls = ACTION_COLORS[action] || 'bg-slate-100 text-slate-600 border-slate-200';
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {action}
    </span>
  );
};

const truncate = (str, n = 16) => str ? `${str.slice(0, n)}…` : '—';

const AuditLogs = () => {
  const [logs, setLogs]               = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [filter, setFilter]           = useState('');
  const [scanLoading, setScanLoading] = useState(false);
  const [integrityStatus, setIntegrityStatus] = useState(null);

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await api.get('/audit/logs?limit=200');
      setLogs(res.data.logs);
    } catch (err) {
      toast.error('Failed to load audit logs');
    } finally {
      setLogsLoading(false);
    }
  };

  const runScan = async () => {
    setScanLoading(true);
    setIntegrityStatus(null);
    try {
      await new Promise(r => setTimeout(r, 1200));
      const res = await api.get('/audit/verify');
      setIntegrityStatus(res.data);
      toast.success('Integrity scan complete');
    } catch (err) {
      const status = { integrity: false, message: err.response?.data?.message || 'Verification Failed' };
      setIntegrityStatus(status);
      toast.error('Tampering detected or verification failed');
    } finally {
      setScanLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const filtered = logs.filter(l =>
    !filter || l.action?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="py-10 max-w-6xl mx-auto space-y-10">

      {/* ── Header ── */}
      <div className="text-center">
        <div className="w-20 h-20 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-400 border border-primary-500/30">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Audit Log Centre</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Live cryptographic audit trail of every action in the system.
          Run the integrity scanner to verify the hash chain has not been tampered with.
        </p>
      </div>

      {/* ── Integrity Scanner ── */}
      <div className="glass-card p-8 flex flex-col items-center gap-6">
        <button
          onClick={runScan}
          disabled={scanLoading}
          className="glass-button text-lg px-10 py-4 flex items-center gap-3 disabled:opacity-50 disabled:cursor-wait hover:scale-105 shadow-[0_0_30px_rgba(170,59,255,0.3)]"
        >
          {scanLoading ? (
            <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />Scanning…</>
          ) : (
            <><ArrowRight className="w-5 h-5" />Run Cryptographic Scan</>
          )}
        </button>

        {scanLoading && (
          <div className="w-full max-w-md h-1.5 bg-white rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-500 to-blue-500"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.2, ease: 'linear' }}
            />
          </div>
        )}

        {integrityStatus && !scanLoading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-3 px-6 py-3 rounded-full border font-medium text-lg
              ${integrityStatus.integrity
                ? 'bg-green-100 text-green-700 border-green-500/30'
                : 'bg-red-500/20 text-red-400 border-red-500/30'}`}
          >
            {integrityStatus.integrity
              ? <ShieldCheck className="w-5 h-5" />
              : <ShieldAlert className="w-5 h-5" />}
            {integrityStatus.message}
          </motion.div>
        )}
      </div>

      {/* ── Log Table ── */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <h2 className="text-xl font-semibold text-slate-900">
            Audit Entries
            <span className="ml-2 text-sm font-normal text-slate-500">({filtered.length} shown)</span>
          </h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Filter by action…"
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-sm placeholder-slate-500 focus:outline-none focus:border-primary-500/50"
              />
            </div>
            <button
              onClick={fetchLogs}
              disabled={logsLoading}
              title="Refresh"
              className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-primary-500/50 transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`w-4 h-4 ${logsLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {logsLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-400" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-slate-500 py-16">No audit log entries found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-slate-500 border-b border-slate-200 text-xs uppercase tracking-wider">
                  <th className="pb-3 pr-4">#</th>
                  <th className="pb-3 pr-4">Action</th>
                  <th className="pb-3 pr-4">User ID</th>
                  <th className="pb-3 pr-4">Metadata</th>
                  <th className="pb-3 pr-4">Timestamp</th>
                  <th className="pb-3 pr-4">Prev Hash</th>
                  <th className="pb-3">Current Hash</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, i) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.015 }}
                    className="border-b border-slate-200 hover:bg-white transition-colors"
                  >
                    <td className="py-3 pr-4 text-slate-500 font-mono">{log.id}</td>
                    <td className="py-3 pr-4"><ActionBadge action={log.action} /></td>
                    <td className="py-3 pr-4 text-slate-600 font-mono">{log.userId ?? '—'}</td>
                    <td className="py-3 pr-4 text-slate-500 font-mono text-xs max-w-[160px] truncate" title={JSON.stringify(log.metadata)}>
                      {log.metadata ? JSON.stringify(log.metadata) : '—'}
                    </td>
                    <td className="py-3 pr-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 text-slate-500 font-mono text-xs" title={log.previousHash}>
                      {log.previousHash === 'GENESIS'
                        ? <span className="text-yellow-400">GENESIS</span>
                        : truncate(log.previousHash)}
                    </td>
                    <td className="py-3 text-slate-500 font-mono text-xs" title={log.currentHash}>
                      {truncate(log.currentHash)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
