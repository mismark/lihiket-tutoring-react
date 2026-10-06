import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiX, FiZap, FiArrowRight, FiStar } from 'react-icons/fi';

const PLANS = [
  {
    name: 'Free', monthlyPrice: 0, yearlyPrice: 0,
    grad: 'from-slate-600 to-slate-700', glow: 'rgba(100,116,139,0.3)',
    badge: null, cta: 'Get Started Free', ctaTo: '/register',
    desc: 'Perfect for exploring the platform and trying out core features.',
    features: [
      { text: 'Access to free courses',    included: true  },
      { text: 'Browse subject catalog',     included: true  },
      { text: 'Basic quiz access',          included: true  },
      { text: 'Community chat',             included: true  },
      { text: 'Live classes',               included: false },
      { text: 'Assignment submissions',     included: false },
      { text: 'Certificates',               included: false },
      { text: 'Progress analytics',         included: false },
      { text: 'Home tutoring requests',     included: false },
      { text: 'Priority support',           included: false },
    ],
  },
  {
    name: 'Student', monthlyPrice: 299, yearlyPrice: 249,
    grad: 'from-emerald-500 to-teal-600', glow: 'rgba(16,185,129,0.4)',
    badge: 'Most Popular', cta: 'Start Learning', ctaTo: '/register',
    desc: 'Full access for learners who want structured, certified learning.',
    features: [
      { text: 'Access to free courses',    included: true  },
      { text: 'Browse subject catalog',     included: true  },
      { text: 'Basic quiz access',          included: true  },
      { text: 'Community chat',             included: true  },
      { text: 'Live classes',               included: true  },
      { text: 'Assignment submissions',     included: true  },
      { text: 'Certificates',               included: true  },
      { text: 'Progress analytics',         included: true  },
      { text: 'Home tutoring requests',     included: false },
      { text: 'Priority support',           included: false },
    ],
  },
  {
    name: 'Pro', monthlyPrice: 599, yearlyPrice: 499,
    grad: 'from-violet-500 to-purple-600', glow: 'rgba(139,92,246,0.4)',
    badge: 'Best Value', cta: 'Go Pro', ctaTo: '/register',
    desc: 'Everything in Student, plus home tutoring and priority support.',
    features: [
      { text: 'Access to free courses',    included: true  },
      { text: 'Browse subject catalog',     included: true  },
      { text: 'Basic quiz access',          included: true  },
      { text: 'Community chat',             included: true  },
      { text: 'Live classes',               included: true  },
      { text: 'Assignment submissions',     included: true  },
      { text: 'Certificates',               included: true  },
      { text: 'Progress analytics',         included: true  },
      { text: 'Home tutoring requests',     included: true  },
      { text: 'Priority support',           included: true  },
    ],
  },
];

const FAQS = [
  { q: 'Is there a free trial?',           a: 'Yes — the Free plan never expires. Explore the platform with no credit card required.' },
  { q: 'What currency are prices in?',      a: 'All prices are in Ethiopian Birr (ETB).' },
  { q: 'Can I switch plans later?',         a: 'Absolutely. Upgrade or downgrade any time from your profile settings.' },
  { q: 'Are there discounts for schools?',  a: 'Yes. We offer group and institutional pricing. Contact us at info@lihiket.com for a quote.' },
  { q: 'How do I cancel?',                  a: 'Cancel anytime from your account settings. Access continues until end of billing period.' },
];

