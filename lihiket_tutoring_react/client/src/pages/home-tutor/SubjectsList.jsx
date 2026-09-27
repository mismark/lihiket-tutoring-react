import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../store/theme/ThemeContext';
import { useAuth }  from '../../store/auth/AuthContext';
import toast from 'react-hot-toast';
import {
  FiHome, FiSearch, FiBook, FiMapPin, FiPhone, FiMail,
  FiUser, FiClock, FiCalendar, FiCheckCircle, FiX,
  FiNavigation, FiLoader, FiArrowRight, FiStar,
  FiChevronLeft, FiChevronRight, FiInfo,
} from 'react-icons/fi';
import { getActiveSubjects } from '../../api/hometutorsubject.api';
import { createBooking }     from '../../api/hometutorsubject.api';

// ── Constants ─────────────────────────────────────────────────────────────────
const GRADE_LEVELS = [
  'KG1','KG2',
  'G1','G2','G3','G4','G5','G6',
  'G7','G8','G9',
  'G10','G11','G12',
  'HL',
];

const GRADE_GROUPS = [
  { label:'Kindergarten',    grades:['KG1','KG2'],                        color:'#ec4899' },
  { label:'Primary (G1–G6)', grades:['G1','G2','G3','G4','G5','G6'],      color:'#3b82f6' },
  { label:'Middle (G7–G9)',  grades:['G7','G8','G9'],                     color:'#8b5cf6' },
  { label:'High (G10–G12)', grades:['G10','G11','G12'],                   color:'#f59e0b' },
  { label:'Higher Level',    grades:['HL'],                               color:'#10b981' },
];

const CATEGORIES = [
  'General','STEM','Sciences','Mathematics',
  'Languages','Arts','Social Studies','Physical Education','Other',
];

const GRADE_COLORS = {
  KG1:'#ec4899', KG2:'#ec4899',
  G1:'#3b82f6',  G2:'#3b82f6',  G3:'#3b82f6',
  G4:'#8b5cf6',  G5:'#8b5cf6',  G6:'#8b5cf6',
  G7:'#f59e0b',  G8:'#f59e0b',  G9:'#f59e0b',
  G10:'#10b981', G11:'#10b981', G12:'#10b981',
  HL:'#06b6d4',
};

const EMPTY_FORM = {
  // Personal
  fullName:'', age:'', sex:'',
  email:'', phone:'',
  // Schedule
  hoursPerWeek:4, preferredSchedule:'', startDate:'',
  // Address
  city:'', subcity:'', street:'', address:'', additionalAddress:'',
  // GPS
  location:{ lat:null, lng:null }, mapLink:'',
  // Extra
  message:'',
};

// ── Utility ───────────────────────────────────────────────────────────────────
// Build a price-per-grade map from the fetched subjects list
function buildPriceMap(subjects) {
  const map = {};
  subjects.forEach(s => {
    if (!map[s.gradeLevel] || s.pricePerHour < map[s.gradeLevel]) {
      map[s.gradeLevel] = s.pricePerHour;
    }
  });
  return map;
}

