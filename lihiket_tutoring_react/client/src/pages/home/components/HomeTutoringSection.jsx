import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiHome, FiMapPin, FiPhone, FiMail, FiUser, FiBook,
  FiClock, FiCalendar, FiCheckCircle, FiX, FiNavigation,
  FiChevronDown, FiStar, FiArrowRight, FiLoader,
} from 'react-icons/fi';
import { useAuth } from '../../../store/auth/AuthContext';
import {
  getHomeTutoringPricing,
  submitHomeTutoringRequest,
} from '../../../api/hometutoring.api';

// ── Grade groups for display ──────────────────────────────────────────────────
const GRADE_GROUPS = [
  { label: 'Kindergarten', grades: ['KG1', 'KG2'], color: '#ec4899', bg: 'rgba(236,72,153,0.1)', bd: 'rgba(236,72,153,0.25)' },
  { label: 'Primary (G1–G6)', grades: ['G1','G2','G3','G4','G5','G6'], color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', bd: 'rgba(59,130,246,0.25)' },
  { label: 'Middle (G7–G9)',  grades: ['G7','G8','G9'],                color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', bd: 'rgba(139,92,246,0.25)' },
  { label: 'High (G10–G12)', grades: ['G10','G11','G12'],              color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', bd: 'rgba(245,158,11,0.25)' },
  { label: 'Higher Level',   grades: ['HL'],                           color: '#10b981', bg: 'rgba(16,185,129,0.1)', bd: 'rgba(16,185,129,0.25)' },
];

const ALL_GRADES = ['KG1','KG2','G1','G2','G3','G4','G5','G6','G7','G8','G9','G10','G11','G12','HL'];

const COMMON_SUBJECTS = [
  'Mathematics','Physics','Chemistry','Biology','English',
  'Amharic','History','Geography','ICT','Economics',
  'Civics','Physical Education','Art',
];

const STATUS_META = {
  pending:   { label: 'Pending Review', color: '#f59e0b' },
  reviewed:  { label: 'Reviewed',       color: '#3b82f6' },
  confirmed: { label: 'Confirmed',      color: '#10b981' },
  assigned:  { label: 'Tutor Assigned', color: '#8b5cf6' },
  cancelled: { label: 'Cancelled',      color: '#ef4444' },
  completed: { label: 'Completed',      color: '#64748b' },
};

const EMPTY_FORM = {
  fullName: '', email: '', phone: '',
  gradeLevel: '', subjects: [],
  hoursPerWeek: 4, preferredSchedule: '',
  startDate: '',
  address: '', city: '',
  location: { lat: null, lng: null },
  mapLink: '',
  message: '',
};

// ── Pricing card ──────────────────────────────────────────────────────────────
function PricingCard({ group, pricing, dark, onSelect }) {
  const prices = group.grades.map(g => pricing[g] ?? 200);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const rangeLabel = minPrice === maxPrice ? `${minPrice}` : `${minPrice}–${maxPrice}`;

  return (
    <motion.div
      className="relative p-6 rounded-2xl border cursor-pointer group"
      style={{ background: group.bg, borderColor: group.bd }}
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      onClick={() => onSelect(group.grades[0])}
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
        style={{ background: `${group.color}20`, border: `1px solid ${group.color}35` }}>
        <FiBook style={{ color: group.color, width: 20, height: 20 }} />
      </div>
      <h4 className="font-bold text-base mb-1" style={{ color: dark ? '#f1f5f9' : '#0f172a' }}>
        {group.label}
      </h4>
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-2xl font-black" style={{ color: group.color }}>
          ETB {rangeLabel}
        </span>
        <span className="text-xs font-medium" style={{ color: dark ? '#64748b' : '#94a3b8' }}>/hr</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {group.grades.map(g => (
          <span key={g} className="px-2 py-0.5 rounded-md text-xs font-bold"
            style={{ background: `${group.color}18`, color: group.color }}>
            {g} — ETB {pricing[g] ?? 200}
          </span>
        ))}
      </div>
      <button
        className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all group-hover:shadow-lg"
        style={{ background: `linear-gradient(135deg, ${group.color}, ${group.color}cc)` }}
        onClick={(e) => { e.stopPropagation(); onSelect(group.grades[0]); }}
      >
        Book a Tutor <FiArrowRight className="inline w-3.5 h-3.5 ml-1" />
      </button>
    </motion.div>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────
export default function HomeTutoringSection({ dark }) {
  const { user } = useAuth();

  // Tokens
  const txt      = dark ? '#f1f5f9'  : '#0f172a';
  const txtSub   = dark ? '#94a3b8'  : '#475569';
  const txtMute  = dark ? '#64748b'  : '#94a3b8';
  const bgCard   = dark ? 'rgba(15,23,42,0.7)' : 'rgba(255,255,255,0.95)';
  const bdCard   = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.09)';
  const inputBg  = dark ? 'rgba(255,255,255,0.05)' : '#f8fafc';
  const inputBd  = dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.12)';
  const inputClr = dark ? '#f1f5f9' : '#0f172a';

  const [pricing, setPricing]         = useState({});
  const [pricingLoaded, setPricingLoaded] = useState(false);
  const [showModal, setShowModal]     = useState(false);
  const [form, setForm]               = useState({ ...EMPTY_FORM });
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [locating, setLocating]       = useState(false);
  const modalRef = useRef();

  // Load pricing on mount
  useEffect(() => {
    getHomeTutoringPricing()
      .then(res => {
        const map = {};
        (res.data || []).forEach(({ grade, pricePerHour }) => { map[grade] = pricePerHour; });
        setPricing(map);
        setPricingLoaded(true);
      })
      .catch(() => {
        // Fallback defaults if API unavailable
        const fallback = {};
        ALL_GRADES.forEach(g => { fallback[g] = 200; });
        setPricing(fallback);
        setPricingLoaded(true);
      });
  }, []);

  // Pre-fill from logged-in student
  useEffect(() => {
    if (user?.role === 'student') {
      setForm(prev => ({
        ...prev,
        fullName: prev.fullName || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
        email:    prev.email    || user.email    || '',
        phone:    prev.phone    || user.phone    || '',
        gradeLevel: prev.gradeLevel || user.gradeLevel || '',
      }));
    }
  }, [user]);

  // Close modal on outside click
  useEffect(() => {
    const handler = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) setShowModal(false);
    };
    if (showModal) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showModal]);

  // Lock body scroll while modal open
  useEffect(() => {
    document.body.style.overflow = showModal ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showModal]);

  const openModal = (grade = '') => {
    setSubmitted(false);
    setForm(prev => ({ ...prev, gradeLevel: grade || prev.gradeLevel }));
    setShowModal(true);
  };

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const toggleSubject = (subj) => {
    setForm(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subj)
        ? prev.subjects.filter(s => s !== subj)
        : [...prev.subjects, subj],
    }));
  };

  // ── Geolocation ──────────────────────────────────────────────────────────────
  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const mapLink = `https://www.google.com/maps?q=${lat},${lng}`;
        setForm(prev => ({ ...prev, location: { lat, lng }, mapLink }));
        toast.success('Location captured successfully!');
        setLocating(false);
      },
      (err) => {
        toast.error(`Could not get location: ${err.message}`);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim()) return toast.error('Full name is required.');
    if (!form.email.trim())    return toast.error('Email is required.');
    if (!form.phone.trim())    return toast.error('Phone number is required.');
    if (!form.gradeLevel)      return toast.error('Please select your grade level.');
    if (!form.address.trim())  return toast.error('Address is required.');

    setSubmitting(true);
    try {
      await submitHomeTutoringRequest(form);
      setSubmitted(true);
      toast.success('Booking submitted! We will contact you within 24 hours.');
    } catch (err) {
      toast.error(err.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = `w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all
    focus:ring-2 focus:ring-emerald-500/40`;
  const inputStyle = { background: inputBg, border: `1px solid ${inputBd}`, color: inputClr };
  const labelStyle = { color: txtSub, fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 };

  return (
    <section id="home-tutoring" style={{ padding: '7rem 1rem' }}>
      <div className="max-w-6xl mx-auto">

        {/* ── Section header ── */}
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
            Our expert tutors come to you. Choose your grade, book a session, and share
            your location — we handle the rest.
          </p>
        </motion.div>

        {/* ── Benefits row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {[
            { icon: FiHome,    title: 'At Your Home',     desc: 'Tutor comes to you',          color: '#10b981' },
            { icon: FiStar,    title: 'Expert Tutors',    desc: 'Verified & experienced',       color: '#3b82f6' },
            { icon: FiClock,   title: 'Flexible Hours',   desc: 'Your schedule, your pace',     color: '#8b5cf6' },
            { icon: FiMapPin,  title: 'Easy Booking',     desc: 'Share location, we find you',  color: '#f59e0b' },
          ].map((b, i) => (
            <motion.div key={i} className="p-4 rounded-2xl text-center"
              style={{ background: bgCard, border: `1px solid ${bdCard}` }}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
              <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
                style={{ background: `${b.color}18`, border: `1px solid ${b.color}30` }}>
                <b.icon style={{ color: b.color, width: 18, height: 18 }} />
              </div>
              <p className="font-bold text-sm mb-0.5" style={{ color: txt }}>{b.title}</p>
              <p className="text-xs" style={{ color: txtMute }}>{b.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Pricing grid ── */}
        <motion.div className="mb-10"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7 }}>
          <h3 className="text-2xl font-black mb-6 text-center" style={{ color: txt }}>
            Pricing Per Grade Level
          </h3>
          {pricingLoaded ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {GRADE_GROUPS.map((group, i) => (
                <PricingCard key={i} group={group} pricing={pricing} dark={dark} onSelect={openModal} />
              ))}
            </div>
          ) : (
            <div className="flex justify-center py-12">
              <FiLoader className="w-8 h-8 animate-spin" style={{ color: '#34d399' }} />
            </div>
          )}
        </motion.div>

        {/* ── CTA button ── */}
        <div className="text-center">
          <motion.button
            className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-lg text-white cursor-pointer"
            style={{ background: 'linear-gradient(135deg,#10b981,#0d9488)', boxShadow: '0 0 30px rgba(16,185,129,0.35)' }}
            whileHover={{ scale: 1.04, boxShadow: '0 0 50px rgba(16,185,129,0.55)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => openModal()}>
            <FiHome className="w-5 h-5" />
            Book a Home Tutor
            <FiArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* ═══════════════════════════ BOOKING MODAL ════════════════════════════ */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto"
            style={{ background: 'rgba(2,8,23,0.75)', backdropFilter: 'blur(6px)', padding: '2rem 1rem' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

            <motion.div ref={modalRef}
              className="relative w-full max-w-2xl rounded-3xl shadow-2xl"
              style={{ background: dark ? '#0f172a' : '#ffffff', border: `1px solid ${bdCard}` }}
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}>

              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4"
                style={{ borderBottom: `1px solid ${bdCard}` }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
                    <FiHome style={{ color: '#34d399', width: 18, height: 18 }} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg" style={{ color: txt }}>Book Home Tutoring</h3>
                    <p className="text-xs" style={{ color: txtMute }}>We'll contact you within 24 hours</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-red-500/15"
                  style={{ color: txtMute }}>
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* ── Success state ── */}
              {submitted ? (
                <div className="flex flex-col items-center text-center px-8 py-14 gap-4">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                      style={{ background: 'rgba(16,185,129,0.15)' }}>
                      <FiCheckCircle style={{ color: '#10b981', width: 40, height: 40 }} />
                    </div>
                  </motion.div>
                  <h3 className="text-2xl font-black" style={{ color: txt }}>Request Submitted!</h3>
                  <p style={{ color: txtSub }}>
                    Thank you, <strong>{form.fullName}</strong>! We've received your home tutoring request
                    and will reach out to <strong>{form.phone}</strong> within 24 hours to confirm your tutor.
                  </p>
                  {form.location.lat && (
                    <a href={form.mapLink} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors hover:opacity-80"
                      style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399' }}>
                      <FiMapPin className="w-4 h-4" /> View your shared location
                    </a>
                  )}
                  <button onClick={() => { setShowModal(false); setSubmitted(false); setForm({ ...EMPTY_FORM }); }}
                    className="mt-2 px-8 py-3 rounded-2xl font-bold text-white"
                    style={{ background: 'linear-gradient(135deg,#10b981,#0d9488)' }}>
                    Done
                  </button>
                </div>
              ) : (
                /* ── Form ── */
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

                  {/* Contact info */}
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest mb-3"
                      style={{ color: '#34d399' }}>Contact Information</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label style={labelStyle}>Full Name *</label>
                        <div className="relative">
                          <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: txtMute }} />
                          <input type="text" placeholder="Abebe Bekele" value={form.fullName}
                            onChange={e => set('fullName', e.target.value)}
                            className={inputClass} style={{ ...inputStyle, paddingLeft: '2.25rem' }} required />
                        </div>
                      </div>
                      <div>
                        <label style={labelStyle}>Phone Number *</label>
                        <div className="relative">
                          <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: txtMute }} />
                          <input type="tel" placeholder="09XXXXXXXX" value={form.phone}
                            onChange={e => set('phone', e.target.value)}
                            className={inputClass} style={{ ...inputStyle, paddingLeft: '2.25rem' }} required />
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <label style={labelStyle}>Email Address *</label>
                        <div className="relative">
                          <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: txtMute }} />
                          <input type="email" placeholder="abebe@example.com" value={form.email}
                            onChange={e => set('email', e.target.value)}
                            className={inputClass} style={{ ...inputStyle, paddingLeft: '2.25rem' }} required />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Academic */}
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest mb-3"
                      style={{ color: '#60a5fa' }}>Academic Details</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label style={labelStyle}>Grade Level *</label>
                        <div className="relative">
                          <FiBook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: txtMute }} />
                          <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: txtMute }} />
                          <select value={form.gradeLevel} onChange={e => set('gradeLevel', e.target.value)}
                            className={inputClass} style={{ ...inputStyle, paddingLeft: '2.25rem', appearance: 'none' }} required>
                            <option value="">Select grade</option>
                            {ALL_GRADES.map(g => (
                              <option key={g} value={g}>
                                {g} {pricing[g] ? `— ETB ${pricing[g]}/hr` : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                        {form.gradeLevel && pricing[form.gradeLevel] && (
                          <p className="text-xs mt-1.5 font-semibold" style={{ color: '#34d399' }}>
                            Price: ETB {pricing[form.gradeLevel]} / hour
                          </p>
                        )}
                      </div>
                      <div>
                        <label style={labelStyle}>Hours per Week</label>
                        <div className="relative">
                          <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: txtMute }} />
                          <input type="number" min="1" max="40" value={form.hoursPerWeek}
                            onChange={e => set('hoursPerWeek', Number(e.target.value))}
                            className={inputClass} style={{ ...inputStyle, paddingLeft: '2.25rem' }} />
                        </div>
                      </div>
                    </div>
                    {/* Subject chips */}
                    <div className="mt-3">
                      <label style={labelStyle}>Subjects Needed</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {COMMON_SUBJECTS.map(s => (
                          <button key={s} type="button"
                            onClick={() => toggleSubject(s)}
                            className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                            style={form.subjects.includes(s)
                              ? { background: '#10b981', color: '#fff', border: '1px solid #10b981' }
                              : { background: inputBg, color: txtSub, border: `1px solid ${inputBd}` }}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest mb-3"
                      style={{ color: '#a78bfa' }}>Schedule Preferences</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label style={labelStyle}>Preferred Start Date</label>
                        <div className="relative">
                          <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: txtMute }} />
                          <input type="date" value={form.startDate}
                            onChange={e => set('startDate', e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className={inputClass} style={{ ...inputStyle, paddingLeft: '2.25rem' }} />
                        </div>
                      </div>
                      <div>
                        <label style={labelStyle}>Preferred Days / Times</label>
                        <input type="text" placeholder="e.g. Mon/Wed afternoons"
                          value={form.preferredSchedule}
                          onChange={e => set('preferredSchedule', e.target.value)}
                          className={inputClass} style={inputStyle} />
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest mb-3"
                      style={{ color: '#f59e0b' }}>Your Location</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label style={labelStyle}>Full Address *</label>
                        <div className="relative">
                          <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: txtMute }} />
                          <input type="text" placeholder="House No., Street, Kebele…"
                            value={form.address} onChange={e => set('address', e.target.value)}
                            className={inputClass} style={{ ...inputStyle, paddingLeft: '2.25rem' }} required />
                        </div>
                      </div>
                      <div>
                        <label style={labelStyle}>City / Sub-city</label>
                        <input type="text" placeholder="e.g. Addis Ababa, Bole"
                          value={form.city} onChange={e => set('city', e.target.value)}
                          className={inputClass} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>GPS Location (optional)</label>
                        <button type="button" onClick={getLocation} disabled={locating}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
                          style={form.location.lat
                            ? { background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#34d399' }
                            : { background: inputBg, border: `1px solid ${inputBd}`, color: txtSub }}>
                          {locating
                            ? <><FiLoader className="w-4 h-4 animate-spin" /> Locating…</>
                            : form.location.lat
                              ? <><FiCheckCircle className="w-4 h-4" /> Location Captured</>
                              : <><FiNavigation className="w-4 h-4" /> Share My Location</>}
                        </button>
                      </div>
                    </div>
                    {form.location.lat && (
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <span className="text-xs px-2 py-1 rounded-lg font-mono"
                          style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399' }}>
                          {form.location.lat.toFixed(5)}, {form.location.lng.toFixed(5)}
                        </span>
                        <a href={form.mapLink} target="_blank" rel="noreferrer"
                          className="text-xs font-semibold hover:underline" style={{ color: '#60a5fa' }}>
                          View on Google Maps ↗
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Extra message */}
                  <div>
                    <label style={labelStyle}>Additional Message (optional)</label>
                    <textarea rows={3} placeholder="Any specific requirements or questions…"
                      value={form.message} onChange={e => set('message', e.target.value)}
                      className={`${inputClass} resize-none`} style={inputStyle} />
                  </div>

                  {/* Submit */}
                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={() => setShowModal(false)}
                      className="flex-1 py-3 rounded-2xl text-sm font-bold transition-all"
                      style={{ background: inputBg, border: `1px solid ${inputBd}`, color: txtSub }}>
                      Cancel
                    </button>
                    <button type="submit" disabled={submitting}
                      className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white transition-all disabled:opacity-60"
                      style={{ background: 'linear-gradient(135deg,#10b981,#0d9488)', boxShadow: '0 0 20px rgba(16,185,129,0.3)' }}>
                      {submitting
                        ? <><FiLoader className="w-4 h-4 animate-spin" /> Submitting…</>
                        : <><FiCheckCircle className="w-4 h-4" /> Submit Booking Request</>}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
