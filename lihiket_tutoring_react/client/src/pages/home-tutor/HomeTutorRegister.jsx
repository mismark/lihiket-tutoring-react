import { useState, useEffect } from 'react';
import { useTheme } from '../../store/theme/ThemeContext';
import { useAuth }  from '../../store/auth/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiUser, FiPhone, FiMail, FiMapPin, FiNavigation,
  FiCheckCircle, FiLoader, FiBook, FiClock,
  FiCalendar, FiHome, FiChevronRight, FiChevronLeft,
} from 'react-icons/fi';
import { submitRegistration } from '../../api/hometutorregistration.api';

// ── Constants ─────────────────────────────────────────────────────────────────
const GRADE_LEVELS = [
  'KG1','KG2',
  'G1','G2','G3','G4','G5','G6',
  'G7','G8','G9',
  'G10','G11','G12',
  'HL',
];

const GRADE_LABELS = {
  KG1:'Kindergarten 1', KG2:'Kindergarten 2',
  G1:'Grade 1',  G2:'Grade 2',  G3:'Grade 3',  G4:'Grade 4',
  G5:'Grade 5',  G6:'Grade 6',  G7:'Grade 7',  G8:'Grade 8',
  G9:'Grade 9',  G10:'Grade 10', G11:'Grade 11', G12:'Grade 12',
  HL:'Higher Level / University Prep',
};

const COMMON_SUBJECTS = [
  'Mathematics','Physics','Chemistry','Biology',
  'English','Amharic','History','Geography',
  'ICT','Economics','Civics','Art',
];

const STEPS = [
  { id: 0, label: 'Personal',  icon: FiUser    },
  { id: 1, label: 'Academic',  icon: FiBook    },
  { id: 2, label: 'Schedule',  icon: FiClock   },
  { id: 3, label: 'Location',  icon: FiMapPin  },
  { id: 4, label: 'Confirm',   icon: FiCheckCircle },
];

const EMPTY = {
  fullName:'', age:'', sex:'', email:'', phone:'',
  gradeLevel:'', subjects:[],
  hoursPerWeek:4, preferredSchedule:'', startDate:'',
  city:'', subcity:'', street:'', address:'', additionalAddress:'',
  location:{ lat:null, lng:null }, mapLink:'',
  message:'',
};

