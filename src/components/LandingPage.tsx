import React, { useEffect, useState } from 'react';
import { 
  Shield, 
  Zap, 
  Search, 
  BarChart3, 
  ChevronRight, 
  Clock, 
  Fingerprint,
  CheckCircle2,
  Globe,
  Award,
  Lock,
  Cpu,
  Eye,
  Terminal,
  Activity
} from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Card3D, BackgroundCanvas, Orb, CustomCursor, WorldMap, FacialOverlay, AIFaceModel3D } from './VisualEffects';

export default function LandingPage() {
  const { signIn } = useAuth();
  const { scrollYProgress } = useScroll();
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="min-h-screen bg-[#030304] text-white selection:bg-[#00D1FF]/30 selection:text-white font-sans overflow-x-hidden">
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[200] bg-[#030304] flex items-center justify-center overflow-hidden"
          >
            <BackgroundCanvas />
            <div className="relative z-10 text-center space-y-24">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="w-96 h-96 mx-auto"
              >
                <AIFaceModel3D />
              </motion.div>
              
              <div className="space-y-4">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 1 }}
                >
                  <h1 className="text-4xl md:text-7xl font-heading font-black tracking-[0.2em] italic uppercase leading-none">
                    YOUR <span className="text-[#00D1FF]">FACE</span>
                  </h1>
                </motion.div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1, duration: 1 }}
                >
                  <h1 className="text-4xl md:text-7xl font-heading font-black tracking-[0.2em] italic uppercase leading-none">
                    YOUR <span className="text-[#00FFEA]">VOICE</span>
                  </h1>
                </motion.div>
                <motion.div
                  initial={{ y: 40, opacity: 0, scale: 0.9 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ delay: 1.5, duration: 1.5, ease: "circOut" }}
                >
                  <h1 className="text-5xl md:text-9xl font-heading font-black tracking-tighter uppercase italic leading-none pt-8">
                    YOUR <span className="text-white shadow-[0_0_50px_rgba(255,255,255,0.3)] px-4">IDENTITY</span>
                  </h1>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3 }}
                className="flex items-center justify-center gap-4 text-[10px] font-mono font-black tracking-[0.4em] text-[#00D1FF] uppercase italic"
              >
                <div className="w-12 h-px bg-[#00D1FF]/30" />
                Initializing_Forensic_Core
                <div className="w-12 h-px bg-[#00D1FF]/30" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CustomCursor />
      <BackgroundCanvas />
      
      {/* Global Digital World Map Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30 flex items-center justify-center">
         <WorldMap className="w-[150%] h-[150%] absolute -rotate-12 translate-x-20" />
      </div>

      {/* Floating Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <Orb className="-top-20 -left-20 bg-blue-600/10" />
        <Orb className="top-1/4 -right-20 bg-cyan-600/10" />
        <Orb className="-bottom-20 right-1/4 bg-blue-400/10" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-28 z-[100] bg-black/40 backdrop-blur-3xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-10 h-full flex items-center justify-between">
          <div className="flex items-center gap-5 group cursor-pointer">
             <motion.div 
               animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }} 
               transition={{ duration: 4, repeat: Infinity }}
               className="w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center shadow-[0_20px_40px_rgba(255,255,255,0.15)]"
             >
                <Shield className="w-8 h-8" />
             </motion.div>
             <div className="flex flex-col">
               <span className="text-2xl font-heading font-black tracking-tighter uppercase italic leading-none">FakeXpose</span>
               <span className="text-[10px] font-mono font-black text-[#00D1FF] tracking-[0.4em] uppercase opacity-70">Core_v3.0</span>
             </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-14">
             <NavLink label="Command_Center" />
             <NavLink label="Neural_Node" />
             <NavLink label="Log_History" />
          </div>

          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={signIn}
            className="px-10 py-4 bg-[#00FFEA] text-black font-heading font-black rounded-2xl text-[11px] uppercase tracking-[0.2em] hover:bg-white transition-all shadow-[0_20px_40px_rgba(0,255,234,0.3)]"
          >
            Access_Node
          </motion.button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-56 pb-32 px-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-4 px-5 py-2 glass rounded-2xl"
            >
               <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_15px_#4ADE80]"></span>
               <span className="text-[10px] font-mono font-black tracking-[0.4em] uppercase text-emerald-400/90">Authentication_Node_Live</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ fontFamily: 'Times New Roman', fontWeight: 'bold', fontStyle: 'italic', color: '#f1f2f9', borderColor: '#e41010' }}
              className="text-8xl lg:text-[10rem] tracking-tighter leading-[0.75] uppercase italic"
            >
              CLONE <br />
              <span className="text-outline text-transparent group hover:text-white transition-all duration-1000">PROOF</span> <br />
              MODAL
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{ fontFamily: 'monospace', fontWeight: 'normal', fontStyle: 'italic' }}
              className="text-2xl text-white/40 max-w-lg leading-snug italic"
            >
              The world's leading neural defense system against visual clones and voice deepfakes. Simple. Powerful. Secure.
            </motion.p>

            <div className="flex flex-wrap items-center gap-8 pt-6">
              <motion.button 
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={signIn}
                style={{ fontFamily: 'Georgia', fontSize: '20px', lineHeight: '10px', fontStyle: 'normal' }}
                className="bg-white text-black px-14 py-6 rounded-[2.5rem] uppercase tracking-[0.3em] shadow-[0_30px_60px_rgba(255,255,255,0.1)] flex items-center gap-4 transition-all"
              >
                Initalize Scan <ChevronRight size={20} />
              </motion.button>
              
              <div className="flex flex-col gap-2">
                 <div className="flex -space-x-4">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-12 h-12 rounded-2xl border-4 border-[#030304] bg-white/5 flex items-center justify-center backdrop-blur-md">
                         <Terminal size={18} className="text-[#00D1FF]/50" />
                      </div>
                    ))}
                 </div>
                 <span style={{ fontSize: '14px' }} className="font-mono font-black tracking-widest text-white/20 uppercase">Trusted by 24k+ Forensic Labs</span>
              </div>
            </div>
          </div>

          <div className="relative group min-h-[600px] flex items-center justify-center">
             <div className="absolute inset-0 bg-[#00D1FF]/10 blur-[150px] rounded-full animate-pulse z-0"></div>
             
             {/* 3D AI Face Model Container */}
             <div className="absolute inset-x-0 h-full z-10 hidden lg:block pointer-events-none">
                <AIFaceModel3D className="scale-125" />
             </div>

             <Card3D className="group relative z-20 scale-90 lg:scale-100">
                <div className="relative glass rounded-[5rem] p-2 shadow-2xl overflow-hidden aspect-square border-white/10 group-hover:border-[#00D1FF]/30 transition-colors duration-700">
                <div className="scan-line" />
                <div className="h-full p-16 flex flex-col justify-between border border-dashed border-white/10 rounded-[4.8rem] relative z-10">
                   <div className="flex justify-between items-start">
                      <div className="space-y-6">
                         <div className="w-16 h-16 bg-white/[0.03] rounded-3xl flex items-center justify-center border border-white/5 shadow-inner">
                            <Cpu className="text-[#00D1FF] animate-pulse" size={32} />
                         </div>
                         <div className="font-heading space-y-1">
                            <p className="text-[10px] text-[#00D1FF] font-mono uppercase tracking-[0.4em]">Hardware_Sync</p>
                            <p className="text-3xl font-black italic tracking-tighter uppercase">FX_UNIT_01</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="text-white text-5xl font-black tracking-tighter italic">99.9<span className="text-[#00D1FF]">%</span></div>
                         <div className="text-[10px] text-white/20 font-mono uppercase tracking-widest mt-2">Dectection_Certainty</div>
                      </div>
                   </div>

                   <div className="space-y-10">
                      <div className="grid grid-cols-2 gap-6">
                         <StatBox label="Sample Vectors" val="2.8M" color="text-[#00D1FF]" />
                         <StatBox label="False Positives" val="<0.01%" color="text-emerald-400" />
                      </div>
                      <div className="h-1 w-full bg-white/5 relative overflow-hidden rounded-full">
                         <motion.div 
                           animate={{ x: ["-100%", "200%"] }} 
                           transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                           className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-[#00D1FF] to-transparent shadow-[0_0_20px_#00D1FF]"
                         />
                      </div>
                   </div>
                </div>
                {/* Embedded World Map Shadow */}
                <WorldMap className="absolute inset-0 opacity-[0.03] scale-110 pointer-events-none" />
             </div>
          </Card3D>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="py-20 bg-white/[0.01] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <Counter label="Active Scans" target={423400} prefix="+" />
          <Counter label="Neural Nodes" target={8120} prefix="" />
          <Counter label="Fakes Caught" target={124900} prefix="+" />
          <Counter label="Threats Refused" target={99.9} suffix="%" decimals={1} />
        </div>
      </section>

      {/* Neural Pipeline (Process Flow) */}
      <section className="py-56 px-10 relative overflow-hidden bg-white/[0.01]">
         <div className="max-w-7xl mx-auto space-y-32">
            <div className="text-center space-y-8">
               <h2 className="text-[12px] font-mono font-black tracking-[0.6em] text-[#00D1FF] uppercase italic">System_Logic</h2>
               <h3 style={{ fontFamily: 'system-ui' }} className="text-8xl font-black tracking-tighter uppercase italic leading-none">Neural_Pipeline</h3>
               <p className="text-2xl text-white/40 font-sans italic max-w-2xl mx-auto leading-relaxed">
                  A four-stage forensic deconstruction of digital assets to identify neural inconsistencies.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
               <div className="absolute top-1/2 left-0 right-0 h-px bg-white/5 -translate-y-1/2 hidden md:block"></div>
               
               <PipelineStep 
                  num="01" 
                  title="Asset_Ingestion" 
                  desc="Media is cryptographically hashed and buffered into the forensic node."
                  icon={<Terminal size={24} />}
               />
               <PipelineStep 
                  num="02" 
                  title="Mesh_Analysis" 
                  desc="42K landmarks are mapped to detect facial drift and spectral spectral timbre."
                  icon={<Fingerprint size={24} />}
               />
               <PipelineStep 
                  num="03" 
                  title="Gemini_Audit" 
                  desc="G3 Flash models perform high-speed synthesis verification across all modalities."
                  icon={<Zap size={24} />}
               />
               <PipelineStep 
                  num="04" 
                  title="Secure_Verdict" 
                  desc="Final forensic report is generated with human-readable neural insights."
                  icon={<Shield size={24} />}
               />
            </div>
         </div>
      </section>

      {/* System Architecture */}
      <section className="py-56 px-10 relative bg-black/50">
         <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
            <div className="space-y-12">
               <div className="space-y-8">
                  <h2 className="text-[12px] font-mono font-black tracking-[0.6em] text-[#00FFEA] uppercase italic">Stack_Composition</h2>
                  <h3 className="text-6xl font-heading font-black tracking-tighter uppercase italic leading-[0.9]">Distributed_Forensic <br/><span className="text-[#00FFEA]">Architecture</span></h3>
               </div>
               
               <div className="space-y-10">
                  <ArchitectureItem label="Intelligent Core" tech="Google Gemini 3 Flash" desc="Sub-second AI inference for multi-modal clone detection." />
                  <ArchitectureItem label="Forensic Persistence" tech="Firebase Firestore" desc="Immutable ledger for scan history and biometric metadata." />
                  <ArchitectureItem label="Neural Interface" tech="Vite + React 18" desc="Ultra-high performance UI with 3D hardware acceleration." />
                  <ArchitectureItem label="Audit Compliance" tech="PDF Forge" desc="Cryptographically signed PDF reports for chain of custody." />
               </div>
            </div>

            <div className="relative aspect-square">
               <div className="absolute inset-0 bg-blue-500/10 blur-[150px] animate-pulse"></div>
               <div className="absolute inset-0 z-0 opacity-40">
                  <AIFaceModel3D className="scale-75" />
               </div>
               <Card3D>
                  <div className="relative h-full glass rounded-[5rem] p-16 flex flex-col items-center justify-center border-white/5 shadow-3xl min-h-[600px] overflow-hidden">
                     {/* Visual Architecture Representation */}
                     <div className="relative h-full w-full flex flex-col items-center justify-between py-12">
                        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="w-24 h-24 glass rounded-[2rem] flex items-center justify-center text-[#00FFEA] border-[#00FFEA]/20">
                           <Zap size={44} />
                        </motion.div>
                        
                        <div className="flex gap-16 relative w-full justify-center">
                           <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10 -translate-y-1/2 z-0"></div>
                           <motion.div animate={{ x: [-10, 10, -10] }} transition={{ duration: 6, repeat: Infinity }} className="w-20 h-20 glass rounded-2xl flex items-center justify-center text-white/20 z-10 bg-black/80">
                              <BarChart3 size={32} />
                           </motion.div>
                           <motion.div animate={{ x: [10, -10, 10] }} transition={{ duration: 6, repeat: Infinity }} className="w-20 h-20 glass rounded-2xl flex items-center justify-center text-white/20 z-10 bg-black/80">
                              <Shield size={32} />
                           </motion.div>
                        </div>

                        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="w-24 h-24 glass rounded-[2rem] flex items-center justify-center text-[#00D1FF] border-[#00D1FF]/20">
                           <Activity size={44} />
                        </motion.div>

                        <WorldMap className="absolute inset-0 opacity-[0.05] scale-125 pointer-events-none" />
                     </div>
                  </div>
               </Card3D>
            </div>
         </div>
      </section>

      {/* Biometric Analysis Section */}
      <section className="py-56 relative overflow-hidden">
         <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12 order-2 lg:order-1">
               <div className="inline-flex items-center gap-4 px-5 py-2 glass rounded-[2rem] border-white/5">
                  <Fingerprint size={18} className="text-[#00FFEA]" />
                  <span className="text-[11px] font-mono font-black tracking-[0.5em] uppercase text-white/40 italic">Biometric_Forensics_Probe</span>
               </div>
               <h2 className="text-8xl font-heading font-black tracking-tighter uppercase italic leading-[0.85]">Facial_Mapping_ <br/><span className="text-[#00FFEA]">Neural_Contours</span></h2>
               <p className="text-2xl text-white/40 font-sans italic max-w-xl leading-relaxed">
                  Our neural matrix reconstructs complex facial geometry using 42,000+ individual landmarks, detecting microscopic muscle drifts that synthetic models fail to reproduce.
               </p>
               <div className="grid grid-cols-2 gap-12">
                  <div className="space-y-3">
                     <span className="text-5xl font-heading font-black italic text-white shadow-sm">42K+</span>
                     <p className="text-[11px] font-mono font-black text-white/20 uppercase tracking-[0.3em]">Active_Landmarks</p>
                  </div>
                  <div className="space-y-3">
                     <span className="text-5xl font-heading font-black italic text-[#00FFEA]">0.4ms</span>
                     <p className="text-[11px] font-mono font-black text-white/20 uppercase tracking-[0.3em]">Inference_Delay</p>
                  </div>
               </div>
            </div>

            <div className="relative order-1 lg:order-2 group">
               <div className="absolute inset-0 bg-[#00FFEA]/10 blur-[150px] rounded-full pointer-events-none group-hover:bg-[#00FFEA]/20 transition-all duration-1000"></div>
               <Card3D>
                  <div className="relative glass aspect-square rounded-[4.5rem] overflow-hidden border border-white/10 group-hover:border-[#00FFEA]/30 transition-all duration-700 shadow-2xl">
                     <img 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1000" 
                      alt="AI Biometric Scan" 
                      className="w-full h-full object-cover opacity-40 grayscale group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100"
                      referrerPolicy="no-referrer"
                     />
                     <FacialOverlay className="opacity-100 scale-125" />
                     <div className="absolute inset-x-0 bottom-0 p-12 bg-gradient-to-t from-black via-black/80 to-transparent">
                        <div className="flex items-center justify-between">
                           <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_#4ADE80]" />
                                 <span className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-[0.4em] italic">Probe_Lock: SECURE</span>
                              </div>
                              <div className="h-2 w-64 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                 <motion.div animate={{ width: ["0%", "100%", "98%"] }} className="h-full bg-emerald-400" transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} />
                              </div>
                           </div>
                           <Shield className="text-white/10 group-hover:text-[#00FFEA]/40 transition-colors" size={44} />
                        </div>
                     </div>
                     <div className="scan-line" />
                  </div>
               </Card3D>
            </div>
         </div>
      </section>

      {/* Features Grid */}
      <section className="py-56 px-10 relative overflow-hidden bg-white/[0.01]">
         <div className="max-w-7xl mx-auto space-y-32">
            <div className="max-w-2xl space-y-6">
               <h2 className="text-[12px] font-mono font-black tracking-[0.5em] text-[#00FFEA] uppercase italic">Neural_Matrix</h2>
               <h3 className="text-7xl font-heading font-black tracking-tighter leading-[0.85] uppercase italic">Defense <br /> Paradigms</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
               <FeatureCard 
                icon={<Eye size={28} />} 
                title="Symmetry_Audit" 
                desc="Deeply analyzes bilateral symmetry inconsistencies and facial landmark drifts in real-time."
                className="md:col-span-2"
               />
               <FeatureCard 
                icon={<Activity size={28} />} 
                title="Voice_Clone_Probe" 
                desc="Detects synthetic timbre and robotic cadence in audio clones."
               />
               <FeatureCard 
                icon={<Lock size={28} />} 
                title="Immutable_Auth" 
                desc="Quantum-resistant hashing for verified original media signatures."
               />
               <FeatureCard 
                icon={<Globe size={28} />} 
                title="Global_Radar" 
                desc="Distributed verification nodes tracking threat vectors globally."
                className="md:col-span-2"
               />
            </div>
         </div>
      </section>

      {/* Dashboard Preview Section (3D Layout) */}
      <section className="py-56 px-10 bg-black/50 overflow-hidden relative">
        <div className="max-w-7xl mx-auto text-center mb-32 space-y-8 relative z-10">
           <h2 className="text-[12px] font-mono font-black tracking-[0.6em] text-[#00D1FF] uppercase italic">Forensic_Pulse</h2>
           <h3 className="text-8xl font-heading font-black tracking-tighter uppercase italic leading-none">Universal_Shield</h3>
        </div>

        <div className="relative max-w-5xl mx-auto">
          <Card3D className="group">
             <div className="glass rounded-[3rem] p-1 shadow-2xl border-white/10 rotate-y-3 relative overflow-hidden">
                <div className="flex h-[500px]">
                   {/* Sidebar Preview */}
                   <div className="w-64 border-r border-white/5 p-8 flex flex-col gap-6 bg-white/[0.01]">
                      <div className="w-10 h-10 bg-[#00D1FF]/10 rounded-xl flex items-center justify-center text-[#00D1FF]">
                        <Shield size={20} />
                      </div>
                      <div className="space-y-4">
                        {[1,2,3,4].map(i => (
                          <div key={i} className={`h-4 w-full bg-white/${i===1 ? '10' : '5'} rounded-full`} />
                        ))}
                      </div>
                   </div>
                   {/* Main Content Preview */}
                   <div className="flex-1 p-10 space-y-10 overflow-hidden">
                      <div className="flex justify-between items-center">
                         <div className="h-4 w-32 bg-white/10 rounded-full" />
                         <div className="flex gap-2">
                           <Pill label="All" active />
                           <Pill label="Suspicious" />
                           <Pill label="Secure" />
                         </div>
                      </div>
                      <div className="space-y-2">
                        {Array.from({ length: 15 }).map((_, i) => (
                           <motion.div 
                             key={i}
                             initial={{ opacity: 0, x: 20 }}
                             whileInView={{ opacity: 1, x: 0 }}
                             transition={{ delay: (i % 5) * 0.1 }}
                             className="h-12 w-full glass rounded-xl flex items-center px-6 justify-between group/row hover:bg-white/[0.05] transition-colors"
                           >
                              <div className="flex items-center gap-4">
                                 <div className="w-3 h-3 rounded-full bg-white/10" />
                                 <div className="h-2 w-44 bg-white/10 rounded-full" />
                              </div>
                              <RiskBadge risk={i % 3 === 0 ? 'Deepfake' : i % 3 === 1 ? 'Safe' : 'Suspicious'} />
                           </motion.div>
                        ))}
                      </div>
                   </div>
                </div>
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black via-transparent to-transparent"></div>
             </div>
          </Card3D>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-56 px-10 relative">
         <div className="max-w-5xl mx-auto glass rounded-[5rem] p-32 text-center space-y-16 relative overflow-hidden shadow-2xl border-white/5">
            <div className="absolute top-0 right-0 p-16 opacity-5 rotate-12 scale-150">
               <Shield size={400} />
            </div>
            
            <h3 className="text-8xl font-heading font-black tracking-tighter uppercase relative z-10 leading-[0.8] italic">Deploy_Universal <br /> Neural_Defense</h3>
            <p className="text-2xl text-white/40 italic max-w-xl mx-auto relative z-10 font-sans leading-relaxed">Initialize your own forensic node in less than 60 seconds. Free for individual researchers.</p>
            
            <motion.button 
              whileHover={{ scale: 1.05, y: -10 }}
              whileTap={{ scale: 0.95 }}
              onClick={signIn}
              className="bg-white text-black px-20 py-8 rounded-[3rem] font-heading font-black text-sm uppercase tracking-[0.4em] relative z-10 hover:bg-[#00FFEA] transition-all shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
            >
              Get_Started_Now
            </motion.button>

            <WorldMap className="absolute inset-0 opacity-[0.02] scale-150" />
         </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-8 border-t border-white/5 font-mono">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                  <Shield size={16} className="text-[#00D1FF]" />
               </div>
               <span className="text-xs font-bold uppercase tracking-widest text-white/60 font-sans italic">FakeXpose Core</span>
            </div>
            <div className="flex gap-10 text-[10px] text-white/30 uppercase tracking-[0.2em]">
               <a href="#" className="hover:text-[#00D1FF] transition-colors">Privacy</a>
               <a href="#" className="hover:text-[#00D1FF] transition-colors">Forensics</a>
               <a href="#" className="hover:text-[#00D1FF] transition-colors">Docs</a>
               <a href="#" className="hover:text-[#00D1FF] transition-colors">Github</a>
            </div>
            <p className="text-[10px] text-white/20 uppercase tracking-[0.2em]">FAKEXPOSE_CORE_V3.0 // ALL_SYSTEMS_GO</p>
         </div>
      </footer>
    </div>
  );
}

