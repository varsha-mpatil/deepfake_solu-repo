import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Shield, AlertTriangle, CheckCircle2, Loader2, FileText, Download, Search, Activity, Fingerprint, Zap, BarChart3, Info, Globe, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeMedia } from '../services/ai';
import { useAuth } from '../context/AuthContext';
import { AIFaceModel3D, Card3D, WorldMap, FacialOverlay } from './VisualEffects';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface WebScanResult {
  matchCount: number;
  isIllegallyUsed: boolean;
  summary: string;
  sources: { title: string; url: string }[];
}

interface Artifact {
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'blending' | 'blinking' | 'mesh' | 'skin' | 'other';
}

interface AnalysisResult {
  score: number;
  verdict: 'SECURE' | 'SUSPICIOUS' | 'MANIPULATED';
  confidence: number;
  findings: string[];
  simpleExplanation: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  rawResponse: string;
  webScan: WebScanResult;
  artifacts: Artifact[];
}

function ManipulationOverlay({ artifacts }: { artifacts: Artifact[] }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {artifacts.map((art, i) => (
          <g key={i}>
            <motion.rect
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ opacity: 1, pathLength: 1 }}
              transition={{ delay: i * 0.2, duration: 1 }}
              x={art.x}
              y={art.y}
              width={art.width}
              height={art.height}
              fill="none"
              stroke={art.type === 'blending' ? '#FF3D00' : art.type === 'blinking' ? '#00E676' : '#FFFF00'}
              strokeWidth="0.5"
              strokeDasharray="2 1"
            />
            <motion.foreignObject
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 + 0.5 }}
              x={art.x}
              y={art.y - 4}
              width="50"
              height="4"
            >
              <div className="bg-black/80 backdrop-blur-sm border border-white/10 rounded px-1.5 py-0.5 flex items-center gap-1.5 w-max">
                <div className={`w-1 h-1 rounded-full ${art.type === 'blending' ? 'bg-red-500' : 'bg-[#00FFEA]'}`} />
                <span className="text-[5px] font-mono font-black text-white uppercase tracking-widest">{art.label}</span>
              </div>
            </motion.foreignObject>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function DetectionEngine({ isDemoMode = false }: { isDemoMode?: boolean }) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Demo Mode Automated Sequence
  React.useEffect(() => {
    if (isDemoMode) {
      const runDemo = async () => {
        setIsAnalyzing(true);
        setPreviewUrl("https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop");
        
        // Phase 1: Probe Initalization
        await new Promise(r => setTimeout(r, 2000));
        
        // Phase 2: Neural Mapping
        const demoResult: AnalysisResult = {
          score: 14.5,
          verdict: 'MANIPULATED',
          confidence: 99.8,
          findings: [
            "Microscopic pixel drift detected in ocular region",
            "Spectral inconsistency in facial mesh alignment",
            "Sub-surface scattering variance outside biological limits",
            "Digital shadow distortion at node boundary"
          ],
          simpleExplanation: "This asset contains high-probability synthetic markers. Our neural probe detected structural mesh drifting and irregular ocular frame-blending, confirming this is a sophisticated neural-synthesis clone.",
          riskLevel: 'Critical',
          rawResponse: "DEMO_NODE_RAW_DATA",
          webScan: {
            matchCount: 1420,
            isIllegallyUsed: true,
            summary: "Unauthorized duplicates detected across darknet repositories.",
            sources: []
          },
          artifacts: [
            { label: "Mesh_Drift", x: 45, y: 35, width: 10, height: 10, type: 'mesh' },
            { label: "Ocular_Blending", x: 42, y: 38, width: 16, height: 5, type: 'blending' },
            { label: "Dermal_Noise", x: 40, y: 50, width: 20, height: 15, type: 'skin' }
          ]
        };

        await new Promise(r => setTimeout(r, 3000));
        setResult(demoResult);
        setIsAnalyzing(false);

        // Phase 3: Auto-scroll
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 800);
      };
      runDemo();
    }
  }, [isDemoMode]);

  const generatePDF = async () => {
    if (!resultRef.current || !result) return;
    
    try {
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: '#030304',
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (clonedDoc) => {
          // 0. Aggressively sanitize the entire document styles to remove oklab/oklch
          // Some browsers return the raw CSS string which html2canvas tries to parse
          const styleTags = clonedDoc.getElementsByTagName('style');
          for (let i = 0; i < styleTags.length; i++) {
            const tag = styleTags[i];
            if (tag.innerHTML.includes('okl') || tag.innerHTML.includes('lab') || tag.innerHTML.includes('lch')) {
              // Replace oklch/oklab patterns with a safe fallback color (white/transparency)
              // This is a regex-based hammer to prevent the parser from ever seeing the keywords
              tag.innerHTML = tag.innerHTML.replace(/oklch\([^)]+\)/g, '#ffffff')
                                          .replace(/oklab\([^)]+\)/g, '#ffffff')
                                          .replace(/color-mix\([^)]+\)/g, 'currentColor');
            }
          }

          // 1. Hide decorative elements and download button
          const decorative = clonedDoc.querySelectorAll('.pointer-events-none, .scan-line, [class*="opacity-[0.03]"], #download-btn-container');
          decorative.forEach(el => (el as HTMLElement).style.display = 'none');
          
          // 2. Remove glass and backdrop-blur effects - these often cause rendering issues
          const glassElements = clonedDoc.querySelectorAll('.glass, .backdrop-blur-xl');
          glassElements.forEach(el => {
            (el as HTMLElement).style.backdropFilter = 'none';
            (el as HTMLElement).style.backgroundColor = '#1a1a1c';
            (el as HTMLElement).style.borderColor = '#333333';
          });

          // 3. Ensure the cloned container has a solid background
          const reportElement = clonedDoc.getElementById('neural-signature-report');
          if (reportElement) {
            reportElement.style.background = '#030304';
            reportElement.style.borderRadius = '0';
            reportElement.style.padding = '40px';
            
            // 4. More aggressive CSS sanitization
            const allElements = reportElement.querySelectorAll('*');
            allElements.forEach(el => {
              const element = el as HTMLElement;
              
              // We need to check BOTH computed style AND inline style
              // Also check for specific variable names that Tailwind 4 uses
              const style = window.getComputedStyle(element);
              
              const isProblematic = (val: string) => 
                val && (val.includes('okl') || val.includes('mix') || val.includes('lab') || val.includes('lch'));

              // Fix text color
              if (isProblematic(style.color)) element.style.setProperty('color', '#ffffff', 'important');
              
              // Fix backgrounds
              if (isProblematic(style.backgroundColor)) {
                element.style.setProperty('background-color', 'transparent', 'important');
              }
              
              // Check specifically for gradients/images which might have oklab
              if (isProblematic(style.backgroundImage)) {
                element.style.setProperty('background-image', 'none', 'important');
              }

              // Fix borders
              if (isProblematic(style.borderColor)) {
                element.style.setProperty('border-color', '#333333', 'important');
              }

              // Fix box-shadow (EXTREMELY common source of oklab in modern Tailwind)
              if (isProblematic(style.boxShadow)) {
                element.style.setProperty('box-shadow', 'none', 'important');
              }

              // Fix SVG attributes
              if (element instanceof SVGElement) {
                if (isProblematic(style.fill)) element.style.setProperty('fill', 'currentColor', 'important');
                if (isProblematic(style.stroke)) element.style.setProperty('stroke', 'currentColor', 'important');
              }
            });

            // 5. Inject a global style override into the cloned document to catch any lingering variables
            const style = clonedDoc.createElement('style');
            style.innerHTML = `
              * { 
                --tw-ring-color: #3b82f6 !important;
                --tw-ring-offset-color: #000 !important;
                --tw-ring-shadow: none !important;
                --tw-shadow: none !important;
                box-shadow: none !important;
              }
            `;
            clonedDoc.head.appendChild(style);
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height] 
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      pdf.save(`FakeXpose_Forensic_Report_${timestamp}.pdf`);
    } catch (err: any) {
      console.error("PDF Export failed:", err);
      // Fallback for specific oklab/oklch issues
      if (err.message?.includes('oklab') || err.message?.includes('oklch')) {
        setError("Forensic Export Sync Conflict: The browser's color engine is currently incompatible with high-fidelity PDF output. Please try refreshing or using a different browser.");
      } else {
        setError("Failed to generate PDF report. Please try again.");
      }
    }
  };

  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    const maxSize = 25 * 1024 * 1024; // 25MB
    // Common deepfake-relevant mime types
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/webp', 
      'video/mp4', 'video/quicktime', 'video/x-matroska',
      'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/ogg'
    ];
    
    if (file.size > maxSize) {
      return "File size exceeds 25.0MB limit. Neural nodes cannot process assets of this magnitude.";
    }
    
    if (!allowedTypes.some(type => file.type.includes(type.split('/')[0]) && file.type !== '')) {
      // More relaxed check as long as it starts with image/, video/ or audio/
      if (!['image/', 'video/', 'audio/'].some(prefix => file.type.startsWith(prefix))) {
        return `Unsupported Forensic Type: ${file.type || 'Unknown'}. Please utilize standard JPG, PNG, MP4, or WAV assets.`;
      }
    }
    
    return null;
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const validationError = validateFile(droppedFile);
      if (validationError) {
        setError(validationError);
        return;
      }
      setFile(droppedFile);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validationError = validateFile(selectedFile);
      if (validationError) {
        setError(validationError);
        return;
      }
      setFile(selectedFile);
    }
  };

  const startAnalysis = async () => {
    if (!file || !user) return;
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    setError(null);

    try {
      const response = await analyzeMedia(file, file.type);
      
      const parsed: AnalysisResult = {
        ...response,
        rawResponse: JSON.stringify(response)
      };

      setResult(parsed);
      
      const scanId = `scan_${Date.now()}`;
      await setDoc(doc(db, 'scans', scanId), {
        id: scanId,
        userId: user.uid,
        fileName: file.name,
        fileType: file.type,
        verdict: parsed.verdict,
        score: parsed.score,
        confidence: parsed.confidence,
        riskLevel: parsed.riskLevel,
        findings: parsed.findings,
        createdAt: serverTimestamp()
      });

    } catch (err: any) {
      console.error("Forensic Error:", err);
      let errorMessage = "An unexpected error occurred during forensic reconstruction.";
      
      if (err.message?.includes("API Key")) {
        errorMessage = "AI Engine Offline: Missing or invalid API credentials.";
      } else if (err.message?.includes("429") || err.message?.toLowerCase().includes("quota")) {
        errorMessage = "Neural Overload: System usage limit exceeded. Please wait 60 seconds.";
      } else if (err.message?.includes("400") || err.message?.toLowerCase().includes("format")) {
        errorMessage = "Corrupt Data: The AI model could not parse this specific media encoding.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 relative">
      {isDemoMode && (
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-24 z-[100] bg-orange-500 text-black p-4 rounded-3xl flex items-center justify-between shadow-[0_20px_50px_rgba(249,115,22,0.3)] mb-8"
        >
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-black/10 rounded-2xl flex items-center justify-center">
                <Activity size={20} />
             </div>
             <div>
                <p className="text-[10px] font-mono font-black uppercase tracking-[0.2em] leading-none mb-1">Automated_Neural_Session</p>
                <p className="text-sm font-heading font-black uppercase italic leading-none">De-Authenticated Demo Mode Active</p>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="px-4 py-2 border border-black/20 rounded-xl text-[9px] font-mono font-bold uppercase tracking-widest animate-pulse">Running_Diagnostics...</div>
          </div>
        </motion.div>
      )}
      {/* Global World Map Background for this section */}
      <WorldMap className="absolute top-0 right-0 w-96 h-96 -translate-y-20 translate-x-20 z-0 pointer-events-none" />

      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12 relative z-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
             <div className="w-12 h-1 bg-[#00D1FF] rounded-full" />
             <h2 className="text-5xl font-heading font-extrabold tracking-tighter uppercase leading-none">Clone_Scanner</h2>
          </div>
          <p className="text-white/40 font-sans italic max-w-md">Multi-modal deep forensic scanner for audio clones and visual deepfakes.</p>
        </div>
        <div className="flex gap-4">
           <div className="px-6 py-2 glass rounded-2xl flex items-center gap-3">
              <Activity size={16} className="text-[#00D1FF]" />
              <span className="text-[10px] font-mono font-bold tracking-widest text-white/40 uppercase">G3_Alpha_Sync</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
        {/* Upload Terminal */}
        <Card3D>
          <div className="h-full glass rounded-[3rem] p-10 flex flex-col relative overflow-hidden group min-h-[500px]">
            <div className="absolute top-8 right-8 opacity-5 group-hover:opacity-10 transition-opacity">
               <Fingerprint size={120} />
            </div>

            <div className="mb-10 flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#00D1FF] rounded-full animate-pulse shadow-[0_0_10px_#00D1FF]" />
                  <span className="text-[10px] font-mono font-bold tracking-widest text-white/30 uppercase">Neural_Input_Node</span>
               </div>
               {file || previewUrl ? (
                 <button onClick={() => { setFile(null); setPreviewUrl(null); }} className="relative z-20 text-white/20 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                    <X size={20} />
                 </button>
               ) : null}
            </div>

            <div 
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center gap-6 cursor-pointer transition-all relative overflow-hidden group/zone ${
                dragActive ? 'border-[#00D1FF] bg-[#00D1FF]/5' : 'border-white/5 hover:border-white/20 hover:bg-white/[0.02]'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*,video/*,audio/*"
              />

              {isAnalyzing && <div className="scan-line" />}

              {!file && !previewUrl ? (
                <>
                  <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center text-white/20 group-hover/zone:text-[#00D1FF] transition-all group-hover/zone:scale-110 shadow-inner">
                    <Upload size={36} />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-xl font-heading font-bold tracking-tighter uppercase italic">Inject_Media_Target</p>
                    <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest leading-relaxed">
                      MP4 (Video) / WAV (Audio) / PNG / JPEG <br /> MAX_LIMIT: 25.0_MB
                    </p>
                  </div>
                </>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center p-8">
                   <div className="absolute inset-0 opacity-10 blur-2xl">
                      {file ? (
                        file.type.startsWith('image') ? (
                           <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                        ) : file.type.startsWith('video') ? (
                           <video src={URL.createObjectURL(file)} className="w-full h-full object-cover" muted loop autoPlay />
                        ) : (
                          <div className="w-full h-full bg-blue-500/20" />
                        )
                      ) : previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : null}
                   </div>
                   <div className="relative z-10 glass rounded-[2.5rem] p-10 flex flex-col items-center gap-6 text-center max-w-sm border-white/10 shadow-2xl">
                      {file ? (
                        file.type.startsWith('image') ? (
                          <div className="w-48 h-48 rounded-2xl overflow-hidden border border-white/20 relative group/preview">
                             <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                             <FacialOverlay className="opacity-0 group-hover/preview:opacity-100 transition-opacity" />
                             {result && result.artifacts && result.artifacts.length > 0 && <ManipulationOverlay artifacts={result.artifacts} />}
                          </div>
                        ) : file.type.startsWith('video') ? (
                          <div className="w-48 h-48 rounded-2xl glass flex items-center justify-center text-[#98FFD4] border border-white/10 relative overflow-hidden group/preview">
                              <video src={URL.createObjectURL(file)} className="w-full h-full object-cover grayscale opacity-40 group-hover/preview:grayscale-0 group-hover/preview:opacity-100 transition-all" autoPlay muted loop />
                              <Activity size={32} className="absolute text-[#98FFD4] animate-pulse pointer-events-none" />
                              {result && result.artifacts && result.artifacts.length > 0 && <ManipulationOverlay artifacts={result.artifacts} />}
                          </div>
                        ) : (
                          <div className="w-48 h-48 rounded-2xl glass flex items-center justify-center text-[#F27D26] border border-white/10">
                              <Zap size={56} className="animate-pulse" />
                          </div>
                        )
                      ) : previewUrl ? (
                         <div className="w-48 h-48 rounded-2xl overflow-hidden border border-white/20 relative group/preview">
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            <FacialOverlay className="opacity-0 group-hover/preview:opacity-100 transition-opacity" />
                            {result && result.artifacts && result.artifacts.length > 0 && <ManipulationOverlay artifacts={result.artifacts} />}
                         </div>
                      ) : null}
                      <div>
                        <p className="text-sm font-bold font-mono truncate w-48 text-white/80">{file?.name || "DEMO_TARGET_ALPHA.PNG"}</p>
                        <div className="mt-2 flex items-center justify-center gap-2">
                           <div className={`px-3 py-1 rounded-full text-[8px] font-mono font-bold uppercase tracking-wider ${file?.type.startsWith('audio') ? 'bg-[#F27D26]/20 text-[#F27D26]' : file?.type.startsWith('video') ? 'bg-[#98FFD4]/20 text-[#98FFD4]' : 'bg-[#00D1FF]/20 text-[#00D1FF]'}`}>
                              {file ? file.type.split('/')[0] : "image"} Asset
                           </div>
                           <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest italic">{file ? (file.size / (1024 * 1024)).toFixed(2) : "4.20"} MB</p>
                        </div>
                      </div>
                   </div>
                </div>
              )}
            </div>

            <div className="mt-10 flex gap-4">
              <button 
                disabled={!file || isAnalyzing}
                onClick={startAnalysis}
                className={`flex-1 py-5 rounded-[1.5rem] font-heading font-bold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 ${
                  !file || isAnalyzing 
                    ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                    : 'bg-white text-black hover:bg-[#00FFEA] hover:-translate-y-1 shadow-xl hover:shadow-[0_20px_40px_rgba(0,255,234,0.2)] active:scale-[0.98]'
                }`}
              >
                {isAnalyzing ? (
                  <>Initializing_Forensic_Probe <Loader2 className="animate-spin" size={16} /></>
                ) : (
                  <>Execute_Deep_Scan <Search size={16} /></>
                )}
              </button>
            </div>
          </div>
        </Card3D>

        {/* Results Panel */}
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-[3rem] p-12 flex flex-col items-center justify-center text-center space-y-8 min-h-[500px] border-red-500/20 bg-red-500/5 shadow-inner"
            >
               <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-[2.5rem] flex items-center justify-center border border-red-500/20">
                  <AlertTriangle size={48} />
               </div>
               <div className="space-y-4">
                  <h3 className="text-3xl font-heading font-bold tracking-tighter uppercase italic text-red-400 leading-none">Neural_Sync_Fail</h3>
                  <p className="text-sm font-sans italic max-w-xs mx-auto text-pretty" style={{ color: '#ffffff99' }}>{error}</p>
               </div>

               {/* Troubleshooting Tips */}
               <div className="bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/5 w-full max-w-md space-y-6 text-left">
                  <div className="flex items-center gap-3">
                     <Activity size={14} className="text-[#00D1FF]" />
                     <span className="text-[10px] font-mono font-black text-white/40 uppercase tracking-widest">Troubleshooting_Nodes</span>
                  </div>
                  <ul className="space-y-3">
                     {error?.includes("limit") || error?.includes("MB") ? (
                        <li className="text-[11px] text-white/30 font-sans italic flex gap-3">
                           <span className="text-[#00D1FF]">•</span> Use compression tools to reduce file size below 25MB.
                        </li>
                     ) : null}
                     {error?.toLowerCase().includes("type") || error?.toLowerCase().includes("format") ? (
                        <li className="text-[11px] text-white/30 font-sans italic flex gap-3">
                           <span className="text-[#00D1FF]">•</span> Convert asset to standard .mp4, .wav, or .jpg/png format.
                        </li>
                     ) : null}
                     {error?.includes("API") ? (
                        <li className="text-[11px] text-white/30 font-sans italic flex gap-3">
                           <span className="text-[#00D1FF]">•</span> Ensure VITE_GEMINI_API_KEY is correctly initialized in environment.
                        </li>
                     ) : null}
                     {error?.includes("Neural Overload") ? (
                        <li className="text-[11px] text-white/30 font-sans italic flex gap-3">
                           <span className="text-[#00D1FF]">•</span> Wait for cooldown period (approx. 60s) before re-scanning.
                        </li>
                     ) : (
                        <li className="text-[11px] text-white/30 font-sans italic flex gap-3">
                           <span className="text-[#00D1FF]">•</span> Verify network stability and forensic node connection.
                        </li>
                     )}
                  </ul>
               </div>

               <button 
                 onClick={() => setError(null)}
                 className="px-10 py-4 glass rounded-2xl text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-white/5 transition-all text-white/40 hover:text-white"
               >
                 Flush_Buffer
               </button>
            </motion.div>
          ) : !result && !isAnalyzing ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="glass rounded-[3rem] p-12 flex flex-col items-center justify-center text-center space-y-10 min-h-[500px] border-dashed border-white/10 group"
            >
               <div className="w-28 h-28 glass rounded-[3rem] flex items-center justify-center text-white/5 border border-white/5 group-hover:scale-110 group-hover:border-[#00D1FF]/20 transition-all duration-700">
                  <Fingerprint size={64} className="group-hover:text-[#00D1FF]/20 transition-colors" />
               </div>
               <div className="space-y-6">
                  <h3 className="text-2xl font-heading font-bold tracking-tighter uppercase italic opacity-20 group-hover:opacity-40 transition-opacity">Awaiting_Neural_Target</h3>
                  <p className="text-sm text-white/20 font-sans italic max-w-xs mx-auto text-pretty leading-relaxed group-hover:text-white/30 transition-colors">Select a source asset in the terminal to begin complex pattern reconstruction and cloning verification.</p>
               </div>
            </motion.div>
          ) : isAnalyzing ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass rounded-[3rem] p-12 flex flex-col items-center justify-center space-y-12 min-h-[500px] overflow-hidden"
            >
               <div className="relative w-full aspect-square max-w-[300px]">
                  <div className="absolute inset-0 z-0">
                     <AIFaceModel3D className="scale-75 opacity-50" />
                  </div>
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-b-2 border-dashed border-[#00FFEA]/40"
                  />
                  <motion.div 
                    animate={{ rotate: -360 }} 
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-8 rounded-full border-t-2 border-dashed border-[#F27D26]/40"
                  />
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                     <Shield className="text-[#00FFEA] animate-pulse drop-shadow-[0_0_15px_rgba(0,255,234,0.5)]" size={64} />
                  </div>
               </div>
               <div className="space-y-8 text-center w-full">
                  <div className="space-y-2">
                    <p className="text-[10px] font-mono font-bold tracking-[0.5em] text-[#00FFEA] uppercase animate-pulse italic">Scanning_High_Frequency_Biometrics</p>
                    <div className="h-0.5 w-24 bg-[#00FFEA]/20 mx-auto rounded-full overflow-hidden">
                       <motion.div className="h-full bg-[#00FFEA] w-full" animate={{ x: [-100, 100] }} transition={{ repeat: Infinity, duration: 1.5 }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-5 max-w-xs mx-auto">
                    <LoadingRow label="Spectral Timbre Analysis" delay={0} />
                    <LoadingRow label="Facial Mesh Consistency" delay={0.2} />
                    <LoadingRow label="Clone Pattern Match" delay={0.4} />
                  </div>
               </div>
            </motion.div>
          ) : (
            <motion.div 
              key="result"
              id="neural-signature-report"
              ref={resultRef}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass rounded-[3rem] p-10 space-y-8 min-h-[500px] bg-gradient-to-br from-[#00D1FF]/[0.02] to-transparent overflow-hidden relative shadow-2xl border-white/5"
            >
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none translate-x-10 -translate-y-10 scale-150">
                 <Shield size={300} />
              </div>

              <div className="flex justify-between items-start relative z-10 shrink-0">
                 <div className="space-y-3 text-left">
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-[#00D1FF] animate-pulse" />
                       <h3 className="text-[9px] font-mono font-bold tracking-[0.4em] uppercase italic" style={{ color: '#ffffff4d' }}>Forensic_Transcript_v4.5</h3>
                    </div>
                    <h4 className="text-4xl font-heading font-extrabold tracking-tighter uppercase italic leading-none">Security_Audit</h4>
                 </div>
                 <ResultBadge verdict={result.verdict} />
              </div>

              {/* Annotated Forensic View */}
              {result.artifacts.length > 0 && (
                <div className="relative z-10 space-y-6">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[10px] font-mono font-bold tracking-widest text-[#00FFEA] uppercase text-left">
                         <Search size={16} /> Annotated_Forensic_View
                      </div>
                      <div className="px-3 py-1 glass rounded-full text-[8px] font-mono font-bold text-white/40 uppercase tracking-widest">
                         {result.artifacts.length} Markers detected
                      </div>
                   </div>
                   <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 aspect-video group/anno bg-black">
                      {file && file.type.startsWith('image') ? (
                        <img src={URL.createObjectURL(file)} alt="Annotated" className="w-full h-full object-contain" />
                      ) : file && file.type.startsWith('video') ? (
                        <video src={URL.createObjectURL(file)} className="w-full h-full object-contain" autoPlay muted loop />
                      ) : null}
                      <ManipulationOverlay artifacts={result.artifacts} />
                      <div className="absolute inset-x-0 bottom-0 p-8 pt-20 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none">
                         <div className="flex gap-4">
                            {Array.from(new Set(result.artifacts.map(a => a.type))).map(type => (
                               <div key={type} className="flex items-center gap-2 px-3 py-1 glass rounded-lg border-white/5">
                                  <div className={`w-1.5 h-1.5 rounded-full ${type === 'blending' ? 'bg-red-500' : 'bg-[#00FFEA]'}`} />
                                  <span className="text-[9px] font-mono font-bold text-white/60 uppercase">{type}</span>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {/* Global Web Probe Section - PROMOTED TO TOP */}
              <div className="relative z-10 p-8 glass rounded-[2.5rem] border-[#00D1FF]/10 bg-white/[0.01] space-y-8 overflow-hidden group/probe text-left">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-[11px] font-mono font-black tracking-[0.4em] text-[#00FFEA] uppercase italic">
                       <Globe size={16} className="animate-spin-slow" /> Global_Web_Probe
                    </div>
                    {result.webScan.isIllegallyUsed && (
                      <div className="px-4 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-[9px] font-mono font-black text-red-400 uppercase tracking-widest animate-pulse">
                         Illegal_Usage_Detected
                      </div>
                    )}
                 </div>
                 
                 <div className="space-y-4">
                    <p className="text-sm font-sans italic text-left leading-relaxed" style={{ color: '#ffffffcc' }}>
                       {result.webScan.summary}
                    </p>
                 </div>

                 {result.webScan.sources.length > 0 && (
                   <div className="space-y-4 text-left">
                      <span className="text-[9px] font-mono font-black text-white/20 uppercase tracking-[0.3em]">Verified_Source_Points</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                         {result.webScan.sources.slice(0, 4).map((source, i) => (
                           <a 
                             key={i} 
                             href={source.url} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="flex items-center gap-3 p-3 glass rounded-xl border-white/5 hover:bg-white/5 hover:border-[#00D1FF]/20 transition-all group/source"
                           >
                              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20 group-hover/source:text-[#00D1FF]">
                                 <Globe size={12} />
                              </div>
                              <div className="flex-1 min-w-0 text-left">
                                 <div className="text-[10px] font-heading font-black text-white italic truncate">{source.title}</div>
                                 <div className="text-[8px] font-mono text-white/20 truncate">{source.url}</div>
                              </div>
                           </a>
                         ))}
                      </div>
                   </div>
                 )}
                 
                 <div className="scan-line opacity-20 pointer-events-none" />
              </div>

              {/* Simple English Explanation Section */}
              <div className="relative z-10 p-8 glass rounded-[2.5rem] border-[#00D1FF]/20 bg-[#00D1FF]/5 space-y-6 shadow-[0_0_50px_rgba(0,209,255,0.05)]">
                 <div className="flex items-center gap-4 text-[11px] font-mono font-black tracking-[0.4em] text-[#00FFEA] uppercase italic text-left">
                    <Info size={16} /> Forensic_Analysis_Summary
                  </div>
                  <p className="text-xl font-sans font-extrabold text-white leading-snug italic text-pretty text-left">
                     "{result.simpleExplanation}"
                  </p>
                  <div className="flex items-center gap-2">
                     <div className="h-1 w-12 bg-emerald-400 rounded-full" />
                     <span className="text-[9px] font-mono font-bold uppercase tracking-widest" style={{ color: '#ffffff33' }}>Natural_Enforced</span>
                  </div>
               </div>

               {/* Spatial Geometry Registry */}
               <div className="space-y-5 relative z-10">
                  <div className="flex items-center gap-3 text-[10px] font-mono font-bold tracking-widest text-[#00FFEA] uppercase text-left">
                     <Target size={16} /> Localized_Artifact_Geometry
                  </div>
                  <div className="glass rounded-[2rem] overflow-hidden border border-white/5 bg-white/[0.02] shadow-2xl">
                     <table className="w-full text-left text-[9px] font-mono">
                        <thead className="bg-white/5 text-white/30 uppercase tracking-wider font-bold">
                           <tr>
                              <th className="px-6 py-4">Artifact_Type</th>
                              <th className="px-6 py-4">Descriptor</th>
                              <th className="px-6 py-4">Spatial_Geometry (X,Y,W,H)</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                           {result.artifacts.map((art, i) => (
                              <tr key={i} className="hover:bg-white/[0.03] transition-colors">
                                 <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                       <div className={`w-1 h-1 rounded-full ${art.type === 'blending' ? 'bg-red-500' : 'bg-[#00FFEA]'}`} />
                                       <span className="text-white font-black italic">{art.type.toUpperCase()}</span>
                                    </div>
                                 </td>
                                 <td className="px-6 py-4 text-white/50">{art.label}</td>
                                 <td className="px-6 py-4 text-[#00FFEA] font-bold">
                                    {`[${Math.round(art.x)}, ${Math.round(art.y)}, ${Math.round(art.width)}, ${Math.round(art.height)}]`}
                                 </td>
                              </tr>
                           ))}
                           {result.artifacts.length === 0 && (
                              <tr>
                                 <td colSpan={3} className="px-6 py-20 text-center text-white/10 italic">
                                    No localized anomalies detected in geometry scan.
                                 </td>
                              </tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>

              <div className="grid grid-cols-2 gap-5 relative z-10">
                 <ResultCard 
                   icon={<BarChart3 size={20} />} 
                   label="Neural_Integrity" 
                   value={`${result.score}%`} 
                   sub="Auth Level"
                 />
                 <ResultCard 
                   icon={<Globe size={20} />} 
                   label="Global_Prevalence" 
                   value={result.webScan.matchCount > 1000 ? "1k+" : `${result.webScan.matchCount}`} 
                   sub="Web Matches"
                 />
              </div>

              <div className="space-y-5 relative z-10">
                 <div className="flex items-center gap-3 text-[10px] font-mono font-bold tracking-widest text-[#00FFEA] uppercase text-left">
                    <Fingerprint size={16} /> Forensic_Markers
                 </div>
                 <div className="grid grid-cols-1 gap-3">
                    {result.findings.slice(0, 3).map((finding, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="flex items-center gap-4 p-4 glass rounded-[1.25rem] hover:bg-white/5 transition-colors border-white/5 group/finding"
                      >
                         <div className="shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#00FFEA]/50 group-hover/finding:text-[#00FFEA] transition-colors">
                            <Activity size={12} />
                         </div>
                         <p className="text-xs font-sans italic text-left truncate" style={{ color: '#ffffff99' }}>{finding}</p>
                      </motion.div>
                    ))}
                 </div>
              </div>

              <div id="download-btn-container" className="pt-8 relative z-10 text-center">
                 <motion.button 
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(0, 255, 234, 0.1)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={generatePDF}
                   className="w-full py-6 bg-[#00FFEA]/10 border border-[#00FFEA]/30 rounded-[2rem] text-xs font-mono font-black uppercase tracking-[0.3em] text-[#00FFEA] hover:bg-[#00FFEA]/20 transition-all flex items-center justify-center gap-4 shadow-[0_20px_40px_rgba(0,255,234,0.1)] group"
                 >
                   Download Forensic PDF Report <Download size={18} className="group-hover:translate-y-1 transition-transform" />
                 </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function LoadingRow({ label, delay }: { label: string, delay: number }) {
  return (
    <div className="space-y-2">
       <div className="flex justify-between items-center text-[8px] font-mono text-white/20 uppercase tracking-widest">
         <span>{label}</span>
         <span className="text-[#00D1FF]">Probe_Active</span>
       </div>
       <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, repeat: Infinity, delay }}
            className="h-full bg-[#00D1FF]/40 rounded-full"
          />
       </div>
    </div>
  )
}

function ResultBadge({ verdict }: { verdict: AnalysisResult['verdict'] }) {
  const configs = {
    SECURE: { icon: <CheckCircle2 size={18} />, label: 'Secure', color: '#10b981', bg: '#10b9811a', border: '#10b98133' },
    SUSPICIOUS: { icon: <AlertTriangle size={18} />, label: 'Suspicious', color: '#f59e0b', bg: '#f59e0b1a', border: '#f59e0b33' },
    MANIPULATED: { icon: <X size={18} />, label: 'Manipulated', color: '#ef4444', bg: '#ef44441a', border: '#ef444433' }
  }
  const config = configs[verdict];
  return (
    <div 
      className="px-6 py-2.5 rounded-2xl flex items-center gap-3 border shadow-lg shadow-black/20"
      style={{ 
        backgroundColor: config.bg, 
        color: config.color, 
        borderColor: config.border 
      }}
    >
       {config.icon}
       <span className="text-xs font-heading uppercase tracking-[0.1em] italic">{config.label}</span>
    </div>
  );
}

function ResultCard({ icon, label, value, sub }: { icon: React.ReactNode, label: string, value: string, sub: string }) {
  return (
    <div className="glass rounded-[2rem] p-6 space-y-4 hover:bg-white/[0.05] transition-colors border-white/5 group text-left">
       <div className="flex justify-between items-center text-white/20 group-hover:text-[#00D1FF] transition-colors">
          <div className="text-[9px] font-mono font-bold uppercase tracking-widest" style={{ color: '#ffffff33' }}>{label}</div>
          {icon}
       </div>
       <div className="space-y-1">
          <div className="text-3xl font-heading tracking-tighter uppercase italic">{value}</div>
          <div className="text-[8px] font-mono font-bold uppercase tracking-widest italic" style={{ color: '#ffffff33' }}>{sub}</div>
       </div>
    </div>
  );
}
