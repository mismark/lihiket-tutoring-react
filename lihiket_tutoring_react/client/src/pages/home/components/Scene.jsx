import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Preload, AdaptiveDpr } from '@react-three/drei';
import * as THREE from 'three';
import HeroObject from './HeroObject';
import ParticleField from './ParticleField';

function SceneContents({ scrollY, mouse, clicked }) {
  return (
    <>
      {/* Ambient + directional */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} color="#ffffff" />

      {/* Stars background */}
      <Stars radius={60} depth={50} count={2000} factor={3} saturation={0} fade speed={0.5} />

      {/* Particles */}
      <ParticleField count={600} />

      {/* Hero 3D object */}
      <HeroObject scrollY={scrollY} mouse={mouse} clicked={clicked} />
    </>
  );
}

export default function Scene({ scrollY = 0, mouse = [0, 0], clicked = false }) {
  const isMobile = window.innerWidth < 768;

  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 45 }}
      gl={{ antialias: !isMobile, alpha: true, powerPreference: 'high-performance' }}
      dpr={[1, isMobile ? 1.5 : 2]}
      style={{ background: 'transparent' }}
      shadows={false}
    >
      <Suspense fallback={null}>
        <AdaptiveDpr pixelated />
        <SceneContents scrollY={scrollY} mouse={mouse} clicked={clicked} />
        <Preload all />
      </Suspense>
    </Canvas>
  );
}