function NavLink({ label }: { label: string }) {
  return (
    <a href="#" className="text-[11px] font-mono font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors relative group">
       {label}
       <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00D1FF] group-hover:w-full transition-all duration-300"></span>
    </a>
  );
}

function FeatureCard({ icon, title, desc, className = "" }: { icon: React.ReactNode, title: string, desc: string, className?: string }) {
  return (
    <Card3D className={className}>
      <div className="h-full glass rounded-[4rem] p-12 space-y-8 hover:bg-white/[0.05] transition-all border border-white/5 shadow-2xl relative overflow-hidden group">
         <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-[#00FFEA] shadow-inner group-hover:scale-110 transition-transform duration-500">
            {icon}
         </div>
         <div className="space-y-4">
            <h4 className="text-3xl font-heading font-black tracking-tighter uppercase italic text-white/90 leading-none">{title}</h4>
            <p className="text-white/40 text-base leading-relaxed italic font-sans">{desc}</p>
         </div>
         <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
            {icon}
         </div>
      </div>
    </Card3D>
  );
}

function StatBox({ label, val, color }: { label: string, val: string, color: string }) {
  return (
    <div className="bg-white/[0.02] p-6 rounded-[2rem] border border-white/5 space-y-2 shadow-inner">
       <p style={{ fontFamily: 'Courier New' }} className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{label}</p>
       <p style={{ fontFamily: 'Verdana' }} className={`text-2xl font-black italic tracking-tighter ${color} uppercase`}>{val}</p>
    </div>
  );
}

function Pill({ label, active = false }: { label: string, active?: boolean }) {
  return (
    <div className={`px-4 py-1.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest border transition-all cursor-pointer ${
      active ? 'bg-white text-black border-white' : 'border-white/10 text-white/30 hover:border-white/30 hover:text-white'
    }`}>
      {label}
    </div>
  );
}

function RiskBadge({ risk }: { risk: 'Safe' | 'Suspicious' | 'Deepfake' }) {
  const colors = {
    'Safe': 'bg-emerald-400/20 text-emerald-400 border-emerald-400/30',
    'Suspicious': 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30',
    'Deepfake': 'bg-red-400/20 text-red-400 border-red-400/30'
  }
  return (
    <div className={`px-3 py-1 rounded-lg text-[8px] font-mono font-bold uppercase tracking-widest border shadow-lg ${colors[risk]}`}>
       {risk}
    </div>
  );
}

function Counter({ label, target, prefix = "", suffix = "", decimals = 0 }: { label: string, target: number, prefix?: string, suffix?: string, decimals?: number }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    const duration = 2000;
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(progress * target);
      
      if (progress < 1) requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  }, [target]);

  return (
    <div className="space-y-2">
       <h4 className="text-5xl font-heading font-black tracking-tighter italic uppercase text-white/90">
         {prefix}{count.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
       </h4>
       <div className="h-0.5 w-12 bg-[#00D1FF]/20 mx-auto rounded-full" />
       <p className="text-[10px] font-mono font-black text-white/20 uppercase tracking-widest leading-none pt-2">{label}</p>
    </div>
  );
}

