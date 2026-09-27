import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiHome, FiMapPin, FiPhone, FiMail, FiUser, FiBook,
  FiClock, FiCalendar, FiCheckCircle, FiX, FiNavigation,
  FiStar, FiArrowRight, FiLoader, FiSearch,
} from 'react-icons/fi';
import { useAuth } from '../../../store/auth/AuthContext';
import { getActiveSubjects } from '../../../api/hometutorsubject.api';
import { createBooking }     from '../../../api/hometutorsubject.api';

// ── Grade colour palette ──────────────────────────────────────────────────────
const GRADE_COLORS = {
  KG1:'#ec4899', KG2:'#ec4899',
  G1:'#3b82f6',  G2:'#3b82f6',  G3:'#3b82f6',
  G4:'#8b5cf6',  G5:'#8b5cf6',  G6:'#8b5cf6',
  G7:'#f59e0b',  G8:'#f59e0b',  G9:'#f59e0b',
  G10:'#10b981', G11:'#10b981', G12:'#10b981',
  HL:'#06b6d4',
};

const EMPTY_FORM = {
  fullName:'', email:'', phone:'',
  hoursPerWeek: 4, preferredSchedule:'',
  startDate:'',
  address:'', city:'',
  location:{ lat:null, lng:null },
  mapLink:'',
  message:'',
};

// ── Hotel-style subject card (same look as SubjectsList.jsx) ──────────────────
function SubjectCard({ subject, onBook, onDetail }) {
  const color  = GRADE_COLORS[subject.gradeLevel] || '#10b981';
  const rating = (4.2 + ((subject.pricePerHour % 10) / 25)).toFixed(1);

  return (
    <motion.div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{ background:'#ffffff', border:'1px solid #e5e7eb', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}
      whileHover={{ y:-3, boxShadow:'0 8px 24px rgba(0,0,0,0.12)' }}
      transition={{ type:'spring', stiffness:300, damping:24 }}>

      {/* Photo */}
      <div className="relative w-full overflow-hidden" style={{ height:190 }}>
        {subject.imageUrl ? (
          <img src={subject.imageUrl} alt={subject.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background:`linear-gradient(135deg,${color}28,${color}0a)` }}>
            <FiBook style={{ color, width:56, height:56, opacity:0.22 }} />
          </div>
        )}
        {/* Rating badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1.5 rounded-full"
          style={{ background:'rgba(28,28,28,0.76)', backdropFilter:'blur(6px)' }}>
          <FiStar className="w-3 h-3" style={{ color:'#f59e0b', fill:'#f59e0b' }} />
          <span className="text-xs font-bold text-white">{rating}</span>
        </div>
        {/* Grade badge */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold"
          style={{ background:`${color}e0`, color:'#fff' }}>
          {subject.gradeLevel}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pt-3 pb-1">
        <h3 className="font-bold text-base leading-tight mb-0.5" style={{ color:'#111827' }}>
          {subject.name}
        </h3>
        <div className="flex items-center gap-1 text-xs mb-2" style={{ color:'#6b7280' }}>
          <FiMapPin className="w-3 h-3 flex-shrink-0" />
          <span>{subject.category} · Home Tutoring, Ethiopia</span>
        </div>

        {/* Price + Book Now */}
        <div className="flex items-center justify-between py-2.5"
          style={{ borderTop:'1px solid #f3f4f6' }}>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black" style={{ color:'#111827' }}>
              {subject.pricePerHour.toLocaleString()} ETB
            </span>
            <span className="text-xs font-medium" style={{ color:'#9ca3af' }}>/hour</span>
          </div>
          <button onClick={() => onBook(subject)}
            className="px-4 py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background:'linear-gradient(135deg,#d97706,#b45309)', minWidth:90 }}>
            Book Now
          </button>
        </div>
      </div>

      {/* View details */}
      <div className="px-4 pb-3" style={{ borderTop:'1px solid #f3f4f6' }}>
        <button onClick={() => onDetail(subject)}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors hover:text-emerald-600"
          style={{ color:'#6b7280' }}>
          <FiSearch className="w-3.5 h-3.5" />
          View details
          <FiArrowRight className="w-3.5 h-3.5" style={{ transform:'rotate(-45deg)' }} />
        </button>
      </div>
    </motion.div>
  );
}

