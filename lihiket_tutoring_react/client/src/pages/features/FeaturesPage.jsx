import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../store/theme/ThemeContext';
import {
  FiVideo, FiBookOpen, FiFileText, FiAward, FiTrendingUp,
  FiShield, FiUsers, FiZap, FiMessageCircle, FiHome,
  FiSearch, FiBell, FiArrowRight, FiCheckCircle,
} from 'react-icons/fi';

const FEATURES = [
  {
    icon: FiVideo,
    title: 'Live Classes',
    color: '#10b981',
    desc: 'Real-time interactive sessions with screen sharing, Q&A, and attendance tracking. Teachers and students connect face-to-face from anywhere.',
    bullets: ['HD video streaming', 'Interactive Q&A', 'Attendance reports', 'Session recordings'],
  },
  {
    icon: FiBookOpen,
    title: 'Course Library',
    color: '#3b82f6',
    desc: 'Structured courses organized by subject, grade, and difficulty. Each lesson includes notes, videos, and downloadable resources.',
    bullets: ['Video lessons', 'PDF notes & slides', 'Progress checkpoints', 'Offline-friendly resources'],
  },
  {
    icon: FiZap,
    title: 'Smart Quizzes',
    color: '#8b5cf6',
    desc: 'Auto-graded quizzes with instant feedback, detailed score breakdowns, and performance history over time.',
    bullets: ['Multiple choice & open-ended', 'Instant auto-grading', 'Performance analytics', 'Retry support'],
  },
  {
    icon: FiFileText,
    title: 'Assignments',
    color: '#f59e0b',
    desc: 'Teachers assign work with deadlines. Students submit directly on the platform. Results and feedback returned in one place.',
    bullets: ['File & text submissions', 'Deadline reminders', 'Teacher feedback', 'Grade history'],
  },
  {
    icon: FiAward,
    title: 'Certificates',
    color: '#ec4899',
    desc: 'Verified digital certificates issued upon course or exam completion. Shareable and recognized by schools and employers.',
    bullets: ['Digitally verifiable', 'Shareable link', 'Course & exam certs', 'Auto-issued on completion'],
  },
  {
    icon: FiTrendingUp,
    title: 'Progress Analytics',
    color: '#34d399',
    desc: 'Dashboards for students, teachers, and parents to track learning outcomes, quiz scores, attendance, and more.',
    bullets: ['Student dashboards', 'Parent visibility', 'Teacher insights', 'Weekly summaries'],
  },
  {
    icon: FiHome,
    title: 'Home Tutoring',
    color: '#fb923c',
    desc: 'Request a qualified tutor to come directly to your home. Browse registered tutors by subject, availability, and location.',
    bullets: ['Verified tutors', 'Subject filtering', 'Schedule requests', 'Addis Ababa coverage'],
  },
  {
    icon: FiMessageCircle,
    title: 'Real-time Chat',
    color: '#60a5fa',
    desc: 'Integrated messaging between students and teachers. Ask questions, share files, and stay connected between sessions.',
    bullets: ['1-on-1 messaging', 'File sharing', 'Notification alerts', 'Message history'],
  },
  {
    icon: FiBell,
    title: 'Notifications',
    color: '#a78bfa',
    desc: 'Stay on top of upcoming classes, assignment deadlines, quiz results, and important platform announcements.',
    bullets: ['In-app alerts', 'Deadline nudges', 'Result notifications', 'Custom preferences'],
  },
  {
    icon: FiSearch,
    title: 'Smart Search',
    color: '#f472b6',
    desc: 'Find teachers, subjects, courses, and resources in seconds with a powerful platform-wide search engine.',
    bullets: ['Cross-content search', 'Filter by role & subject', 'Instant results', 'Recent history'],
  },
  {
    icon: FiUsers,
    title: 'Multi-role Platform',
    color: '#10b981',
    desc: 'Purpose-built dashboards for students, teachers, parents, and admins — each role gets exactly what they need.',
    bullets: ['Student dashboard', 'Teacher tools', 'Parent visibility', 'Admin controls'],
  },
  {
    icon: FiShield,
    title: 'Security & Privacy',
    color: '#3b82f6',
    desc: 'Role-based access control, secure authentication, and data protection baked into every layer of the platform.',
    bullets: ['Role-based access', 'Secure auth (OTP)', 'Data encryption', 'GDPR-conscious design'],
  },
];