// ── Pricing table (grade groups with per-grade chips) ─────────────────────────
function PricingTable({ priceMap, dark, onBook }) {
  const txt     = dark ? '#f1f5f9' : '#0f172a';
  const txtMute = dark ? '#64748b' : '#94a3b8';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-14">
      {GRADE_GROUPS.map((grp, gi) => {
        const available = grp.grades.filter(g => priceMap[g] != null);
        if (available.length === 0) return null;

        const prices   = available.map(g => priceMap[g]);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const range    = minPrice === maxPrice
          ? `ETB ${minPrice}`
          : `ETB ${minPrice}–${maxPrice}`;

        return (
          <motion.div key={gi}
            className="relative p-5 rounded-2xl cursor-pointer group"
            style={{
              background: `${grp.color}0f`,
              border: `1.5px solid ${grp.color}30`,
            }}
            whileHover={{ scale:1.03, y:-3 }}
            transition={{ type:'spring', stiffness:300, damping:22 }}>

            {/* icon */}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background:`${grp.color}20`, border:`1px solid ${grp.color}35` }}>
              <FiBook style={{ color:grp.color, width:18, height:18 }} />
            </div>

            <h4 className="font-bold text-sm mb-1" style={{ color: txt }}>{grp.label}</h4>

            <p className="text-xl font-black mb-3" style={{ color: grp.color }}>
              {range}
              <span className="text-xs font-medium ml-1" style={{ color: txtMute }}>/hr</span>
            </p>

            {/* per-grade chips */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {available.map(g => (
                <span key={g} className="px-2 py-0.5 rounded-md text-xs font-bold"
                  style={{ background:`${grp.color}18`, color: grp.color }}>
                  {g} — ETB {priceMap[g]}
                </span>
              ))}
            </div>

            <button
              onClick={() => onBook(grp.grades[0])}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all"
              style={{ background:`linear-gradient(135deg,${grp.color},${grp.color}cc)` }}>
              Book a Tutor <FiArrowRight className="inline w-3.5 h-3.5 ml-1" />
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Hotel-style subject card ──────────────────────────────────────────────────
function SubjectCard({ subject, onBook, onDetail }) {
  const color  = GRADE_COLORS[subject.gradeLevel] || '#10b981';
  const rating = (4.2 + ((subject.pricePerHour % 10) / 25)).toFixed(1);

  return (
    <motion.div className="rounded-2xl overflow-hidden flex flex-col bg-white"
      style={{ border:'1px solid #e5e7eb', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}
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
        {/* Rating */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1.5 rounded-full"
          style={{ background:'rgba(28,28,28,0.76)', backdropFilter:'blur(6px)' }}>
          <FiStar className="w-3 h-3" style={{ color:'#f59e0b', fill:'#f59e0b' }} />
          <span className="text-xs font-bold text-white">{rating}</span>
        </div>
        {/* Grade */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold"
          style={{ background:`${color}e0`, color:'#fff' }}>
          {subject.gradeLevel}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pt-3 pb-1">
        <h3 className="font-bold text-base leading-tight mb-0.5 text-gray-900">{subject.name}</h3>
        <div className="flex items-center gap-1 text-xs mb-2 text-gray-500">
          <FiMapPin className="w-3 h-3 flex-shrink-0" />
          <span>{subject.category} · Home Tutoring, Ethiopia</span>
        </div>
        <div className="flex items-center justify-between py-2.5"
          style={{ borderTop:'1px solid #f3f4f6' }}>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-gray-900">
              {subject.pricePerHour.toLocaleString()} ETB
            </span>
            <span className="text-xs text-gray-400">/hour</span>
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
          className="w-full flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-gray-400 hover:text-emerald-600 transition-colors">
          <FiInfo className="w-3.5 h-3.5" />
          View details
          <FiArrowRight className="w-3.5 h-3.5 -rotate-45" />
        </button>
      </div>
    </motion.div>
  );
}

// ── Multi-step Booking / Registration modal ───────────────────────────────────
const STEPS = ['Personal', 'Schedule', 'Location', 'Confirm'];

function BookingModal({ subject, dark, onClose }) {
  const { user } = useAuth();

  const [step, setStep]       = useState(0);
  const [form, setForm]       = useState({
    ...EMPTY_FORM,
    fullName: user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '',
    email:    user?.email || '',
    phone:    user?.phone || '',
  });
  const [locating,   setLocating]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const modalRef = useRef();

  // tokens
  const txt      = dark ? '#f1f5f9' : '#0f172a';
  const txtSub   = dark ? '#94a3b8' : '#475569';
  const txtMute  = dark ? '#64748b' : '#94a3b8';
  const bg       = dark ? '#0f172a' : '#ffffff';
  const inputBg  = dark ? 'rgba(255,255,255,0.05)' : '#f8fafc';
  const inputBd  = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
  const bdCard   = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const color    = GRADE_COLORS[subject?.gradeLevel] || '#10b981';

  const set = (k, v) => setForm(p => ({ ...p, [k]:v }));

  const iCls = 'w-full px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all';
  const iSty = { background:inputBg, border:`1px solid ${inputBd}`, color:txt };
  const lSty = { color:txtSub, fontSize:'0.75rem', fontWeight:600, display:'block', marginBottom:4 };
  const sHdr = (label, col) => (
    <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color:col }}>{label}</p>
  );

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

  // GPS
  const getGPS = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported.');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude:lat, longitude:lng } }) => {
        setForm(p => ({ ...p, location:{ lat, lng }, mapLink:`https://www.google.com/maps?q=${lat},${lng}` }));
        toast.success('Location captured!');
        setLocating(false);
      },
      err => { toast.error(`Location error: ${err.message}`); setLocating(false); },
      { enableHighAccuracy:true, timeout:10000 }
    );
  };

  // per-step validation before advancing
  const validateStep = () => {
    if (step === 0) {
      if (!form.fullName.trim()) { toast.error('Full name is required.'); return false; }
      if (!form.age || Number(form.age) < 3) { toast.error('Please enter a valid age.'); return false; }
      if (!form.sex) { toast.error('Please select a sex.'); return false; }
      if (!form.phone.trim()) { toast.error('Phone number is required.'); return false; }
      if (!form.email.trim()) { toast.error('Email address is required.'); return false; }
    }
    if (step === 2) {
      if (!form.city.trim())    { toast.error('City is required.'); return false; }
      if (!form.address.trim()) { toast.error('House No. / main address is required.'); return false; }
    }
    return true;
  };

  const next = () => { if (validateStep()) setStep(s => Math.min(STEPS.length - 1, s + 1)); };
  const prev = () => setStep(s => Math.max(0, s - 1));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await createBooking({ subjectId: subject._id, ...form });
      setSubmitted(true);
      toast.success('Registration submitted!');
    } catch (err) {
      toast.error(err.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Step content ─────────────────────────────────────────────────────────
  const stepContent = () => {
    switch (step) {

      // ── Step 0: Personal details ────────────────────────────────────────
      case 0:
        return (
          <div className="space-y-4">
            {sHdr('Personal Information', '#34d399')}

            {/* Full name */}
            <div>
              <label style={lSty}>Full Name *</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:txtMute }} />
                <input value={form.fullName} onChange={e => set('fullName', e.target.value)}
                  placeholder="e.g. Abebe Bekele" className={iCls}
                  style={{ ...iSty, paddingLeft:'2.25rem' }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Age */}
              <div>
                <label style={lSty}>Age *</label>
                <input type="number" min="3" max="100" value={form.age}
                  onChange={e => set('age', e.target.value)}
                  placeholder="e.g. 14" className={iCls} style={iSty} />
              </div>

              {/* Sex */}
              <div>
                <label style={lSty}>Sex *</label>
                <div className="flex gap-2 mt-1">
                  {['male','female','other'].map(s => (
                    <button key={s} type="button"
                      onClick={() => set('sex', s)}
                      className="flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all"
                      style={form.sex === s
                        ? { background:'#10b981', color:'#fff', border:'1px solid #10b981' }
                        : { background:inputBg, color:txtSub, border:`1px solid ${inputBd}` }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Phone */}
              <div>
                <label style={lSty}>Phone Number *</label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:txtMute }} />
                  <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                    placeholder="09XXXXXXXX" className={iCls}
                    style={{ ...iSty, paddingLeft:'2.25rem' }} />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={lSty}>Email Address *</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:txtMute }} />
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    placeholder="abebe@example.com" className={iCls}
                    style={{ ...iSty, paddingLeft:'2.25rem' }} />
                </div>
              </div>
            </div>
          </div>
        );

      // ── Step 1: Schedule ────────────────────────────────────────────────
      case 1:
        return (
          <div className="space-y-4">
            {sHdr('Schedule Preferences', '#a78bfa')}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={lSty}>Hours per Week</label>
                <div className="relative">
                  <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:txtMute }} />
                  <input type="number" min="1" max="40" value={form.hoursPerWeek}
                    onChange={e => set('hoursPerWeek', Number(e.target.value))}
                    className={iCls} style={{ ...iSty, paddingLeft:'2.25rem' }} />
                </div>
              </div>
              <div>
                <label style={lSty}>Preferred Start Date</label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:txtMute }} />
                  <input type="date" value={form.startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => set('startDate', e.target.value)}
                    className={iCls} style={{ ...iSty, paddingLeft:'2.25rem' }} />
                </div>
              </div>
            </div>

            <div>
              <label style={lSty}>Preferred Days / Times</label>
              <input value={form.preferredSchedule} onChange={e => set('preferredSchedule', e.target.value)}
                placeholder="e.g. Mon, Wed & Fri — afternoons"
                className={iCls} style={iSty} />
            </div>

            <div>
              <label style={lSty}>Additional Message (optional)</label>
              <textarea rows={3} value={form.message} onChange={e => set('message', e.target.value)}
                placeholder="Any specific requirements, topics to focus on, etc."
                className={`${iCls} resize-none`} style={iSty} />
            </div>

            {/* Cost preview */}
            {subject && (
              <div className="rounded-xl px-4 py-3" style={{ background:`${color}08`, border:`1px solid ${color}20` }}>
                <p className="text-sm font-semibold" style={{ color:txtSub }}>
                  Estimated weekly cost:&nbsp;
                  <span className="font-black text-base" style={{ color }}>
                    ETB {(subject.pricePerHour * form.hoursPerWeek).toLocaleString()}
                  </span>
                  <span className="text-xs ml-1" style={{ color:txtMute }}>
                    ({form.hoursPerWeek} hr × ETB {subject.pricePerHour}/hr)
                  </span>
                </p>
              </div>
            )}
          </div>
        );

      // ── Step 2: Location ────────────────────────────────────────────────
      case 2:
        return (
          <div className="space-y-4">
            {sHdr('Your Location', '#f59e0b')}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* City */}
              <div>
                <label style={lSty}>City *</label>
                <input value={form.city} onChange={e => set('city', e.target.value)}
                  placeholder="e.g. Addis Ababa, Bahir Dar"
                  className={iCls} style={iSty} />
              </div>

              {/* Sub-city */}
              <div>
                <label style={lSty}>Sub-city / Woreda</label>
                <input value={form.subcity} onChange={e => set('subcity', e.target.value)}
                  placeholder="e.g. Bole, Kirkos, Arada"
                  className={iCls} style={iSty} />
              </div>

              {/* Street */}
              <div>
                <label style={lSty}>Street / Road</label>
                <input value={form.street} onChange={e => set('street', e.target.value)}
                  placeholder="e.g. Bole Road, Meskel Sq."
                  className={iCls} style={iSty} />
              </div>

              {/* House No. */}
              <div>
                <label style={lSty}>House No. / Main Address *</label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:txtMute }} />
                  <input value={form.address} onChange={e => set('address', e.target.value)}
                    placeholder="e.g. House 42, Block B"
                    className={iCls} style={{ ...iSty, paddingLeft:'2.25rem' }} />
                </div>
              </div>
            </div>

            {/* Additional description */}
            <div>
              <label style={lSty}>Additional Address Description</label>
              <textarea rows={2} value={form.additionalAddress}
                onChange={e => set('additionalAddress', e.target.value)}
                placeholder="Nearby landmarks, colour of gate, floor number — anything that helps the tutor find you."
                className={`${iCls} resize-none`} style={iSty} />
            </div>

            {/* GPS */}
            <div>
              <label style={lSty}>GPS Location (optional — helps us find you faster)</label>
              <button type="button" onClick={getGPS} disabled={locating}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold disabled:opacity-60 transition-all"
                style={form.location.lat
                  ? { background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.4)', color:'#34d399' }
                  : { background:inputBg, border:`1px solid ${inputBd}`, color:txtSub }}>
                {locating
                  ? <><FiLoader className="w-4 h-4 animate-spin" /> Getting location…</>
                  : form.location.lat
                    ? <><FiCheckCircle className="w-4 h-4" /> Location Captured</>
                    : <><FiNavigation className="w-4 h-4" /> Share My GPS Location</>}
              </button>

              {form.location.lat && (
                <div className="mt-2 flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-mono px-2.5 py-1 rounded-lg"
                    style={{ background:'rgba(16,185,129,0.08)', color:'#34d399' }}>
                    {form.location.lat.toFixed(5)}, {form.location.lng.toFixed(5)}
                  </span>
                  <a href={form.mapLink} target="_blank" rel="noreferrer"
                    className="text-xs font-semibold hover:underline" style={{ color:'#60a5fa' }}>
                    Preview on Google Maps ↗
                  </a>
                </div>
              )}
            </div>
          </div>
        );

      // ── Step 3: Confirm ─────────────────────────────────────────────────
      case 3:
        return (
          <div className="space-y-4">
            {sHdr('Confirm Your Registration', '#34d399')}

            {/* Summary card */}
            <div className="rounded-2xl overflow-hidden" style={{ border:`1px solid ${bdCard}` }}>

              {/* Subject row */}
              <div className="px-4 py-3 flex items-center gap-3"
                style={{ background:`${color}0a`, borderBottom:`1px solid ${bdCard}` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background:`${color}20` }}>
                  <FiBook style={{ color, width:16, height:16 }} />
                </div>
                <div>
                  <p className="font-black text-sm" style={{ color:txt }}>{subject?.name}</p>
                  <p className="text-xs" style={{ color:txtMute }}>
                    {subject?.gradeLevel} · ETB {subject?.pricePerHour}/hr
                  </p>
                </div>
                <span className="ml-auto text-lg font-black" style={{ color }}>
                  ETB {((subject?.pricePerHour ?? 0) * form.hoursPerWeek).toLocaleString()}/wk
                </span>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-4 py-3 text-xs">
                {[
                  ['Full Name',  form.fullName],
                  ['Age',        form.age ? `${form.age} years` : '—'],
                  ['Sex',        form.sex || '—'],
                  ['Phone',      form.phone],
                  ['Email',      form.email],
                  ['Hours/week', `${form.hoursPerWeek} hrs`],
                  ['Start Date', form.startDate || '—'],
                  ['Schedule',   form.preferredSchedule || '—'],
                  ['City',       form.city || '—'],
                  ['Sub-city',   form.subcity || '—'],
                  ['Street',     form.street || '—'],
                  ['Address',    form.address],
                ].map(([label, val]) => (
                  <div key={label}>
                    <span style={{ color:txtMute }}>{label}: </span>
                    <span className="font-semibold" style={{ color:txt }}>{val}</span>
                  </div>
                ))}

                {form.additionalAddress && (
                  <div className="col-span-2">
                    <span style={{ color:txtMute }}>Additional: </span>
                    <span className="font-semibold" style={{ color:txt }}>{form.additionalAddress}</span>
                  </div>
                )}

                {form.location.lat && (
                  <div className="col-span-2 flex items-center gap-2">
                    <span style={{ color:txtMute }}>GPS: </span>
                    <span className="font-mono text-emerald-500 font-semibold">
                      {form.location.lat.toFixed(5)}, {form.location.lng.toFixed(5)}
                    </span>
                    <a href={form.mapLink} target="_blank" rel="noreferrer"
                      className="text-xs font-semibold hover:underline" style={{ color:'#60a5fa' }}>
                      Maps ↗
                    </a>
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs text-center" style={{ color:txtMute }}>
              By submitting you agree to be contacted within 24 hours to confirm your tutor.
            </p>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto"
      style={{ background:'rgba(2,8,23,0.78)', backdropFilter:'blur(6px)', padding:'1.5rem 1rem' }}>
      <motion.div ref={modalRef} className="w-full max-w-lg rounded-3xl shadow-2xl my-4"
        style={{ background: bg, border:`1px solid ${bdCard}` }}
        initial={{ opacity:0, y:50, scale:0.96 }}
        animate={{ opacity:1, y:0, scale:1 }}
        exit={{ opacity:0, y:30, scale:0.97 }}
        transition={{ type:'spring', stiffness:260, damping:28 }}>

        {/* ── Modal header ── */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4"
          style={{ borderBottom:`1px solid ${bdCard}` }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background:`${color}18`, border:`1px solid ${color}30` }}>
              <FiBook style={{ color, width:18, height:18 }} />
            </div>
            <div>
              <h3 className="font-black text-base leading-tight" style={{ color:txt }}>
                {subject?.name ?? 'Book a Tutor'}
              </h3>
              <p className="text-xs mt-0.5" style={{ color:txtMute }}>
                {subject?.gradeLevel} · ETB {subject?.pricePerHour}/hr · Home visit
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-500/10 flex-shrink-0">
            <FiX className="w-5 h-5 text-red-400" />
          </button>
        </div>

        {/* ── Step progress bar ── */}
        {!submitted && (
          <div className="px-6 pt-4 pb-2">
            <div className="flex items-center gap-2">
              {STEPS.map((label, i) => (
                <div key={i} className="flex items-center gap-2 flex-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all"
                      style={i < step
                        ? { background:'#10b981', color:'#fff' }
                        : i === step
                          ? { background:color, color:'#fff' }
                          : { background:dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb', color:txtMute }}>
                      {i < step ? '✓' : i + 1}
                    </div>
                    <span className="hidden sm:block text-xs font-semibold"
                      style={{ color: i === step ? color : txtMute }}>{label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-px transition-all"
                      style={{ background: i < step ? '#10b981' : (dark ? 'rgba(255,255,255,0.1)' : '#e5e7eb') }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Body ── */}
        {submitted ? (
          /* Success */
          <div className="flex flex-col items-center text-center px-8 py-12 gap-4">
            <motion.div initial={{ scale:0 }} animate={{ scale:1 }}
              transition={{ type:'spring', stiffness:300, damping:20 }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-2"
                style={{ background:'rgba(16,185,129,0.12)' }}>
                <FiCheckCircle style={{ color:'#10b981', width:44, height:44 }} />
              </div>
            </motion.div>
            <h3 className="text-2xl font-black" style={{ color:txt }}>Registration Submitted!</h3>
            <p className="text-sm leading-relaxed" style={{ color:txtSub }}>
              Thank you, <strong>{form.fullName}</strong>!<br />
              We received your booking for <strong>{subject?.name}</strong>.<br />
              We will call <strong>{form.phone}</strong> within 24 hours to confirm your tutor.
            </p>
            {form.mapLink && (
              <a href={form.mapLink} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
                style={{ color:'#60a5fa' }}>
                <FiMapPin className="w-4 h-4" /> View your shared location ↗
              </a>
            )}
            <button onClick={onClose}
              className="mt-2 px-8 py-3 rounded-2xl font-bold text-white"
              style={{ background:'linear-gradient(135deg,#10b981,#0d9488)' }}>
              Done
            </button>
          </div>
        ) : (
          <div className="px-6 py-5">
            <AnimatePresence mode="wait">
              <motion.div key={step}
                initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }}
                exit={{ opacity:0, x:-30 }}
                transition={{ duration:0.2 }}>
                {stepContent()}
              </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-6">
              {step > 0 && (
                <button onClick={prev}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all"
                  style={{ background:dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6',
                           border:`1px solid ${dark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`, color:txtSub }}>
                  <FiChevronLeft className="w-4 h-4" /> Back
                </button>
              )}

              {step < STEPS.length - 1 ? (
                <button onClick={next}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white"
                  style={{ background:`linear-gradient(135deg,${color},${color}cc)` }}>
                  Continue <FiChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white disabled:opacity-60"
                  style={{ background:'linear-gradient(135deg,#10b981,#0d9488)', boxShadow:'0 0 20px rgba(16,185,129,0.35)' }}>
                  {submitting
                    ? <><FiLoader className="w-4 h-4 animate-spin" /> Submitting…</>
                    : <><FiCheckCircle className="w-4 h-4" /> Submit Registration</>}
                </button>
              )}
            </div>
          </div>
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
  const bg     = dark ? '#020817' : '#f5f5f0';
  const inputBg = dark ? 'rgba(255,255,255,0.07)' : '#ffffff';
  const inputBd = dark ? 'rgba(255,255,255,0.12)' : '#e5e7eb';

  const [subjects,     setSubjects]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [filterGrade,  setFilterGrade]  = useState('');
  const [filterCat,    setFilterCat]    = useState('');
  const [bookTarget,   setBookTarget]   = useState(null);  // subject obj OR grade string
  const [detailTarget, setDetailTarget] = useState(null);

  useEffect(() => {
    setLoading(true);
    getActiveSubjects({
      ...(filterGrade ? { gradeLevel:filterGrade } : {}),
      ...(filterCat   ? { category:filterCat }     : {}),
      ...(search      ? { search }                 : {}),
    })
      .then(res => setSubjects(res.data || []))
      .catch(err => toast.error(err.message || 'Failed to load subjects.'))
      .finally(() => setLoading(false));
  }, [filterGrade, filterCat, search]);

  const priceMap = buildPriceMap(subjects);

  // Booking can be opened from a subject card (passes subject obj)
  // or from the pricing table (passes grade string → pick first match)
  const openBook = (target) => {
    if (typeof target === 'string') {
      // grade string from pricing table — find first matching subject
      const match = subjects.find(s => s.gradeLevel === target);
      setBookTarget(match ?? null);
      if (!match) toast.error('No subject available for that grade yet.');
    } else {
      setBookTarget(target);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

        {/* ── Hero ── */}
        <div className="relative rounded-3xl overflow-hidden"
          style={{ background:'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)', minHeight:200 }}>
          <div className="absolute inset-0"
            style={{ background:'radial-gradient(ellipse at 20% 50%,rgba(16,185,129,0.12),transparent 60%)' }} />
          <div className="relative px-8 py-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4"
              style={{ background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.3)', color:'#34d399' }}>
              <FiHome className="w-3.5 h-3.5" /> Home Tutoring
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
              Book a Home Tutor
            </h1>
            <p className="text-slate-400 max-w-xl">
              Expert tutors come to you. Browse our subjects, check pricing per grade, and register in minutes.
            </p>
          </div>
        </div>

        {/* ── Pricing table (only if subjects loaded) ── */}
        {!loading && Object.keys(priceMap).length > 0 && (
          <div>
            <h2 className="text-2xl font-black mb-6" style={{ color: txt }}>
              Pricing Per Grade Level
            </h2>
            <PricingTable priceMap={priceMap} dark={dark} onBook={openBook} />
          </div>
        )}

        {/* ── Filters ── */}
        <div className="flex flex-wrap gap-3 items-center">
          <h2 className="text-2xl font-black mr-2" style={{ color: txt }}>Available Subjects</h2>
          <div className="flex flex-wrap gap-2 ml-auto">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search…"
                className="pl-9 pr-4 py-2 rounded-xl text-sm outline-none"
                style={{ background:inputBg, border:`1px solid ${inputBd}`, color:txt, width:160 }} />
            </div>
            <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm outline-none"
              style={{ background:inputBg, border:`1px solid ${inputBd}`, color:txt }}>
              <option value="">All Grades</option>
              {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm outline-none"
              style={{ background:inputBg, border:`1px solid ${inputBd}`, color:txt }}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {(search || filterGrade || filterCat) && (
              <button onClick={() => { setSearch(''); setFilterGrade(''); setFilterCat(''); }}
                className="text-xs font-semibold hover:underline text-red-400">
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Grid ── */}
        {loading ? (
          <div className="flex justify-center py-20">
            <FiLoader className="w-8 h-8 animate-spin" style={{ color:'#10b981' }} />
          </div>
        ) : subjects.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <FiBook className="w-12 h-12 opacity-20 text-gray-400" />
            <p className="font-semibold text-lg" style={{ color:txtSub }}>No subjects found</p>
            <p className="text-sm text-gray-400">
              {search || filterGrade || filterCat
                ? 'Try adjusting your filters.'
                : 'Subjects will appear here once the admin adds them.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjects.map(s => (
              <SubjectCard key={s._id} subject={s}
                onBook={openBook}
                onDetail={setDetailTarget} />
            ))}
          </div>
        )}

        {/* ── My bookings link ── */}
        <div className="text-center pb-4">
          <Link to="/home-tutor/my-bookings"
            className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
            style={{ color:'#34d399' }}>
            View my bookings <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ── Detail popup ── */}
      <AnimatePresence>
        {detailTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background:'rgba(0,0,0,0.55)', backdropFilter:'blur(4px)' }}
            onClick={() => setDetailTarget(null)}>
            <motion.div className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl bg-white"
              initial={{ opacity:0, scale:0.94, y:40 }}
              animate={{ opacity:1, scale:1, y:0 }}
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
                <h3 className="text-xl font-black mb-1 text-gray-900">{detailTarget.name}</h3>
                <p className="text-sm mb-3 text-gray-500">
                  {detailTarget.gradeLevel} · {detailTarget.category} · Home Tutoring, Ethiopia
                </p>
                {detailTarget.description && (
                  <p className="text-sm leading-relaxed mb-3 text-gray-700">{detailTarget.description}</p>
                )}
                {detailTarget.outcomes?.length > 0 && (
                  <ul className="mb-4 space-y-1.5">
                    {detailTarget.outcomes.map((o, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-emerald-500 mt-0.5">✓</span> {o}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex items-center justify-between pt-3" style={{ borderTop:'1px solid #f3f4f6' }}>
                  <div>
                    <span className="text-2xl font-black text-gray-900">
                      {detailTarget.pricePerHour.toLocaleString()} ETB
                    </span>
                    <span className="text-xs ml-1 text-gray-400">/hour</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setDetailTarget(null)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 text-gray-500">
                      Close
                    </button>
                    <button onClick={() => { openBook(detailTarget); setDetailTarget(null); }}
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

      {/* ── Booking / Registration modal ── */}
      <AnimatePresence>
        {bookTarget && (
          <BookingModal
            subject={bookTarget}
            dark={dark}
            onClose={() => setBookTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