// ── Step indicator ────────────────────────────────────────────────────────────
function StepBar({ current, dark }) {
  const txtMute = dark ? '#64748b' : '#9ca3af';
  return (
    <div className="flex items-center justify-center gap-0 mb-8 px-2">
      {STEPS.map((s, i) => {
        const done    = i < current;
        const active  = i === current;
        const Icon    = s.icon;
        return (
          <div key={s.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <motion.div
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300"
                animate={{
                  background: done ? '#10b981' : active ? '#3b82f6' : (dark ? 'rgba(255,255,255,0.07)' : '#e5e7eb'),
                  color:      done || active ? '#ffffff' : txtMute,
                }}>
                {done ? <FiCheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </motion.div>
              <span className="text-xs font-semibold hidden sm:block"
                style={{ color: active ? '#3b82f6' : done ? '#10b981' : txtMute }}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="w-8 sm:w-12 h-0.5 mx-1 mt-[-14px] transition-all duration-500"
                style={{ background: done ? '#10b981' : (dark ? 'rgba(255,255,255,0.1)' : '#e5e7eb') }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Reusable field components ─────────────────────────────────────────────────
function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function HomeTutorRegister() {
  const { theme } = useTheme();
  const { user }  = useAuth();
  const dark      = theme === 'dark';

  // ── Tokens ──────────────────────────────────────────────────────────────────
  const pageBg   = dark ? '#020817'                      : '#f0f4ff';
  const cardBg   = dark ? '#0f172a'                      : '#ffffff';
  const bdCard   = dark ? 'rgba(255,255,255,0.08)'       : 'rgba(0,0,0,0.08)';
  const txt      = dark ? '#f1f5f9'                      : '#0f172a';
  const txtSub   = dark ? '#94a3b8'                      : '#475569';
  const txtMute  = dark ? '#64748b'                      : '#9ca3af';
  const inputBg  = dark ? 'rgba(255,255,255,0.05)'       : '#f8fafc';
  const inputBd  = dark ? 'rgba(255,255,255,0.1)'        : 'rgba(0,0,0,0.12)';
  const inputClr = dark ? '#f1f5f9'                      : '#0f172a';

  const iCls = 'w-full px-3.5 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/40 transition-all';
  const iSty = { background:inputBg, border:`1px solid ${inputBd}`, color:inputClr };

  // ── State ────────────────────────────────────────────────────────────────────
  const [step, setStep]   = useState(0);
  const [form, setForm]   = useState({
    ...EMPTY,
    fullName: user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '',
    email:    user?.email || '',
    phone:    user?.phone || '',
  });
  const [locating,   setLocating]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [regData,    setRegData]    = useState(null);

  // pre-fill from logged-in student
  useEffect(() => {
    if (user?.gradeLevel) setForm(p => ({ ...p, gradeLevel: p.gradeLevel || user.gradeLevel }));
  }, [user]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleSubject = s => setForm(p => ({
    ...p,
    subjects: p.subjects.includes(s) ? p.subjects.filter(x => x !== s) : [...p.subjects, s],
  }));

  // ── GPS ──────────────────────────────────────────────────────────────────────
  const captureGPS = () => {
    if (!navigator.geolocation) return toast.error('Geolocation is not supported by your browser.');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude: lat, longitude: lng } }) => {
        setForm(p => ({ ...p, location:{ lat, lng }, mapLink:`https://www.google.com/maps?q=${lat},${lng}` }));
        toast.success('Location captured!');
        setLocating(false);
      },
      err => { toast.error(`Could not get location: ${err.message}`); setLocating(false); },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  // ── Step validation ───────────────────────────────────────────────────────────
  const validate = () => {
    if (step === 0) {
      if (!form.fullName.trim()) return toast.error('Full name is required.'), false;
      if (!form.age || Number(form.age) < 3 || Number(form.age) > 100)
        return toast.error('Please enter a valid age (3–100).'), false;
      if (!form.sex)             return toast.error('Please select your sex.'), false;
      if (!form.phone.trim())    return toast.error('Phone number is required.'), false;
      if (!form.email.trim())    return toast.error('Email address is required.'), false;
    }
    if (step === 1) {
      if (!form.gradeLevel)      return toast.error('Please select your grade level.'), false;
    }
    if (step === 3) {
      if (!form.city.trim())     return toast.error('City is required.'), false;
      if (!form.address.trim())  return toast.error('House No. / address is required.'), false;
    }
    return true;
  };

  const next = () => { if (validate()) setStep(s => Math.min(STEPS.length - 1, s + 1)); };
  const prev = () => setStep(s => Math.max(0, s - 1));

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await submitRegistration(form);
      setRegData(res.data);
      setSubmitted(true);
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Step content ──────────────────────────────────────────────────────────────
  const stepContent = () => {
    switch (step) {

      // ── 0: Personal ──────────────────────────────────────────────────────────
      case 0:
        return (
          <div className="space-y-5">
            <Field label="Full Name" required>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: txtMute }} />
                <input value={form.fullName} onChange={e => set('fullName', e.target.value)}
                  placeholder="e.g. Abebe Girma" className={iCls}
                  style={{ ...iSty, paddingLeft: '2.25rem' }} />
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Age" required>
                <input type="number" min="3" max="100" value={form.age}
                  onChange={e => set('age', e.target.value)}
                  placeholder="e.g. 14" className={iCls} style={iSty} />
              </Field>

              <Field label="Sex" required>
                <div className="flex gap-2 h-[42px]">
                  {['Male', 'Female', 'Other'].map(s => (
                    <button key={s} type="button" onClick={() => set('sex', s.toLowerCase())}
                      className="flex-1 rounded-xl text-xs font-bold capitalize border transition-all"
                      style={form.sex === s.toLowerCase()
                        ? { background: '#3b82f6', color: '#fff', border: '1px solid #3b82f6' }
                        : { background: inputBg, color: txtSub, border: `1px solid ${inputBd}` }}>
                      {s}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Phone Number" required>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: txtMute }} />
                  <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                    placeholder="09XXXXXXXX" className={iCls}
                    style={{ ...iSty, paddingLeft: '2.25rem' }} />
                </div>
              </Field>

              <Field label="Email Address" required>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: txtMute }} />
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    placeholder="abebe@example.com" className={iCls}
                    style={{ ...iSty, paddingLeft: '2.25rem' }} />
                </div>
              </Field>
            </div>
          </div>
        );

      // ── 1: Academic ───────────────────────────────────────────────────────────
      case 1:
        return (
          <div className="space-y-5">
            <Field label="Grade Level" required>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {GRADE_LEVELS.map(g => (
                  <button key={g} type="button" onClick={() => set('gradeLevel', g)}
                    title={GRADE_LABELS[g]}
                    className="py-2.5 rounded-xl text-xs font-bold border transition-all"
                    style={form.gradeLevel === g
                      ? { background: '#3b82f6', color: '#fff', border: '1px solid #3b82f6' }
                      : { background: inputBg, color: txtSub, border: `1px solid ${inputBd}` }}>
                    {g}
                  </button>
                ))}
              </div>
              {form.gradeLevel && (
                <p className="text-xs mt-2 font-semibold" style={{ color: '#60a5fa' }}>
                  Selected: {GRADE_LABELS[form.gradeLevel]}
                </p>
              )}
            </Field>

            <Field label="Subjects Needed">
              <p className="text-xs mb-2" style={{ color: txtMute }}>Select all that apply</p>
              <div className="flex flex-wrap gap-2">
                {COMMON_SUBJECTS.map(s => (
                  <button key={s} type="button" onClick={() => toggleSubject(s)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                    style={form.subjects.includes(s)
                      ? { background: '#10b981', color: '#fff', border: '1px solid #10b981' }
                      : { background: inputBg, color: txtSub, border: `1px solid ${inputBd}` }}>
                    {s}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        );

      // ── 2: Schedule ───────────────────────────────────────────────────────────
      case 2:
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Hours per Week">
                <div className="relative">
                  <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: txtMute }} />
                  <input type="number" min="1" max="40" value={form.hoursPerWeek}
                    onChange={e => set('hoursPerWeek', Number(e.target.value))}
                    className={iCls} style={{ ...iSty, paddingLeft: '2.25rem' }} />
                </div>
              </Field>

              <Field label="Preferred Start Date">
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: txtMute }} />
                  <input type="date" value={form.startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => set('startDate', e.target.value)}
                    className={iCls} style={{ ...iSty, paddingLeft: '2.25rem' }} />
                </div>
              </Field>
            </div>

            <Field label="Preferred Days & Times">
              <input value={form.preferredSchedule} onChange={e => set('preferredSchedule', e.target.value)}
                placeholder="e.g. Monday, Wednesday & Friday — afternoons"
                className={iCls} style={iSty} />
            </Field>

            <Field label="Additional Notes (optional)">
              <textarea rows={3} value={form.message} onChange={e => set('message', e.target.value)}
                placeholder="Any special requirements, topics to focus on, or questions for us…"
                className={`${iCls} resize-none`} style={iSty} />
            </Field>
          </div>
        );

      // ── 3: Location ───────────────────────────────────────────────────────────
      case 3:
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="City" required>
                <div className="relative">
                  <FiHome className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: txtMute }} />
                  <input value={form.city} onChange={e => set('city', e.target.value)}
                    placeholder="e.g. Addis Ababa, Bahir Dar"
                    className={iCls} style={{ ...iSty, paddingLeft: '2.25rem' }} />
                </div>
              </Field>

              <Field label="Sub-city / Woreda">
                <input value={form.subcity} onChange={e => set('subcity', e.target.value)}
                  placeholder="e.g. Bole, Kirkos, Arada"
                  className={iCls} style={iSty} />
              </Field>

              <Field label="Street / Road">
                <input value={form.street} onChange={e => set('street', e.target.value)}
                  placeholder="e.g. Bole Road, Meskel Square"
                  className={iCls} style={iSty} />
              </Field>

              <Field label="House No. / Main Address" required>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: txtMute }} />
                  <input value={form.address} onChange={e => set('address', e.target.value)}
                    placeholder="e.g. House 42, Block B"
                    className={iCls} style={{ ...iSty, paddingLeft: '2.25rem' }} />
                </div>
              </Field>
            </div>

            <Field label="Additional Address Description">
              <textarea rows={2} value={form.additionalAddress}
                onChange={e => set('additionalAddress', e.target.value)}
                placeholder="Nearby landmarks, gate colour, floor number — anything that helps the tutor find you easily."
                className={`${iCls} resize-none`} style={iSty} />
            </Field>

            {/* GPS */}
            <Field label="GPS Location (optional — helps us find you faster)">
              <button type="button" onClick={captureGPS} disabled={locating}
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-semibold border transition-all disabled:opacity-60"
                style={form.location.lat
                  ? { background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.4)', color:'#10b981' }
                  : { background: inputBg, border: `1px solid ${inputBd}`, color: txtSub }}>
                {locating
                  ? <><FiLoader className="w-4 h-4 animate-spin" /> Getting your location…</>
                  : form.location.lat
                    ? <><FiCheckCircle className="w-4 h-4" /> Location Captured ✓</>
                    : <><FiNavigation className="w-4 h-4" /> Share My GPS Location</>}
              </button>

              {form.location.lat && (
                <div className="mt-2 flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-mono px-2.5 py-1 rounded-lg"
                    style={{ background:'rgba(16,185,129,0.08)', color:'#10b981' }}>
                    {form.location.lat.toFixed(6)}, {form.location.lng.toFixed(6)}
                  </span>
                  <a href={form.mapLink} target="_blank" rel="noreferrer"
                    className="text-xs font-semibold hover:underline"
                    style={{ color:'#60a5fa' }}>
                    Preview on Google Maps ↗
                  </a>
                </div>
              )}
            </Field>
          </div>
        );

      // ── 4: Confirm ────────────────────────────────────────────────────────────
      case 4:
        return (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-center mb-4" style={{ color: txtSub }}>
              Please review your information before submitting.
            </p>

            {/* Summary grid */}
            {[
              {
                heading: 'Personal',
                color: '#3b82f6',
                rows: [
                  ['Full Name',    form.fullName],
                  ['Age',          form.age ? `${form.age} years` : '—'],
                  ['Sex',          form.sex ? form.sex.charAt(0).toUpperCase() + form.sex.slice(1) : '—'],
                  ['Phone',        form.phone],
                  ['Email',        form.email],
                ],
              },
              {
                heading: 'Academic',
                color: '#10b981',
                rows: [
                  ['Grade Level',  form.gradeLevel ? GRADE_LABELS[form.gradeLevel] : '—'],
                  ['Subjects',     form.subjects.length ? form.subjects.join(', ') : 'Not specified'],
                ],
              },
              {
                heading: 'Schedule',
                color: '#8b5cf6',
                rows: [
                  ['Hours/Week',   `${form.hoursPerWeek} hours`],
                  ['Start Date',   form.startDate || 'Not specified'],
                  ['Preferred',    form.preferredSchedule || 'Not specified'],
                ],
              },
              {
                heading: 'Location',
                color: '#f59e0b',
                rows: [
                  ['City',         form.city],
                  ['Sub-city',     form.subcity || '—'],
                  ['Street',       form.street  || '—'],
                  ['Address',      form.address],
                  ['Additional',   form.additionalAddress || '—'],
                  ['GPS',          form.location.lat
                    ? `${form.location.lat.toFixed(5)}, ${form.location.lng.toFixed(5)}`
                    : 'Not shared'],
                ],
              },
            ].map(section => (
              <div key={section.heading} className="rounded-2xl overflow-hidden"
                style={{ border: `1px solid ${bdCard}` }}>
                <div className="px-4 py-2.5"
                  style={{ background: `${section.color}12`, borderBottom: `1px solid ${bdCard}` }}>
                  <p className="text-xs font-black uppercase tracking-wider"
                    style={{ color: section.color }}>{section.heading}</p>
                </div>
                <div className="px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-1.5">
                  {section.rows.map(([label, val]) => (
                    <div key={label}>
                      <span className="text-xs" style={{ color: txtMute }}>{label}: </span>
                      <span className="text-xs font-semibold" style={{ color: txt }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {form.message && (
              <div className="rounded-xl px-4 py-3"
                style={{ background: inputBg, border: `1px solid ${inputBd}` }}>
                <p className="text-xs" style={{ color: txtMute }}>Notes: <span style={{ color: txt }}>{form.message}</span></p>
              </div>
            )}

            <p className="text-xs text-center pt-1" style={{ color: txtMute }}>
              By submitting you agree to be contacted within 24 hours to confirm your assigned tutor.
            </p>
          </div>
        );

      default: return null;
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: pageBg }}>
        <motion.div className="w-full max-w-md rounded-3xl p-8 text-center shadow-xl"
          style={{ background: cardBg, border: `1px solid ${bdCard}` }}
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1,   y: 0  }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}>

          <motion.div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(16,185,129,0.12)' }}
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.15 }}>
            <FiCheckCircle style={{ color: '#10b981', width: 48, height: 48 }} />
          </motion.div>

          <h2 className="text-2xl font-black mb-3" style={{ color: txt }}>
            Registration Submitted!
          </h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: txtSub }}>
            Thank you, <strong>{form.fullName}</strong>!<br />
            We received your home tutoring registration.<br />
            Our team will call <strong>{form.phone}</strong> within <strong>24 hours</strong> to confirm your tutor.
          </p>

          {form.mapLink && (
            <a href={form.mapLink} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold mb-6 transition hover:opacity-80"
              style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)', color: '#60a5fa' }}>
              <FiNavigation className="w-4 h-4" /> View your shared location ↗
            </a>
          )}

          <button
            onClick={() => { setSubmitted(false); setStep(0); setForm({ ...EMPTY }); }}
            className="w-full py-3 rounded-2xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)' }}>
            Register Another Student
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Form page ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen py-10 px-4" style={{ background: pageBg }}>
      <div className="max-w-xl mx-auto">

        {/* Page header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4"
            style={{ background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.25)', color:'#60a5fa' }}>
            <FiHome className="w-3.5 h-3.5" /> Home Tutoring
          </div>
          <h1 className="text-3xl font-black mb-2" style={{ color: txt }}>
            Register for Home Tutoring
          </h1>
          <p className="text-sm" style={{ color: txtSub }}>
            Fill in your details and we'll match you with the right tutor.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl shadow-xl p-6 sm:p-8"
          style={{ background: cardBg, border: `1px solid ${bdCard}` }}>

          {/* Step bar */}
          <StepBar current={step} dark={dark} />

          {/* Step title */}
          <div className="mb-6">
            <h2 className="text-lg font-black" style={{ color: txt }}>
              Step {step + 1} of {STEPS.length} — {STEPS[step].label}
            </h2>
            <div className="mt-2 h-1.5 rounded-full overflow-hidden"
              style={{ background: dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb' }}>
              <motion.div className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg,#3b82f6,#10b981)' }}
                animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                transition={{ duration: 0.4 }} />
            </div>
          </div>

          {/* Step content with slide animation */}
          <AnimatePresence mode="wait">
            <motion.div key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0  }}
              exit={{ opacity: 0, x: -24  }}
              transition={{ duration: 0.2 }}>
              {stepContent()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button onClick={prev}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold border transition-all"
                style={{ background: inputBg, border: `1px solid ${inputBd}`, color: txtSub }}>
                <FiChevronLeft className="w-4 h-4" /> Back
              </button>
            )}

            {step < STEPS.length - 1 ? (
              <button onClick={next}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white transition-all"
                style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)', boxShadow: '0 4px 20px rgba(59,130,246,0.35)' }}>
                Continue <FiChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white disabled:opacity-60 transition-all"
                style={{ background: 'linear-gradient(135deg,#10b981,#0d9488)', boxShadow: '0 4px 20px rgba(16,185,129,0.35)' }}>
                {submitting
                  ? <><FiLoader className="w-4 h-4 animate-spin" /> Submitting…</>
                  : <><FiCheckCircle className="w-4 h-4" /> Submit Registration</>}
              </button>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs mt-5" style={{ color: txtMute }}>
          🔒 Your information is private and used only to match you with the right tutor.
        </p>
      </div>
    </div>
  );
}
