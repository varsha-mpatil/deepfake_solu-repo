import React, { useRef, useState, useEffect, Suspense, useMemo } from 'react';
import { motion, useSpring, useTransform } from 'motion/react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

export function NeuralBrainCore({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Suspense fallback={null}>
          <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
            <group>
              <mesh>
                <sphereGeometry args={[1, 64, 64]} />
                <MeshDistortMaterial
                  color="#00D1FF"
                  speed={5}
                  distort={0.6}
                  radius={1}
                />
              </mesh>
              <mesh scale={[1.1, 1.1, 1.1]}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshBasicMaterial color="#00FFEA" wireframe transparent opacity={0.1} />
              </mesh>
            </group>
          </Float>
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
        </Suspense>
      </Canvas>
    </div>
  );
}

function FaceParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Create a sphere of particles that we will distort slightly to feel "alive"
  const count = 2000;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const r = 2; // Radius
        pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y += 0.002;
    pointsRef.current.rotation.z += 0.001;
    
    // Pulse effect
    const scale = 1 + Math.sin(state.clock.getElapsedTime() * 0.5) * 0.05;
    pointsRef.current.scale.set(scale, scale, scale);
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#00D1FF"
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function ScanningRings() {
    const ringRef = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (!ringRef.current) return;
        ringRef.current.rotation.y += 0.01;
        ringRef.current.position.y = Math.sin(state.clock.getElapsedTime()) * 1.5;
    });

    return (
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[2.5, 0.01, 16, 100]} />
            <meshBasicMaterial color="#00FFEA" transparent opacity={0.3} />
        </mesh>
    )
}

