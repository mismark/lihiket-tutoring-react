import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../store/theme/ThemeContext';
import {
  FiArrowRight, FiStar, FiPlay,
  FiBookOpen, FiUsers, FiAward, FiZap,
  FiVideo, FiFileText, FiTrendingUp, FiShield,
  FiTarget, FiGlobe, FiHeart, FiClock,
} from 'react-icons/fi';

// ── Animated counter ──────────────────────────────────────────────────────────
function useCounter(end, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * end));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  return count;
}

// ── IntersectionObserver ──────────────────────────────────────────────────────
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

export default function HomePage() {
  const { theme }   = useTheme();
  const dark        = theme === 'dark';

  const [statsRef,    statsInView]    = useInView(0.3);
  const [featRef,     featInView]     = useInView(0.1);
  const [goalsRef,    goalsInView]    = useInView(0.2);
  const [testiRef,    testiInView]    = useInView(0.1);
  const [heroLoaded,  setHeroLoaded]  = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const bg        = dark ? 'bg-slate-950'   : 'bg-white';
  const bgSub     = dark ? 'bg-slate-900'   : 'bg-slate-50';
  const bgCard    = dark ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200';
  const heading   = dark ? 'text-white'     : 'text-slate-900';
  const sub       = dark ? 'text-slate-400' : 'text-slate-600';
  const muted     = dark ? 'text-slate-500' : 'text-slate-500';
  const divider   = dark ? 'border-white/10' : 'border-slate-200';
  const cardHover = dark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50';

  // ── Stat card ─────────────────────────────────────────────────────────────
  const StatCard = ({ value, label, suffix = '+', icon: Icon, color, start }) => {
    const count = useCounter(value, 2000, start);
    return (
      <div className="text-center group">
        <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div className={`text-4xl font-black mb-1 ${heading}`}>{count.toLocaleString()}{suffix}</div>
        <div className={`text-sm font-medium ${sub}`}>{label}</div>
      </div>
    );
  };

  const FEATURES = [
    { icon: FiVideo,      title: 'Live Interactive Classes',  desc: 'Join real-time sessions with expert teachers. Ask questions, get instant answers, and learn together.',        color: 'bg-blue-500/10 text-blue-500 dark:text-blue-400',    border: 'hover:border-blue-400/40' },
    { icon: FiZap,        title: 'Smart Quiz System',         desc: 'Auto-graded quizzes with instant results, score tracking, and personalised feedback for every student.',       color: 'bg-violet-500/10 text-violet-500 dark:text-violet-400', border: 'hover:border-violet-400/40' },
    { icon: FiFileText,   title: 'Assignment Tracking',       desc: 'Submit assignments digitally. Teachers grade with feedback. Students see results instantly.',                   color: 'bg-amber-500/10 text-amber-500 dark:text-amber-400',   border: 'hover:border-amber-400/40' },
    { icon: FiAward,      title: 'Verified Certificates',     desc: 'Earn certificates on course completion. Showcase achievements to universities and employers.',                  color: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400', border: 'hover:border-emerald-400/40' },
    { icon: FiTrendingUp, title: 'Progress Analytics',        desc: 'Detailed dashboards showing performance trends, strength areas, and improvement opportunities.',               color: 'bg-pink-500/10 text-pink-500 dark:text-pink-400',      border: 'hover:border-pink-400/40' },
    { icon: FiShield,     title: 'Secure & Private',          desc: 'End-to-end encrypted. Your data is protected. Access from any device, anywhere, anytime.',                    color: 'bg-teal-500/10 text-teal-500 dark:text-teal-400',      border: 'hover:border-teal-400/40' },
  ];

  const GOALS = [
    { n: '01', title: 'Bridge the Education Gap',    desc: 'Make quality education accessible to every Ethiopian student regardless of location or background.',          grad: 'from-blue-500 to-indigo-600' },
    { n: '02', title: 'Empower Teachers',            desc: 'Give educators powerful tools to create content, track student progress, and deliver better outcomes.',         grad: 'from-emerald-500 to-teal-600' },
    { n: '03', title: 'Personalised Learning Paths', desc: 'Adapt to each student\'s pace and style with customised content, quizzes, and feedback.',                     grad: 'from-violet-500 to-purple-600' },
    { n: '04', title: 'Build Future-Ready Skills',   desc: 'Prepare students for universities and careers with rigorous curriculum and certified achievements.',           grad: 'from-amber-500 to-orange-600' },
  ];

  const TESTI = [
    { name: 'Selam Alemu',   role: 'Grade 12 Student',   text: 'The live classes and instant quiz results helped me improve my scores dramatically. I passed my entrance exam with top marks!', av: 'from-pink-500 to-rose-600' },
    { name: 'Dawit Haile',   role: 'Mathematics Teacher', text: 'Creating lessons and tracking student progress has never been easier. The grading system saves me hours every week.',             av: 'from-blue-500 to-indigo-600' },
    { name: 'Meron Tadesse', role: 'Parent',              text: 'I can see exactly how my child is progressing. Notifications keep me updated on every submission and grade.',                    av: 'from-emerald-500 to-teal-600' },
  ];

  const fadeUp = (i = 0) => ({
    opacity: featInView ? 1 : 0,
    transform: featInView ? 'translateY(0)' : 'translateY(30px)',
    transition: `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`,
  });

  return (
    <div className={`min-h-screen overflow-x-hidden transition-colors duration-300 ${bg}`}>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes floatY {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-14px); }
        }
        @keyframes glowPulse {
          0%,100% { opacity:.3; transform:scale(1); }
          50%     { opacity:.6; transform:scale(1.1); }
        }
        @keyframes rotateSlow {
          from { transform:rotate(0deg); }
          to   { transform:rotate(360deg); }
        }
        @keyframes shimmer {
          0%   { background-position:-200% center; }
          100% { background-position: 200% center; }
        }
        .float-anim { animation: floatY 6s ease-in-out infinite; }
        .glow-anim  { animation: glowPulse 4s ease-in-out infinite; }
        .spin-slow  { animation: rotateSlow 20s linear infinite; }
        .spin-rev   { animation: rotateSlow 15s linear infinite reverse; }
        .shimmer-text {
          background: linear-gradient(90deg,#10b981,#3b82f6,#8b5cf6,#10b981);
          background-size:200% auto;
          -webkit-background-clip:text;
          -webkit-text-fill-color:transparent;
          background-clip:text;
          animation: shimmer 4s linear infinite;
        }
      `}</style>

      {/* ════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">

        {/* BG */}
        <div className={`absolute inset-0 ${dark
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
          : 'bg-gradient-to-br from-blue-50 via-white to-emerald-50'}`} />

        {/* Orbs */}
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl glow-anim ${dark ? 'bg-blue-600/20' : 'bg-blue-400/15'}`} />
        <div className={`absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl glow-anim ${dark ? 'bg-violet-600/20' : 'bg-violet-400/15'}`} style={{ animationDelay: '2s' }} />

        {/* Rings */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border spin-slow ${dark ? 'border-white/5' : 'border-slate-200/60'}`} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border spin-rev ${dark ? 'border-white/5' : 'border-slate-200/60'}`} />

        {/* Floating cards — desktop only */}
        {/* Top-left: quiz score */}
        <div className="absolute top-32 left-8 md:left-24 hidden md:block z-10 float-anim" style={{ animationDelay: '0s' }}>
          <div className={`rounded-2xl p-4 shadow-2xl w-44 border backdrop-blur-sm ${dark ? 'bg-slate-800/80 border-slate-700' : 'bg-white/90 border-slate-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center">
                <FiZap className="w-4 h-4 text-white" />
              </div>
              <span className={`text-xs font-bold ${heading}`}>Quiz Score</span>
            </div>
            <div className={`text-3xl font-black ${heading}`}>95%</div>
            <div className="text-emerald-500 text-xs mt-1">↑ 12% this week</div>
            <div className={`mt-2 h-1.5 rounded-full overflow-hidden ${dark ? 'bg-slate-700' : 'bg-slate-200'}`}>
              <div className="h-full w-[95%] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
            </div>
          </div>
        </div>

        {/* Top-right: students */}
        <div className="absolute top-44 right-8 md:right-24 hidden md:block z-10 float-anim" style={{ animationDelay: '1s' }}>
          <div className={`rounded-2xl p-4 shadow-2xl w-44 border backdrop-blur-sm ${dark ? 'bg-slate-800/80 border-slate-700' : 'bg-white/90 border-slate-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center">
                <FiUsers className="w-4 h-4 text-white" />
              </div>
              <span className={`text-xs font-bold ${heading}`}>Students</span>
            </div>
            <div className={`text-3xl font-black ${heading}`}>500+</div>
            <div className={`text-xs mt-1 ${sub}`}>Active learners</div>
            <div className="flex -space-x-2 mt-2">
              {['bg-pink-500','bg-blue-500','bg-amber-500','bg-violet-500'].map((c,i) => (
                <div key={i} className={`w-6 h-6 rounded-full ${c} border-2 ${dark ? 'border-slate-800' : 'border-white'}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom-left: certificates */}
        <div className="absolute bottom-32 left-8 md:left-32 hidden md:block z-10 float-anim" style={{ animationDelay: '2s' }}>
          <div className={`rounded-2xl p-4 shadow-2xl w-40 border backdrop-blur-sm ${dark ? 'bg-slate-800/80 border-slate-700' : 'bg-white/90 border-slate-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center">
                <FiAward className="w-4 h-4 text-white" />
              </div>
              <span className={`text-xs font-bold ${heading}`}>Certs</span>
            </div>
            <div className={`text-3xl font-black ${heading}`}>120</div>
            <div className={`text-xs mt-1 ${sub}`}>This month</div>
          </div>
        </div>

        {/* Bottom-right: live */}
        <div className="absolute bottom-40 right-8 md:right-28 hidden md:block z-10 float-anim" style={{ animationDelay: '1.5s' }}>
          <div className={`rounded-2xl p-4 shadow-2xl w-40 border backdrop-blur-sm ${dark ? 'bg-slate-800/80 border-slate-700' : 'bg-white/90 border-slate-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-violet-500 flex items-center justify-center">
                <FiVideo className="w-4 h-4 text-white" />
              </div>
              <span className={`text-xs font-bold ${heading}`}>Live Now</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className={`text-sm font-bold ${heading}`}>3 Classes</span>
            </div>
            <div className="text-violet-500 text-xs mt-1">Join now →</div>
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-20 max-w-5xl mx-auto px-4 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-sm font-semibold mb-8"
            style={{ opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease 0.1s' }}>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Ethiopia's #1 Online Tutoring Platform
            <FiStar className="w-4 h-4" />
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-[1.05] tracking-tight"
            style={{ opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.8s ease 0.2s' }}>
            <span className={heading}>Learn Without</span>
            <br />
            <span className="shimmer-text">Limits</span>
          </h1>

          {/* Sub */}
          <p className={`text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed ${sub}`}
            style={{ opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s ease 0.4s' }}>
            Connect with expert teachers. Master any subject. Earn verified certificates.
            Join thousands of Ethiopian students achieving their academic goals with Lihiket.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            style={{ opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s ease 0.6s' }}>
            <Link to="/register"
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-lg transition-all duration-300 hover:-translate-y-1 shadow-xl shadow-emerald-500/25">
              Start Learning Free
              <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login"
              className={`inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl border font-bold text-lg transition-all duration-300 hover:-translate-y-1 ${
                dark
                  ? 'border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/40'
                  : 'border-slate-300 bg-white text-slate-900 hover:bg-slate-50 hover:border-slate-400 shadow-md'
              }`}>
              <FiPlay className="w-5 h-5" />
              Sign In
            </Link>
          </div>

          {/* Trust */}
          <div className={`flex flex-wrap items-center justify-center gap-6 text-sm ${muted}`}
            style={{ opacity: heroLoaded ? 1 : 0, transition: 'all 0.8s ease 0.8s' }}>
            {['✓ Free to start', '✓ No credit card needed', '✓ 500+ students', '✓ Expert teachers'].map(t => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          STATS
      ════════════════════════════════════════════════════════ */}
      <section ref={statsRef} className={`py-20 ${dark ? 'bg-slate-900/50' : 'bg-slate-50 border-y border-slate-100'}`}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard value={500} suffix="+"  label="Active Students"    icon={FiUsers}      color="bg-gradient-to-br from-blue-500 to-indigo-600"   start={statsInView} />
            <StatCard value={50}  suffix="+"  label="Expert Teachers"    icon={FiStar}       color="bg-gradient-to-br from-emerald-500 to-teal-600"  start={statsInView} />
            <StatCard value={100} suffix="+"  label="Courses & Subjects"  icon={FiBookOpen}   color="bg-gradient-to-br from-violet-500 to-purple-600" start={statsInView} />
            <StatCard value={95}  suffix="%"  label="Success Rate"        icon={FiTrendingUp} color="bg-gradient-to-br from-amber-500 to-orange-600"  start={statsInView} />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FEATURES
      ════════════════════════════════════════════════════════ */}
      <section ref={featRef} className={`py-24 px-4 ${bg}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4 border ${dark ? 'bg-violet-500/10 border-violet-500/20 text-violet-400' : 'bg-violet-50 border-violet-200 text-violet-600'}`}>
              Everything You Need
            </span>
            <h2 className={`text-4xl md:text-5xl font-black mb-4 ${heading}`}>
              Powerful Features for<br /><span className="shimmer-text">Modern Learning</span>
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${sub}`}>
              From live classes to smart analytics — every tool designed to help you learn faster.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className={`group p-6 rounded-3xl border transition-all duration-500 hover:-translate-y-2 hover:shadow-xl ${bgCard} ${f.border} ${cardHover}`}
                style={fadeUp(i)}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${f.color} group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className={`font-bold text-lg mb-2 ${heading}`}>{f.title}</h3>
                <p className={`text-sm leading-relaxed ${sub}`}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          GOALS & OBJECTIVES
      ════════════════════════════════════════════════════════ */}
      <section ref={goalsRef} className={`py-24 px-4 ${dark ? 'bg-slate-900/40' : 'bg-slate-50'} border-y ${divider}`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            <div>
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mb-6 border ${dark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
                Our Mission
              </span>
              <h2 className={`text-4xl md:text-5xl font-black mb-4 ${heading}`}>
                Goals &<br /><span className="shimmer-text">Objectives</span>
              </h2>
              <p className={`mb-10 leading-relaxed ${sub}`}>
                Lihiket Tutoring was founded with one clear vision: make quality education accessible to every Ethiopian student, regardless of where they live.
              </p>
              <div className="space-y-6">
                {GOALS.map((g, i) => (
                  <div key={i} className="flex gap-4 group"
                    style={{ opacity: goalsInView ? 1 : 0, transform: goalsInView ? 'translateX(0)' : 'translateX(-30px)', transition: `opacity .6s ease ${i * .15}s, transform .6s ease ${i * .15}s` }}>
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${g.grad} flex items-center justify-center flex-shrink-0 text-xl font-black text-white shadow-lg group-hover:scale-110 transition-transform`}>
                      {g.n}
                    </div>
                    <div>
                      <h4 className={`font-bold mb-1 ${heading}`}>{g.title}</h4>
                      <p className={`text-sm leading-relaxed ${sub}`}>{g.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3D hub visual */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-80 h-80">
                <div className={`absolute inset-0 rounded-full border-2 border-dashed spin-slow ${dark ? 'border-white/10' : 'border-slate-300/60'}`} />
                <div className={`absolute inset-4 rounded-full border spin-rev ${dark ? 'border-white/5' : 'border-slate-200/60'}`} />
                <div className={`absolute inset-8 rounded-3xl border flex flex-col items-center justify-center p-6 shadow-2xl ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/30">
                    <FiBookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div className={`font-black text-2xl ${heading}`}>Lihiket</div>
                  <div className={`text-xs mt-1 ${muted}`}>Online Tutoring</div>
                </div>
                {[
                  { Icon: FiTarget, grad: 'from-blue-500 to-indigo-600',   style: { top: '-16px', left: '50%', marginLeft: '-20px' } },
                  { Icon: FiGlobe,  grad: 'from-emerald-500 to-teal-600',  style: { top: '50%',   right: '-16px', marginTop: '-20px' } },
                  { Icon: FiHeart,  grad: 'from-pink-500 to-rose-600',     style: { bottom: '-16px', left: '50%', marginLeft: '-20px' } },
                  { Icon: FiClock,  grad: 'from-amber-500 to-orange-600',  style: { top: '50%',   left: '-16px', marginTop: '-20px' } },
                ].map(({ Icon, grad, style }, i) => (
                  <div key={i} className="absolute" style={style}>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-lg float-anim`}
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

      {/* ════════════════════════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════════════════════════ */}
      <section ref={testiRef} className={`py-24 px-4 ${bg}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4 border ${dark ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-600'}`}>
              Student Stories
            </span>
            <h2 className={`text-4xl md:text-5xl font-black mb-4 ${heading}`}>
              Loved by Students<br /><span className="shimmer-text">Across Ethiopia</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTI.map((t, i) => (
              <div key={i} className={`p-6 rounded-3xl border shadow-sm ${bgCard}`}
                style={{ opacity: testiInView ? 1 : 0, transform: testiInView ? 'translateY(0)' : 'translateY(20px)', transition: `opacity .6s ease ${i * .15}s, transform .6s ease ${i * .15}s` }}>
                <div className="flex gap-1 mb-3">
                  {[1,2,3,4,5].map(s => <FiStar key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                </div>
                <p className={`text-sm leading-relaxed mb-4 ${sub}`}>"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.av} flex items-center justify-center text-white font-bold text-sm`}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p className={`font-semibold text-sm ${heading}`}>{t.name}</p>
                    <p className={`text-xs ${muted}`}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════════════════════ */}
      <section className={`py-24 px-4 ${dark ? 'bg-slate-900/40' : 'bg-slate-50'} border-y ${divider}`}>
        <div className="max-w-5xl mx-auto text-center">
          <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mb-6 border ${dark ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600'}`}>
            Get Started in Minutes
          </span>
          <h2 className={`text-4xl md:text-5xl font-black mb-4 ${heading}`}>
            How Lihiket <span className="shimmer-text">Works</span>
          </h2>
          <p className={`mb-16 text-lg ${sub}`}>Three simple steps to transform your learning.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className={`hidden md:block absolute top-10 left-[16%] right-[16%] h-px ${dark ? 'bg-gradient-to-r from-blue-500/50 via-violet-500/50 to-emerald-500/50' : 'bg-gradient-to-r from-blue-300 via-violet-300 to-emerald-300'}`} />
            {[
              { step: '1', title: 'Create Account',  desc: 'Sign up free as student, teacher, or parent in under 2 minutes.',        color: 'from-blue-500 to-indigo-600',   glow: 'shadow-blue-500/20' },
              { step: '2', title: 'Choose Subjects', desc: 'Browse subjects, preview teachers, and enroll in courses you need.',      color: 'from-violet-500 to-purple-600', glow: 'shadow-violet-500/20' },
              { step: '3', title: 'Start Learning',  desc: 'Attend live classes, take quizzes, submit work, and track your growth.', color: 'from-emerald-500 to-teal-600',  glow: 'shadow-emerald-500/20' },
            ].map(({ step, title, desc, color, glow }, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${color} flex items-center justify-center text-3xl font-black text-white shadow-2xl ${glow} mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                  {step}
                </div>
                <h3 className={`font-bold text-xl mb-3 ${heading}`}>{title}</h3>
                <p className={`text-sm leading-relaxed ${sub}`}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          CTA
      ════════════════════════════════════════════════════════ */}
      <section className={`py-24 px-4 ${bg}`}>
        <div className="max-w-3xl mx-auto text-center">
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8 border ${dark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
            <FiZap className="w-4 h-4" />
            Free to get started — no credit card required
          </span>
          <h2 className={`text-5xl md:text-6xl font-black mb-6 leading-tight ${heading}`}>
            Your Future Starts<br /><span className="shimmer-text">Today</span>
          </h2>
          <p className={`text-lg mb-10 max-w-xl mx-auto ${sub}`}>
            Join thousands of Ethiopian students who are already achieving their dreams with Lihiket Tutoring.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register"
              className="group inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-lg transition-all duration-300 hover:-translate-y-1 shadow-2xl shadow-emerald-500/25">
              Create Free Account
              <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login"
              className={`inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl border font-bold text-lg transition-all duration-300 hover:-translate-y-0.5 ${
                dark
                  ? 'border-white/20 bg-white/5 text-white hover:bg-white/10'
                  : 'border-slate-300 bg-white text-slate-900 hover:bg-slate-50 shadow-md'
              }`}>
              Sign In
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-10 flex items-center justify-center gap-3">
            <div className="flex -space-x-3">
              {['from-pink-500 to-rose-600','from-blue-500 to-indigo-600','from-emerald-500 to-teal-600','from-amber-500 to-orange-600'].map((g,i) => (
                <div key={i} className={`w-10 h-10 rounded-full bg-gradient-to-br ${g} border-2 ${dark ? 'border-slate-950' : 'border-white'} flex items-center justify-center text-white text-xs font-bold`}>
                  {['S','D','M','A'][i]}
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <FiStar key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}</div>
              <div className={`text-sm ${sub}`}>Trusted by 500+ students</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
