import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../store/theme/ThemeContext';
import {
  FiMapPin, FiClock, FiArrowRight, FiUsers, FiHeart,
  FiZap, FiGlobe, FiAward, FiBookOpen, FiChevronDown,
} from 'react-icons/fi';

const OPENINGS = [
  {
    title: 'Senior Full-Stack Engineer',
    dept: 'Engineering',
    type: 'Full-time',
    location: 'Addis Ababa / Remote',
    color: '#10b981',
    desc: 'Help us scale the Lihiket platform. You\'ll work across the React frontend and Node.js backend, owning key features from design to deployment.',
    reqs: ['3+ years React & Node.js', 'Experience with REST APIs', 'PostgreSQL or MongoDB', 'Good communication skills'],
  },
  {
    title: 'Curriculum Designer',
    dept: 'Education',
    type: 'Full-time',
    location: 'Addis Ababa',
    color: '#3b82f6',
    desc: 'Work with our teachers to structure engaging, outcomes-driven course content for Ethiopian secondary and university students.',
    reqs: ['Background in education or curriculum dev', 'Strong writing & communication', 'Familiarity with Ethiopian curriculum', 'Attention to detail'],
  },
  {
    title: 'Customer Success Specialist',
    dept: 'Support',
    type: 'Full-time',
    location: 'Addis Ababa',
    color: '#f59e0b',
    desc: 'Be the first point of contact for our students and teachers. Help them get the most out of Lihiket and resolve issues quickly and warmly.',
    reqs: ['Excellent Amharic & English', 'Patient and empathetic communication', 'Tech-comfortable', 'Experience in a support or teaching role is a plus'],
  },
  {
    title: 'Subject Matter Expert — Mathematics',
    dept: 'Education',
    type: 'Part-time / Contract',
    location: 'Remote',
    color: '#8b5cf6',
    desc: 'Create and review math content for grades 9-12. This includes lesson notes, quiz questions, and practice exams aligned to the Ethiopian curriculum.',
    reqs: ['Degree in Mathematics or related field', 'Teaching experience preferred', 'Ability to explain complex topics clearly', 'Reliable internet connection'],
  },
  {
    title: 'Marketing & Growth Associate',
    dept: 'Marketing',
    type: 'Full-time',
    location: 'Addis Ababa',
    color: '#ec4899',
    desc: 'Own our social media, content marketing, and community growth. Help us reach more students and teachers across Ethiopia.',
    reqs: ['Experience in digital marketing', 'Strong copywriting skills', 'Social media savvy', 'Knowledge of Ethiopian education landscape is a plus'],
  },
];

const PERKS = [
  { icon: FiHeart,    color:'#ec4899', title:'Mission-Driven',      desc:'Work on something that genuinely improves education for Ethiopian youth.' },
  { icon: FiGlobe,    color:'#3b82f6', title:'Flexible Work',        desc:'Remote-friendly roles and flexible hours that fit your life.' },
  { icon: FiZap,      color:'#f59e0b', title:'Fast-Moving Team',     desc:'Small team, big impact. Your ideas ship quickly and you see results.' },
  { icon: FiUsers,    color:'#10b981', title:'Collaborative Culture', desc:'Supportive teammates who share knowledge and help each other grow.' },
  { icon: FiAward,    color:'#8b5cf6', title:'Learning Budget',       desc:'We invest in your growth with access to courses, books, and events.' },
  { icon: FiBookOpen, color:'#34d399', title:'Free Platform Access',  desc:'Every team member gets full Pro access to the Lihiket platform.' },
];