// ── Booking modal ─────────────────────────────────────────────────────────────
function BookingModal({ subject, dark, onClose }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    ...EMPTY_FORM,
    fullName: user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '',
    email:    user?.email || '',
    phone:    user?.phone || '',
  });
  const [locating,   setLocating]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const modalRef = useRef();

  const txt      = dark ? '#f1f5f9' : '#0f172a';
  const txtSub   = dark ? '#94a3b8' : '#475569';
  const txtMute  = dark ? '#64748b' : '#94a3b8';
  const inputBg  = dark ? 'rgba(255,255,255,0.05)' : '#f8fafc';
  const inputBd  = dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.12)';
  const bdCard   = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const color    = GRADE_COLORS[subject.gradeLevel] || '#10b981';

  const set = (k, v) => setForm(p => ({ ...p, [k]:v }));
  const iCls = 'w-full px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/40';
  const iSty = { background:inputBg, border:`1px solid ${inputBd}`, color:txt };
  const lSty = { color:txtSub, fontSize:'0.75rem', fontWeight:600, display:'block', marginBottom:4 };

  // close on outside click
  useEffect(() => {
    const h = e => { if (modalRef.current && !modalRef.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  // lock scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const getGPS = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported.');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude:lat, longitude:lng } = pos.coords;
        setForm(p => ({ ...p, location:{ lat, lng }, mapLink:`https://www.google.com/maps?q=${lat},${lng}` }));
        toast.success('Location captured!');
        setLocating(false);
      },
      err => { toast.error(`Location error: ${err.message}`); setLocating(false); },
      { enableHighAccuracy:true, timeout:10000 }
    );
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.fullName.trim()) return toast.error('Full name is required.');
    if (!form.email.trim())    return toast.error('Email is required.');
    if (!form.phone.trim())    return toast.error('Phone is required.');
    if (!form.address.trim())  return toast.error('Address is required.');
    setSubmitting(true);
    try {
      await createBooking({ subjectId: subject._id, ...form });
      setSubmitted(true);
      toast.success('Booking submitted!');
    } catch (err) {
      toast.error(err.message || 'Failed to submit booking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto"
      style={{ background:'rgba(2,8,23,0.75)', backdropFilter:'blur(6px)', padding:'2rem 1rem' }}>
      <motion.div ref={modalRef} className="w-full max-w-lg rounded-3xl shadow-2xl my-4"
        style={{ background: dark ? '#0f172a' : '#ffffff', border:`1px solid ${bdCard}` }}
        initial={{ opacity:0, y:50, scale:0.96 }}
        animate={{ opacity:1, y:0,  scale:1    }}
        exit={{ opacity:0, y:30, scale:0.97 }}
        transition={{ type:'spring', stiffness:260, damping:28 }}>

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4"
          style={{ borderBottom:`1px solid ${bdCard}` }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background:`${color}18`, border:`1px solid ${color}30` }}>
              <FiBook style={{ color, width:18, height:18 }} />
            </div>
            <div>
              <h3 className="font-black text-base" style={{ color:txt }}>Book: {subject.name}</h3>
              <p className="text-xs mt-0.5" style={{ color:txtMute }}>
                {subject.gradeLevel} · ETB {subject.pricePerHour}/hr · Home visit
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-500/10 flex-shrink-0">
            <FiX className="w-5 h-5" style={{ color:'#ef4444' }} />
          </button>
        </div>

        {/* Success */}
        {submitted ? (
          <div className="flex flex-col items-center text-center px-8 py-12 gap-4">
            <motion.div initial={{ scale:0 }} animate={{ scale:1 }}
              transition={{ type:'spring', stiffness:300, damping:20 }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-2"
                style={{ background:'rgba(16,185,129,0.12)' }}>
                <FiCheckCircle style={{ color:'#10b981', width:40, height:40 }} />
              </div>
            </motion.div>
            <h3 className="text-xl font-black" style={{ color:txt }}>Booking Submitted!</h3>
            <p className="text-sm" style={{ color:txtSub }}>
              We received your booking for <strong>{subject.name}</strong>. Our team will call
              <strong> {form.phone}</strong> within 24 hours to confirm.
            </p>
            {form.mapLink && (
              <a href={form.mapLink} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
                style={{ color:'#60a5fa' }}>
                <FiMapPin className="w-4 h-4" /> View shared location ↗
              </a>
            )}
            <button onClick={onClose}
              className="mt-2 px-8 py-3 rounded-2xl font-bold text-white"
              style={{ background:'linear-gradient(135deg,#10b981,#0d9488)' }}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

            {/* Contact */}
            <div>
              <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color:'#34d399' }}>Contact Info</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label style={lSty}>Full Name *</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:txtMute }} />
                    <input value={form.fullName} onChange={e => set('fullName', e.target.value)}
                      placeholder="Abebe Bekele" className={iCls}
                      style={{ ...iSty, paddingLeft:'2.25rem' }} required />
                  </div>
                </div>
                <div>
                  <label style={lSty}>Phone *</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:txtMute }} />
                    <input value={form.phone} onChange={e => set('phone', e.target.value)}
                      placeholder="09XXXXXXXX" className={iCls}
                      style={{ ...iSty, paddingLeft:'2.25rem' }} required />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label style={lSty}>Email *</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:txtMute }} />
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                      placeholder="abebe@example.com" className={iCls}
                      style={{ ...iSty, paddingLeft:'2.25rem' }} required />
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div>
              <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color:'#a78bfa' }}>Schedule</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={lSty}>Hours / Week</label>
                  <div className="relative">
                    <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:txtMute }} />
                    <input type="number" min="1" max="40" value={form.hoursPerWeek}
                      onChange={e => set('hoursPerWeek', Number(e.target.value))}
                      className={iCls} style={{ ...iSty, paddingLeft:'2.25rem' }} />
                  </div>
                </div>
                <div>
                  <label style={lSty}>Start Date</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:txtMute }} />
                    <input type="date" value={form.startDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => set('startDate', e.target.value)}
                      className={iCls} style={{ ...iSty, paddingLeft:'2.25rem' }} />
                  </div>
                </div>
                <div className="col-span-2">
                  <label style={lSty}>Preferred Days / Times</label>
                  <input value={form.preferredSchedule} onChange={e => set('preferredSchedule', e.target.value)}
                    placeholder="e.g. Mon/Wed evenings" className={iCls} style={iSty} />
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color:'#f59e0b' }}>Your Location</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label style={lSty}>Full Address *</label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:txtMute }} />
                    <input value={form.address} onChange={e => set('address', e.target.value)}
                      placeholder="House No., Street, Kebele…"
                      className={iCls} style={{ ...iSty, paddingLeft:'2.25rem' }} required />
                  </div>
                </div>
                <div>
                  <label style={lSty}>City / Sub-city</label>
                  <input value={form.city} onChange={e => set('city', e.target.value)}
                    placeholder="e.g. Addis Ababa, Bole" className={iCls} style={iSty} />
                </div>
                <div>
                  <label style={lSty}>GPS (optional)</label>
                  <button type="button" onClick={getGPS} disabled={locating}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60"
                    style={form.location.lat
                      ? { background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.35)', color:'#34d399' }
                      : { background:inputBg, border:`1px solid ${inputBd}`, color:txtSub }}>
                    {locating ? <><FiLoader className="w-4 h-4 animate-spin" /> Locating…</>
                      : form.location.lat ? <><FiCheckCircle className="w-4 h-4" /> Captured</>
                      : <><FiNavigation className="w-4 h-4" /> Share Location</>}
                  </button>
                </div>
              </div>
              {form.location.lat && (
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono px-2 py-1 rounded-lg"
                    style={{ background:'rgba(16,185,129,0.08)', color:'#34d399' }}>
                    {form.location.lat.toFixed(5)}, {form.location.lng.toFixed(5)}
                  </span>
                  <a href={form.mapLink} target="_blank" rel="noreferrer"
                    className="text-xs font-semibold hover:underline" style={{ color:'#60a5fa' }}>
                    View on Maps ↗
                  </a>
                </div>
              )}
            </div>

            {/* Message */}
            <div>
              <label style={lSty}>Additional Message (optional)</label>
              <textarea rows={2} value={form.message} onChange={e => set('message', e.target.value)}
                placeholder="Any specific needs or questions…"
                className={`${iCls} resize-none`} style={iSty} />
            </div>

            {/* Cost summary */}
            <div className="rounded-xl px-4 py-3" style={{ background:`${color}08`, border:`1px solid ${color}20` }}>
              <p className="text-xs font-semibold" style={{ color:txtSub }}>
                Estimated: <span className="font-black" style={{ color }}>
                  ETB {(subject.pricePerHour * form.hoursPerWeek).toLocaleString()}
                </span> / week ({form.hoursPerWeek} hr × ETB {subject.pricePerHour}/hr)
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 py-3 rounded-2xl text-sm font-bold"
                style={{ background:inputBg, border:`1px solid ${inputBd}`, color:txtSub }}>
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white disabled:opacity-60"
                style={{ background:`linear-gradient(135deg,${color},${color}cc)` }}>
                {submitting
                  ? <><FiLoader className="w-4 h-4 animate-spin" /> Submitting…</>
                  : <><FiCheckCircle className="w-4 h-4" /> Confirm Booking</>}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────
