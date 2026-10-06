import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../store/theme/ThemeContext';
import {
  FiMail, FiPhone, FiMapPin, FiSend,
  FiFacebook, FiTwitter, FiLinkedin, FiInstagram,
  FiCheckCircle, FiAlertCircle,
} from 'react-icons/fi';

const SUBJECTS = [
  'General Enquiry',
  'Technical Support',
  'Billing & Payments',
  'Partnership Opportunity',
  'School / Institution Pricing',
  'Press & Media',
  'Other',
];

const SOCIALS = [
  { href:'https://www.linkedin.com/in/mekuanit-misganaw-b0aa16384/', icon:FiLinkedin,  label:'LinkedIn',  color:'#0a66c2' },
  { href:'https://t.me/mismarkol',                                     icon:FiSend,      label:'Telegram',  color:'#229ed9' },
  { href:'#facebook',                                                  icon:FiFacebook,  label:'Facebook',  color:'#1877f2' },
  { href:'#twitter',                                                   icon:FiTwitter,   label:'Twitter',   color:'#1da1f2' },
  { href:'#instagram',                                                 icon:FiInstagram, label:'Instagram', color:'#e1306c' },
];

function InputField({ label, id, type='text', required, value, onChange, error }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold mb-1.5" style={{ color:'#94a3b8' }}>
        {label}{required && <span style={{ color:'#f87171' }}> *</span>}
      </label>
      <input
        id={id} type={type} required={required}
        value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
        style={{
          background:'rgba(255,255,255,0.05)',
          border: error ? '1px solid rgba(248,113,113,0.5)' : '1px solid rgba(255,255,255,0.1)',
          color:'#f1f5f9',
        }}
        onFocus={e => { e.target.style.borderColor = '#34d399'; e.target.style.boxShadow = '0 0 0 3px rgba(52,211,153,0.12)'; }}
        onBlur={e  => { e.target.style.borderColor = error ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.1)'; e.target.style.boxShadow='none'; }}
      />
      {error && <p className="text-xs mt-1" style={{ color:'#f87171' }}>{error}</p>}
    </div>
  );
}

