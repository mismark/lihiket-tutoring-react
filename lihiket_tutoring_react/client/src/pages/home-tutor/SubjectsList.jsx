import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../store/theme/ThemeContext';
import { useAuth }  from '../../store/auth/AuthContext';
import toast from 'react-hot-toast';
import {
  FiHome, FiSearch, FiBook, FiMapPin, FiPhone, FiMail,
  FiUser, FiClock, FiCalendar, FiCheckCircle, FiX,
  FiNavigation, FiLoader, FiFilter, FiArrowRight, FiStar,
  FiChevronDown,
} from 'react-icons/fi';
import { getActiveSubjects } from '../../api/hometutorsubject.api';
import { createBooking }     from '../../api/hometutorsubject.api';

const GRADE_LEVELS = ['KG1','KG2','G1','G2','G3','G4','G5','G6','G7','G8','G9','G10','G11','G12','HL'];
const CATEGORIES   = ['General','STEM','Sciences','Mathematics','Languages','Arts','Social Studies','Physical Education','Other'];

const COMMON_SUBJECTS = ['Mathematics','Physics','Chemistry','Biology','English','Amharic','History','Geography','ICT','Economics','Civics'];

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
  hoursPerWeek: 4, preferredSchedule: '',
  startDate:'',
  address:'', city:'',
  location:{ lat:null, lng:null },
  mapLink:'',
  message:'',
};

