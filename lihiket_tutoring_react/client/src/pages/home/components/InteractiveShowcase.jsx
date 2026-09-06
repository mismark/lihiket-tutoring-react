import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, MeshTransmissionMaterial, Stars, AdaptiveDpr } from '@react-three/drei';
import { motion } from 'framer-motion';

function ShowcaseObject() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight color="#3b82f6" intensity={4} position={[3, 3, 3]} />
      <pointLight color="#8b5cf6" intensity={3} position={[-3, -2, 2]} />
      <pointLight color="#10b981" intensity={2} position={[0, 4, -2]} />
      <Stars radius={40} depth={30} count={800} factor={2} saturation={0} fade />

      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.3}>
        <mesh castShadow>
          <icosahedronGeometry args={[1.8, 2]} />
          <MeshTransmissionMaterial
            backside
            backsideThickness={0.2}
            thickness={0.15}
            roughness={0}
            transmission={0.95}
            ior={1.6}
            chromaticAberration={0.1}
            anisotropy={0.5}
            distortion={0.4}
            distortionScale={0.2}
            temporalDistortion={0.15}
            color="#818cf8"
            attenuationColor="#6366f1"
            attenuationDistance={0.8}
          />
        </mesh>
      </Float>

      {/* Orbiting spheres */}
      {[0, 1, 2, 3, 4, 5].map(i => (
        <Float key={i} speed={1 + i * 0.3} rotationIntensity={0} floatIntensity={0}>
          <mesh position={[
            Math.cos(i * Math.PI / 3) * 3,
            Math.sin(i * Math.PI / 3) * 1.5,
            Math.sin(i * Math.PI / 3) * 2,
          ]}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial
              color={['#3b82f6','#8b5cf6','#10b981','#06b6d4','#f59e0b','#ec4899'][i]}
              emissive={['#3b82f6','#8b5cf6','#10b981','#06b6d4','#f59e0b','#ec4899'][i]}
              emissiveIntensity={2}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

const LABELS = [
  { text: 'Live Classes',    x: '15%', y: '25%' },
  { text: 'Smart Quizzes',  x: '75%', y: '20%' },
  { text: 'Certificates',   x: '10%', y: '70%' },
  { text: 'Analytics',      x: '72%', y: '72%' },
];

export default function InteractiveShowcase() {
  return (
    <div className="relative w-full h-[500px] md:h-[600px]">
      {/* Canvas */}
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <AdaptiveDpr pixelated />
          <ShowcaseObject />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.8}
            maxPolarAngle={Math.PI * 0.7}
            minPolarAngle={Math.PI * 0.3}
          />
        </Suspense>
      </Canvas>

      {/* Floating labels */}
      {LABELS.map((l, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{ left: l.x, top: l.y }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md"
            style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(99,102,241,0.4)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-white text-xs font-semibold whitespace-nowrap">{l.text}</span>
          </div>
        </motion.div>
      ))}

      {/* Instruction */}
      <motion.p
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-slate-500 text-xs"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Drag to rotate · Scroll to zoom
      </motion.p>
    </div>
  );
}
