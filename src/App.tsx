import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Upload, 
  Activity, 
  Search, 
  Settings, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle2, 
  History as HistoryIcon, 
  Menu,
  X,
  FileVideo,
  FileImage,
  ExternalLink,
  Info,
  Server,
  Fingerprint,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from './lib/firebase';
import DetectionEngine from './components/DetectionEngine';
import HistoryView from './components/HistoryView';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import { CustomCursor, BackgroundCanvas, NeuralBrainCore } from './components/VisualEffects';
import { Lock } from 'lucide-react';

type View = 'dashboard' | 'detect' | 'history' | 'settings';

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const startDemo = () => {
    setIsDemoMode(true);
    setActiveView('detect');
  };

  // Reset demo when leaving detection view
  useEffect(() => {
    if (activeView !== 'detect') {
      setIsDemoMode(false);
    }
  }, [activeView]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'scans'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as any;
      setHistory(items);
    });

    return () => unsubscribe();
  }, [user]);

  const stats = {
    total: history.length,
    deepfakes: history.filter(h => h.verdict === 'MANIPULATED' || h.verdict === 'SUSPICIOUS').length,
    integrity: history.length > 0 ? (history.reduce((acc: number, h: any) => acc + (h.score || 0), 0) / history.length).toFixed(1) : '100'
  };

  if (loading) return (
    <div className="h-screen bg-[#030304] flex items-center justify-center">
       <CustomCursor />
       <BackgroundCanvas />
       <div className="flex flex-col items-center gap-6 relative z-10">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-16 h-16 bg-[#00D1FF]/20 border border-[#00D1FF]/40 rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(0,209,255,0.2)]"
          >
            <Shield size={48} className="text-[#00D1FF]" />
          </motion.div>
          <p className="text-[10px] font-mono font-black uppercase tracking-[0.6em] text-[#00D1FF]/60 italic animate-pulse">Initializing_Nodes...</p>
       </div>
    </div>
  );

  if (!user) return <LandingPage />;

  return (
    <div className="flex h-screen bg-[#030304] text-[#E0E0E0] font-sans selection:bg-[#00D1FF]/30 selection:text-white overflow-hidden">
      <CustomCursor />
      <BackgroundCanvas />
      
      {/* Background Noise/Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] select-none z-0">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150"></div>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#00D1FF 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }}></div>
      </div>

      {/* Sidebar */}
      <aside className={`relative z-10 bg-black/40 backdrop-blur-3xl border-r border-white/5 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isSidebarOpen ? 'w-80' : 'w-24'} py-10 flex flex-col`}>
        <div className="px-10 mb-20 flex items-center gap-5">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }} 
            transition={{ duration: 4, repeat: Infinity }}
            className="w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center flex-shrink-0 shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
          >
            <Shield className="w-8 h-8" />
          </motion.div>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <h1 className="text-2xl font-heading font-black tracking-tighter truncate uppercase italic leading-none">FakeXpose</h1>
              <span className="text-[9px] font-mono font-black text-[#00D1FF] tracking-[0.4em] uppercase opacity-70">Core_v3.0</span>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 px-5 space-y-4">
          <NavItem 
            icon={<BarChart3 size={22} />} 
            label="Command_Center" 
            isActive={activeView === 'dashboard'} 
            onClick={() => setActiveView('dashboard')}
            isOpen={isSidebarOpen}
          />
          <NavItem 
            icon={<Zap size={22} />} 
            label="Neural_Scan" 
            isActive={activeView === 'detect'} 
            onClick={() => setActiveView('detect')}
            isOpen={isSidebarOpen}
          />
          <NavItem 
            icon={<HistoryIcon size={22} />} 
            label="Forensic_Archive" 
            isActive={activeView === 'history'} 
            onClick={() => setActiveView('history')}
            isOpen={isSidebarOpen}
          />
          <NavItem 
            icon={<Fingerprint size={22} />} 
            label="Node_Settings" 
            isActive={activeView === 'settings'} 
            onClick={() => setActiveView('settings')}
            isOpen={isSidebarOpen}
          />
        </nav>

        <div className="mt-auto px-4 space-y-4">
          {isSidebarOpen && (
            <div className="p-6 glass rounded-[2rem] border-white/5">
               <div className="flex items-center gap-3 mb-3">
                 <Fingerprint size={16} className="text-[#00D1FF]" />
                 <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-white/40">Neural Sync Active</span>
               </div>
               <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                 <motion.div 
                   animate={{ width: ["0%", "85%", "75%"] }}
                   className="h-full bg-emerald-400 rounded-full shadow-[0_0_10px_#4ADE80]" 
                 />
               </div>
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center gap-4 p-4 text-white/30 hover:text-[#00D1FF] hover:bg-white/5 rounded-[1.5rem] transition-all group"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            {isSidebarOpen && <span className="text-[10px] font-mono font-bold tracking-widest uppercase">Collapse UI</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative z-10 custom-scrollbar">
        <header className="h-20 glass border-b border-white/5 px-10 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3 text-[10px] font-mono font-bold tracking-[0.2em] text-white/30 uppercase">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10B981]"></span>
              FAKEXPOSE_NODE_STABLE
            </div>
            <div className="hidden lg:flex items-center gap-6 text-[10px] font-mono text-white/20 uppercase tracking-[0.1em]">
               <span>LATENCY: 4ms</span>
               <span>ENGINE: G3_FLASH_PRO</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={logout}
              className="px-5 py-2 glass rounded-full flex items-center gap-3 hover:border-[#00D1FF]/40 transition-all group"
            >
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-[10px] font-bold text-[#00D1FF]">{user.displayName?.charAt(0) || 'U'}</span>
                )}
              </div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">Term_Session</span>
            </button>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto min-h-[calc(100vh-5rem)]">
          <AnimatePresence mode="wait">
            {activeView === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="space-y-12"
              >
                {/* Identity Thought Dashboard Header */}
                <div className="relative glass rounded-[4rem] p-16 overflow-hidden border-white/5 bg-gradient-to-br from-[#00D1FF]/5 to-transparent">
                  <div className="grid lg:grid-cols-2 gap-10 items-center relative z-10">
                    <div className="space-y-8 text-left">
                       <div className="inline-flex items-center gap-3 px-4 py-1.5 glass rounded-full border-white/5">
                          <Zap size={14} className="text-[#00D1FF]" />
                          <span className="text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-[#00D1FF]">Active_Forensic_Presence</span>
                       </div>
                       <h2 className="text-6xl md:text-7xl font-heading font-black tracking-tighter uppercase italic leading-[0.8] mix-blend-difference">
                        YOUR FACE <br/>
                        YOUR VOICE <br/>
                        <span className="text-[#00D1FF]">YOUR IDENTITY.</span>
                       </h2>
                       <p className="text-xl text-white/40 italic font-sans max-w-md">
                          Neural protection is active. Every byte of your digital existence is being shielded by FakeXpose Core v3.0.
                       </p>
                       <motion.button 
                         whileHover={{ scale: 1.05, x: 10 }}
                         whileTap={{ scale: 0.95 }}
                         onClick={startDemo}
                         className="flex items-center gap-4 px-8 py-4 bg-[#00FFEA] text-black font-heading font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-[0_20px_50px_rgba(0,255,234,0.2)]"
                       >
                          Launch_Demo_Session <ExternalLink size={16} />
                       </motion.button>
                    </div>
                    <div className="relative h-96">
                       <div className="absolute inset-0 bg-[#00D1FF]/20 blur-[100px] rounded-full animate-pulse z-0" />
                       <NeuralBrainCore className="scale-150 relative z-10" />
                    </div>
                  </div>
                  {/* Decorative Scan lines */}
                  <div className="scan-line opacity-10" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <StatCard label="Total Scans" value={stats.total.toLocaleString()} trend="+12.4%" icon={<Activity size={18} />} />
                  <StatCard label="Critical Risk" value={stats.deepfakes.toString()} trend="+2" trendColor="text-red-400" icon={<AlertTriangle size={18} />} />
                  <StatCard label="Hash Strength" value="99.9%" trend="SECURE" icon={<Shield size={18} />} />
                  <StatCard label="Average Integrity" value={`${stats.integrity}%`} trend="OPTIMIZED" icon={<Search size={18} />} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 glass rounded-[3rem] p-10 space-y-10">
                     <div className="flex items-center justify-between">
                       <h3 className="text-xl font-heading tracking-tighter uppercase italic flex items-center gap-3">
                         <HistoryIcon size={20} className="text-[#00D1FF]" /> Forensic_Live_Feed
                       </h3>
                       <button 
                        onClick={() => setActiveView('history')}
                        className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#00D1FF]/60 hover:text-[#00D1FF] transition-colors"
                       >
                         View_Archive
                       </button>
                     </div>

                     <div className="space-y-4">
                      {history.length > 0 ? (
                        history.slice(0, 5).map((item, i) => (
                          <motion.div 
                            key={item.id} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center justify-between p-5 glass rounded-[1.5rem] group hover:bg-white/[0.05] transition-all"
                          >
                            <div className="flex items-center gap-6">
                               <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-white/20 group-hover:text-[#00D1FF] transition-colors">
                                  {item.fileType?.startsWith('video') ? <FileVideo size={20} /> : <FileImage size={20} />}
                               </div>
                               <div>
                                  <p className="text-[13px] font-bold text-white/80 font-mono truncate max-w-[200px]">{item.fileName}</p>
                                  <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest">{new Date(item.createdAt?.toDate ? item.createdAt.toDate() : Date.now()).toLocaleTimeString()}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-8">
                               <div className="text-right">
                                  <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Integrity</p>
                                  <p className="font-mono font-bold text-sm">{item.score}%</p>
                               </div>
                               <RiskBadge risk={item.verdict === 'SECURE' ? 'Safe' : item.verdict === 'SUSPICIOUS' ? 'Suspicious' : 'Deepfake'} />
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="py-24 text-center space-y-6">
                           <div className="w-20 h-20 glass rounded-[2rem] flex items-center justify-center mx-auto text-white/5">
                              <Search size={40} />
                           </div>
                           <p className="text-[10px] font-mono font-bold tracking-[0.5em] text-white/10 uppercase">Waiting_For_Input</p>
                        </div>
                      )}
                     </div>
                  </div>

                  <div className="lg:col-span-4 space-y-8">
                     <div className="glass rounded-[3rem] p-10 flex flex-col h-full bg-gradient-to-br from-[#00D1FF]/5 to-transparent">
                        <h4 className="text-xl font-heading tracking-tighter uppercase italic mb-8">Neural_Status</h4>
                        
                        <div className="space-y-10 flex-1">
                           <ProjectMeter label="Pattern Sync" progress={98} color="bg-[#00D1FF]" />
                           <ProjectMeter label="Edge Hash" progress={92} color="bg-purple-500" />
                           <ProjectMeter label="Metadata Auth" progress={85} color="bg-emerald-400" />
                        </div>

                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setActiveView('detect')}
                          className="mt-12 w-full py-5 bg-white text-black font-heading text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-[#00D1FF] hover:text-white transition-all shadow-xl flex items-center justify-center gap-4"
                        >
                          Execute_Scan <Zap size={16} />
                        </motion.button>
                     </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === 'detect' && <DetectionEngine isDemoMode={isDemoMode} />}
            {activeView === 'history' && <HistoryView />}
            {activeView === 'settings' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl mx-auto py-32 text-center"
              >
                <div className="glass rounded-[4rem] p-20 space-y-10">
                   <div className="w-20 h-20 bg-[#00D1FF]/10 text-[#00D1FF] rounded-[2rem] flex items-center justify-center mx-auto border border-[#00D1FF]/20 shadow-[0_0_30px_rgba(0,209,255,0.1)]">
                      <Lock size={40} />
                   </div>
                   <div className="space-y-4">
                      <h3 className="text-3xl font-heading tracking-tighter uppercase italic">Security Node</h3>
                      <p className="text-white/40 italic font-sans">Configuration restricted to high-clearance administrators. Neutral system state confirmed.</p>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function NavItem({ icon, label, isActive, onClick, isOpen }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void, isOpen: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-5 rounded-3xl transition-all group relative overflow-hidden ${
        isActive 
          ? 'bg-white text-black shadow-2xl scale-[1.02]' 
          : 'text-white/40 hover:text-white hover:bg-white/5'
      }`}
    >
      <div className={`transition-transform duration-500 relative z-10 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
      {isOpen && (
        <span className={`text-xs font-heading font-bold uppercase tracking-widest transition-all duration-300 relative z-10 ${isActive ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}>
          {label}
        </span>
      )}
    </button>
  );
}

function StatCard({ label, value, trend, icon, trendColor = 'text-emerald-400' }: { label: string, value: string, trend: string, icon: React.ReactNode, trendColor?: string }) {
  return (
    <div className="glass rounded-[2rem] p-8 space-y-4 group hover:bg-white/[0.05] transition-all relative overflow-hidden border border-white/5">
      <div className="flex justify-between items-start">
         <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-white/30 group-hover:text-[#00D1FF] transition-all duration-500 shadow-inner">{icon}</div>
         <div className={`px-3 py-1 rounded-full bg-white/5 text-[10px] font-mono font-bold tracking-widest ${trendColor} uppercase shadow-sm`}>{trend}</div>
      </div>
      <div>
        <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white/30 mb-1">{label}</p>
        <h4 className="text-4xl font-heading font-extrabold tracking-tighter uppercase leading-none text-white/90">{value}</h4>
      </div>
      <div className="absolute -bottom-2 -right-2 opacity-5 scale-150 rotate-12 transition-transform group-hover:scale-110 duration-700">
         {icon}
      </div>
    </div>
  );
}

function ProjectMeter({ label, progress, color }: { label: string, progress: number, color: string }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
         <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/40">{label}</span>
         <span className="text-[9px] font-mono text-white/20">{progress}% ACCURACY</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
         <motion.div 
           initial={{ width: 0 }}
           animate={{ width: `${progress}%` }}
           transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
           className={`h-full ${color} rounded-full`}
         />
      </div>
    </div>
  );
}

function RiskBadge({ risk }: { risk: 'Safe' | 'Suspicious' | 'Deepfake' }) {
  const colors = {
    'Safe': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    'Suspicious': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    'Deepfake': 'text-red-400 bg-red-400/10 border-red-400/20'
  }
  return (
    <div className={`px-4 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-widest border ${colors[risk]}`}>
       {risk}
    </div>
  );
}

