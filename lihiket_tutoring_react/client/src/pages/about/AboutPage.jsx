import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTheme } from '../../store/theme/ThemeContext';
import logo from '../../assets/logo.jpg';
import {
  FiTarget, FiUsers, FiAward, FiHeart, FiStar, FiZap,
  FiBookOpen, FiGlobe, FiShield, FiTrendingUp, FiArrowRight,
  FiMail, FiPhone, FiMapPin, FiCheckCircle, FiEye, FiCompass,
} from 'react-icons/fi';

// ── Animated counter (viewport-triggered) ─────────────────────────────────────
function Counter({ end, suffix = '+', duration = 1800 }) {
  const [val, setVal]         = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect(); } },
      { threshold: 0.5 },
    );
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

// ── Team member card ───────────────────────────────────────────────────────────
function TeamCard({ name, role, bio, initials, color, delay }) {
  return (
    <motion.div
      className="rounded-2xl p-6 flex flex-col items-center text-center group"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -6, borderColor: `${color}40` }}
    >
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white mb-4 group-hover:scale-105 transition-transform"
        style={{ background: `linear-gradient(135deg,${color},${color}99)`, boxShadow: `0 8px 32px ${color}30` }}
      >
        {initials}
      </div>
      <h4 className="text-base font-bold text-white mb-0.5">{name}</h4>
      <p className="text-xs font-semibold mb-3" style={{ color }}>{role}</p>
      <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>{bio}</p>
    </motion.div>
  );
}

// ── Value card ─────────────────────────────────────────────────────────────────
function ValueCard({ icon: Icon, title, desc, color, delay }) {
  return (
    <motion.div
      className="p-6 rounded-2xl"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -4, borderColor: `${color}50` }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}
      >
        <Icon style={{ color, width: 22, height: 22 }} />
      </div>
      <h4 className="font-bold text-white mb-2">{title}</h4>
      <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>{desc}</p>
    </motion.div>
  );
}

