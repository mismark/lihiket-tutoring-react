import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../store/theme/ThemeContext';
import { FiChevronDown, FiSearch } from 'react-icons/fi';

const CATEGORIES = [
  {
    label: 'Getting Started',
    color: '#10b981',
    items: [
      { q: 'What is Lihiket?',                  a: 'Lihiket is Ethiopia\'s online tutoring platform. It connects students with expert teachers for live classes, assignments, quizzes, and certified learning — all in one place.' },
      { q: 'Is Lihiket free to use?',            a: 'Yes. You can sign up for free and access basic features at no cost. Paid plans unlock live classes, certificates, and more.' },
      { q: 'Who can use Lihiket?',               a: 'Students of all ages, their parents, and qualified teachers across Ethiopia. There is also an admin role for school or institution management.' },
      { q: 'How do I create an account?',        a: 'Click "Sign Up" on the homepage, enter your name and email, verify your account via OTP, and you\'re ready to go.' },
      { q: 'Is there a mobile app?',             a: 'Lihiket is a Progressive Web App (PWA). You can install it directly from your browser on Android or iOS — no app store required.' },
    ],
  },
  {
    label: 'For Students',
    color: '#3b82f6',
    items: [
      { q: 'How do I enroll in a course?',       a: 'Browse the subject catalog, pick a course, and click Enroll. Free courses are instantly accessible; paid courses require an active subscription.' },
      { q: 'Can I access courses offline?',      a: 'PDF notes and documents can be downloaded for offline reading. Live classes and videos require an internet connection.' },
      { q: 'How are quizzes graded?',            a: 'Multiple-choice questions are auto-graded instantly. Open-ended questions are reviewed and graded by your teacher.' },
      { q: 'How do I get a certificate?',        a: 'Complete all lessons and pass the final exam for a course. Your certificate is automatically issued and available to share.' },
      { q: 'Can my parents see my progress?',    a: 'Yes. Parents can create a linked account to view their child\'s progress, grades, and attendance from a dedicated dashboard.' },
    ],
  },
  {
    label: 'For Teachers',
    color: '#8b5cf6',
    items: [
      { q: 'How do I become a teacher on Lihiket?',  a: 'Register with the Teacher role, complete your profile, and await approval from the admin. Once approved you can create subjects and courses.' },
      { q: 'Can I set my own schedule for live classes?', a: 'Yes. You schedule live classes at your preferred time and students are notified automatically.' },
      { q: 'How do I create assignments?',           a: 'Inside any subject, navigate to Assignments and click Create. Set a title, deadline, and instructions. Students will see it immediately.' },
      { q: 'Can I message my students directly?',    a: 'Yes. The integrated chat system lets you message any student enrolled in your subjects.' },
      { q: 'How do I track student performance?',    a: 'Your Teacher Dashboard shows quiz scores, assignment submissions, attendance rates, and overall progress for every student.' },
    ],
  },
  {
    label: 'Payments & Plans',
    color: '#f59e0b',
    items: [
      { q: 'What payment methods are accepted?',    a: 'We accept Ethiopian mobile wallets (Telebirr, CBE Birr) and bank transfers. More payment methods are being added.' },
      { q: 'Can I cancel my subscription?',         a: 'Yes, at any time from your Account Settings. Access continues until the end of the billing period.' },
      { q: 'Are there discounts for schools?',      a: 'Yes. We offer institutional pricing for schools and tutoring centers. Email info@lihiket.com for a custom quote.' },
      { q: 'Is my payment information secure?',     a: 'Absolutely. We do not store card details on our servers. All payment processing is handled by certified payment processors.' },
    ],
  },
  {
    label: 'Technical',
    color: '#ec4899',
    items: [
      { q: 'Which browsers are supported?',         a: 'Lihiket works on all modern browsers — Chrome, Firefox, Safari, and Edge. We recommend Chrome for the best experience.' },
      { q: 'What internet speed do I need?',        a: 'For live classes, a connection of 2 Mbps or faster is recommended. Text-based features like quizzes work on slower connections.' },
      { q: 'I forgot my password. What do I do?',   a: 'Click "Forgot Password" on the login page, enter your email, and follow the OTP verification steps to set a new password.' },
      { q: 'How do I report a bug or issue?',        a: 'Use the Contact page or email support@lihiket.com. Include a screenshot and description of the issue for the fastest resolution.' },
    ],
  },
];