// ── Subject card — hotel-listing style ───────────────────────────────────────
function SubjectCard({ subject, dark, onBook, onDetail }) {
  const txt    = dark ? '#1a1a1a' : '#1a1a1a';   // card body always light bg
  const txtSub = '#6b7280';
  const color  = GRADE_COLORS[subject.gradeLevel] || '#10b981';

  // Deterministic "rating" from price so every card looks filled
  const rating = subject.rating ?? (4.2 + ((subject.pricePerHour % 10) / 25)).toFixed(1);

  return (
    <motion.div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
      whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}>

      {/* ── Photo with rating badge ── */}
      <div className="relative w-full overflow-hidden" style={{ height: 190 }}>
        {subject.imageUrl ? (
          <img src={subject.imageUrl} alt={subject.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg,${color}28,${color}0a)` }}>
            <FiBook style={{ color, width: 56, height: 56, opacity: 0.25 }} />
          </div>
        )}
        {/* Rating badge top-right */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1.5 rounded-full"
          style={{ background: 'rgba(30,30,30,0.78)', backdropFilter: 'blur(6px)' }}>
          <FiStar className="w-3 h-3" style={{ color: '#f59e0b', fill: '#f59e0b' }} />
          <span className="text-xs font-bold text-white">{rating}</span>
        </div>
        {/* Grade badge top-left */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold"
          style={{ background: `${color}e0`, color: '#fff' }}>
          {subject.gradeLevel}
        </div>
      </div>

      {/* ── Card body ── */}
      <div className="px-4 pt-3 pb-1">
        <h3 className="font-bold text-base leading-tight mb-0.5" style={{ color: '#111827' }}>
          {subject.name}
        </h3>
        <div className="flex items-center gap-1 text-xs mb-2" style={{ color: txtSub }}>
          <FiMapPin className="w-3 h-3 flex-shrink-0" />
          <span>{subject.category} · Home Tutoring, Ethiopia</span>
        </div>

        {/* Price + Book Now */}
        <div className="flex items-center justify-between py-2.5"
          style={{ borderTop: '1px solid #f3f4f6' }}>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black" style={{ color: '#111827' }}>
              {subject.pricePerHour.toLocaleString()} ETB
            </span>
            <span className="text-xs font-medium" style={{ color: txtSub }}>/hour</span>
          </div>
          <button
            onClick={() => onBook(subject)}
            className="px-4 py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg,#d97706,#b45309)', minWidth: 96 }}>
            Book Now
          </button>
        </div>
      </div>

      {/* ── View details link ── */}
      <div className="px-4 pb-3" style={{ borderTop: '1px solid #f3f4f6' }}>
        <button
          onClick={() => onDetail?.(subject)}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors hover:text-emerald-600"
          style={{ color: '#6b7280' }}>
          <FiSearch className="w-3.5 h-3.5" />
          View details
          <FiArrowRight className="w-3.5 h-3.5" style={{ transform: 'rotate(-45deg)' }} />
        </button>
      </div>
    </motion.div>
  );
}

// ── Booking modal ─────────────────────────────────────────────────────────────
function BookingModal({ subject, dark, onClose, onBooked }) {
  const { user }   = useAuth();
  const [form,     setForm]     = useState({
    ...EMPTY_FORM,
    fullName: user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '',
    email:    user?.email  || '',
    phone:    user?.phone  || '',
  });
  const [locating,   setLocating]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const modalRef = useRef();

  const txt     = dark ? '#f1f5f9' : '#0f172a';
  const txtSub  = dark ? '#94a3b8' : '#475569';
  const txtMute = dark ? '#64748b' : '#94a3b8';
  const inputBg = dark ? 'rgba(255,255,255,0.05)' : '#f8fafc';
  const inputBd = dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.12)';
  const bdCard  = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const color   = GRADE_COLORS[subject.gradeLevel] || '#10b981';

  const set = (k,v) => setForm(p => ({ ...p, [k]:v }));
  const inputCls   = 'w-full px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/40';
  const inputStyle = { background: inputBg, border:`1px solid ${inputBd}`, color: txt };
  const labelStyle = { color: txtSub, fontSize:'0.75rem', fontWeight:600, display:'block', marginBottom:4 };

  // Close on outside click
  useEffect(() => {
    const h = e => { if (modalRef.current && !modalRef.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const getLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported.');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
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
      onBooked?.();
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

        {/* Modal header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4"
          style={{ borderBottom:`1px solid ${bdCard}` }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background:`${color}18`, border:`1px solid ${color}30` }}>
              <FiBook style={{ color, width:18, height:18 }} />
            </div>
            <div>
              <h3 className="font-black text-base" style={{ color: txt }}>Book: {subject.name}</h3>
              <p className="text-xs mt-0.5" style={{ color: txtMute }}>
                {subject.gradeLevel} · ETB {subject.pricePerHour}/hr
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
            <h3 className="text-xl font-black" style={{ color: txt }}>Booking Submitted!</h3>
            <p className="text-sm" style={{ color: txtSub }}>
              We received your booking for <strong>{subject.name}</strong>. Our team will call
              <strong> {form.phone}</strong> within 24 hours to confirm your tutor.
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
                  <label style={labelStyle}>Full Name *</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:txtMute }} />
                    <input value={form.fullName} onChange={e => set('fullName', e.target.value)}
                      placeholder="Abebe Bekele" className={inputCls}
                      style={{ ...inputStyle, paddingLeft:'2.25rem' }} required />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Phone *</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:txtMute }} />
                    <input value={form.phone} onChange={e => set('phone', e.target.value)}
                      placeholder="09XXXXXXXX" className={inputCls}
                      style={{ ...inputStyle, paddingLeft:'2.25rem' }} required />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label style={labelStyle}>Email *</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:txtMute }} />
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                      placeholder="abebe@example.com" className={inputCls}
                      style={{ ...inputStyle, paddingLeft:'2.25rem' }} required />
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div>
              <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color:'#a78bfa' }}>Schedule</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={labelStyle}>Hours / Week</label>
                  <div className="relative">
                    <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:txtMute }} />
                    <input type="number" min="1" max="40" value={form.hoursPerWeek}
                      onChange={e => set('hoursPerWeek', Number(e.target.value))}
                      className={inputCls} style={{ ...inputStyle, paddingLeft:'2.25rem' }} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Start Date</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:txtMute }} />
                    <input type="date" value={form.startDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => set('startDate', e.target.value)}
                      className={inputCls} style={{ ...inputStyle, paddingLeft:'2.25rem' }} />
                  </div>
                </div>
                <div className="col-span-2">
                  <label style={labelStyle}>Preferred Days / Times</label>
                  <input value={form.preferredSchedule} onChange={e => set('preferredSchedule', e.target.value)}
                    placeholder="e.g. Mon/Wed evenings"
                    className={inputCls} style={inputStyle} />
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color:'#f59e0b' }}>Your Location</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label style={labelStyle}>Full Address *</label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:txtMute }} />
                    <input value={form.address} onChange={e => set('address', e.target.value)}
                      placeholder="House No., Street, Kebele…"
                      className={inputCls} style={{ ...inputStyle, paddingLeft:'2.25rem' }} required />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>City / Sub-city</label>
                  <input value={form.city} onChange={e => set('city', e.target.value)}
                    placeholder="e.g. Addis Ababa, Bole"
                    className={inputCls} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>GPS (optional)</label>
                  <button type="button" onClick={getLocation} disabled={locating}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60"
                    style={form.location.lat
                      ? { background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.35)', color:'#34d399' }
                      : { background:inputBg, border:`1px solid ${inputBd}`, color:txtSub }}>
                    {locating
                      ? <><FiLoader className="w-4 h-4 animate-spin" /> Locating…</>
                      : form.location.lat
                        ? <><FiCheckCircle className="w-4 h-4" /> Captured</>
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
              <label style={labelStyle}>Additional Message (optional)</label>
              <textarea rows={2} value={form.message} onChange={e => set('message', e.target.value)}
                placeholder="Any specific needs or questions…"
                className={`${inputCls} resize-none`} style={inputStyle} />
            </div>

            {/* Summary */}
            <div className="rounded-xl px-4 py-3" style={{ background:`${color}08`, border:`1px solid ${color}20` }}>
              <p className="text-xs font-semibold" style={{ color: txtSub }}>
                Estimated cost: <span className="font-black" style={{ color }}>
                  ETB {subject.pricePerHour * form.hoursPerWeek}
                </span> / week ({form.hoursPerWeek} hr{form.hoursPerWeek !== 1 ? 's' : ''} × ETB {subject.pricePerHour}/hr)
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

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SubjectsList() {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const txt    = dark ? '#f1f5f9' : '#111827';
  const txtSub = dark ? '#94a3b8' : '#6b7280';
  const bg     = dark ? '#020817' : '#f5f5f0';   // warm off-white like the screenshot

  const [subjects,  setSubjects]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [filterGrade,    setFilterGrade]    = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [bookTarget,   setBookTarget]   = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);

  const inputBg = dark ? 'rgba(255,255,255,0.07)' : '#ffffff';
  const inputBd = dark ? 'rgba(255,255,255,0.12)' : '#e5e7eb';

  useEffect(() => {
    setLoading(true);
    getActiveSubjects({
      ...(filterGrade    ? { gradeLevel: filterGrade }    : {}),
      ...(filterCategory ? { category:  filterCategory }  : {}),
      ...(search         ? { search }                     : {}),
    })
      .then(res => setSubjects(res.data || []))
      .catch(err => toast.error(err.message || 'Failed to load subjects.'))
      .finally(() => setLoading(false));
  }, [filterGrade, filterCategory, search]);

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Hero banner */}
        <div className="relative rounded-3xl overflow-hidden"
          style={{ background:'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)', minHeight:200 }}>
          <div className="absolute inset-0" style={{ background:'radial-gradient(ellipse at 20% 50%,rgba(16,185,129,0.12),transparent 60%)' }} />
          <div className="relative px-8 py-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4"
              style={{ background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.3)', color:'#34d399' }}>
              <FiHome className="w-3.5 h-3.5" /> Home Tutoring
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
              Browse Available Subjects
            </h1>
            <p className="text-slate-400 max-w-xl">
              Expert tutors visit your home. Select a subject, book a session, and share your location.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search subjects…"
              className="pl-9 pr-4 py-2 rounded-xl text-sm outline-none"
              style={{ background: inputBg, border: `1px solid ${inputBd}`, color: txt, width: 200 }} />
          </div>
          <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm outline-none"
            style={{ background: inputBg, border: `1px solid ${inputBd}`, color: txt }}>
            <option value="">All Grades</option>
            {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm outline-none"
            style={{ background: inputBg, border: `1px solid ${inputBd}`, color: txt }}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {(search || filterGrade || filterCategory) && (
            <button onClick={() => { setSearch(''); setFilterGrade(''); setFilterCategory(''); }}
              className="text-xs font-semibold hover:underline" style={{ color: '#ef4444' }}>
              Clear filters
            </button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <FiLoader className="w-8 h-8 animate-spin" style={{ color: '#10b981' }} />
          </div>
        ) : subjects.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <FiBook className="w-12 h-12 opacity-20" style={{ color: '#9ca3af' }} />
            <p className="font-semibold text-lg" style={{ color: txtSub }}>No subjects found</p>
            <p className="text-sm" style={{ color: '#9ca3af' }}>
              {search || filterGrade || filterCategory ? 'Try adjusting your filters.' : 'Subjects will appear here once the admin adds them.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjects.map(s => (
              <SubjectCard
                key={s._id}
                subject={s}
                dark={dark}
                onBook={setBookTarget}
                onDetail={setDetailTarget}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail sheet */}
      <AnimatePresence>
        {detailTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
            onClick={() => setDetailTarget(null)}>
            <motion.div
              className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
              style={{ background: '#ffffff' }}
              initial={{ opacity: 0, scale: 0.94, y: 40 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
              onClick={e => e.stopPropagation()}>
              {/* Image */}
              {detailTarget.imageUrl ? (
                <img src={detailTarget.imageUrl} alt={detailTarget.name}
                  className="w-full object-cover" style={{ height: 200 }} />
              ) : (
                <div className="w-full flex items-center justify-center"
                  style={{ height: 200, background: `linear-gradient(135deg,${GRADE_COLORS[detailTarget.gradeLevel] ?? '#10b981'}22,transparent)` }}>
                  <FiBook style={{ width: 64, height: 64, opacity: 0.2, color: GRADE_COLORS[detailTarget.gradeLevel] }} />
                </div>
              )}
              <div className="p-5">
                <h3 className="text-xl font-black mb-1" style={{ color: '#111827' }}>{detailTarget.name}</h3>
                <p className="text-sm mb-3" style={{ color: '#6b7280' }}>
                  {detailTarget.gradeLevel} · {detailTarget.category} · Home Tutoring, Ethiopia
                </p>
                {detailTarget.description && (
                  <p className="text-sm leading-relaxed mb-3" style={{ color: '#374151' }}>
                    {detailTarget.description}
                  </p>
                )}
                {detailTarget.outcomes?.length > 0 && (
                  <ul className="mb-4 space-y-1.5">
                    {detailTarget.outcomes.map((o, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#374151' }}>
                        <span style={{ color: '#10b981', marginTop: 3 }}>✓</span> {o}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #f3f4f6' }}>
                  <div>
                    <span className="text-2xl font-black" style={{ color: '#111827' }}>
                      {detailTarget.pricePerHour.toLocaleString()} ETB
                    </span>
                    <span className="text-xs ml-1" style={{ color: '#9ca3af' }}>/hour</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setDetailTarget(null)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold"
                      style={{ background: '#f3f4f6', color: '#6b7280' }}>
                      Close
                    </button>
                    <button onClick={() => { setBookTarget(detailTarget); setDetailTarget(null); }}
                      className="px-5 py-2 rounded-xl text-sm font-bold text-white"
                      style={{ background: 'linear-gradient(135deg,#d97706,#b45309)' }}>
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Booking modal */}
      <AnimatePresence>
        {bookTarget && (
          <BookingModal
            subject={bookTarget}
            dark={dark}
            onClose={() => setBookTarget(null)}
            onBooked={() => {}}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