export default function HomeTutoringSection({ dark }) {
  const txt    = dark ? '#f1f5f9' : '#0f172a';
  const txtSub = dark ? '#94a3b8' : '#475569';
  const txtMute= dark ? '#64748b' : '#94a3b8';
  const bgCard = dark ? 'rgba(15,23,42,0.7)' : 'rgba(255,255,255,0.95)';
  const bdCard = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.09)';

  const [subjects,     setSubjects]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [bookTarget,   setBookTarget]   = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);

  useEffect(() => {
    getActiveSubjects()
      .then(res => setSubjects(res.data || []))
      .catch(() => setSubjects([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="home-tutoring" style={{ padding:'7rem 1rem' }}>
      <div className="max-w-6xl mx-auto">

        {/* ── Header ── */}
        <motion.div className="text-center mb-14"
          initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true, amount:0.3 }} transition={{ duration:0.7 }}>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4"
            style={{ background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', color:'#34d399' }}>
            <FiHome className="w-4 h-4" /> Home Tutoring Available
          </span>
          <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color:txt }}>
            Learn from the<br />
            <span style={{ background:'linear-gradient(90deg,#34d399,#60a5fa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              Comfort of Home
            </span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color:txtSub }}>
            Expert tutors come to you. Browse subjects created by our team, book a session, and share your location.
          </p>
        </motion.div>

        {/* ── Benefits ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {[
            { icon:FiHome,    title:'At Your Home',   desc:'Tutor comes to you',         color:'#10b981' },
            { icon:FiStar,    title:'Expert Tutors',  desc:'Verified & experienced',      color:'#3b82f6' },
            { icon:FiClock,   title:'Flexible Hours', desc:'Your schedule, your pace',    color:'#8b5cf6' },
            { icon:FiMapPin,  title:'Easy Booking',   desc:'Share location, we find you', color:'#f59e0b' },
          ].map((b, i) => (
            <motion.div key={i} className="p-4 rounded-2xl text-center"
              style={{ background:bgCard, border:`1px solid ${bdCard}` }}
              initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }} transition={{ duration:0.5, delay:i*0.1 }}>
              <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
                style={{ background:`${b.color}18`, border:`1px solid ${b.color}30` }}>
                <b.icon style={{ color:b.color, width:18, height:18 }} />
              </div>
              <p className="font-bold text-sm mb-0.5" style={{ color:txt }}>{b.title}</p>
              <p className="text-xs" style={{ color:txtMute }}>{b.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Subjects grid ── */}
        <motion.div className="mb-10"
          initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true, amount:0.15 }} transition={{ duration:0.7 }}>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h3 className="text-2xl font-black" style={{ color:txt }}>Available Subjects</h3>
            <Link to="/home-tutor"
              className="flex items-center gap-2 text-sm font-semibold hover:underline"
              style={{ color:'#34d399' }}>
              View all subjects <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <FiLoader className="w-8 h-8 animate-spin" style={{ color:'#34d399' }} />
            </div>
          ) : subjects.length === 0 ? (
            <div className="flex flex-col items-center py-10 gap-3">
              <FiBook className="w-10 h-10 opacity-20" style={{ color:txtMute }} />
              <p className="font-semibold" style={{ color:txtSub }}>No subjects added yet</p>
              <p className="text-sm" style={{ color:txtMute }}>Check back soon — our team is preparing subjects for you.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {subjects.slice(0, 6).map(s => (
                <SubjectCard key={s._id} subject={s}
                  onBook={setBookTarget}
                  onDetail={setDetailTarget} />
              ))}
            </div>
          )}
        </motion.div>

        {/* ── CTA ── */}
        {subjects.length > 0 && (
          <div className="text-center">
            <Link to="/home-tutor">
              <motion.span
                className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-lg text-white cursor-pointer"
                style={{ background:'linear-gradient(135deg,#10b981,#0d9488)', boxShadow:'0 0 30px rgba(16,185,129,0.35)' }}
                whileHover={{ scale:1.04, boxShadow:'0 0 50px rgba(16,185,129,0.55)' }}
                whileTap={{ scale:0.97 }}>
                <FiHome className="w-5 h-5" />
                Browse All Subjects
                <FiArrowRight className="w-5 h-5" />
              </motion.span>
            </Link>
          </div>
        )}
      </div>

      {/* ── Detail popup ── */}
      <AnimatePresence>
        {detailTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background:'rgba(0,0,0,0.55)', backdropFilter:'blur(4px)' }}
            onClick={() => setDetailTarget(null)}>
            <motion.div className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
              style={{ background:'#ffffff' }}
              initial={{ opacity:0, scale:0.94, y:40 }}
              animate={{ opacity:1, scale:1,    y:0  }}
              exit={{ opacity:0, scale:0.96, y:20 }}
              transition={{ type:'spring', stiffness:280, damping:26 }}
              onClick={e => e.stopPropagation()}>
              {detailTarget.imageUrl ? (
                <img src={detailTarget.imageUrl} alt={detailTarget.name}
                  className="w-full object-cover" style={{ height:200 }} />
              ) : (
                <div className="w-full flex items-center justify-center"
                  style={{ height:200, background:`linear-gradient(135deg,${GRADE_COLORS[detailTarget.gradeLevel]??'#10b981'}22,transparent)` }}>
                  <FiBook style={{ width:64, height:64, opacity:0.18, color:GRADE_COLORS[detailTarget.gradeLevel] }} />
                </div>
              )}
              <div className="p-5">
                <h3 className="text-xl font-black mb-1" style={{ color:'#111827' }}>{detailTarget.name}</h3>
                <p className="text-sm mb-3" style={{ color:'#6b7280' }}>
                  {detailTarget.gradeLevel} · {detailTarget.category} · Home Tutoring, Ethiopia
                </p>
                {detailTarget.description && (
                  <p className="text-sm leading-relaxed mb-3" style={{ color:'#374151' }}>
                    {detailTarget.description}
                  </p>
                )}
                {detailTarget.outcomes?.length > 0 && (
                  <ul className="mb-4 space-y-1.5">
                    {detailTarget.outcomes.map((o, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm" style={{ color:'#374151' }}>
                        <span style={{ color:'#10b981', marginTop:3 }}>✓</span> {o}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex items-center justify-between pt-3" style={{ borderTop:'1px solid #f3f4f6' }}>
                  <div>
                    <span className="text-2xl font-black" style={{ color:'#111827' }}>
                      {detailTarget.pricePerHour.toLocaleString()} ETB
                    </span>
                    <span className="text-xs ml-1" style={{ color:'#9ca3af' }}>/hour</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setDetailTarget(null)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold"
                      style={{ background:'#f3f4f6', color:'#6b7280' }}>
                      Close
                    </button>
                    <button onClick={() => { setBookTarget(detailTarget); setDetailTarget(null); }}
                      className="px-5 py-2 rounded-xl text-sm font-bold text-white"
                      style={{ background:'linear-gradient(135deg,#d97706,#b45309)' }}>
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Booking modal ── */}
      <AnimatePresence>
        {bookTarget && (
          <BookingModal
            subject={bookTarget}
            dark={dark}
            onClose={() => setBookTarget(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
