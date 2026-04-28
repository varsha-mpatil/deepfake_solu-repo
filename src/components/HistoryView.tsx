import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, FileVideo, FileImage, Shield, AlertTriangle, CheckCircle2, Trash2, ExternalLink, Search, Activity, Clock, Fingerprint } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc, orderBy, writeBatch, getDocs } from 'firebase/firestore';
import { Card3D } from './VisualEffects';

interface HistoryItem {
  id: string;
  docId: string;
  fileName: string;
  fileType: string;
  verdict: 'SECURE' | 'SUSPICIOUS' | 'MANIPULATED';
  score: number;
  createdAt: any;
}

export default function HistoryView() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'SECURE' | 'SUSPICIOUS' | 'MANIPULATED'>('ALL');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'scans'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(d => ({
        ...d.data(),
        docId: d.id
      })) as any;
      setHistory(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const clearHistory = async () => {
    if (confirm("Execute total wipe of forensic archive? This cannot be undone.")) {
      if (!user) return;
      const q = query(collection(db, 'scans'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  };

  const deleteItem = async (id: string) => {
    await deleteDoc(doc(db, 'scans', id));
  };

  const filteredHistory = history.filter(item => filter === 'ALL' || item.verdict === filter);

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 glass rounded-2xl border-white/5">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_#4ADE80]"></span>
            <span className="text-[10px] font-mono font-black tracking-[0.4em] uppercase text-emerald-400/80">Archival_Sync: Active</span>
          </div>
          <h2 className="text-6xl font-heading font-black tracking-tighter uppercase italic leading-none">Forensic_Archive</h2>
          <p className="text-xl text-white/40 font-sans italic max-w-lg leading-relaxed">A permanent cryptographic ledger of neural signature verifications across global digital nodes.</p>
        </div>
        
        <div className="flex items-center gap-6">
           {history.length > 0 && (
             <button 
               onClick={clearHistory}
               className="px-8 py-3.5 glass rounded-[2rem] text-[11px] font-heading font-black text-red-400 hover:text-white hover:bg-red-500/20 transition-all uppercase tracking-widest border border-red-500/20 shadow-2xl"
             >
               Purge_Logs
             </button>
           )}
        </div>
      </div>

      <div className="space-y-12">
        {/* Filters */}
        <div className="flex flex-wrap gap-5 bg-white/[0.02] p-2 rounded-[3.5rem] border border-white/5 w-fit">
           <FilterPill label="All_Nodes" active={filter === 'ALL'} onClick={() => setFilter('ALL')} />
           <FilterPill label="Secure" active={filter === 'SECURE'} onClick={() => setFilter('SECURE')} />
           <FilterPill label="Suspicious" active={filter === 'SUSPICIOUS'} onClick={() => setFilter('SUSPICIOUS')} />
           <FilterPill label="Manipulated" active={filter === 'MANIPULATED'} onClick={() => setFilter('MANIPULATED')} />
        </div>

        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="text-center py-44 glass rounded-[3rem] border-dashed border-white/5">
               <Shield className="animate-pulse mx-auto text-white/10" size={64} />
            </div>
          ) : filteredHistory.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-44 glass rounded-[3rem] border border-dashed border-white/10 space-y-8"
            >
              <div className="w-24 h-24 glass rounded-[2.5rem] flex items-center justify-center mx-auto text-white/5">
                 <Search size={48} />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-heading tracking-tighter uppercase italic opacity-20">No_Forensic_Records</p>
                <p className="text-[10px] font-mono text-white/10 uppercase tracking-widest">Awaiting system input...</p>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredHistory.map((item, i) => (
                <HistoryRow key={item.docId} item={item} index={i} onDelete={() => deleteItem(item.docId)} />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function HistoryRow({ item, index, onDelete, ...props }: any) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: (index % 10) * 0.05 }}
      className="glass rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 hover:bg-white/[0.05] transition-all group border-white/5 shadow-xl relative overflow-hidden"
    >
      <div className="flex flex-1 items-center gap-10 w-full relative z-10">
         <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center text-white/30 group-hover:text-[#00D1FF] transition-all duration-500 relative border border-white/5 shadow-inner bg-white/[0.01]">
            {item.fileType?.startsWith('video') ? <FileVideo size={28} /> : <FileImage size={28} />}
            <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-black animate-pulse" />
         </div>
         <div className="min-w-0 space-y-2">
            <h4 className="text-xl font-heading font-black tracking-tight truncate max-w-[200px] md:max-w-md group-hover:text-white transition-colors uppercase italic">{item.fileName}</h4>
            <div className="flex flex-wrap items-center gap-6 text-[10px] font-mono font-black tracking-widest text-white/20 uppercase">
               <span className="flex items-center gap-2 italic bg-white/[0.03] px-3 py-1 rounded-full"><Clock size={14} className="text-[#00D1FF]/50" /> {new Date(item.createdAt?.toDate ? item.createdAt.toDate() : Date.now()).toLocaleString()}</span>
               <span className="flex items-center gap-2 italic bg-white/[0.03] px-3 py-1 rounded-full"><Fingerprint size={14} className="text-[#00D1FF]/50" /> UID_{item.docId.slice(0, 8)}</span>
            </div>
         </div>
      </div>

      <div className="flex items-center gap-12 w-full md:w-auto justify-between md:justify-end relative z-10">
         <div className="text-right space-y-1">
            <p className="text-[10px] font-mono font-black text-white/20 uppercase tracking-widest">Integrity_Index</p>
            <p className="text-3xl font-heading font-black tracking-tighter italic text-[#00D1FF]">{item.score}%</p>
         </div>
         
         <div className="flex items-center gap-6">
            <RiskBadge risk={item.verdict === 'SECURE' ? 'Safe' : item.verdict === 'SUSPICIOUS' ? 'Suspicious' : 'Deepfake'} />
            <button 
              onClick={onDelete}
              className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-all border border-white/5 shadow-lg group/trash"
            >
               <Trash2 size={20} className="group-hover/trash:scale-110 transition-transform" />
            </button>
         </div>
      </div>
    </motion.div>
  );
}

function FilterPill({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`px-8 py-3 rounded-[2.5rem] text-[11px] font-heading font-black uppercase tracking-[0.2em] transition-all cursor-pointer ${
        active 
          ? 'bg-white text-black shadow-[0_20px_40px_rgba(255,255,255,0.15)] scale-[1.05]' 
          : 'text-white/40 hover:text-white hover:bg-white/5'
      }`}
    >
      {label}
    </button>
  );
}

function RiskBadge({ risk }: { risk: 'Safe' | 'Suspicious' | 'Deepfake' }) {
  const colors = {
    'Safe': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    'Suspicious': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    'Deepfake': 'text-red-400 bg-red-400/10 border-red-400/20'
  }
  return (
    <div className={`px-5 py-2 rounded-xl text-[9px] font-mono font-bold uppercase tracking-widest border shadow-lg ${colors[risk]}`}>
       {risk}
    </div>
  );
}