function PipelineStep({ num, title, desc, icon }: { num: string, title: string, desc: string, icon: React.ReactNode }) {
  return (
    <div className="relative space-y-8 group">
       <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center text-white/30 group-hover:text-[#00D1FF] group-hover:border-[#00D1FF]/30 transition-all duration-500 border border-white/5 relative z-10 bg-black">
          {icon}
          <div className="absolute -top-3 -right-3 text-[10px] font-mono font-black text-[#00D1FF] bg-black border border-white/10 w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
             {num}
          </div>
       </div>
       <div className="space-y-4">
          <h4 className="text-xl font-heading font-black tracking-tighter uppercase italic group-hover:text-[#00D1FF] transition-colors">{title}</h4>
          <p className="text-[13px] text-white/30 font-sans leading-relaxed italic">{desc}</p>
       </div>
    </div>
  );
}

function ArchitectureItem({ label, tech, desc }: { label: string, tech: string, desc: string }) {
  return (
    <div className="flex gap-8 group">
       <div className="w-1.5 h-1.5 bg-[#00FFEA] rounded-full mt-2 group-hover:scale-150 transition-transform shadow-[0_0_10px_#00FFEA]" />
       <div className="space-y-2">
          <div className="flex items-center gap-4">
             <span className="text-[10px] font-mono font-black text-white/20 uppercase tracking-widest">{label}</span>
             <span className="text-[11px] font-mono font-black text-[#00FFEA] uppercase tracking-widest italic">{tech}</span>
          </div>
          <p className="text-sm text-white/40 font-sans italic leading-relaxed">{desc}</p>
       </div>
    </div>
  );
}