function PlanCard({ plan, yearly, delay }) {
  const isPopular = plan.name === 'Student';
  const isPro     = plan.name === 'Pro';
  const price     = yearly ? plan.yearlyPrice : plan.monthlyPrice;

  return (
    <motion.div
      className="relative flex flex-col rounded-3xl p-7 overflow-hidden"
      style={{
        background: isPopular
          ? 'linear-gradient(160deg,rgba(16,185,129,0.15),rgba(13,148,136,0.08))'
          : isPro
          ? 'linear-gradient(160deg,rgba(139,92,246,0.15),rgba(109,40,217,0.08))'
          : 'rgba(255,255,255,0.03)',
        border: isPopular
          ? '1.5px solid rgba(16,185,129,0.45)'
          : isPro
          ? '1.5px solid rgba(139,92,246,0.45)'
          : '1px solid rgba(255,255,255,0.08)',
        boxShadow: isPopular
          ? `0 0 60px ${plan.glow}`
          : isPro
          ? `0 0 60px ${plan.glow}`
          : 'none',
      }}
      initial={{ opacity:0, y:30 }}
      whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true, amount:0.2 }}
      transition={{ duration:0.6, delay }}
      whileHover={{ y: -6 }}
    >
      {/* Top glow blob */}
      <div className={`absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-20 bg-gradient-to-br ${plan.grad}`} />

      {plan.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1.5"
          style={{ background:`linear-gradient(135deg,${isPopular?'#10b981,#0d9488':'#8b5cf6,#7c3aed'})`, boxShadow:`0 4px 16px ${plan.glow}` }}>
          <FiStar className="w-3 h-3" /> {plan.badge}
        </div>
      )}

      {/* Icon */}
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 bg-gradient-to-br ${plan.grad}`}
        style={{ boxShadow:`0 0 20px ${plan.glow}` }}>
        <FiZap className="w-5 h-5 text-white" />
      </div>

      <h3 className="text-xl font-black text-white mb-1">{plan.name}</h3>
      <p className="text-sm text-slate-400 mb-6 leading-relaxed">{plan.desc}</p>

      {/* Price */}
      <div className="mb-7">
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-black text-white">{price === 0 ? 'Free' : price.toLocaleString()}</span>
          {price > 0 && <span className="text-sm font-semibold text-slate-500">ETB / mo</span>}
        </div>
        {yearly && price > 0 && (
          <p className="text-xs mt-1 text-emerald-400">
            Billed annually — save {(((plan.monthlyPrice - plan.yearlyPrice) / plan.monthlyPrice)*100).toFixed(0)}%
          </p>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-3 flex-1 mb-7">
        {plan.features.map(f => (
          <li key={f.text} className={`flex items-center gap-2.5 text-sm ${f.included ? 'text-slate-200' : 'text-slate-600'}`}>
            {f.included
              ? <FiCheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              : <FiX           className="w-4 h-4 flex-shrink-0 text-slate-700" />}
            {f.text}
          </li>
        ))}
      </ul>

      <Link to={plan.ctaTo}>
        <motion.div
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-white cursor-pointer"
          style={isPopular || isPro
            ? { background:`linear-gradient(135deg,${isPopular?'#10b981,#0d9488':'#8b5cf6,#7c3aed'})`, boxShadow:`0 0 24px ${plan.glow}` }
            : { background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.14)' }}
          whileHover={{ scale:1.02, boxShadow:`0 0 36px ${plan.glow}` }}
          whileTap={{ scale:0.98 }}>
          {plan.cta} <FiArrowRight className="w-4 h-4" />
        </motion.div>
      </Link>
    </motion.div>
  );
}

function FaqItem({ q, a, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div className="rounded-2xl overflow-hidden"
      style={{ border: open ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.07)' }}
      initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.45, delay:index*0.07 }}>
      <button className="w-full flex items-center justify-between gap-4 p-5 text-left"
        style={{ background: open ? 'rgba(16,185,129,0.07)' : 'rgba(255,255,255,0.02)' }}
        onClick={() => setOpen(o => !o)}>
        <span className="font-semibold text-white text-sm">{q}</span>
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration:0.2 }}>
          <FiArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: open ? '#34d399' : '#475569' }} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="body" initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.22 }}>
            <p className="px-5 pb-5 text-sm leading-relaxed text-slate-400">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);

  return (
    <div style={{ background:'linear-gradient(135deg,#020817 0%,#0a0f1e 50%,#020817 100%)', minHeight:'100vh' }}>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-24 pb-16 px-4">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div style={{ position:'absolute', top:'-10%', left:'-5%', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle,rgba(16,185,129,0.1) 0%,transparent 70%)', filter:'blur(40px)' }} />
          <div style={{ position:'absolute', bottom:'-10%', right:'-5%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(139,92,246,0.1) 0%,transparent 70%)', filter:'blur(40px)' }} />
        </div>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <motion.div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-6 text-sm font-semibold"
            style={{ background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.35)', color:'#34d399' }}
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}>
            Simple, Transparent Pricing
          </motion.div>

          <motion.h1 className="font-black leading-tight mb-4 text-white"
            style={{ fontSize:'clamp(2.2rem,6vw,3.8rem)' }}
            initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.1 }}>
            Pick the plan that{' '}
            <span style={{ background:'linear-gradient(90deg,#34d399,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              fits you
            </span>
          </motion.h1>

          <motion.p className="text-lg leading-relaxed mb-8 text-slate-400"
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.2 }}>
            Start free, upgrade when you're ready. No hidden fees, no credit card required.
          </motion.p>

          {/* Toggle */}
          <motion.div className="inline-flex items-center gap-1 p-1.5 rounded-2xl"
            style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)' }}
            initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}>
            <button onClick={() => setYearly(false)}
              className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{ background: !yearly ? 'rgba(255,255,255,0.1)' : 'transparent', color: !yearly ? '#fff' : '#64748b' }}>
              Monthly
            </button>
            <button onClick={() => setYearly(true)}
              className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
              style={{ background: yearly ? 'rgba(16,185,129,0.2)' : 'transparent', color: yearly ? '#34d399' : '#64748b' }}>
              Yearly
              <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ background:'rgba(16,185,129,0.2)', color:'#34d399' }}>Save ~17%</span>
            </button>
          </motion.div>

          <motion.div className="flex items-center justify-center gap-2 text-sm mt-6 text-slate-500"
            initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}>
            <Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-emerald-400">Pricing</span>
          </motion.div>
        </div>
      </section>

      {/* ── Plans ── */}
      <section className="px-4 pb-20" style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-5xl mx-auto pt-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan, i) => <PlanCard key={plan.name} plan={plan} yearly={yearly} delay={i*0.1} />)}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-4 pb-24" style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-2xl mx-auto pt-16">
          <motion.div className="text-center mb-10"
            initial={{ opacity:0, y:25 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.6 }}>
            <h2 className="text-3xl font-black text-white mb-3">Pricing FAQs</h2>
            <p className="text-slate-400">Quick answers to common billing questions.</p>
          </motion.div>
          <div className="space-y-3">
            {FAQS.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} index={i} />)}
          </div>
          <motion.p className="text-center text-sm mt-8 text-slate-500"
            initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} transition={{ delay:0.4 }}>
            Still have questions?{' '}
            <Link to="/contact" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">Contact us →</Link>
          </motion.p>
        </div>
      </section>
    </div>
  );
}
