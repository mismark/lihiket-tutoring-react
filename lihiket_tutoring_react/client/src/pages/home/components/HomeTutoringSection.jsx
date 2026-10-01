import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiHome, FiMapPin, FiStar, FiClock,
  FiArrowRight, FiCheckCircle, FiUsers, FiBook,
} from 'react-icons/fi';

const BENEFITS = [
  { icon: FiHome,   title: 'At Your Home',    desc: 'Tutor comes directly to you',      color: '#10b981' },
  { icon: FiStar,   title: 'Expert Tutors',   desc: 'Verified & experienced teachers',  color: '#3b82f6' },
  { icon: FiClock,  title: 'Flexible Hours',  desc: 'Your schedule, your pace',         color: '#8b5cf6' },
  { icon: FiMapPin, title: 'Easy Location',   desc: 'Share GPS, we find you',           color: '#f59e0b' },
];

const FEATURES = [
  'All grade levels — KG to Grade 12',
  'Mathematics, Physics, Chemistry, English & more',
  'One-on-one personalised sessions',
  'Flexible scheduling — mornings, evenings, weekends',
  'Affordable hourly rates',
  'Tutor assigned within 24 hours',
];

export default function HomeTutoringSection({ dark }) {
  const txt    = dark ? '#f1f5f9' : '#0f172a';
  const txtSub = dark ? '#94a3b8' : '#475569';
  const txtMute= dark ? '#64748b' : '#9ca3af';
  const bgCard = dark ? 'rgba(15,23,42,0.7)' : 'rgba(255,255,255,0.9)';
  const bdCard = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  return (
    <section id="home-tutoring" style={{ padding: '7rem 1rem' }}>
      <div className="max-w-6xl mx-auto">

        {/* ── Header ── */}
        <motion.div className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7 }}>

          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}>
            <FiHome className="w-4 h-4" /> Home Tutoring Available
          </span>

          <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: txt }}>
            Learn from the<br />
            <span style={{ background: 'linear-gradient(90deg,#34d399,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Comfort of Home
            </span>
          </h2>

          <p className="text-lg max-w-2xl mx-auto" style={{ color: txtSub }}>
            Expert tutors come to you. Register now and we'll match you with the right tutor within 24 hours.
          </p>
        </motion.div>

        {/* ── Benefits row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {BENEFITS.map((b, i) => (
            <motion.div key={i} className="p-5 rounded-2xl text-center"
              style={{ background: bgCard, border: `1px solid ${bdCard}` }}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
              <div className="w-11 h-11 rounded-xl mx-auto mb-3 flex items-center justify-center"
                style={{ background: `${b.color}18`, border: `1px solid ${b.color}30` }}>
                <b.icon style={{ color: b.color, width: 20, height: 20 }} />
              </div>
              <p className="font-bold text-sm mb-1" style={{ color: txt }}>{b.title}</p>
              <p className="text-xs leading-relaxed" style={{ color: txtMute }}>{b.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Main CTA card ── */}
        <motion.div
          className="relative rounded-3xl overflow-hidden"
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.8 }}>

          {/* Background */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#0f172a 100%)' }} />
          <div className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at 20% 50%,rgba(16,185,129,0.12),transparent 55%)' }} />
          <div className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at 80% 50%,rgba(59,130,246,0.1),transparent 55%)' }} />

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 p-8 md:p-12">

            {/* Left — text + features */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5"
                style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}>
                <FiUsers className="w-3.5 h-3.5" /> 500+ Students Already Registered
              </div>

              <h3 className="text-3xl font-black text-white mb-3 leading-tight">
                Need a Tutor<br />at Your Door?
              </h3>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Fill in a quick registration form — tell us your grade, subjects, location and schedule.
                We handle the rest and call you within 24 hours.
              </p>

              {/* Feature checklist */}
              <ul className="space-y-2.5 mb-8">
                {FEATURES.map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <FiCheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#34d399' }} />
                    <span className="text-sm text-slate-300">{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-3">
                <Link to="/home-tutoring">
                  <motion.div
                    className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-bold text-base text-white cursor-pointer"
                    style={{ background: 'linear-gradient(135deg,#10b981,#0d9488)', boxShadow: '0 0 28px rgba(16,185,129,0.4)' }}
                    whileHover={{ scale: 1.04, boxShadow: '0 0 44px rgba(16,185,129,0.6)' }}
                    whileTap={{ scale: 0.97 }}>
                    <FiBook className="w-5 h-5" />
                    Register Now
                    <FiArrowRight className="w-4 h-4" />
                  </motion.div>
                </Link>

                <Link to="/home-tutor/register">
                  <motion.div
                    className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-bold text-base cursor-pointer"
                    style={{
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#e2e8f0',
                    }}
                    whileHover={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.25)' }}
                    whileTap={{ scale: 0.97 }}>
                    Learn More
                  </motion.div>
                </Link>
              </div>
            </div>

            {/* Right — info card */}
            <div className="flex items-center justify-center">
              <motion.div className="w-full max-w-sm rounded-2xl p-6"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}
                whileHover={{ borderColor: 'rgba(52,211,153,0.3)' }}
                transition={{ duration: 0.3 }}>

                <div className="flex items-center gap-3 mb-5 pb-4"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(16,185,129,0.15)' }}>
                    <FiHome style={{ color: '#34d399', width: 18, height: 18 }} />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">Home Tutoring</p>
                    <p className="text-xs" style={{ color: '#64748b' }}>Registration takes 2 minutes</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { step: '1', label: 'Fill in the form',         color: '#3b82f6' },
                    { step: '2', label: 'Share your location',      color: '#8b5cf6' },
                    { step: '3', label: 'We call you in 24 hrs',    color: '#f59e0b' },
                    { step: '4', label: 'Tutor arrives at your home', color: '#10b981' },
                  ].map(({ step, label, color }) => (
                    <div key={step} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                        style={{ background: `linear-gradient(135deg,${color},${color}99)` }}>
                        {step}
                      </div>
                      <p className="text-sm font-medium text-slate-300">{label}</p>
                    </div>
                  ))}
                </div>

                <Link to="/home-tutoring"
                  className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg,#10b981,#0d9488)' }}>
                  <FiArrowRight className="w-4 h-4" /> Register for Home Tutoring
                </Link>
              </motion.div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
