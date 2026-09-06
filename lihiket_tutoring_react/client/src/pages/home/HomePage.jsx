import { useEffect, useRef, useState, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import {
  FiArrowRight, FiStar, FiPlay, FiBookOpen, FiUsers,
  FiAward, FiZap, FiVideo, FiFileText, FiTrendingUp,
  FiShield, FiTarget, FiCheck,
} from 'react-icons/fi';
import MagneticButton    from './components/MagneticButton';
import FeatureCard        from './components/FeatureCard';

// ── Gallery data — curated Unsplash teaching images ───────────────────────────
const GALLERY_ROW1 = [
  { src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=480&h=320&fit=crop&auto=format', label: 'Group Study Session',    tag: 'Collaboration' },
  { src: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=480&h=320&fit=crop&auto=format', label: 'Classroom Learning',     tag: 'Teaching' },
  { src: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=480&h=320&fit=crop&auto=format', label: 'One-on-One Tutoring',     tag: 'Mentorship' },
  { src: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=480&h=320&fit=crop&auto=format', label: 'Students Collaborating',  tag: 'Teamwork' },
  { src: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=480&h=320&fit=crop&auto=format', label: 'Digital Learning',        tag: 'Technology' },
  { src: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=480&h=320&fit=crop&auto=format', label: 'Taking Notes',            tag: 'Focus' },
  { src: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=480&h=320&fit=crop&auto=format', label: 'Classroom Engagement',    tag: 'Interactive' },
  { src: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=480&h=320&fit=crop&auto=format', label: 'Friendly Teaching',       tag: 'Support' },
];
const GALLERY_ROW2 = [
  { src: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=480&h=320&fit=crop&auto=format', label: 'Inspiring Students',      tag: 'Motivation' },
  { src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=480&h=320&fit=crop&auto=format', label: 'Online Class',             tag: 'Live Learning' },
  { src: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=480&h=320&fit=crop&auto=format', label: 'Campus Study',             tag: 'University' },
  { src: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=480&h=320&fit=crop&auto=format', label: 'Focused Learning',         tag: 'Achievement' },
  { src: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=480&h=320&fit=crop&auto=format', label: 'Library Research',         tag: 'Knowledge' },
  { src: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=480&h=320&fit=crop&auto=format', label: 'Interactive Lesson',       tag: 'Engagement' },
  { src: 'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=480&h=320&fit=crop&auto=format', label: 'Joyful Learning',          tag: 'Happiness' },
  { src: 'https://images.unsplash.com/photo-1491841573634-28140fc7ced7?w=480&h=320&fit=crop&auto=format', label: 'Group Discussion',         tag: 'Community' },
];

// ── Gallery card ────────────���─────────────────────────────────────────────────
function GalleryCard({ src, label, tag }) {
  return (
    <motion.div
      className="relative flex-shrink-0 rounded-2xl overflow-hidden cursor-default group"
      style={{ width: 320, height: 210 }}
      whileHover={{ scale: 1.03, zIndex: 10 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <img
        src={src}
        alt={label}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        style={{ filter: 'brightness(0.75)' }}
      />
      {/* Overlay gradient */}
      <div className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-70"
        style={{ background: 'linear-gradient(to top, rgba(2,8,23,0.9) 0%, rgba(2,8,23,0.2) 50%, transparent 100%)' }} />

      {/* Tag pill */}
      <div className="absolute top-3 left-3">
        <span className="px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-sm"
          style={{ background: 'rgba(16,185,129,0.25)', border: '1px solid rgba(16,185,129,0.4)', color: '#6ee7b7' }}>
          {tag}
        </span>
      </div>

      {/* Label */}
      <div className="absolute bottom-0 left-0 right-0 px-4 py-3">
        <p className="text-white font-semibold text-sm truncate">{label}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-emerald-400 text-xs">Lihiket Learning</span>
        </div>
      </div>

      {/* Glow border on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: 'inset 0 0 0 1.5px rgba(16,185,129,0.5)' }} />
    </motion.div>
  );
}

// Lazy-load heavy 3D components
const Scene              = lazy(() => import('./components/Scene'));
const InteractiveShowcase = lazy(() => import('./components/InteractiveShowcase'));

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ end, suffix = '+', duration = 2000 }) {
  const [val, setVal] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStarted(true); obs.disconnect(); }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * end));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, end, duration]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ── useInView ─────────────────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef();
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

const FEATURES = [
  { icon: FiVideo,      title: 'Live Interactive Classes',  desc: 'Join real-time sessions with expert teachers. Ask questions, get instant answers, collaborate live.',          color: '#3b82f6', glow: 'rgba(59,130,246,0.15)' },
  { icon: FiZap,        title: 'Smart Quiz Engine',         desc: 'Auto-graded adaptive quizzes with instant feedback, score tracking, and personalised learning paths.',         color: '#8b5cf6', glow: 'rgba(139,92,246,0.15)' },
  { icon: FiFileText,   title: 'Assignment Management',     desc: 'Submit work digitally. Teachers grade with rich feedback. Track every submission and grade in one place.',     color: '#f59e0b', glow: 'rgba(245,158,11,0.15)' },
  { icon: FiAward,      title: 'Verified Certificates',     desc: 'Earn recognised certificates on completion. Showcase achievements to universities and employers worldwide.',   color: '#10b981', glow: 'rgba(16,185,129,0.15)' },
  { icon: FiTrendingUp, title: 'Deep Analytics',            desc: 'Detailed performance dashboards showing trends, strength areas, and exactly where to improve.',                color: '#ec4899', glow: 'rgba(236,72,153,0.15)' },
  { icon: FiShield,     title: 'Secure & Private',          desc: 'End-to-end encrypted. Your data stays protected. Access everything from any device, anywhere.',               color: '#06b6d4', glow: 'rgba(6,182,212,0.15)' },
];

const STATS = [
  { value: 500, suffix: '+', label: 'Students',     icon: FiUsers,      color: '#3b82f6' },
  { value: 50,  suffix: '+', label: 'Teachers',     icon: FiStar,       color: '#8b5cf6' },
  { value: 100, suffix: '+', label: 'Courses',      icon: FiBookOpen,   color: '#10b981' },
  { value: 95,  suffix: '%', label: 'Success Rate', icon: FiTrendingUp, color: '#f59e0b' },
];

const GOALS = [
  { title: 'Bridge the Education Gap',   desc: 'Make quality education accessible to every Ethiopian student regardless of location or economic background.' },
  { title: 'Empower Educators',          desc: 'Provide teachers with powerful tools to create content, track progress, and deliver better learning outcomes.' },
  { title: 'Personalised Learning',      desc: 'Adapt to each student\'s unique pace and style with tailored content, smart quizzes, and personal feedback.' },
  { title: 'Future-Ready Skills',        desc: 'Prepare students for universities and careers with rigorous curriculum and certified achievement records.' },
];

export default function HomePage() {
  const containerRef  = useRef();
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const [scrollY,   setScrollY]   = useState(0);
  const [mouse,     setMouse]     = useState([0, 0]);
  const [clicked,   setClicked]   = useState(false);
  const [heroLoaded, setHeroLoaded] = useState(false);

  const [featRef,   featInView]   = useInView(0.1);
  const [goalsRef,  goalsInView]  = useInView(0.15);

  // Hero parallax
  const heroY      = useTransform(smoothProgress, [0, 0.3], [0, -120]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.25], [1, 0]);
  const heroScale  = useTransform(smoothProgress, [0, 0.3], [1, 0.85]);

  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouse  = (e) => {
      setMouse([
        (e.clientX / window.innerWidth  - 0.5) * 2,
        (e.clientY / window.innerHeight - 0.5) * 2,
      ]);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouse);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  // Reduce motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768;

  return (
    <div ref={containerRef} style={{ background: '#020817', color: 'white', overflowX: 'hidden' }}>

      {/* ══════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

        {/* 3D Canvas — full background */}
        <div className="absolute inset-0 z-0">
          <Suspense fallback={<div style={{ background: '#020817', width: '100%', height: '100%' }} />}>
            <Scene scrollY={scrollY} mouse={prefersReduced ? [0,0] : mouse} clicked={clicked} />
          </Suspense>
        </div>

        {/* Gradient overlays for readability */}
        <div className="absolute inset-0 z-[1]" style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(2,8,23,0.6) 70%)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-48 z-[1]" style={{ background: 'linear-gradient(to top, #020817, transparent)' }} />

        {/* Hero content */}
        <motion.div
          className="relative z-10 max-w-5xl mx-auto px-4 text-center"
          style={{ y: prefersReduced ? 0 : heroY, opacity: heroOpacity, scale: heroScale }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-8 text-sm font-semibold"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}
            initial={{ opacity: 0, y: 30 }}
            animate={heroLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <motion.div className="w-2 h-2 rounded-full bg-emerald-400"
              animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            Ethiopia's #1 Online Tutoring Platform
            <FiStar className="w-3.5 h-3.5" />
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={heroLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h1 className="font-black leading-[1.02] tracking-tight mb-6"
              style={{ fontSize: 'clamp(3rem, 8vw, 6rem)' }}>
              <span style={{ color: 'white' }}>Experience</span>
              <br />
              <span style={{
                background: 'linear-gradient(90deg, #34d399, #60a5fa, #a78bfa, #34d399)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'shimmerText 4s linear infinite',
              }}>
                the Future
              </span>
            </h1>
          </motion.div>

          {/* Sub */}
          <motion.p
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: '#94a3b8' }}
            initial={{ opacity: 0, y: 30 }}
            animate={heroLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            Connect with expert teachers. Master any subject. Earn verified certificates.
            Join thousands of Ethiopian students transforming their future with Lihiket.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={heroLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <MagneticButton>
              <Link to="/register">
                <motion.div
                  className="group flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg text-white"
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #0d9488)',
                    boxShadow: '0 0 30px rgba(16,185,129,0.4), 0 8px 32px rgba(16,185,129,0.2)',
                  }}
                  whileHover={{ boxShadow: '0 0 50px rgba(16,185,129,0.6), 0 12px 40px rgba(16,185,129,0.3)' }}
                  transition={{ duration: 0.3 }}
                >
                  Get Started Free
                  <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.div>
              </Link>
            </MagneticButton>

            <MagneticButton>
              <Link to="/login">
                <motion.div
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg text-white"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(12px)',
                  }}
                  whileHover={{
                    background: 'rgba(255,255,255,0.1)',
                    borderColor: 'rgba(255,255,255,0.3)',
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <FiPlay className="w-5 h-5" />
                  Explore
                </motion.div>
              </Link>
            </MagneticButton>
          </motion.div>

          {/* Click 3D hint */}
          <motion.p
            className="mt-8 text-sm"
            style={{ color: '#475569' }}
            initial={{ opacity: 0 }}
            animate={heroLoaded ? { opacity: 1 } : {}}
            transition={{ delay: 1.2 }}
          >
            Move your mouse around · Click the 3D object to interact
          </motion.p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <span className="text-xs" style={{ color: '#475569' }}>Scroll to explore</span>
          <motion.div
            className="w-6 h-10 rounded-full border flex items-start justify-center pt-1.5"
            style={{ borderColor: 'rgba(255,255,255,0.15)' }}
          >
            <motion.div
              className="w-1.5 h-3 rounded-full bg-emerald-400"
              animate={{ y: [0, 14, 0], opacity: [1, 0, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════
          STATS
      ══════════════════════════════════════════ */}
      <section style={{ padding: '5rem 1rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {STATS.map((s, i) => (
              <motion.div
                key={i}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <motion.div
                  className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: `${s.color}15`, border: `1px solid ${s.color}30` }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <s.icon style={{ color: s.color, width: 24, height: 24 }} />
                </motion.div>
                <div className="text-4xl font-black text-white mb-1" style={{ textShadow: `0 0 20px ${s.color}60` }}>
                  <Counter end={s.value} suffix={s.suffix} />
                </div>
                <div className="text-sm font-medium" style={{ color: '#64748b' }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TEACHING MOMENTS — Auto-scroll gallery
      ══════════════════════════════════════════ */}
      <section style={{ padding: '4rem 0', overflow: 'hidden' }}>
        {/* Label */}
        <div className="text-center mb-10 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-3"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399' }}>
              Real Learning, Real Results
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
              Where Teachers &amp; Students{' '}
              <span style={{ background: 'linear-gradient(90deg, #34d399, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Connect
              </span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Friendly, engaging, and effective — the way learning should always feel.
            </p>
          </motion.div>
        </div>

        {/* Row 1 — scroll left */}
        <div className="relative mb-4">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to right, #020817, transparent)' }} />
          <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to left, #020817, transparent)' }} />

          <div className="flex gap-4 overflow-hidden">
            <motion.div
              className="flex gap-4 flex-shrink-0"
              animate={{ x: [0, -2600] }}
              transition={{ duration: 35, repeat: Infinity, ease: 'linear', repeatType: 'loop' }}
            >
              {[...GALLERY_ROW1, ...GALLERY_ROW1].map((img, i) => (
                <GalleryCard key={i} {...img} />
              ))}
            </motion.div>
          </div>
        </div>

        {/* Row 2 — scroll right */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to right, #020817, transparent)' }} />
          <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to left, #020817, transparent)' }} />

          <div className="flex gap-4 overflow-hidden">
            <motion.div
              className="flex gap-4 flex-shrink-0"
              animate={{ x: [-2600, 0] }}
              transition={{ duration: 38, repeat: Infinity, ease: 'linear', repeatType: 'loop' }}
            >
              {[...GALLERY_ROW2, ...GALLERY_ROW2].map((img, i) => (
                <GalleryCard key={i} {...img} />
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          INTRODUCTION
      ══════════════════════════════════════════ */}
      <section style={{ padding: '7rem 1rem' }}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-6"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8' }}>
              Why Lihiket?
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
              A New Standard for<br />
              <span style={{ background: 'linear-gradient(90deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Online Education
              </span>
            </h2>
            <p className="text-lg leading-relaxed mb-10" style={{ color: '#94a3b8' }}>
              We built Lihiket because Ethiopian students deserve world-class education tools.
              Live classes, smart assessments, progress tracking, and certified achievements — all in one platform.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: FiTarget, title: 'Goal-Oriented', desc: 'Every feature built around measurable student outcomes', color: '#3b82f6' },
              { icon: FiUsers,  title: 'Community',     desc: 'Learn together with students and teachers across Ethiopia', color: '#10b981' },
              { icon: FiAward,  title: 'Recognised',    desc: 'Certificates and results that matter to employers and universities', color: '#f59e0b' },
            ].map((c, i) => (
              <motion.div key={i}
                className="p-6 rounded-2xl text-center"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                whileHover={{ y: -4, borderColor: `${c.color}40` }}
              >
                <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: `${c.color}15`, border: `1px solid ${c.color}30` }}>
                  <c.icon style={{ color: c.color, width: 22, height: 22 }} />
                </div>
                <h4 className="text-white font-bold mb-2">{c.title}</h4>
                <p className="text-sm" style={{ color: '#64748b' }}>{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════ */}
      <section ref={featRef} style={{ padding: '7rem 1rem', background: 'rgba(255,255,255,0.015)' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4"
              style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa' }}>
              Platform Features
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Everything You Need<br />
              <span style={{ background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                to Excel
              </span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#94a3b8' }}>
              Hover each card to interact. Every tool designed to help you learn faster and achieve more.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <FeatureCard key={i} {...f} delay={i * 0.08} inView={featInView} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          INTERACTIVE SHOWCASE
      ══════════════════════════════════════════ */}
      <section style={{ padding: '7rem 1rem' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4"
              style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)', color: '#22d3ee' }}>
              Interactive Experience
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              <span style={{ background: 'linear-gradient(90deg, #22d3ee, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Explore
              </span>{' '}
              the Platform
            </h2>
            <p style={{ color: '#94a3b8' }}>Drag, rotate, and discover what Lihiket has to offer</p>
          </motion.div>

          <motion.div
            className="rounded-3xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
          >
            <Suspense fallback={
              <div className="w-full h-[500px] flex items-center justify-center" style={{ color: '#475569' }}>
                Loading 3D experience…
              </div>
            }>
              <InteractiveShowcase />
            </Suspense>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          GOALS
      ══════════════════════════════════════════ */}
      <section ref={goalsRef} style={{ padding: '7rem 1rem', background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={goalsInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8 }}
              >
                <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-6"
                  style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}>
                  Our Mission
                </span>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                  Goals &<br />
                  <span style={{ background: 'linear-gradient(90deg, #34d399, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Objectives
                  </span>
                </h2>
                <p className="mb-10 leading-relaxed" style={{ color: '#94a3b8' }}>
                  We founded Lihiket with one clear vision: make quality education accessible to every Ethiopian student, regardless of location or background.
                </p>
              </motion.div>

              <div className="space-y-5">
                {GOALS.map((g, i) => (
                  <motion.div
                    key={i}
                    className="flex gap-4 p-4 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    initial={{ opacity: 0, x: -30 }}
                    animate={goalsInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6, delay: i * 0.12 }}
                    whileHover={{ x: 4, borderColor: 'rgba(16,185,129,0.3)' }}
                  >
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-black text-white"
                      style={{ background: `linear-gradient(135deg, ${['#3b82f6','#10b981','#8b5cf6','#f59e0b'][i]}, ${['#6366f1','#0d9488','#7c3aed','#d97706'][i]})` }}>
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1">{g.title}</h4>
                      <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>{g.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right: value props */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={goalsInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { label: 'Students Enrolled', value: '500+',  color: '#3b82f6', icon: FiUsers },
                { label: 'Courses Available', value: '100+',  color: '#10b981', icon: FiBookOpen },
                { label: 'Live Sessions/Mo',  value: '200+',  color: '#8b5cf6', icon: FiVideo },
                { label: 'Success Rate',      value: '95%',   color: '#f59e0b', icon: FiTrendingUp },
                { label: 'Certificates',      value: '300+',  color: '#ec4899', icon: FiAward },
                { label: 'Expert Teachers',   value: '50+',   color: '#06b6d4', icon: FiShield },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="p-5 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  whileHover={{ scale: 1.03, borderColor: `${item.color}40` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <item.icon style={{ color: item.color, width: 20, height: 20 }} className="mb-2" />
                  <div className="text-2xl font-black text-white" style={{ textShadow: `0 0 12px ${item.color}60` }}>
                    {item.value}
                  </div>
                  <div className="text-xs mt-1" style={{ color: '#64748b' }}>{item.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA — FINAL
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ padding: '8rem 1rem' }}>
        {/* Background 3D effect via CSS */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(16,185,129,0.08), transparent 70%)' }} />
        <motion.div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 30% 70%, rgba(99,102,241,0.06), transparent 60%)' }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        <div className="relative max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold mb-8"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}>
              <FiZap className="w-4 h-4" />
              Free to get started — no credit card required
            </span>

            <h2 className="font-black text-white mb-6 leading-tight"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}>
              Ready to Experience<br />
              <span style={{
                background: 'linear-gradient(90deg, #34d399, #60a5fa, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                the Future?
              </span>
            </h2>

            <p className="text-lg mb-10" style={{ color: '#94a3b8' }}>
              Join thousands of Ethiopian students who are already achieving their dreams.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <MagneticButton strength={0.25}>
                <Link to="/register">
                  <motion.div
                    className="flex items-center gap-3 px-10 py-5 rounded-2xl font-bold text-lg text-white"
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #0d9488)',
                      boxShadow: '0 0 40px rgba(16,185,129,0.5), 0 12px 40px rgba(16,185,129,0.25)',
                    }}
                    whileHover={{
                      boxShadow: '0 0 60px rgba(16,185,129,0.7), 0 16px 50px rgba(16,185,129,0.35)',
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Create Free Account
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <FiArrowRight className="w-5 h-5" />
                    </motion.div>
                  </motion.div>
                </Link>
              </MagneticButton>

              <MagneticButton strength={0.25}>
                <Link to="/login">
                  <motion.div
                    className="flex items-center gap-3 px-10 py-5 rounded-2xl font-bold text-lg text-white"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(12px)',
                    }}
                    whileHover={{
                      background: 'rgba(255,255,255,0.1)',
                      borderColor: 'rgba(255,255,255,0.3)',
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Sign In
                  </motion.div>
                </Link>
              </MagneticButton>
            </div>

            {/* Social proof */}
            <motion.div
              className="flex items-center justify-center gap-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex -space-x-3">
                {['#ec4899','#3b82f6','#10b981','#f59e0b'].map((c,i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: `linear-gradient(135deg, ${c}, ${c}99)`, borderColor: '#020817' }}>
                    {['S','D','M','A'][i]}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <FiStar key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}</div>
                <div className="text-sm" style={{ color: '#64748b' }}>Trusted by 500+ students</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer style={{ padding: '3rem 1rem 2rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <img src="/logo.jpg" alt="Lihiket" className="w-8 h-8 rounded-xl object-cover" />
              <span className="text-white font-bold text-lg">Lihiket<span style={{ color: '#34d399' }}>.</span></span>
            </div>
            <div className="flex items-center gap-6 text-sm" style={{ color: '#64748b' }}>
              {['Subjects','Documents','Assignments','Quizzes'].map(l => (
                <Link key={l} to="/" className="hover:text-white transition-colors">{l}</Link>
              ))}
            </div>
            <p className="text-sm" style={{ color: '#475569' }}>
              © {new Date().getFullYear()} Lihiket Tutoring. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Global shimmer keyframe */}
      <style>{`
        @keyframes shimmerText {
          0%   { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
}
