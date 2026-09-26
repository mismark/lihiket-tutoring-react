import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function FeatureCard({ icon: Icon, title, desc, color, glow, delay = 0, inView, dark = true }) {
  const ref   = useRef();
  const x     = useMotionValue(0);
  const y     = useMotionValue(0);
  const rotX  = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), { stiffness: 150, damping: 20 });
  const rotY  = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), { stiffness: 150, damping: 20 });
  const scale = useSpring(1, { stiffness: 200, damping: 20 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top)  / rect.height - 0.5);
  };

  // ── Theme-aware tokens ──────────────────────────────────────────────────────
  const cardBg     = dark
    ? 'rgba(15,23,42,0.65)'
    : 'rgba(255,255,255,0.92)';
  const cardBd     = hovered
    ? `${color}45`
    : dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.09)';
  const cardShadow = hovered
    ? `0 0 40px ${glow}`
    : dark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.08)';
  const titleColor = dark ? '#f1f5f9' : '#0f172a';
  const descColor  = dark ? '#94a3b8' : '#475569';

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => { scale.set(1.04); setHovered(true); }}
      onMouseLeave={() => { x.set(0); y.set(0); scale.set(1); setHovered(false); }}
      style={{
        rotateX: rotX,
        rotateY: rotY,
        scale,
        transformPerspective: 800,
        background: cardBg,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderColor: cardBd,
        boxShadow: cardShadow,
      }}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative p-6 rounded-3xl border cursor-default"
    >
      {/* Glow overlay */}
      <motion.div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        animate={{ opacity: hovered ? (dark ? 0.07 : 0.04) : 0 }}
        style={{ background: `radial-gradient(circle at 50% 50%, ${color}, transparent 70%)` }}
        transition={{ duration: 0.3 }}
      />

      {/* Icon */}
      <motion.div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 relative z-10"
        style={{ background: `${color}18`, border: `1px solid ${color}35` }}
        animate={{ scale: hovered ? 1.1 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Icon style={{ color, width: 22, height: 22 }} />
      </motion.div>

      <h3 className="font-bold text-lg mb-2 relative z-10" style={{ color: titleColor }}>{title}</h3>
      <p className="text-sm leading-relaxed relative z-10" style={{ color: descColor }}>{desc}</p>

      {/* Bottom accent line */}
      <motion.div
        className="absolute bottom-0 left-6 right-6 h-px rounded-full"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}
