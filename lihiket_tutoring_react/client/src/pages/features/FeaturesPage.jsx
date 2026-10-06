import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiVideo, FiBookOpen, FiFileText, FiAward, FiTrendingUp,
  FiShield, FiUsers, FiZap, FiMessageCircle, FiHome,
  FiSearch, FiBell, FiArrowRight, FiCheckCircle,
} from 'react-icons/fi';

const FEATURES = [
  { icon: FiVideo,         title: 'Live Classes',        grad: 'from-emerald-500 to-teal-600',   glow: 'rgba(16,185,129,0.35)',  bullets: ['HD video streaming','Interactive Q&A','Attendance reports','Session recordings'],   desc: 'Real-time interactive sessions with screen sharing, Q&A, and attendance tracking.' },
  { icon: FiBookOpen,      title: 'Course Library',       grad: 'from-blue-500 to-indigo-600',    glow: 'rgba(59,130,246,0.35)',  bullets: ['Video lessons','PDF notes & slides','Progress checkpoints','Offline-friendly docs'], desc: 'Structured courses by subject, grade, and difficulty with video and PDF resources.' },
  { icon: FiZap,           title: 'Smart Quizzes',        grad: 'from-violet-500 to-purple-600',  glow: 'rgba(139,92,246,0.35)', bullets: ['Multiple choice & open-ended','Instant auto-grading','Performance analytics','Retry support'], desc: 'Auto-graded quizzes with instant feedback, score breakdowns, and history.' },
  { icon: FiFileText,      title: 'Assignments',          grad: 'from-amber-500 to-orange-600',   glow: 'rgba(245,158,11,0.35)',  bullets: ['File & text submissions','Deadline reminders','Teacher feedback','Grade history'],    desc: 'Assign work with deadlines. Students submit directly. Feedback returned in one place.' },
  { icon: FiAward,         title: 'Certificates',         grad: 'from-pink-500 to-rose-600',      glow: 'rgba(236,72,153,0.35)', bullets: ['Digitally verifiable','Shareable link','Course & exam certs','Auto-issued'],         desc: 'Verified digital certificates issued on course or exam completion. Shareable.' },
  { icon: FiTrendingUp,    title: 'Progress Analytics',   grad: 'from-cyan-500 to-sky-600',       glow: 'rgba(6,182,212,0.35)',  bullets: ['Student dashboards','Parent visibility','Teacher insights','Weekly summaries'],      desc: 'Dashboards for students, teachers, and parents to track learning outcomes.' },
  { icon: FiHome,          title: 'Home Tutoring',        grad: 'from-orange-500 to-red-500',     glow: 'rgba(249,115,22,0.35)', bullets: ['Verified tutors','Subject filtering','Schedule requests','Addis Ababa coverage'],    desc: 'Request a qualified tutor to come to your home. Browse by subject and availability.' },
  { icon: FiMessageCircle, title: 'Real-time Chat',       grad: 'from-sky-500 to-blue-600',       glow: 'rgba(14,165,233,0.35)', bullets: ['1-on-1 messaging','File sharing','Notification alerts','Message history'],           desc: 'Integrated messaging between students and teachers. Ask questions, share files.' },
  { icon: FiBell,          title: 'Notifications',        grad: 'from-fuchsia-500 to-violet-600', glow: 'rgba(217,70,239,0.35)', bullets: ['In-app alerts','Deadline nudges','Result notifications','Custom preferences'],       desc: 'Stay on top of classes, deadlines, quiz results, and platform announcements.' },
  { icon: FiSearch,        title: 'Smart Search',         grad: 'from-lime-500 to-green-600',     glow: 'rgba(132,204,22,0.35)', bullets: ['Cross-content search','Filter by role & subject','Instant results','Recent history'], desc: 'Find teachers, subjects, courses, and resources in seconds.' },
  { icon: FiUsers,         title: 'Multi-role Platform',  grad: 'from-emerald-500 to-cyan-500',   glow: 'rgba(16,185,129,0.35)', bullets: ['Student dashboard','Teacher tools','Parent visibility','Admin controls'],             desc: 'Purpose-built dashboards for students, teachers, parents, and admins.' },
  { icon: FiShield,        title: 'Security & Privacy',   grad: 'from-indigo-500 to-blue-600',    glow: 'rgba(99,102,241,0.35)', bullets: ['Role-based access','Secure auth (OTP)','Data encryption','GDPR-conscious design'],   desc: 'Role-based access control, secure authentication, and data protection built in.' },
];

