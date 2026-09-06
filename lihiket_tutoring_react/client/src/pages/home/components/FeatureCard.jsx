import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function FeatureCard({ icon: Icon, title, desc, color, glow, delay = 0, inView }) {
  const ref    = useRef();
  const x      = useMotionValue(0);
  const y      = useMotionValue(0);
  const rotX   = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), { stiffness: 150, damping: 20 });
  const rotY   = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]),  { stiffness: 150, damping: 20 });
  const scale  = useSpring(1, { stiffness: 200, damping: 20 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top)  / rect.height - 0.5);
  };

  const handleMouseEnter = () => { scale.set(1.04); setHovered(true); };
  const handleMouseLeave = () => { x.set(0); y.set(0); scale.set(1); setHovered(false); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX: rotX, rotateY: rotY, scale, transformStyle: 'preserve-3d', transformPerspective: 800 }}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative p-6 rounded-3xl border cursor-default"
      style={{
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(16px)',
        borderColor: hovered ? `${color}40` : 'rgba(255,255,255,0.06)',
        boxShadow: hovered ? `0 0 40px ${glow}` : '0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* Glow overlay */}
      <motion.div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        animate={{ opacity: hovered ? 0.06 : 0 }}
        style={{ background: `radial-gradient(circle at 50% 50%, ${color}, transparent 70%)` }}
        transition={{ duration: 0.3 }}
      />

      {/* Icon */}
      <motion.div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 relative z-10"
        style={{ background: `linear-gradient(135deg, ${color}20, ${color}10)`, border: `1px solid ${color}30` }}
        animate={{ scale: hovered ? 1.1 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Icon style={{ color, width: 24, height: 24 }} />
      </motion.div>

      <h3 className="text-white font-bold text-lg mb-2 relative z-10">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed relative z-10">{desc}</p>

      {/* Bottom glow line */}
      <motion.div
        className="absolute bottom-0 left-6 right-6 h-px rounded-full"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}