export default function ContactPage() {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const [form, setForm]     = useState({ name:'', email:'', subject:SUBJECTS[0], message:'' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [sending, setSending] = useState(false);

  const txt    = dark ? '#f1f5f9' : '#0f172a';
  const txtSub = dark ? '#94a3b8' : '#475569';
  const bg     = dark ? '#020817' : '#f8fafc';
  const bgAlt  = dark ? 'rgba(2,12,30,0.95)' : '#f1f5f9';
  const bdSect = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';

  function validate() {
    const e = {};
    if (!form.name.trim())                          e.name    = 'Name is required.';
    if (!form.email.trim())                         e.email   = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address.';
    if (!form.message.trim())                       e.message = 'Message is required.';
    else if (form.message.trim().length < 20)       e.message = 'Message must be at least 20 characters.';
    return e;
  }

  function handleSet(field) {
    return (val) => {
      setForm(f => ({ ...f, [field]: val }));
      if (errors[field]) setErrors(e => { const n = {...e}; delete n[field]; return n; });
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSending(true);
    // Simulate send — replace with real API call when backend supports it
    await new Promise(r => setTimeout(r, 1200));
    setSending(false);
    setStatus('success');
    setForm({ name:'', email:'', subject:SUBJECTS[0], message:'' });
  }

  return (
    <div style={{ background:bg, color:txt, minHeight:'100vh' }}>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-24 pb-16 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ position:'absolute', top:'5%', left:'5%', width:480, height:480, borderRadius:'50%', background:'rgba(16,185,129,0.05)', filter:'blur(80px)' }} />
          <div style={{ position:'absolute', bottom:'0', right:'5%', width:380, height:380, borderRadius:'50%', background:'rgba(59,130,246,0.05)', filter:'blur(80px)' }} />
        </div>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <motion.div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-6 text-sm font-semibold"
            style={{ background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', color:'#34d399' }}
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}
          >
            <motion.div className="w-2 h-2 rounded-full bg-emerald-400" animate={{ scale:[1,1.4,1] }} transition={{ duration:1.5, repeat:Infinity }} />
            Contact Us
          </motion.div>
          <motion.h1
            className="font-black leading-tight mb-4"
            style={{ fontSize:'clamp(2.4rem,6vw,4rem)', color:txt }}
            initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.1 }}
          >
            We'd love to{' '}
            <span style={{ background:'linear-gradient(90deg,#34d399,#60a5fa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              hear from you
            </span>
          </motion.h1>
          <motion.p className="text-lg leading-relaxed" style={{ color:txtSub }}
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.2 }}>
            Have a question, feedback, or partnership idea? Send us a message and we'll get back to you within 24 hours.
          </motion.p>
          <motion.div className="flex items-center justify-center gap-2 text-sm mt-6" style={{ color:'#64748b' }}
            initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}>
            <Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link>
            <span>/</span>
            <span style={{ color:'#34d399' }}>Contact</span>
          </motion.div>
        </div>
      </section>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <section style={{ padding:'3rem 1rem 7rem', borderTop:`1px solid ${bdSect}` }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* ── Left: info ─────────────────────────────────────────────────── */}
          <motion.div className="lg:col-span-2 space-y-6"
            initial={{ opacity:0, x:-30 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true, amount:0.2 }} transition={{ duration:0.7 }}>

            {[
              { icon:FiMail,   color:'#3b82f6', label:'Email',    value:'info@lihiket.com',        href:'mailto:info@lihiket.com' },
              { icon:FiPhone,  color:'#10b981', label:'Phone',    value:'+251 918 854 070',         href:'tel:+251918854070' },
              { icon:FiMapPin, color:'#f59e0b', label:'Location', value:'Addis Ababa, Ethiopia',    href:null },
            ].map(({ icon:Icon, color, label, value, href }) => (
              <div key={label} className="flex items-start gap-4 p-5 rounded-2xl"
                style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:`${color}15`, border:`1px solid ${color}25` }}>
                  <Icon style={{ color, width:19, height:19 }} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color:'#64748b' }}>{label}</p>
                  {href
                    ? <a href={href} className="font-semibold text-sm transition-colors hover:text-emerald-400" style={{ color:'#f1f5f9' }}>{value}</a>
                    : <p className="font-semibold text-sm" style={{ color:'#f1f5f9' }}>{value}</p>
                  }
                </div>
              </div>
            ))}

            {/* Office hours */}
            <div className="p-5 rounded-2xl" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color:'#64748b' }}>Support Hours (EAT)</p>
              {[
                { day:'Mon – Fri', hours:'8:00 AM – 6:00 PM' },
                { day:'Saturday',  hours:'9:00 AM – 3:00 PM' },
                { day:'Sunday',    hours:'Closed' },
              ].map(({ day, hours }) => (
                <div key={day} className="flex justify-between py-1.5 border-b last:border-none text-sm" style={{ borderColor:'rgba(255,255,255,0.06)' }}>
                  <span style={{ color:'#94a3b8' }}>{day}</span>
                  <span className="font-semibold" style={{ color: hours === 'Closed' ? '#475569' : '#f1f5f9' }}>{hours}</span>
                </div>
              ))}
            </div>

            {/* Social */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color:'#64748b' }}>Follow Us</p>
              <div className="flex items-center gap-2 flex-wrap">
                {SOCIALS.map(({ href, icon:Icon, label, color }) => (
                  <a key={label} href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    aria-label={label}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                    style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}
                    onMouseEnter={e => { e.currentTarget.style.background=`${color}20`; e.currentTarget.style.borderColor=`${color}50`; }}
                    onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; }}>
                    <Icon style={{ color, width:16, height:16 }} />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Right: form ────────────────────────────────────────────────── */}
          <motion.div className="lg:col-span-3"
            initial={{ opacity:0, x:30 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true, amount:0.2 }} transition={{ duration:0.7, delay:0.1 }}>
            <div className="p-8 rounded-3xl" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)' }}>
              <h2 className="text-xl font-black text-white mb-6">Send us a message</h2>

              {status === 'success' ? (
                <motion.div className="text-center py-12"
                  initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.4 }}>
                  <FiCheckCircle className="w-14 h-14 mx-auto mb-4" style={{ color:'#34d399' }} />
                  <h3 className="text-xl font-black text-white mb-2">Message sent!</h3>
                  <p className="text-sm mb-6" style={{ color:'#94a3b8' }}>Thanks for reaching out. We'll get back to you within 24 hours.</p>
                  <button onClick={() => setStatus(null)}
                    className="text-sm font-semibold transition-colors" style={{ color:'#34d399' }}>
                    Send another message →
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InputField label="Full Name" id="name" required value={form.name} onChange={handleSet('name')} error={errors.name} />
                    <InputField label="Email Address" id="email" type="email" required value={form.email} onChange={handleSet('email')} error={errors.email} />
                  </div>

                  {/* Subject select */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold mb-1.5" style={{ color:'#94a3b8' }}>Subject</label>
                    <select id="subject" value={form.subject} onChange={e => setForm(f => ({...f, subject:e.target.value}))}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none cursor-pointer"
                      style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#f1f5f9' }}>
                      {SUBJECTS.map(s => <option key={s} value={s} style={{ background:'#0f172a' }}>{s}</option>)}
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold mb-1.5" style={{ color:'#94a3b8' }}>
                      Message <span style={{ color:'#f87171' }}>*</span>
                    </label>
                    <textarea id="message" rows={5} required
                      value={form.message} onChange={e => handleSet('message')(e.target.value)}
                      placeholder="Tell us how we can help…"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all"
                      style={{
                        background:'rgba(255,255,255,0.05)',
                        border: errors.message ? '1px solid rgba(248,113,113,0.5)' : '1px solid rgba(255,255,255,0.1)',
                        color:'#f1f5f9',
                      }}
                      onFocus={e => { e.target.style.borderColor='#34d399'; e.target.style.boxShadow='0 0 0 3px rgba(52,211,153,0.12)'; }}
                      onBlur={e  => { e.target.style.borderColor=errors.message ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.1)'; e.target.style.boxShadow='none'; }}
                    />
                    {errors.message && <p className="text-xs mt-1" style={{ color:'#f87171' }}>{errors.message}</p>}
                  </div>

                  {status === 'error' && (
                    <div className="flex items-center gap-2 p-3 rounded-xl text-sm" style={{ background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.25)', color:'#f87171' }}>
                      <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                      Something went wrong. Please try again or email us directly.
                    </div>
                  )}

                  <motion.button type="submit" disabled={sending}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white text-sm"
                    style={{ background:'linear-gradient(135deg,#10b981,#0d9488)', boxShadow:'0 0 20px rgba(16,185,129,0.3)', opacity: sending ? 0.7 : 1 }}
                    whileHover={{ scale: sending ? 1 : 1.01 }} whileTap={{ scale: sending ? 1 : 0.99 }}>
                    {sending ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending…</>
                    ) : (
                      <><FiSend className="w-4 h-4" /> Send Message</>
                    )}
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
