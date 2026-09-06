import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function ParticleField({ count = 800, mobile = false }) {
  const mesh = useRef();
  const n = mobile ? Math.floor(count / 3) : count;

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const palette = [
      new THREE.Color('#3b82f6'), // blue
      new THREE.Color('#8b5cf6'), // violet
      new THREE.Color('#06b6d4'), // cyan
      new THREE.Color('#10b981'), // emerald
    ];
    for (let i = 0; i < n; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3]     = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return { positions: pos, colors: col };
  }, [n]);

  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.y = state.clock.elapsedTime * 0.03;
    mesh.current.rotation.x = state.clock.elapsedTime * 0.015;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={n} itemSize={3} />
        <bufferAttribute attach="attributes-color" array={colors} count={n} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
