import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../store/theme/ThemeContext';
import {
  FiCheckCircle, FiX, FiZap, FiArrowRight, FiStar,
} from 'react-icons/fi';

const PLANS = [
  {
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    color: '#64748b',
    badge: null,
    desc: 'Perfect for exploring the platform and trying out core features.',
    cta: 'Get Started Free',
    ctaTo: '/register',
    features: [
      { text: 'Access to free courses',         included: true  },
      { text: 'Browse subject catalog',          included: true  },
      { text: 'Basic quiz access',               included: true  },
      { text: 'Community chat',                  included: true  },
      { text: 'Live classes',                    included: false },
      { text: 'Assignment submissions',          included: false },
      { text: 'Certificates',                    included: false },
      { text: 'Progress analytics',              included: false },
      { text: 'Home tutoring requests',          included: false },
      { text: 'Priority support',                included: false },
    ],
  },
  {
    name: 'Student',
    monthlyPrice: 299,
    yearlyPrice: 249,
    color: '#10b981',
    badge: 'Most Popular',
    desc: 'Full access for learners who want structured, certified learning.',
    cta: 'Start Learning',
    ctaTo: '/register',
    features: [
      { text: 'Access to free courses',         included: true  },
      { text: 'Browse subject catalog',          included: true  },
      { text: 'Basic quiz access',               included: true  },
      { text: 'Community chat',                  included: true  },
      { text: 'Live classes',                    included: true  },
      { text: 'Assignment submissions',          included: true  },
      { text: 'Certificates',                    included: true  },
      { text: 'Progress analytics',              included: true  },
      { text: 'Home tutoring requests',          included: false },
      { text: 'Priority support',                included: false },
    ],
  },
  {
    name: 'Pro',
    monthlyPrice: 599,
    yearlyPrice: 499,
    color: '#8b5cf6',
    badge: 'Best Value',
    desc: 'Everything in Student, plus home tutoring and priority support.',
    cta: 'Go Pro',
    ctaTo: '/register',
    features: [
      { text: 'Access to free courses',         included: true  },
      { text: 'Browse subject catalog',          included: true  },
      { text: 'Basic quiz access',               included: true  },
      { text: 'Community chat',                  included: true  },
      { text: 'Live classes',                    included: true  },
      { text: 'Assignment submissions',          included: true  },
      { text: 'Certificates',                    included: true  },
      { text: 'Progress analytics',              included: true  },
      { text: 'Home tutoring requests',          included: true  },
      { text: 'Priority support',                included: true  },
    ],
  },
];

const FAQS = [
  { q: 'Is there a free trial?',           a: 'Yes — the Free plan never expires. You can explore the platform with no credit card required.' },
  { q: 'What currency are prices in?',      a: 'All prices are in Ethiopian Birr (ETB).' },
  { q: 'Can I switch plans later?',         a: 'Absolutely. You can upgrade or downgrade at any time from your profile settings.' },
  { q: 'Are there discounts for schools?',  a: 'Yes. We offer group and institutional pricing. Contact us at info@lihiket.com for a quote.' },
  { q: 'How do I cancel?',                  a: 'You can cancel anytime from your account settings. Your access continues until the end of the billing period.' },
];

function PlanCard({ plan, yearly, delay }) {
  const isPopular = !!plan.badge;
  const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;

  return (
    <motion.div
      className="relative flex flex-col rounded-3xl p-8"
      style={{
        background: isPopular ? `linear-gradient(160deg,rgba(16,185,129,0.1),rgba(16,185,129,0.04))` : 'rgba(255,255,255,0.03)',
        border: isPopular ? '1.5px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.08)',
        boxShadow: isPopular ? '0 0 50px rgba(16,185,129,0.1)' : 'none',
      }}
      initial={{ opacity:0, y:30 }}
      whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true, amount:0.3 }}
      transition={{ duration:0.6, delay }}
    >
      {plan.badge && (
        <div
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1.5"
          style={{ background:'linear-gradient(135deg,#10b981,#0d9488)', boxShadow:'0 4px 16px rgba(16,185,129,0.4)' }}
        >
          <FiStar className="w-3 h-3" /> {plan.badge}
        </div>
      )}

      <div className="mb-6">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background:`${plan.color}18`, border:`1px solid ${plan.color}30` }}>
          <FiZap style={{ color:plan.color, width:20, height:20 }} />
        </div>
        <h3 className="text-xl font-black text-white mb-1">{plan.name}</h3>
        <p className="text-sm leading-relaxed" style={{ color:'#94a3b8' }}>{plan.desc}</p>
      </div>

      <div className="mb-8">
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-black text-white">{price === 0 ? 'Free' : `${price.toLocaleString()}`}</span>
          {price > 0 && <span className="text-sm font-semibold" style={{ color:'#64748b' }}>ETB / mo</span>}
        </div>
        {yearly && price > 0 && (
          <p className="text-xs mt-1" style={{ color:'#34d399' }}>Billed annually — save {(((plan.monthlyPrice - plan.yearlyPrice) / plan.monthlyPrice) * 100).toFixed(0)}%</p>
        )}
      </div>

      <ul className="space-y-3 flex-1 mb-8">
        {plan.features.map((f) => (
          <li key={f.text} className="flex items-center gap-2.5 text-sm" style={{ color: f.included ? '#cbd5e1' : '#334155' }}>
            {f.included
              ? <FiCheckCircle style={{ color: plan.color, width:15, height:15, flexShrink:0 }} />
              : <FiX style={{ color:'#334155', width:15, height:15, flexShrink:0 }} />
            }
            {f.text}
          </li>
        ))}
      </ul>

      <Link to={plan.ctaTo}>
        <motion.div
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm cursor-pointer"
          style={isPopular
            ? { background:'linear-gradient(135deg,#10b981,#0d9488)', color:'#fff', boxShadow:'0 0 20px rgba(16,185,129,0.35)' }
            : { background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'#fff' }
          }
          whileHover={{ scale:1.02, boxShadow: isPopular ? '0 0 36px rgba(16,185,129,0.55)' : 'none' }}
          whileTap={{ scale:0.98 }}
        >
          {plan.cta} <FiArrowRight className="w-4 h-4" />
        </motion.div>
      </Link>
    </motion.div>
  );
}