function OpeningCard({ job, delay }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      className="rounded-2xl overflow-hidden"
      style={{ border: open ? `1px solid ${job.color}35` : '1px solid rgba(255,255,255,0.07)' }}
      initial={{ opacity:0, y:25 }}
      whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true, amount:0.2 }}
      transition={{ duration:0.55, delay }}
    >
      <button
        className="w-full text-left p-6 flex flex-col sm:flex-row sm:items-center gap-4"
        style={{ background: open ? `${job.color}07` : 'rgba(255,255,255,0.02)' }}
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold"
              style={{ background:`${job.color}18`, border:`1px solid ${job.color}30`, color:job.color }}>
              {job.dept}
            </span>
            <span className="flex items-center gap-1 text-xs" style={{ color:'#64748b' }}>
              <FiClock className="w-3 h-3" />{job.type}
            </span>
            <span className="flex items-center gap-1 text-xs" style={{ color:'#64748b' }}>
              <FiMapPin className="w-3 h-3" />{job.location}
            </span>
          </div>
          <h3 className="font-bold text-white text-lg">{job.title}</h3>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration:0.2 }} className="flex-shrink-0">
          <FiChevronDown style={{ color: open ? job.color : '#64748b', width:20, height:20 }} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height:0, opacity:0 }}
            animate={{ height:'auto', opacity:1 }}
            exit={{ height:0, opacity:0 }}
            transition={{ duration:0.25 }}
          >
            <div className="px-6 pb-6">
              <p className="text-sm leading-relaxed mb-5" style={{ color:'#94a3b8' }}>{job.desc}</p>
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color:'#64748b' }}>Requirements</p>
                <ul className="space-y-1.5">
                  {job.reqs.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-sm" style={{ color:'#94a3b8' }}>
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: job.color }} />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
              <Link to="/contact">
                <motion.div
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white cursor-pointer"
                  style={{ background:`linear-gradient(135deg,${job.color},${job.color}bb)`, boxShadow:`0 0 18px ${job.color}30` }}
                  whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}>
                  Apply for this role <FiArrowRight className="w-4 h-4" />
                </motion.div>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function CareersPage() {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const txt    = dark ? '#f1f5f9' : '#0f172a';
  const txtSub = dark ? '#94a3b8' : '#475569';
  const bg     = dark ? '#020817' : '#f8fafc';
  const bgAlt  = dark ? 'rgba(2,12,30,0.95)' : '#f1f5f9';
  const bdSect = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';

  return (
    <div style={{ background:bg, color:txt, minHeight:'100vh' }}>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-24 pb-20 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ position:'absolute', top:'5%', left:'5%', width:500, height:500, borderRadius:'50%', background:'rgba(16,185,129,0.05)', filter:'blur(80px)' }} />
          <div style={{ position:'absolute', bottom:'0', right:'5%', width:400, height:400, borderRadius:'50%', background:'rgba(236,72,153,0.05)', filter:'blur(80px)' }} />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-6 text-sm font-semibold"
            style={{ background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', color:'#34d399' }}
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}
          >
            <motion.div className="w-2 h-2 rounded-full bg-emerald-400" animate={{ scale:[1,1.4,1] }} transition={{ duration:1.5, repeat:Infinity }} />
            We're Hiring
          </motion.div>
          <motion.h1
            className="font-black leading-tight mb-5"
            style={{ fontSize:'clamp(2.4rem,6vw,4rem)', color:txt }}
            initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.1 }}
          >
            Build the future of{' '}
            <span style={{ background:'linear-gradient(90deg,#34d399,#ec4899)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              Ethiopian education
            </span>
          </motion.h1>
          <motion.p className="text-lg leading-relaxed mb-8" style={{ color:txtSub }}
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.2 }}>
            We're a small, passionate team on a big mission. Join us and help make
            quality education accessible to every student in Ethiopia.
          </motion.p>
          <motion.div className="flex items-center justify-center gap-2 text-sm" style={{ color:'#64748b' }}
            initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}>
            <Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link>
            <span>/</span>
            <span style={{ color:'#34d399' }}>Careers</span>
          </motion.div>
        </div>
      </section>

      {/* ── Perks ────────────────────────────────────────────────────────────── */}
      <section style={{ padding:'4rem 1rem', background:bgAlt, borderTop:`1px solid ${bdSect}`, borderBottom:`1px solid ${bdSect}` }}>
        <div className="max-w-5xl mx-auto">
          <motion.p className="text-center text-xs font-bold uppercase tracking-widest mb-10" style={{ color:'#64748b' }}
            initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}>
            Why work at Lihiket
          </motion.p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PERKS.map(({ icon:Icon, color, title, desc }, i) => (
              <motion.div key={title} className="p-5 rounded-2xl"
                style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}
                initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true, amount:0.3 }}
                transition={{ duration:0.5, delay:i * 0.07 }}
                whileHover={{ y:-3, borderColor:`${color}30` }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background:`${color}15`, border:`1px solid ${color}25` }}>
                  <Icon style={{ color, width:20, height:20 }} />
                </div>
                <h4 className="font-bold text-white text-sm mb-1">{title}</h4>
                <p className="text-xs leading-relaxed" style={{ color:'#94a3b8' }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Open roles ───────────────────────────────────────────────────────── */}
      <section style={{ padding:'5rem 1rem 7rem' }}>
        <div className="max-w-3xl mx-auto">
          <motion.div className="text-center mb-12"
            initial={{ opacity:0, y:25 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true, amount:0.4 }} transition={{ duration:0.6 }}>
            <h2 className="text-3xl font-black mb-3" style={{ color:txt }}>Open Positions</h2>
            <p style={{ color:txtSub }}>Click any role to see full details and how to apply.</p>
          </motion.div>
          <div className="space-y-4">
            {OPENINGS.map((job, i) => <OpeningCard key={job.title} job={job} delay={i * 0.06} />)}
          </div>

          <motion.div className="mt-14 text-center p-8 rounded-2xl"
            style={{ background:'rgba(16,185,129,0.05)', border:'1px solid rgba(16,185,129,0.15)' }}
            initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true, amount:0.5 }} transition={{ duration:0.6 }}>
            <p className="font-bold text-white mb-1">Don't see a role that fits?</p>
            <p className="text-sm mb-5" style={{ color:'#94a3b8' }}>
              We're always looking for great people. Send us your CV and a short note about what you'd bring to the team.
            </p>
            <a href="mailto:careers@lihiket.com">
              <motion.div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white cursor-pointer"
                style={{ background:'linear-gradient(135deg,#10b981,#0d9488)', boxShadow:'0 0 20px rgba(16,185,129,0.3)' }}
                whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}>
                Send an Open Application <FiArrowRight className="w-4 h-4" />
              </motion.div>
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