// ── Timeline step ──────────────────────────────────────────────────────────────
function TimelineStep({ year, title, desc, color, isLast, delay }) {
  return (
    <motion.div
      className="relative flex gap-6"
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, delay }}
    >
      {/* Line */}
      <div className="flex flex-col items-center">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-black text-white flex-shrink-0 z-10"
          style={{ background: `linear-gradient(135deg,${color},${color}80)`, boxShadow: `0 4px 20px ${color}35` }}
        >
          {year}
        </div>
        {!isLast && <div className="w-px flex-1 mt-2" style={{ background: 'rgba(255,255,255,0.08)' }} />}
      </div>
      {/* Content */}
      <div className="pb-10">
        <h4 className="font-bold text-white mb-1">{title}</h4>
        <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>{desc}</p>
      </div>
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function AboutPage() {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const heroRef = useRef();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY  = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOp = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Design tokens
  const bg     = dark ? '#020817'            : '#f8fafc';
  const bgAlt  = dark ? 'rgba(2,12,30,0.95)' : '#f1f5f9';
  const txt    = dark ? '#f1f5f9'            : '#0f172a';
  const txtSub = dark ? '#94a3b8'            : '#475569';
  const bdSect = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
  const bgCard = dark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const bdCard = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  return (
    <div style={{ background: bg, color: txt, minHeight: '100vh' }}>

      <style>{`
        @keyframes shimTxt { from{background-position:0 50%} to{background-position:200% 50%} }
        @keyframes floatY  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes glow    { 0%,100%{opacity:.3;transform:scale(1)} 50%{opacity:.55;transform:scale(1.08)} }
        .shim  { background:linear-gradient(90deg,#34d399,#60a5fa,#a78bfa,#34d399);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimTxt 4s linear infinite; }
        .float { animation:floatY 6s ease-in-out infinite; }
        .glowa { animation:glow 4s ease-in-out infinite; }
      `}</style>

      {/* ══════════════════════ HERO ══════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-14"
      >
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1920&h=900&fit=crop&auto=format&q=80"
            alt="Students learning in a bright classroom"
            className="w-full h-full object-cover object-center"
            style={{ filter: 'brightness(0.28) saturate(0.8)' }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(2,8,23,0.5) 0%, rgba(2,8,23,0.85) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.07) 0%,transparent 50%,rgba(99,102,241,0.06) 100%)' }} />
        </div>

        {/* Ambient orbs */}
        <div className="absolute glowa" style={{ top: '15%', left: '10%', width: 380, height: 380, borderRadius: '50%', background: 'rgba(16,185,129,0.06)', filter: 'blur(70px)' }} />
        <div className="absolute glowa" style={{ bottom: '15%', right: '10%', width: 320, height: 320, borderRadius: '50%', background: 'rgba(99,102,241,0.07)', filter: 'blur(70px)', animationDelay: '2s' }} />

        <motion.div
          className="relative z-10 max-w-4xl mx-auto px-4 text-center"
          style={{ y: heroY, opacity: heroOp }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-8 text-sm font-semibold"
            style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)', color: '#34d399' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-emerald-400"
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            About Lihiket
          </motion.div>

          <motion.h1
            className="font-black leading-[1.05] tracking-tight mb-6"
            style={{ fontSize: 'clamp(2.6rem,7vw,5rem)' }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
          >
            <span className="text-white">Empowering Ethiopia's</span><br />
            <span className="shim">Next Generation</span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'rgba(241,245,249,0.85)' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Lihiket was built with a single belief: every Ethiopian student deserves access
            to world-class education, no matter where they are.
          </motion.p>

          {/* Breadcrumb */}
          <motion.div
            className="flex items-center justify-center gap-2 mt-8 text-sm"
            style={{ color: '#64748b' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link>
            <span>/</span>
            <span style={{ color: '#34d399' }}>About</span>
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════ STATS BAR ═════════════════════════════════════ */}
      <section style={{ background: 'rgba(2,12,30,0.95)', borderTop: `1px solid ${bdSect}`, borderBottom: `1px solid ${bdSect}`, padding: '3.5rem 1rem' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {[
            { icon: FiUsers,     color: '#10b981', value: 500,  suffix: '+', label: 'Active Students'  },
            { icon: FiBookOpen,  color: '#3b82f6', value: 50,   suffix: '+', label: 'Expert Teachers'  },
            { icon: FiAward,     color: '#f59e0b', value: 120,  suffix: '+', label: 'Certificates Issued' },
            { icon: FiTrendingUp,color: '#8b5cf6', value: 95,   suffix: '%', label: 'Success Rate'     },
          ].map(({ icon: Icon, color, value, suffix, label }, i) => (
            <motion.div
              key={i}
              className="text-center"
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <motion.div
                className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                style={{ background: `${color}18`, border: `1px solid ${color}35` }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Icon style={{ color, width: 24, height: 24 }} />
              </motion.div>
              <div className="text-4xl font-black mb-1" style={{ color: '#f1f5f9', textShadow: `0 0 20px ${color}50` }}>
                <Counter end={value} suffix={suffix} />
              </div>
              <div className="text-sm font-medium" style={{ color: '#64748b' }}>{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════ MISSION & VISION ══════════════════════════════ */}
      <section style={{ padding: '7rem 1rem', background: bg, borderBottom: `1px solid ${bdSect}` }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <span
              className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8' }}
            >
              What Drives Us
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight" style={{ color: txt }}>
              Our Mission &amp;{' '}
              <span style={{ background: 'linear-gradient(90deg,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Vision
              </span>
            </h2>
            <p className="max-w-2xl mx-auto text-lg leading-relaxed" style={{ color: txtSub }}>
              Two guiding ideas that shape every decision we make at Lihiket.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mission */}
            <motion.div
              className="p-8 rounded-3xl relative overflow-hidden"
              style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)' }}
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7 }}
              whileHover={{ borderColor: 'rgba(16,185,129,0.4)' }}
            >
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full" style={{ background: 'radial-gradient(circle,rgba(16,185,129,0.08) 0%,transparent 70%)', transform: 'translate(30%,-30%)' }} />
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
                <FiTarget style={{ color: '#34d399', width: 26, height: 26 }} />
              </div>
              <h3 className="text-2xl font-black mb-4" style={{ color: '#f1f5f9' }}>Our Mission</h3>
              <p className="text-base leading-relaxed mb-5" style={{ color: '#94a3b8' }}>
                To democratize quality education in Ethiopia by connecting dedicated students
                with passionate teachers through a reliable, accessible, and engaging digital platform
                — removing barriers of geography, cost, and resource availability.
              </p>
              <ul className="space-y-2">
                {[
                  'Make expert tutoring reachable for every student',
                  'Equip teachers with powerful digital tools',
                  'Track progress with data-driven insights',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: '#94a3b8' }}>
                    <FiCheckCircle className="mt-0.5 flex-shrink-0" style={{ color: '#34d399', width: 15, height: 15 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Vision */}
            <motion.div
              className="p-8 rounded-3xl relative overflow-hidden"
              style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)' }}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              whileHover={{ borderColor: 'rgba(99,102,241,0.4)' }}
            >
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full" style={{ background: 'radial-gradient(circle,rgba(99,102,241,0.08) 0%,transparent 70%)', transform: 'translate(30%,-30%)' }} />
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
                <FiEye style={{ color: '#818cf8', width: 26, height: 26 }} />
              </div>
              <h3 className="text-2xl font-black mb-4" style={{ color: '#f1f5f9' }}>Our Vision</h3>
              <p className="text-base leading-relaxed mb-5" style={{ color: '#94a3b8' }}>
                To become Ethiopia's most trusted education platform — a place where every
                student can unlock their full potential, every teacher can build a thriving
                career, and the country's knowledge economy grows stronger each year.
              </p>
              <ul className="space-y-2">
                {[
                  'Lead Ethiopia in digital education innovation',
                  'Bridge the urban-rural learning gap',
                  'Build the next generation of confident professionals',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: '#94a3b8' }}>
                    <FiCheckCircle className="mt-0.5 flex-shrink-0" style={{ color: '#818cf8', width: 15, height: 15 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ OUR STORY ════════════════════════════════════ */}
      <section style={{ padding: '7rem 1rem', background: bgAlt, borderBottom: `1px solid ${bdSect}` }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <span
              className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-5"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24' }}
            >
              Our Story
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight" style={{ color: txt }}>
              Born from a<br />
              <span style={{ background: 'linear-gradient(90deg,#fbbf24,#f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Simple Belief
              </span>
            </h2>
            <div className="space-y-4" style={{ color: txtSub }}>
              <p className="text-base leading-relaxed">
                Lihiket started with a simple observation: talented Ethiopian students were being held back
                not by their intelligence or ambition, but by limited access to quality tutors and modern
                learning tools.
              </p>
              <p className="text-base leading-relaxed">
                We set out to change that. We built a platform where students can find expert teachers
                in any subject, attend live interactive classes, take smart assessments, and earn
                recognized certificates — all from any device, anywhere in Ethiopia.
              </p>
              <p className="text-base leading-relaxed">
                Today, Lihiket serves hundreds of students and teachers across the country. But this
                is only the beginning. We're committed to continuously improving the platform, expanding
                our subject catalog, and bringing world-class education tools to every corner of Ethiopia.
              </p>
            </div>
            <motion.div className="mt-8">
              <Link to="/register">
                <motion.div
                  className="inline-flex items-center gap-3 px-7 py-3.5 rounded-2xl font-bold text-white cursor-pointer"
                  style={{ background: 'linear-gradient(135deg,#10b981,#0d9488)', boxShadow: '0 0 24px rgba(16,185,129,0.35)' }}
                  whileHover={{ boxShadow: '0 0 40px rgba(16,185,129,0.55)', scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Join Our Community <FiArrowRight className="w-4 h-4" />
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <TimelineStep year="'22" title="The Idea" desc="Identified the gap in quality online education for Ethiopian students and began planning Lihiket." color="#10b981" delay={0.1} />
            <TimelineStep year="'23" title="Platform Built" desc="Developed the core learning platform: live classes, quizzes, assignments, and tutor matching." color="#3b82f6" delay={0.2} />
            <TimelineStep year="'24" title="First Students" desc="Launched to our first cohort of students and teachers. Positive feedback shaped the product roadmap." color="#8b5cf6" delay={0.3} />
            <TimelineStep year="'25" title="Growing Fast" desc="Crossed 500+ active learners, 50+ teachers, and expanded home-tutoring services across Addis Ababa." color="#f59e0b" delay={0.4} />
            <TimelineStep year="Now" title="What's Next" desc="Scaling to more cities, adding new subjects, and building Ethiopia's largest learning community." color="#ec4899" delay={0.5} isLast />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════ CORE VALUES ═══════════════════════════════════ */}
      <section style={{ padding: '7rem 1rem', background: bg, borderBottom: `1px solid ${bdSect}` }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <span
              className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4"
              style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.3)', color: '#f472b6' }}
            >
              What We Stand For
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: txt }}>
              Our Core{' '}
              <span style={{ background: 'linear-gradient(90deg,#f472b6,#fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Values
              </span>
            </h2>
            <p className="max-w-xl mx-auto text-base leading-relaxed" style={{ color: txtSub }}>
              These principles guide how we build the product, support our community, and grow as a team.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ValueCard icon={FiHeart}    title="Student-First"     desc="Every feature, every decision starts with one question: does this help students learn better?"               color="#ec4899" delay={0}    />
            <ValueCard icon={FiShield}   title="Integrity"         desc="Honest grades, verified certificates, and transparent practices. Students and teachers can trust Lihiket."  color="#10b981" delay={0.08} />
            <ValueCard icon={FiGlobe}    title="Accessibility"     desc="Great education belongs to everyone. We design for low-bandwidth environments and affordable access."         color="#3b82f6" delay={0.16} />
            <ValueCard icon={FiZap}      title="Excellence"        desc="We hold ourselves to the highest standard: fast, reliable, beautiful, and educationally sound."              color="#f59e0b" delay={0.24} />
            <ValueCard icon={FiCompass}  title="Growth Mindset"    desc="We believe skills are built, not born. We champion effort, iteration, and continuous improvement."           color="#8b5cf6" delay={0.32} />
            <ValueCard icon={FiStar}     title="Community"         desc="Students, teachers, and parents form one thriving community. Together we achieve more than alone."            color="#34d399" delay={0.4}  />
          </div>
        </div>
      </section>

      {/* ══════════════════════ TEAM ══════════════════════════════════════════ */}
      <section style={{ padding: '7rem 1rem', background: bgAlt, borderBottom: `1px solid ${bdSect}` }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <span
              className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}
            >
              The People Behind Lihiket
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: txt }}>
              Meet the{' '}
              <span style={{ background: 'linear-gradient(90deg,#34d399,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Team
              </span>
            </h2>
            <p className="max-w-xl mx-auto text-base leading-relaxed" style={{ color: txtSub }}>
              A small, passionate team united by the belief that technology can transform education in Africa.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <TeamCard
              name="Mekuanit Misganaw"
              role="Founder & Lead Developer"
              bio="Full-stack engineer with a passion for education technology. Built Lihiket from the ground up to solve real learning challenges in Ethiopia."
              initials="MM"
              color="#10b981"
              delay={0}
            />
            <TeamCard
              name="Content Team"
              role="Curriculum & Learning Design"
              bio="Experienced educators who curate and review course content to ensure every lesson meets the highest academic standards."
              initials="CT"
              color="#3b82f6"
              delay={0.1}
            />
            <TeamCard
              name="Support Team"
              role="Student Success"
              bio="Dedicated to helping students and teachers get the most out of Lihiket. Available every day to answer questions and resolve issues fast."
              initials="ST"
              color="#8b5cf6"
              delay={0.2}
            />
          </div>

          {/* LinkedIn CTA */}
          <motion.div
            className="mt-10 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <a
              href="https://www.linkedin.com/in/mekuanit-misganaw-b0aa16384/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
              style={{ color: '#60a5fa' }}
            >
              Connect with the founder on LinkedIn <FiArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════ WHAT WE OFFER ════════════════════════════════ */}
      <section style={{ padding: '7rem 1rem', background: bg, borderBottom: `1px solid ${bdSect}` }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <span
              className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4"
              style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa' }}
            >
              Platform Capabilities
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: txt }}>
              Everything You Need{' '}
              <span style={{ background: 'linear-gradient(90deg,#60a5fa,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                to Succeed
              </span>
            </h2>
            <p className="max-w-xl mx-auto text-base leading-relaxed" style={{ color: txtSub }}>
              Lihiket brings all the tools for teaching and learning into one seamless experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: FiUsers,      title: 'Live Classes',       desc: 'Interactive real-time sessions with screen sharing and Q&A.',         color: '#10b981' },
              { icon: FiBookOpen,   title: 'Course Library',     desc: 'Structured lessons with video, notes, and downloadable resources.',   color: '#3b82f6' },
              { icon: FiZap,        title: 'Smart Quizzes',      desc: 'Auto-graded quizzes with instant feedback and performance analytics.', color: '#8b5cf6' },
              { icon: FiAward,      title: 'Certificates',       desc: 'Verified digital certificates for completed courses and exams.',       color: '#f59e0b' },
              { icon: FiTrendingUp, title: 'Progress Tracking',  desc: 'Dashboards for students, teachers, and parents to monitor growth.',   color: '#ec4899' },
              { icon: FiShield,     title: 'Secure Platform',    desc: 'End-to-end data protection with role-based access control.',          color: '#34d399' },
              { icon: FiCompass,    title: 'Home Tutoring',      desc: 'Request qualified tutors to come directly to your home.',             color: '#fb923c' },
              { icon: FiGlobe,      title: 'Any Device',         desc: 'Fully responsive — works on phone, tablet, or desktop.',              color: '#60a5fa' },
            ].map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div
                key={i}
                className="p-5 rounded-2xl"
                style={{ background: bgCard, border: `1px solid ${bdCard}` }}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                whileHover={{ y: -4, borderColor: `${color}40` }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                  <Icon style={{ color, width: 20, height: 20 }} />
                </div>
                <h4 className="font-bold text-sm mb-1.5" style={{ color: txt }}>{title}</h4>
                <p className="text-xs leading-relaxed" style={{ color: txtSub }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ CONTACT / CTA ════════════════════════════════ */}
      <section style={{ padding: '7rem 1rem', background: bgAlt }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <span
              className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}
            >
              Get in Touch
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: txt }}>
              We'd Love to{' '}
              <span style={{ background: 'linear-gradient(90deg,#34d399,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Hear from You
              </span>
            </h2>
            <p className="max-w-xl mx-auto text-base leading-relaxed" style={{ color: txtSub }}>
              Have a question, partnership idea, or just want to say hello? Reach out — we respond to every message.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
            {[
              { icon: FiMail,   label: 'Email Us',       value: 'info@lihiket.com',       href: 'mailto:info@lihiket.com',   color: '#3b82f6' },
              { icon: FiPhone,  label: 'Call Us',        value: '+251 918 854 070',        href: 'tel:+251918854070',         color: '#10b981' },
              { icon: FiMapPin, label: 'Find Us',        value: 'Addis Ababa, Ethiopia',   href: null,                        color: '#f59e0b' },
            ].map(({ icon: Icon, label, value, href, color }, i) => (
              <motion.div
                key={i}
                className="p-6 rounded-2xl text-center"
                style={{ background: bgCard, border: `1px solid ${bdCard}` }}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4, borderColor: `${color}40` }}
              >
                <div className="w-13 h-13 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `${color}15`, border: `1px solid ${color}30`, width: 52, height: 52 }}>
                  <Icon style={{ color, width: 22, height: 22 }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#64748b' }}>{label}</p>
                {href ? (
                  <a href={href} className="font-semibold transition-colors hover:opacity-80" style={{ color: txt }}>{value}</a>
                ) : (
                  <p className="font-semibold" style={{ color: txt }}>{value}</p>
                )}
              </motion.div>
            ))}
          </div>

          {/* Final CTA */}
          <motion.div
            className="relative rounded-3xl overflow-hidden p-10 md:p-14 text-center"
            style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.12) 0%,rgba(99,102,241,0.1) 100%)', border: '1px solid rgba(16,185,129,0.2)' }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            {/* Decorative orb */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(16,185,129,0.1) 0%,transparent 70%)', transform: 'translate(30%,-30%)' }} />

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
              style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}>
              <motion.div className="w-2 h-2 rounded-full bg-emerald-400" animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
              Ready to Start?
            </div>

            <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
              Start Your Learning Journey Today
            </h3>
            <p className="max-w-lg mx-auto mb-8 text-base leading-relaxed" style={{ color: '#94a3b8' }}>
              Join hundreds of Ethiopian students already transforming their academic future with Lihiket.
              It's free to get started.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <motion.div
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg text-white cursor-pointer"
                  style={{ background: 'linear-gradient(135deg,#10b981,#0d9488)', boxShadow: '0 0 30px rgba(16,185,129,0.4)' }}
                  whileHover={{ boxShadow: '0 0 50px rgba(16,185,129,0.65)', scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Create Free Account <FiArrowRight className="w-5 h-5" />
                </motion.div>
              </Link>
              <Link to="/login">
                <motion.div
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg text-white cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)' }}
                  whileHover={{ background: 'rgba(255,255,255,0.13)', borderColor: 'rgba(255,255,255,0.3)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  Sign In
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