function FeatureCard({ icon: Icon, title, grad, glow, desc, bullets, delay }) {
  return (
    <motion.div
      className="relative p-6 rounded-2xl flex flex-col gap-4 overflow-hidden group"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, border: '1px solid rgba(255,255,255,0.14)', boxShadow: `0 0 40px ${glow}` }}
    >
      {/* Glow orb */}
      <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br ${grad}`} />

      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${grad} shadow-lg`}
        style={{ boxShadow: `0 0 20px ${glow}` }}>
        <Icon className="w-5 h-5 text-white" />
      </div>

      <div>
        <h3 className="font-bold text-white text-lg mb-2">{title}</h3>
        <p className="text-sm leading-relaxed mb-4 text-slate-400">{desc}</p>
        <ul className="space-y-1.5">
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-2 text-sm text-slate-300">
              <FiCheckCircle className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
              {b}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export default function FeaturesPage() {
  return (
    <div style={{ background: 'linear-gradient(135deg,#020817 0%,#0a0f1e 50%,#020817 100%)', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-24 pb-20 px-4">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div style={{ position:'absolute', top:'-10%', left:'-5%',  width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle,rgba(16,185,129,0.12) 0%,transparent 70%)', filter:'blur(40px)' }} />
          <div style={{ position:'absolute', bottom:'-10%', right:'-5%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 70%)', filter:'blur(40px)' }} />
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-6 text-sm font-semibold"
            style={{ background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.35)', color:'#34d399' }}
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}
          >
            <motion.div className="w-2 h-2 rounded-full bg-emerald-400" animate={{ scale:[1,1.4,1] }} transition={{ duration:1.5, repeat:Infinity }} />
            Platform Features
          </motion.div>

          <motion.h1
            className="font-black leading-tight mb-5 text-white"
            style={{ fontSize: 'clamp(2.2rem,6vw,3.8rem)' }}
            initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.1 }}
          >
            Everything you need to{' '}
            <span style={{ background:'linear-gradient(90deg,#34d399,#60a5fa,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              teach &amp; learn
            </span>
          </motion.h1>

          <motion.p className="text-lg leading-relaxed mb-8 text-slate-400"
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.2 }}>
            12 powerful features built specifically for Ethiopian students, teachers, and parents — all in one seamless platform.
          </motion.p>

          <motion.div className="flex items-center justify-center gap-2 text-sm text-slate-500"
            initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}>
            <Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-emerald-400">Features</span>
          </motion.div>
        </div>
      </section>

      {/* ── Grid ── */}
      <section className="px-4 pb-24" style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto pt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => <FeatureCard key={f.title} {...f} delay={i * 0.04} />)}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-4 pb-24">
        <motion.div
          className="max-w-2xl mx-auto text-center rounded-3xl p-12"
          style={{ background:'linear-gradient(135deg,rgba(16,185,129,0.12) 0%,rgba(99,102,241,0.1) 100%)', border:'1px solid rgba(16,185,129,0.25)', boxShadow:'0 0 60px rgba(16,185,129,0.08)' }}
          initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true, amount:0.4 }} transition={{ duration:0.7 }}
        >
          <h2 className="text-3xl font-black text-white mb-4">Ready to get started?</h2>
          <p className="text-slate-400 mb-8">Join hundreds of students already using Lihiket to reach their goals.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <motion.div
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-white cursor-pointer"
                style={{ background:'linear-gradient(135deg,#10b981,#0d9488)', boxShadow:'0 0 28px rgba(16,185,129,0.45)' }}
                whileHover={{ boxShadow:'0 0 45px rgba(16,185,129,0.65)', scale:1.02 }} whileTap={{ scale:0.98 }}>
                Create Free Account <FiArrowRight className="w-4 h-4" />
              </motion.div>
            </Link>
            <Link to="/pricing">
              <motion.div
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-white cursor-pointer"
                style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)' }}
                whileHover={{ background:'rgba(255,255,255,0.12)' }} whileTap={{ scale:0.98 }}>
                See Pricing
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
