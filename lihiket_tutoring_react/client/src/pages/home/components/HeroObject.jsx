import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MeshTransmissionMaterial, Float, Trail } from '@react-three/drei';
import * as THREE from 'three';

export default function HeroObject({ scrollY = 0, mouse = [0, 0], clicked = false }) {
  const meshRef  = useRef();
  const groupRef = useRef();
  const ringRef  = useRef();

  const targetRot  = useRef([0, 0]);
  const currentRot = useRef([0, 0]);
  const [hovered, setHovered] = useState(false);
  const [pulse, setPulse] = useState(false);

  useFrame((state) => {
    if (!meshRef.current || !groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Idle rotation
    meshRef.current.rotation.y += 0.004;
    meshRef.current.rotation.x += 0.002;

    // Mouse parallax
    targetRot.current[0] = mouse[1] * 0.4;
    targetRot.current[1] = mouse[0] * 0.4;
    currentRot.current[0] += (targetRot.current[0] - currentRot.current[0]) * 0.05;
    currentRot.current[1] += (targetRot.current[1] - currentRot.current[1]) * 0.05;
    groupRef.current.rotation.x = currentRot.current[0];
    groupRef.current.rotation.y = currentRot.current[1];

    // Scroll effect
    groupRef.current.position.z = -scrollY * 0.005;
    groupRef.current.position.y = -scrollY * 0.003;

    // Click spring scale
    const targetScale = clicked ? 1.15 : hovered ? 1.05 : 1.0;
    const cs = meshRef.current.scale.x;
    meshRef.current.scale.setScalar(cs + (targetScale - cs) * 0.08);

    // Ring orbit
    if (ringRef.current) {
      ringRef.current.rotation.x = t * 0.5;
      ringRef.current.rotation.y = t * 0.8;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer ring orbit */}
      <mesh ref={ringRef}>
        <torusGeometry args={[2.5, 0.02, 8, 80]} />
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.8} transparent opacity={0.6} />
      </mesh>

      {/* Second ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.8, 0.015, 8, 80]} />
        <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.6} transparent opacity={0.4} />
      </mesh>

      {/* Main hero object — torus knot with glass material */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
        <mesh
          ref={meshRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={() => { setPulse(true); setTimeout(() => setPulse(false), 600); }}
          castShadow
        >
          <torusKnotGeometry args={[1, 0.35, 200, 32, 2, 3]} />
          <MeshTransmissionMaterial
            backside
            backsideThickness={0.3}
            thickness={0.2}
            roughness={0}
            transmission={1}
            ior={1.5}
            chromaticAberration={0.06}
            anisotropy={0.3}
            distortion={0.5}
            distortionScale={0.3}
            temporalDistortion={0.1}
            color={hovered ? '#60a5fa' : '#818cf8'}
            attenuationColor="#8b5cf6"
            attenuationDistance={0.5}
          />
        </mesh>
      </Float>

      {/* Glowing core */}
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#06b6d4"
          emissiveIntensity={pulse ? 4 : 2}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Point lights for atmosphere */}
      <pointLight color="#3b82f6" intensity={3} distance={8} position={[2, 2, 2]} />
      <pointLight color="#8b5cf6" intensity={2} distance={6} position={[-2, -1, 1]} />
      <pointLight color="#06b6d4" intensity={1.5} distance={5} position={[0, 0, 3]} />
    </group>
  );
}
