import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api/axios';

const AuditLogs = () => {
  const [loading, setLoading] = useState(false);
  const [integrityStatus, setIntegrityStatus] = useState(null);

  const checkIntegrity = async () => {
    setLoading(true);
    setIntegrityStatus(null);
    try {
      // Add artificial delay for aesthetic scan effect
      await new Promise(resolve => setTimeout(resolve, 1500));
      const res = await api.get('/audit/verify');
      setIntegrityStatus(res.data);
      toast.success('Integrity scan complete');
    } catch (err) {
      toast.error('Tampering detected or failed to verify logs');
      setIntegrityStatus({
        integrity: false,
        message: err.response?.data?.message || 'Verification Failed'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 max-w-4xl mx-auto">
      <div className="mb-12 text-center">
        <div className="w-24 h-24 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-400 border border-primary-500/30">
          <ShieldCheck className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Blockchain Integrity Scanner</h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Manually verify the cryptographic hash chain of all votes and actions. This ensures that no data has been retroactively altered or deleted by malicious actors.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center">
        <button 
          onClick={checkIntegrity}
          disabled={loading}
          className="glass-button text-xl px-12 py-5 flex items-center gap-3 disabled:opacity-50 disabled:cursor-wait hover:scale-105 mb-12 shadow-[0_0_30px_rgba(170,59,255,0.4)]"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              Scanning Blocks...
            </>
          ) : (
            <>
              <ArrowRight className="w-6 h-6" />
              Run Cryptographic Scan
            </>
          )}
        </button>

        {loading && (
           <div className="w-full max-w-lg h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary-500 to-blue-500"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "linear" }}
              />
           </div>
        )}

        {integrityStatus && !loading && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`glass-card p-10 text-center w-full shadow-xl ${integrityStatus.integrity ? 'border-green-500/30' : 'border-red-500/30'}`}>
            <h2 className="text-3xl font-bold text-white mb-6">Scan Results</h2>
            <div className={`inline-flex items-center gap-3 px-8 py-4 rounded-full font-medium text-xl border ${integrityStatus.integrity ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
               {integrityStatus.integrity ? <ShieldCheck className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6 rotate-180" />}
               {integrityStatus.message}
            </div>
            <p className="text-slate-400 mt-6 text-base max-w-lg mx-auto">
               {integrityStatus.integrity 
                 ? 'The audit log chain is completely intact. No tampering detected. Every vote and administrative action has been cryptographically secured and cryptographically linked to the previous transaction.' 
                 : 'WARNING: The cryptographic chain is broken. This indicates manual database tampering or synchronization failure.'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