export function AIFaceModel3D({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Suspense fallback={null}>
          <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
             <group>
                <FaceParticles />
                <ScanningRings />
                {/* Visual Neural Core */}
                <mesh>
                  <sphereGeometry args={[1.5, 32, 32]} />
                  <MeshDistortMaterial
                    color="#00D1FF"
                    speed={2}
                    distort={0.4}
                    radius={1}
                    transparent
                    opacity={0.1}
                  />
                </mesh>
             </group>
          </Float>
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export function Card3D({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useSpring(0, { damping: 20, stiffness: 100 });
  const y = useSpring(0, { damping: 20, stiffness: 100 });

  const rotateX = useTransform(y, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Convert to relative values from -0.5 to 0.5
    x.set((mouseX / width) - 0.5);
    y.set((mouseY / height) - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  const background = useTransform(
    [x, y],
    ([latestX, latestY]: any) => `radial-gradient(400px circle at ${(latestX + 0.5) * 100}% ${(latestY + 0.5) * 100}%, rgba(0, 209, 255, 0.15), transparent)`
  );

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={`relative perspective-container transition-all duration-300 ${className}`}
    >
      {/* Dynamic Cursor Spotlight */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300"
        style={{
          background,
          opacity: isHovered ? 1 : 0
        }}
      />
      <div style={{ transform: 'translateZ(20px)' }} className="h-full">
        {children}
      </div>
    </motion.div>
  );
}

export function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width: number;
    let height: number;
    const points: { x: number; y: number; originX: number; originY: number }[] = [];
    const spacing = 40;
    const mouse = { x: 0, y: 0 };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      points.length = 0;
      for (let x = 0; x < width; x += spacing) {
        for (let y = 0; y < height; y += spacing) {
          points.push({ x, y, originX: x, originY: y });
        }
      }
    };

    window.addEventListener('resize', resize);
    resize();

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(0, 209, 255, 0.3)';
      
      points.forEach(p => {
        const dx = mouse.x - p.originX;
        const dy = mouse.y - p.originY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 200;
        
        if (dist < maxDist) {
          const force = (maxDist - dist) / maxDist;
          p.x = p.originX - (dx / dist) * force * 15;
          p.y = p.originY - (dy / dist) * force * 15;
          ctx.beginPath();
          ctx.fillStyle = `rgba(0, 209, 255, ${0.1 + force * 0.5})`;
          ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          p.x = p.originX;
          p.y = p.originY;
          ctx.beginPath();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.arc(p.x, p.y, 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}

export function CustomCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [lagPos, setLagPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  useEffect(() => {
    let frame: number;
    const follow = () => {
      setLagPos(prev => ({
        x: prev.x + (pos.x - prev.x) * 0.15,
        y: prev.y + (pos.y - prev.y) * 0.15,
      }));
      frame = requestAnimationFrame(follow);
    };
    follow();
    return () => cancelAnimationFrame(frame);
  }, [pos]);

  return (
    <>
      <div 
        className="fixed w-2 h-2 bg-white rounded-full pointer-events-none z-[9999]"
        style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)' }}
      />
      <div 
        className="fixed w-8 h-8 border border-white/30 rounded-full pointer-events-none z-[9998] transition-transform duration-100 ease-out"
        style={{ left: lagPos.x, top: lagPos.y, transform: 'translate(-50%, -50%)' }}
      />
    </>
  );
}

export function Orb({ className = "" }: { className?: string }) {
  return (
    <motion.div
      animate={{
        y: [0, -20, 0],
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`absolute w-[40rem] h-[40rem] rounded-full blur-[100px] pointer-events-none opacity-40 mix-blend-screen ${className}`}
    />
  );
}

export function WorldMap({ className = "" }: { className?: string }) {
  return (
    <div className={`relative opacity-30 grayscale invert ${className}`}>
      <svg viewBox="0 0 1000 500" className="w-full h-full filter blur-[0.5px]">
         {/* Simplified World Path */}
         <path 
           fill="currentColor" 
           d="M170,160 Q190,130 220,140 T270,130 T320,150 T380,140 T440,160 T500,150 T560,180 T620,160 T680,140 T740,150 T800,180 T860,160 T900,200 T850,300 T780,350 T700,380 T620,360 T540,380 T460,360 T380,380 T300,360 T220,380 T150,340 T120,280 T140,200 Z" 
           className="text-white/5"
         />
         
         {/* Animated Grid lines */}
         <defs>
           <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
             <stop offset="0%" stopColor="#00D1FF" stopOpacity="0" />
             <stop offset="50%" stopColor="#00D1FF" stopOpacity="0.5" />
             <stop offset="100%" stopColor="#00D1FF" stopOpacity="0" />
           </linearGradient>
         </defs>

         {/* Interconnected Network Nodes */}
         {[
           {id: 1, x: 250, y: 180}, {id: 2, x: 420, y: 160}, 
           {id: 3, x: 680, y: 220}, {id: 4, x: 380, y: 320},
           {id: 5, x: 580, y: 360}, {id: 6, x: 820, y: 280},
           {id: 7, x: 180, y: 240}, {id: 8, x: 740, y: 140},
         ].map(dot => (
           <React.Fragment key={dot.id}>
             <motion.circle 
               cx={dot.x} cy={dot.y} r="2.5" 
               fill="#00D1FF"
               animate={{ opacity: [0.3, 1, 0.3], r: [2.5, 3.5, 2.5] }}
               transition={{ duration: 3, repeat: Infinity, delay: dot.id * 0.4 }}
             />
             <motion.circle 
               cx={dot.x} cy={dot.y} r="12" 
               stroke="#00D1FF" strokeWidth="0.5" fill="none"
               animate={{ scale: [0.8, 1.5, 0.8], opacity: [0.2, 0, 0.2] }}
               transition={{ duration: 4, repeat: Infinity, delay: dot.id * 0.4 }}
             />
           </React.Fragment>
         ))}

         {/* Connection Lines with Pulse */}
         <g stroke="url(#lineGrad)" strokeWidth="0.8">
            <line x1="250" y1="180" x2="420" y2="160" />
            <line x1="420" y1="160" x2="680" y2="220" />
            <line x1="250" y1="180" x2="380" y2="320" />
            <line x1="380" y1="320" x2="580" y2="360" />
            <line x1="680" y1="220" x2="820" y2="280" />
            <line x1="740" y1="140" x2="680" y2="220" />
            <line x1="180" y1="240" x2="250" y2="180" />
         </g>
      </svg>
    </div>
  );
}

export function FacialOverlay({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <svg viewBox="0 0 200 200" className="w-full h-full opacity-40">
        {/* Simulated facial contour dots */}
        <g className="text-[#00D1FF]">
           {/* Eyes */}
           <motion.circle cx="70" cy="80" r="1.5" fill="currentColor" animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} />
           <motion.circle cx="130" cy="80" r="1.5" fill="currentColor" animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.5 }} />
           {/* Nose bridge */}
           <circle cx="100" cy="90" r="1" fill="currentColor" />
           <circle cx="100" cy="110" r="1" fill="currentColor" />
           {/* Mouth contour */}
           <path d="M80,140 Q100,150 120,140" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
           {/* Face contour */}
           <path d="M50,70 Q50,160 100,180 Q150,160 150,70" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
        </g>
      </svg>
    </div>
  );
}