function FaqItem({ q, a, color, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      className="rounded-xl overflow-hidden"
      style={{ border: open ? `1px solid ${color}30` : '1px solid rgba(255,255,255,0.06)' }}
      initial={{ opacity:0, y:15 }}
      whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true, amount:0.3 }}
      transition={{ duration:0.4, delay:index * 0.05 }}
    >
      <button
        className="w-full flex items-start justify-between gap-4 p-5 text-left"
        style={{ background: open ? `${color}08` : 'rgba(255,255,255,0.02)' }}
        onClick={() => setOpen(o => !o)}
      >
        <span className="font-semibold text-white text-sm leading-snug">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration:0.2 }} className="flex-shrink-0 mt-0.5">
          <FiChevronDown style={{ color: open ? color : '#64748b', width:16, height:16 }} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height:0, opacity:0 }}
            animate={{ height:'auto', opacity:1 }}
            exit={{ height:0, opacity:0 }}
            transition={{ duration:0.22 }}
          >
            <p className="px-5 pb-5 text-sm leading-relaxed" style={{ color:'#94a3b8' }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQPage() {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const txt    = dark ? '#f1f5f9' : '#0f172a';
  const txtSub = dark ? '#94a3b8' : '#475569';
  const bg     = dark ? '#020817' : '#f8fafc';
  const bgAlt  = dark ? 'rgba(2,12,30,0.95)' : '#f1f5f9';
  const bdSect = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';

  const lq = query.toLowerCase().trim();
  const searchResults = lq
    ? CATEGORIES.flatMap(c => c.items.filter(i => i.q.toLowerCase().includes(lq) || i.a.toLowerCase().includes(lq)).map(i => ({ ...i, color: c.color })))
    : null;

  return (
    <div style={{ background:bg, color:txt, minHeight:'100vh' }}>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-24 pb-16 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ position:'absolute', top:'5%', left:'5%', width:480, height:480, borderRadius:'50%', background:'rgba(59,130,246,0.05)', filter:'blur(80px)' }} />
          <div style={{ position:'absolute', bottom:'0', right:'5%', width:380, height:380, borderRadius:'50%', background:'rgba(16,185,129,0.05)', filter:'blur(80px)' }} />
        </div>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <motion.div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-6 text-sm font-semibold"
            style={{ background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.3)', color:'#60a5fa' }}
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}
          >
            Frequently Asked Questions
          </motion.div>
          <motion.h1
            className="font-black leading-tight mb-4"
            style={{ fontSize:'clamp(2.4rem,6vw,4rem)', color:txt }}
            initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.1 }}
          >
            How can we{' '}
            <span style={{ background:'linear-gradient(90deg,#60a5fa,#34d399)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              help you?
            </span>
          </motion.h1>
          <motion.p className="text-lg leading-relaxed mb-8" style={{ color:txtSub }}
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.2 }}>
            Find answers to the most common questions about Lihiket.
          </motion.p>

          {/* Search */}
          <motion.div className="relative max-w-md mx-auto"
            initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.3 }}>
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:'#64748b' }} />
            <input
              type="text"
              placeholder="Search questions…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm font-medium outline-none transition-all"
              style={{
                background:'rgba(255,255,255,0.05)',
                border:'1px solid rgba(255,255,255,0.1)',
                color:'#f1f5f9',
              }}
            />
          </motion.div>

          <motion.div className="flex items-center justify-center gap-2 text-sm mt-6" style={{ color:'#64748b' }}
            initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}>
            <Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link>
            <span>/</span>
            <span style={{ color:'#34d399' }}>FAQ</span>
          </motion.div>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <section style={{ padding:'2rem 1rem 7rem', borderTop:`1px solid ${bdSect}` }}>
        <div className="max-w-3xl mx-auto">

          {searchResults ? (
            /* Search results */
            <div>
              <p className="text-sm mb-6" style={{ color:'#64748b' }}>
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{query}"
              </p>
              {searchResults.length > 0
                ? <div className="space-y-3">{searchResults.map((r, i) => <FaqItem key={i} q={r.q} a={r.a} color={r.color} index={i} />)}</div>
                : <p className="text-center py-16" style={{ color:'#64748b' }}>No results found. Try a different search term.</p>
              }
            </div>
          ) : (
            /* Tabbed categories */
            <div>
              {/* Tab bar */}
              <div className="flex flex-wrap gap-2 mb-8">
                {CATEGORIES.map((c, i) => (
                  <button key={c.label} onClick={() => setActiveTab(i)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: activeTab === i ? `${c.color}18` : 'rgba(255,255,255,0.04)',
                      border: activeTab === i ? `1px solid ${c.color}40` : '1px solid rgba(255,255,255,0.07)',
                      color: activeTab === i ? c.color : '#64748b',
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Items */}
              <AnimatePresence mode="wait">
                <motion.div key={activeTab}
                  className="space-y-3"
                  initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
                  transition={{ duration:0.2 }}>
                  {CATEGORIES[activeTab].items.map((item, i) => (
                    <FaqItem key={i} q={item.q} a={item.a} color={CATEGORIES[activeTab].color} index={i} />
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {/* Still have questions */}
          <motion.div className="mt-14 text-center p-8 rounded-2xl"
            style={{ background:'rgba(16,185,129,0.05)', border:'1px solid rgba(16,185,129,0.15)' }}
            initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true, amount:0.5 }} transition={{ duration:0.6 }}>
            <p className="font-bold text-white mb-1">Didn't find your answer?</p>
            <p className="text-sm mb-5" style={{ color:'#94a3b8' }}>Our team is happy to help. Reach out and we'll respond within 24 hours.</p>
            <Link to="/contact">
              <motion.div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white cursor-pointer"
                style={{ background:'linear-gradient(135deg,#10b981,#0d9488)', boxShadow:'0 0 20px rgba(16,185,129,0.3)' }}
                whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}>
                Contact Support
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