function FaqItem({ q, a, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      className="rounded-2xl overflow-hidden"
      style={{ border:'1px solid rgba(255,255,255,0.07)' }}
      initial={{ opacity:0, y:20 }}
      whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true, amount:0.4 }}
      transition={{ duration:0.5, delay:index * 0.07 }}
    >
      <button
        className="w-full flex items-center justify-between gap-4 p-5 text-left"
        style={{ background: open ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.02)' }}
        onClick={() => setOpen(o => !o)}
      >
        <span className="font-semibold text-white text-sm">{q}</span>
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration:0.2 }}>
          <FiArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: open ? '#34d399' : '#64748b' }} />
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
            <p className="px-5 pb-5 text-sm leading-relaxed" style={{ color:'#94a3b8' }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function PricingPage() {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const [yearly, setYearly] = useState(false);

  const txt    = dark ? '#f1f5f9' : '#0f172a';
  const txtSub = dark ? '#94a3b8' : '#475569';
  const bg     = dark ? '#020817' : '#f8fafc';
  const bgAlt  = dark ? 'rgba(2,12,30,0.95)' : '#f1f5f9';
  const bdSect = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';

  return (
    <div style={{ background:bg, color:txt, minHeight:'100vh' }}>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-24 pb-16 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ position:'absolute', top:'10%', left:'5%', width:500, height:500, borderRadius:'50%', background:'rgba(16,185,129,0.05)', filter:'blur(80px)' }} />
          <div style={{ position:'absolute', bottom:'0', right:'5%', width:400, height:400, borderRadius:'50%', background:'rgba(139,92,246,0.05)', filter:'blur(80px)' }} />
        </div>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <motion.div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-6 text-sm font-semibold"
            style={{ background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', color:'#34d399' }}
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}
          >
            Simple, Transparent Pricing
          </motion.div>
          <motion.h1
            className="font-black leading-tight mb-4"
            style={{ fontSize:'clamp(2.4rem,6vw,4rem)', color:txt }}
            initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.1 }}
          >
            Pick the plan that{' '}
            <span style={{ background:'linear-gradient(90deg,#34d399,#8b5cf6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              fits you
            </span>
          </motion.h1>
          <motion.p
            className="text-lg leading-relaxed mb-8"
            style={{ color:txtSub }}
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.2 }}
          >
            Start free, upgrade when you're ready. No hidden fees, no credit card required.
          </motion.p>

          {/* Billing toggle */}
          <motion.div
            className="inline-flex items-center gap-3 p-1 rounded-2xl"
            style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}
            initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
          >
            <button
              onClick={() => setYearly(false)}
              className="px-5 py-2 rounded-xl text-sm font-bold transition-all"
              style={{ background: !yearly ? 'rgba(255,255,255,0.1)' : 'transparent', color: !yearly ? '#fff' : '#64748b' }}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className="px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
              style={{ background: yearly ? 'rgba(16,185,129,0.15)' : 'transparent', color: yearly ? '#34d399' : '#64748b' }}
            >
              Yearly
              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background:'rgba(16,185,129,0.2)', color:'#34d399' }}>Save ~17%</span>
            </button>
          </motion.div>

          <motion.div className="flex items-center justify-center gap-2 text-sm mt-6" style={{ color:'#64748b' }}
            initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}>
            <Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link>
            <span>/</span>
            <span style={{ color:'#34d399' }}>Pricing</span>
          </motion.div>
        </div>
      </section>

      {/* ── Plans ────────────────────────────────────────────────────────────── */}
      <section style={{ padding:'2rem 1rem 6rem', borderTop:`1px solid ${bdSect}` }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan, i) => (
            <PlanCard key={plan.name} plan={plan} yearly={yearly} delay={i * 0.1} />
          ))}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section style={{ padding:'5rem 1rem 7rem', background:bgAlt, borderTop:`1px solid ${bdSect}` }}>
        <div className="max-w-2xl mx-auto">
          <motion.div className="text-center mb-10"
            initial={{ opacity:0, y:25 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true, amount:0.4 }} transition={{ duration:0.6 }}>
            <h2 className="text-3xl font-black mb-3" style={{ color:txt }}>Pricing FAQs</h2>
            <p style={{ color:txtSub }}>Quick answers to common billing questions.</p>
          </motion.div>
          <div className="space-y-3">
            {FAQS.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} index={i} />)}
          </div>
          <motion.p className="text-center text-sm mt-8" style={{ color:'#64748b' }}
            initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} transition={{ delay:0.4 }}>
            Still have questions?{' '}
            <Link to="/contact" className="font-semibold transition-colors" style={{ color:'#34d399' }}>Contact us →</Link>
          </motion.p>
        </div>
      </section>
    </div>
  );
}