function FeatureCard({ icon: Icon, title, color, desc, bullets, delay }) {
  return (
    <motion.div
      className="p-7 rounded-2xl flex flex-col gap-4 group"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay }}
      whileHover={{ y: -5, borderColor: `${color}45` }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}
      >
        <Icon style={{ color, width: 22, height: 22 }} />
      </div>
      <div>
        <h3 className="font-bold text-white text-lg mb-2">{title}</h3>
        <p className="text-sm leading-relaxed mb-4" style={{ color: '#94a3b8' }}>{desc}</p>
        <ul className="space-y-1.5">
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-2 text-sm" style={{ color: '#64748b' }}>
              <FiCheckCircle style={{ color, width: 13, height: 13, flexShrink: 0 }} />
              {b}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export default function FeaturesPage() {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const txt    = dark ? '#f1f5f9' : '#0f172a';
  const txtSub = dark ? '#94a3b8' : '#475569';
  const bg     = dark ? '#020817' : '#f8fafc';
  const bgAlt  = dark ? 'rgba(2,12,30,0.95)' : '#f1f5f9';
  const bdSect = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';

  return (
    <div style={{ background: bg, color: txt, minHeight: '100vh' }}>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-24 pb-20 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ position:'absolute', top:'10%', left:'5%', width:500, height:500, borderRadius:'50%', background:'rgba(16,185,129,0.06)', filter:'blur(80px)' }} />
          <div style={{ position:'absolute', bottom:'10%', right:'5%', width:400, height:400, borderRadius:'50%', background:'rgba(99,102,241,0.06)', filter:'blur(80px)' }} />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-6 text-sm font-semibold"
            style={{ background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', color:'#34d399' }}
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}
          >
            <motion.div className="w-2 h-2 rounded-full bg-emerald-400" animate={{ scale:[1,1.4,1] }} transition={{ duration:1.5, repeat:Infinity }} />
            Platform Features
          </motion.div>
          <motion.h1
            className="font-black leading-tight mb-5"
            style={{ fontSize:'clamp(2.4rem,6vw,4rem)', color: txt }}
            initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.1 }}
          >
            Everything you need to{' '}
            <span style={{ background:'linear-gradient(90deg,#34d399,#60a5fa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              teach &amp; learn
            </span>
          </motion.h1>
          <motion.p
            className="text-lg leading-relaxed mb-8"
            style={{ color: txtSub }}
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.2 }}
          >
            12 powerful features built specifically for Ethiopian students, teachers, and parents —
            all in one seamless platform.
          </motion.p>
          <motion.div
            className="flex items-center justify-center gap-2 text-sm"
            style={{ color:'#64748b' }}
            initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
          >
            <Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link>
            <span>/</span>
            <span style={{ color:'#34d399' }}>Features</span>
          </motion.div>
        </div>
      </section>

      {/* ── Feature grid ─────────────────────────────────────────────────────── */}
      <section style={{ padding:'4rem 1rem 7rem', borderTop:`1px solid ${bdSect}` }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={i * 0.05} />
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section style={{ padding:'5rem 1rem', background: bgAlt, borderTop:`1px solid ${bdSect}` }}>
        <motion.div
          className="max-w-2xl mx-auto text-center rounded-3xl p-12"
          style={{ background:'linear-gradient(135deg,rgba(16,185,129,0.1) 0%,rgba(99,102,241,0.08) 100%)', border:'1px solid rgba(16,185,129,0.2)' }}
          initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true, amount:0.4 }} transition={{ duration:0.7 }}
        >
          <h2 className="text-3xl font-black text-white mb-4">Ready to get started?</h2>
          <p className="mb-8" style={{ color:'#94a3b8' }}>Join hundreds of students already using Lihiket to reach their goals.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <motion.div
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-white cursor-pointer"
                style={{ background:'linear-gradient(135deg,#10b981,#0d9488)', boxShadow:'0 0 24px rgba(16,185,129,0.35)' }}
                whileHover={{ boxShadow:'0 0 40px rgba(16,185,129,0.55)', scale:1.02 }} whileTap={{ scale:0.98 }}
              >
                Create Free Account <FiArrowRight className="w-4 h-4" />
              </motion.div>
            </Link>
            <Link to="/pricing">
              <motion.div
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-white cursor-pointer"
                style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.15)' }}
                whileHover={{ background:'rgba(255,255,255,0.1)' }} whileTap={{ scale:0.98 }}
              >
                See Pricing
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
