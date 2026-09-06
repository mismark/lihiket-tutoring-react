import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight, FiStar, FiCheck, FiPlay,
  FiBookOpen, FiUsers, FiAward, FiZap,
  FiVideo, FiFileText, FiTrendingUp, FiShield,
  FiTarget, FiGlobe, FiHeart, FiClock,
} from 'react-icons/fi';

// ── Animated counter hook ─────────────────────────────────────────────────────
function useCounter(end, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  return count;
}

// ── Intersection observer hook ────────────────────────────────────────────────
function useInView(threshold = 0.1) {
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

// ── Floating 3D card ──────────────────────────────────────────────────────────
function Float3DCard({ children, delay = 0, className = '' }) {
  return (
    <div
      className={`animate-float ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

// ── Stat counter card ─────────────────────────────────────────────────────────
function StatCard({ value, label, suffix = '+', icon: Icon, color, start }) {
  const count = useCounter(value, 2000, start);
  return (
    <div className="text-center group">
      <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div className="text-4xl font-black text-white mb-1">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-slate-300 text-sm font-medium">{label}</div>
    </div>
  );
}

// ── Feature card ──────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, desc, color, delay, inView }) {
  return (
    <div
      className="group relative p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-default"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
      }}
    >
      {/* Glow effect */}
      <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${color.replace('bg-', 'bg-').replace('text-', '')}`}
        style={{ background: 'radial-gradient(circle at center, currentColor, transparent 70%)' }} />

      <div className={`w-12 h-12 rounded-2xl ${color} bg-opacity-20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

// ── Goal card ─────────────────────────────────────────────────────────────────
function GoalCard({ number, title, desc, color, delay, inView }) {
  return (
    <div
      className="relative flex gap-4 group"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateX(0)' : 'translateX(-30px)',
        transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
      }}
    >
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center flex-shrink-0 text-xl font-black text-white shadow-lg group-hover:scale-110 transition-transform`}>
        {number}
      </div>
      <div>
        <h4 className="text-white font-bold mb-1">{title}</h4>
        <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ── Testimonial card ──────────────────────────────────────────────────────────
function TestimonialCard({ name, role, text, avatar, delay, inView }) {
  return (
    <div
      className="p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
        transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
      }}
    >
      <div className="flex gap-1 mb-3">
        {[1,2,3,4,5].map(i => <FiStar key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
      </div>
      <p className="text-slate-300 text-sm leading-relaxed mb-4">"{text}"</p>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full ${avatar} flex items-center justify-center text-white font-bold text-sm`}>
          {name[0]}
        </div>
        <div>
          <p className="text-white font-semibold text-sm">{name}</p>
          <p className="text-slate-500 text-xs">{role}</p>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [statsRef, statsInView]       = useInView(0.3);
  const [featuresRef, featuresInView] = useInView(0.1);
  const [goalsRef, goalsInView]       = useInView(0.2);
  const [testiRef, testiInView]       = useInView(0.1);
  const [heroLoaded, setHeroLoaded]   = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  const FEATURES = [
    { icon: FiVideo,      title: 'Live Interactive Classes',    desc: 'Join real-time sessions with expert teachers. Ask questions, get instant answers, and learn together.',          color: 'bg-blue-500 text-blue-400' },
    { icon: FiZap,        title: 'Smart Quiz System',           desc: 'Auto-graded quizzes with instant results, score tracking, and personalized feedback for every student.',         color: 'bg-violet-500 text-violet-400' },
    { icon: FiFileText,   title: 'Assignment Tracking',         desc: 'Submit assignments digitally. Teachers grade and provide feedback. Students see results instantly.',              color: 'bg-amber-500 text-amber-400' },
    { icon: FiAward,      title: 'Verified Certificates',       desc: 'Earn certificates upon course completion. Showcase your achievements to universities and employers.',             color: 'bg-emerald-500 text-emerald-400' },
    { icon: FiTrendingUp, title: 'Progress Analytics',          desc: 'Detailed dashboards showing performance trends, strength areas, and improvement opportunities.',                  color: 'bg-pink-500 text-pink-400' },
    { icon: FiShield,     title: 'Secure & Private',            desc: 'End-to-end encrypted. Your data is protected. Access from any device, anywhere, anytime.',                       color: 'bg-teal-500 text-teal-400' },
  ];

  const GOALS = [
    { number: '01', title: 'Bridge the Education Gap',     desc: 'Make quality education accessible to every Ethiopian student regardless of location or economic background.',          color: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
    { number: '02', title: 'Empower Teachers',             desc: 'Give educators powerful tools to create engaging content, track student progress, and deliver better outcomes.',         color: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
    { number: '03', title: 'Personalized Learning Paths',  desc: 'Adapt to each student\'s pace and learning style with customized content, quizzes, and feedback.',                      color: 'bg-gradient-to-br from-violet-500 to-purple-600' },
    { number: '04', title: 'Build Future-Ready Skills',    desc: 'Prepare students for universities and careers with rigorous curriculum, exams, and certified achievements.',             color: 'bg-gradient-to-br from-amber-500 to-orange-600' },
  ];

  const TESTIMONIALS = [
    { name: 'Selam Alemu',   role: 'Grade 12 Student',  text: 'The live classes and instant quiz results helped me improve my scores dramatically. I passed my entrance exam with top marks!', avatar: 'bg-gradient-to-br from-pink-500 to-rose-600' },
    { name: 'Dawit Haile',   role: 'Mathematics Teacher', text: 'Creating lessons and tracking student progress has never been easier. The assignment grading system saves me hours every week.', avatar: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
    { name: 'Meron Tadesse', role: 'Parent',              text: 'I can see exactly how my child is progressing. The notifications keep me updated on every submission and grade.', avatar: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 overflow-x-hidden">

      {/* ── Custom CSS animations ── */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-12px) rotate(1deg); }
          66% { transform: translateY(-6px) rotate(-1deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-18px); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float2 { animation: float2 8s ease-in-out infinite; }
        .animate-glow { animation: glow-pulse 4s ease-in-out infinite; }
        .animate-slide-up { animation: slide-up 0.8s ease forwards; }
        .animate-rotate { animation: rotate-slow 20s linear infinite; }
        .text-shimmer {
          background: linear-gradient(90deg, #34d399, #60a5fa, #a78bfa, #34d399);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .card-3d {
          transform-style: preserve-3d;
          perspective: 1000px;
        }
        .card-3d:hover {
          transform: rotateY(5deg) rotateX(-5deg) scale(1.02);
        }
      `}</style>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">

        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl animate-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-violet-600/20 blur-3xl animate-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-600/5 blur-3xl animate-glow" style={{ animationDelay: '1s' }} />

        {/* Rotating ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-white/5 animate-rotate" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/5 animate-rotate" style={{ animationDirection: 'reverse', animationDuration: '15s' }} />

        {/* Floating 3D cards */}
        <Float3DCard delay={0} className="absolute top-32 left-8 md:left-24 hidden md:block z-10">
          <div className="card-3d bg-gradient-to-br from-blue-600/80 to-indigo-700/80 backdrop-blur-sm border border-white/20 rounded-2xl p-4 shadow-2xl w-44">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <FiZap className="w-4 h-4 text-white" />
              </div>
              <span className="text-white text-xs font-bold">Quiz Score</span>
            </div>
            <div className="text-3xl font-black text-white">95%</div>
            <div className="text-blue-200 text-xs mt-1">↑ 12% this week</div>
            <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full w-[95%] bg-white rounded-full" />
            </div>
          </div>
        </Float3DCard>

        <Float3DCard delay={1} className="absolute top-44 right-8 md:right-24 hidden md:block z-10">
          <div className="card-3d bg-gradient-to-br from-emerald-600/80 to-teal-700/80 backdrop-blur-sm border border-white/20 rounded-2xl p-4 shadow-2xl w-44">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <FiUsers className="w-4 h-4 text-white" />
              </div>
              <span className="text-white text-xs font-bold">Students</span>
            </div>
            <div className="text-3xl font-black text-white">500+</div>
            <div className="text-emerald-200 text-xs mt-1">Active learners</div>
            <div className="flex -space-x-2 mt-2">
              {['bg-pink-500','bg-blue-500','bg-amber-500','bg-violet-500'].map((c,i) => (
                <div key={i} className={`w-6 h-6 rounded-full ${c} border-2 border-slate-800`} />
              ))}
              <div className="w-6 h-6 rounded-full bg-slate-600 border-2 border-slate-800 flex items-center justify-center text-[8px] text-white font-bold">+</div>
            </div>
          </div>
        </Float3DCard>

        <Float3DCard delay={2} className="absolute bottom-32 left-8 md:left-32 hidden md:block z-10">
          <div className="card-3d bg-gradient-to-br from-amber-600/80 to-orange-700/80 backdrop-blur-sm border border-white/20 rounded-2xl p-4 shadow-2xl w-40">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <FiAward className="w-4 h-4 text-white" />
              </div>
              <span className="text-white text-xs font-bold">Certificates</span>
            </div>
            <div className="text-3xl font-black text-white">120</div>
            <div className="text-amber-200 text-xs mt-1">Issued this month</div>
          </div>
        </Float3DCard>

        <Float3DCard delay={1.5} className="absolute bottom-40 right-8 md:right-28 hidden md:block z-10">
          <div className="card-3d bg-gradient-to-br from-violet-600/80 to-purple-700/80 backdrop-blur-sm border border-white/20 rounded-2xl p-4 shadow-2xl w-40">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <FiVideo className="w-4 h-4 text-white" />
              </div>
              <span className="text-white text-xs font-bold">Live Now</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <span className="text-white text-sm font-bold">3 Classes</span>
            </div>
            <div className="text-violet-200 text-xs mt-1">Join now →</div>
          </div>
        </Float3DCard>

        {/* Hero content */}
        <div className="relative z-20 max-w-5xl mx-auto px-4 text-center">

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-semibold mb-8"
            style={{ opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease 0.1s' }}
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Ethiopia's #1 Online Tutoring Platform
            <FiStar className="w-4 h-4" />
          </div>

          {/* Main headline */}
          <h1
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-[1.05] tracking-tight"
            style={{ opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.8s ease 0.2s' }}
          >
            <span className="text-white">Learn Without</span>
            <br />
            <span className="text-shimmer">Limits</span>
          </h1>

          {/* Subheadline */}
          <p
            className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s ease 0.4s' }}
          >
            Connect with expert teachers. Master any subject. Earn verified certificates.
            Join thousands of Ethiopian students achieving their academic goals with Lihiket.
          </p>

          {/* CTA buttons */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            style={{ opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s ease 0.6s' }}
          >
            <Link to="/register"
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg hover:from-emerald-400 hover:to-teal-400 transition-all duration-300 hover:-translate-y-1 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40">
              Start Learning Free
              <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login"
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm text-white font-bold text-lg hover:bg-white/10 hover:border-white/40 transition-all duration-300 hover:-translate-y-1">
              <FiPlay className="w-5 h-5" />
              Sign In
            </Link>
          </div>

          {/* Trust badges */}
          <div
            className="flex flex-wrap items-center justify-center gap-6 text-slate-500 text-sm"
            style={{ opacity: heroLoaded ? 1 : 0, transition: 'all 0.8s ease 0.8s' }}
          >
            {['✓ Free to start', '✓ No credit card needed', '✓ 500+ students', '✓ Expert teachers'].map(t => (
              <span key={t} className="flex items-center gap-1">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section ref={statsRef} className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 via-slate-900 to-blue-900/20" />
        <div className="relative max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard value={500}  suffix="+"  label="Active Students"    icon={FiUsers}      color="bg-gradient-to-br from-blue-500 to-indigo-600"   start={statsInView} />
            <StatCard value={50}   suffix="+"  label="Expert Teachers"    icon={FiStar}       color="bg-gradient-to-br from-emerald-500 to-teal-600"  start={statsInView} />
            <StatCard value={100}  suffix="+"  label="Courses & Subjects"  icon={FiBookOpen}   color="bg-gradient-to-br from-violet-500 to-purple-600" start={statsInView} />
            <StatCard value={95}   suffix="%"  label="Success Rate"        icon={FiTrendingUp} color="bg-gradient-to-br from-amber-500 to-orange-600"  start={statsInView} />
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section ref={featuresRef} className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950" />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-semibold mb-4">
              Everything You Need
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Powerful Features for<br />
              <span className="text-shimmer">Modern Learning</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              From live classes to smart analytics — every tool designed to help you learn faster and achieve more.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <FeatureCard key={i} {...f} delay={i * 0.1} inView={featuresInView} />
            ))}
          </div>
        </div>
      </section>

      {/* ── GOALS & OBJECTIVES ── */}
      <section ref={goalsRef} className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/40 via-slate-950 to-violet-950/40" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="relative max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left — goals */}
            <div>
              <span className="inline-block px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold mb-6">
                Our Mission
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Goals &<br />
                <span className="text-shimmer">Objectives</span>
              </h2>
              <p className="text-slate-400 mb-10 leading-relaxed">
                Lihiket Tutoring was founded with a clear vision: make quality education accessible to every Ethiopian student, regardless of where they live or how much they earn.
              </p>
              <div className="space-y-6">
                {GOALS.map((g, i) => (
                  <GoalCard key={i} {...g} delay={i * 0.15} inView={goalsInView} />
                ))}
              </div>
            </div>

            {/* Right — 3D visual */}
            <div className="relative hidden lg:flex items-center justify-center">
              {/* Central hub */}
              <div className="relative w-80 h-80">
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/10 animate-rotate" />
                <div className="absolute inset-4 rounded-full border border-white/5 animate-rotate" style={{ animationDirection: 'reverse' }} />

                {/* Center card */}
                <div className="absolute inset-8 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex flex-col items-center justify-center p-6 shadow-2xl">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/30">
                    <FiBookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-white font-black text-2xl">Lihiket</div>
                  <div className="text-slate-400 text-xs mt-1">Online Tutoring</div>
                </div>

                {/* Orbiting icons */}
                {[
                  { icon: FiTarget,  color: 'from-blue-500 to-indigo-600',   top: '-16px',  left: '50%',  ml: '-20px' },
                  { icon: FiGlobe,   color: 'from-emerald-500 to-teal-600',  top: '50%',    right: '-16px', mt: '-20px' },
                  { icon: FiHeart,   color: 'from-pink-500 to-rose-600',     bottom: '-16px', left: '50%', ml: '-20px' },
                  { icon: FiClock,   color: 'from-amber-500 to-orange-600',  top: '50%',    left: '-16px', mt: '-20px' },
                ].map(({ icon: Icon, color, ...pos }, i) => (
                  <div key={i} className="absolute" style={pos}>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg animate-float`}
                      style={{ animationDelay: `${i * 0.5}s` }}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section ref={testiRef} className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-slate-900" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-semibold mb-4">
              Student Stories
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Loved by Students<br />
              <span className="text-shimmer">Across Ethiopia</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <TestimonialCard key={i} {...t} delay={i * 0.15} inView={testiInView} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-slate-950 to-blue-950/30" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="relative max-w-5xl mx-auto text-center">
          <span className="inline-block px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold mb-6">
            Get Started in Minutes
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            How Lihiket <span className="text-shimmer">Works</span>
          </h2>
          <p className="text-slate-400 mb-16 text-lg">Three simple steps to transform your learning.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-px bg-gradient-to-r from-blue-500/50 via-violet-500/50 to-emerald-500/50" />

            {[
              { step: '1', title: 'Create Account',   desc: 'Sign up free as student, teacher, or parent in under 2 minutes.',       color: 'from-blue-500 to-indigo-600',   glow: 'shadow-blue-500/30' },
              { step: '2', title: 'Choose Subjects',  desc: 'Browse subjects, preview teachers, and enroll in the courses you need.', color: 'from-violet-500 to-purple-600', glow: 'shadow-violet-500/30' },
              { step: '3', title: 'Start Learning',   desc: 'Attend live classes, take quizzes, submit work, and track your growth.', color: 'from-emerald-500 to-teal-600',  glow: 'shadow-emerald-500/30' },
            ].map(({ step, title, desc, color, glow }, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${color} flex items-center justify-center text-3xl font-black text-white shadow-2xl ${glow} mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                  {step}
                </div>
                <h3 className="text-white font-bold text-xl mb-3">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/40 via-slate-950 to-blue-950/40" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Big glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-emerald-500/10 blur-3xl rounded-full" />

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold mb-8">
            <FiZap className="w-4 h-4" />
            Free to get started — no credit card required
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            Your Future Starts<br />
            <span className="text-shimmer">Today</span>
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of Ethiopian students who are already achieving their dreams with Lihiket Tutoring.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register"
              className="group inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg hover:from-emerald-400 hover:to-teal-400 transition-all duration-300 hover:-translate-y-1 shadow-2xl shadow-emerald-500/30">
              Create Free Account
              <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm text-white font-bold text-lg hover:bg-white/10 hover:border-white/40 transition-all duration-300">
              Sign In
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-10 flex items-center justify-center gap-3">
            <div className="flex -space-x-3">
              {['from-pink-500 to-rose-600','from-blue-500 to-indigo-600','from-emerald-500 to-teal-600','from-amber-500 to-orange-600'].map((g,i) => (
                <div key={i} className={`w-10 h-10 rounded-full bg-gradient-to-br ${g} border-2 border-slate-950 flex items-center justify-center text-white text-xs font-bold`}>
                  {['S','D','M','A'][i]}
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <FiStar key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}</div>
              <div className="text-slate-400 text-sm">Trusted by 500+ students</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
