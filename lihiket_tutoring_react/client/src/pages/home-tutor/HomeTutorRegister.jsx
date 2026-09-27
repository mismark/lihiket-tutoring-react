import { useState, useEffect } from 'react';
import { Link }    from 'react-router-dom';
import { useTheme } from '../../store/theme/ThemeContext';
import { useAuth }  from '../../store/auth/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiUser, FiPhone, FiMail, FiMapPin, FiNavigation,
  FiCheckCircle, FiLoader, FiBook, FiClock, FiCalendar,
  FiAlertCircle, FiChevronRight, FiArrowLeft,
  FiAward, FiShield, FiUsers,
} from 'react-icons/fi';
import { submitRegistration } from '../../api/hometutorregistration.api';

// ─── Data ──────────────────────────────────────────────────────────────────────
const GRADE_GROUPS = [
  { label: 'Kindergarten', grades: ['KG1', 'KG2'],                       color: '#ec4899' },
  { label: 'Primary',      grades: ['G1','G2','G3','G4','G5','G6'],       color: '#3b82f6' },
  { label: 'Middle',       grades: ['G7','G8','G9'],                      color: '#8b5cf6' },
  { label: 'High School',  grades: ['G10','G11','G12'],                   color: '#f59e0b' },
  { label: 'Higher Level', grades: ['HL'],                                color: '#10b981' },
];

const GRADE_LABEL = {
  KG1:'Kindergarten 1', KG2:'Kindergarten 2',
  G1:'Grade 1',  G2:'Grade 2',  G3:'Grade 3',  G4:'Grade 4',
  G5:'Grade 5',  G6:'Grade 6',  G7:'Grade 7',  G8:'Grade 8',
  G9:'Grade 9',  G10:'Grade 10',G11:'Grade 11',G12:'Grade 12',
  HL:'Higher Level / University Prep',
};

const SUBJECTS = [
  { name:'Mathematics', icon:'∑' }, { name:'Physics',    icon:'⚛' },
  { name:'Chemistry',   icon:'🧪' }, { name:'Biology',    icon:'🧬' },
  { name:'English',     icon:'📖' }, { name:'Amharic',    icon:'ሀ'  },
  { name:'History',     icon:'🏛'  }, { name:'Geography',  icon:'🌍' },
  { name:'ICT',         icon:'💻'  }, { name:'Economics',  icon:'📊' },
  { name:'Civics',      icon:'⚖'  }, { name:'Art',        icon:'🎨' },
];

const EMPTY = {
  fullName:'', age:'', sex:'',
  email:'', phone:'',
  gradeLevel:'', subjects:[],
  hoursPerWeek:4, preferredSchedule:'', startDate:'',
  city:'', subcity:'', street:'', address:'', additionalAddress:'',
  location:{ lat:null, lng:null }, mapLink:'',
  message:'',
};

const STEPS = [
  { id:0, label:'Personal',  desc:'Your basic details',     color:'#3b82f6' },
  { id:1, label:'Academic',  desc:'Grade & subjects',       color:'#10b981' },
  { id:2, label:'Schedule',  desc:'Timing preferences',     color:'#8b5cf6' },
  { id:3, label:'Location',  desc:'Where to find you',      color:'#f59e0b' },
  { id:4, label:'Review',    desc:'Confirm & submit',       color:'#34d399' },
];

// ─── Shared field wrapper ──────────────────────────────────────────────────────
function Field({ label, required, hint, error, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold" style={{ color: '#374151' }}>
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {hint && <span className="text-xs" style={{ color: '#9ca3af' }}>{hint}</span>}
      </div>
      {children}
      {error && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-red-500">
          <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

// ─── Input / Textarea base styles (always light-card regardless of page theme) ─
const I = 'w-full rounded-xl border text-sm outline-none transition-all ' +
          'focus:ring-2 focus:ring-offset-0 placeholder:text-gray-300';

function Inp({ icon: Icon, error, ...props }) {
  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />}
      <input
        className={`${I} py-3 ${Icon ? 'pl-10 pr-4' : 'px-4'} ${error ? 'border-red-300 focus:ring-red-200 bg-red-50' : 'border-gray-200 focus:ring-blue-100 bg-white hover:border-gray-300'}`}
        style={{ color: '#111827' }}
        {...props}
      />
    </div>
  );
}

function Textarea({ error, ...props }) {
  return (
    <textarea
      className={`${I} px-4 py-3 resize-none ${error ? 'border-red-300 focus:ring-red-200 bg-red-50' : 'border-gray-200 focus:ring-blue-100 bg-white hover:border-gray-300'}`}
      style={{ color: '#111827' }}
      {...props}
    />
  );
}

// ─── Step indicator (left panel) ──────────────────────────────────────────────
function StepPanel({ current }) {
  return (
    <div className="hidden lg:flex flex-col gap-1 py-10 px-8 min-w-[220px]"
      style={{ background: 'linear-gradient(160deg,#0f172a 0%,#1e293b 100%)' }}>

      {/* Logo area */}
      <div className="mb-10">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm"
            style={{ background: 'linear-gradient(135deg,#10b981,#3b82f6)' }}>L</div>
          <span className="font-black text-white text-lg">Lihiket</span>
        </Link>
        <p className="text-xs mt-3 leading-relaxed" style={{ color: '#64748b' }}>
          Home Tutoring Registration
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-1 flex-1">
        {STEPS.map((s, i) => {
          const done   = i < current;
          const active = i === current;
          return (
            <div key={s.id} className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all"
              style={{ background: active ? `${s.color}18` : 'transparent' }}>
              {/* circle */}
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 transition-all"
                style={done
                  ? { background: '#10b981', color: '#fff' }
                  : active
                    ? { background: s.color, color: '#fff' }
                    : { background: 'rgba(255,255,255,0.07)', color: '#64748b' }}>
                {done ? <FiCheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <div>
                <p className="text-sm font-bold leading-tight"
                  style={{ color: done || active ? '#f1f5f9' : '#475569' }}>{s.label}</p>
                <p className="text-xs" style={{ color: '#475569' }}>{s.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust badges */}
      <div className="mt-8 space-y-2.5 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {[
          { icon: FiShield, text: 'Your data is private' },
          { icon: FiUsers,  text: '500+ matched students' },
          { icon: FiAward,  text: 'Verified tutors only' },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-2">
            <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#34d399' }} />
            <span className="text-xs" style={{ color: '#64748b' }}>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Progress bar (mobile) ─────────────────────────────────────────────────────
function MobileProgress({ current }) {
  const pct = ((current + 1) / STEPS.length) * 100;
  return (
    <div className="lg:hidden px-6 py-4 bg-white border-b border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-bold text-gray-800">
          Step {current + 1}/{STEPS.length} — {STEPS[current].label}
        </p>
        <p className="text-xs font-semibold text-gray-400">{Math.round(pct)}% complete</p>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <motion.div className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg,${STEPS[current].color},${STEPS[current].color}99)` }}
          animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} />
      </div>
    </div>
  );
}

// ─── Review row ────────────────────────────────────────────────────────────────
function RRow({ label, value, color = '#6b7280' }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5" style={{ borderBottom: '1px solid #f3f4f6' }}>
      <p className="text-xs font-semibold w-36 flex-shrink-0 mt-0.5" style={{ color: '#9ca3af' }}>{label}</p>
      <p className="text-sm font-medium text-gray-800 flex-1">{value}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════════════════════════
export default function HomeTutorRegister() {
  const { theme } = useTheme();
  const { user }  = useAuth();
  const dark      = theme === 'dark';

  const [step,       setStep]       = useState(0);
  const [form,       setForm]       = useState({
    ...EMPTY,
    fullName:   user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '',
    email:      user?.email      || '',
    phone:      user?.phone      || '',
    gradeLevel: user?.gradeLevel || '',
  });
  const [errors,     setErrors]     = useState({});
  const [locating,   setLocating]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);

  useEffect(() => {
    if (user?.gradeLevel) setForm(p => ({ ...p, gradeLevel: p.gradeLevel || user.gradeLevel }));
  }, [user]);

  const set      = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(e => { const n={...e}; delete n[k]; return n; }); };
  const toggleSub = s  => setForm(p => ({ ...p, subjects: p.subjects.includes(s) ? p.subjects.filter(x=>x!==s) : [...p.subjects,s] }));

  // ── GPS ─────────────────────────────────────────────────────────────────────
  const captureGPS = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported.'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude:lat, longitude:lng } }) => {
        setForm(p => ({ ...p, location:{lat,lng}, mapLink:`https://www.google.com/maps?q=${lat},${lng}` }));
        toast.success('Location captured!');
        setLocating(false);
      },
      err => { toast.error(`Location error: ${err.message}`); setLocating(false); },
      { enableHighAccuracy:true, timeout:12000 }
    );
  };

  // ── Validate current step ────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (step === 0) {
      if (!form.fullName.trim())                          e.fullName  = 'Full name is required';
      if (!form.age || +form.age<3 || +form.age>100)     e.age       = 'Enter a valid age (3–100)';
      if (!form.sex)                                      e.sex       = 'Please select your sex';
      if (!form.phone.trim())                             e.phone     = 'Phone number is required';
      if (!form.email.trim())                             e.email     = 'Email is required';
    }
    if (step === 1) {
      if (!form.gradeLevel)                               e.gradeLevel = 'Please select a grade level';
    }
    if (step === 3) {
      if (!form.city.trim())                              e.city      = 'City is required';
      if (!form.address.trim())                           e.address   = 'House No. / address is required';
    }
    setErrors(e);
    if (Object.keys(e).length) { toast.error('Please fix the highlighted fields.'); return false; }
    return true;
  };

  const next = () => { if (validate()) { setStep(s => Math.min(STEPS.length-1, s+1)); window.scrollTo({top:0,behavior:'smooth'}); } };
  const prev = () => { setStep(s => Math.max(0, s-1)); window.scrollTo({top:0,behavior:'smooth'}); };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitRegistration(form);
      setSubmitted(true);
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally { setSubmitting(false); }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  //  SUCCESS
  // ─────────────────────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6"
        style={{ background: dark ? '#020817' : '#f0f9ff' }}>
        <motion.div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
          initial={{ opacity:0, scale:0.88, y:40 }}
          animate={{ opacity:1, scale:1, y:0 }}
          transition={{ type:'spring', stiffness:260, damping:22 }}>

          {/* Top banner */}
          <div className="h-2 w-full" style={{ background:'linear-gradient(90deg,#10b981,#3b82f6,#8b5cf6)' }} />

          <div className="px-8 py-10 text-center">
            <motion.div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background:'rgba(16,185,129,0.1)' }}
              initial={{ scale:0 }} animate={{ scale:1 }}
              transition={{ type:'spring', stiffness:300, damping:18, delay:0.15 }}>
              <FiCheckCircle style={{ color:'#10b981', width:40, height:40 }} />
            </motion.div>

            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
              Registration Successful!
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Thank you, <span className="font-bold text-gray-800">{form.fullName}</span>.<br />
              We'll call <span className="font-bold text-gray-800">{form.phone}</span> within{' '}
              <span className="font-bold text-emerald-600">24 hours</span> to confirm your tutor.
            </p>

            {/* Summary strip */}
            <div className="rounded-2xl text-left mb-6 overflow-hidden"
              style={{ border:'1px solid #e5e7eb' }}>
              <div className="px-4 py-2 bg-gray-50">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Your Summary</p>
              </div>
              <div className="px-4 py-3 space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Grade</span><span className="font-semibold text-gray-800">{form.gradeLevel} — {GRADE_LABEL[form.gradeLevel]}</span></div>
                {form.subjects.length > 0 && <div className="flex justify-between"><span className="text-gray-400">Subjects</span><span className="font-semibold text-gray-800">{form.subjects.join(', ')}</span></div>}
                <div className="flex justify-between"><span className="text-gray-400">Location</span><span className="font-semibold text-gray-800">{[form.address, form.city].filter(Boolean).join(', ')}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Hours/week</span><span className="font-semibold text-gray-800">{form.hoursPerWeek} hrs</span></div>
              </div>
            </div>

            {form.mapLink && (
              <a href={form.mapLink} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-500 hover:underline mb-6">
                <FiNavigation className="w-4 h-4" /> View your shared location ↗
              </a>
            )}

            <button onClick={() => { setSubmitted(false); setStep(0); setForm({...EMPTY}); setErrors({}); }}
              className="w-full py-3.5 rounded-2xl font-bold text-white text-sm"
              style={{ background:'linear-gradient(135deg,#10b981,#0d9488)' }}>
              Register Another Student
            </button>

            <Link to="/" className="block mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors">
              ← Back to homepage
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  //  FORM
  // ─────────────────────────────────────────────────────────────────────────────
  const stepColor = STEPS[step].color;

  const stepContent = () => {
    // ── STEP 0: Personal ────────────────────────────────────────────────────────
    if (step === 0) return (
      <div className="space-y-5">
        <Field label="Full Name" required error={errors.fullName}>
          <Inp icon={FiUser} value={form.fullName} error={errors.fullName}
            onChange={e => set('fullName', e.target.value)}
            placeholder="e.g. Abebe Girma Tadesse" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Age" required error={errors.age}>
            <Inp type="number" min="3" max="100" value={form.age} error={errors.age}
              onChange={e => set('age', e.target.value)} placeholder="e.g. 14" />
          </Field>

          <Field label="Sex" required error={errors.sex}>
            <div className="flex gap-2 h-[46px]">
              {['Male','Female','Other'].map(s => (
                <button key={s} type="button"
                  onClick={() => set('sex', s.toLowerCase())}
                  className="flex-1 rounded-xl text-xs font-bold border transition-all"
                  style={form.sex === s.toLowerCase()
                    ? { background:'#3b82f6', color:'#fff', border:'1px solid #3b82f6' }
                    : { background:'#fff', color:'#9ca3af', border:'1px solid #e5e7eb' }}>
                  {s}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Phone Number" required error={errors.phone}>
            <Inp icon={FiPhone} type="tel" value={form.phone} error={errors.phone}
              onChange={e => set('phone', e.target.value)} placeholder="09XXXXXXXX" />
          </Field>
          <Field label="Email Address" required error={errors.email}>
            <Inp icon={FiMail} type="email" value={form.email} error={errors.email}
              onChange={e => set('email', e.target.value)} placeholder="abebe@example.com" />
          </Field>
        </div>
      </div>
    );

    // ── STEP 1: Academic ────────────────────────────────────────────────────────
    if (step === 1) return (
      <div className="space-y-6">
        <Field label="Grade Level" required error={errors.gradeLevel}>
          <div className="space-y-3">
            {GRADE_GROUPS.map(grp => (
              <div key={grp.label}>
                <p className="text-xs font-bold mb-2" style={{ color: grp.color }}>{grp.label}</p>
                <div className="flex flex-wrap gap-2">
                  {grp.grades.map(g => (
                    <button key={g} type="button"
                      onClick={() => set('gradeLevel', g)}
                      className="px-4 py-2 rounded-xl text-sm font-bold border transition-all"
                      style={form.gradeLevel === g
                        ? { background: grp.color, color:'#fff', border:`1px solid ${grp.color}` }
                        : { background:'#fff', color:'#6b7280', border:'1px solid #e5e7eb' }}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {form.gradeLevel && (
            <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-xl"
              style={{ background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.2)' }}>
              <FiCheckCircle className="w-4 h-4 flex-shrink-0" style={{ color:'#10b981' }} />
              <p className="text-sm font-semibold" style={{ color:'#10b981' }}>
                {GRADE_LABEL[form.gradeLevel]}
              </p>
            </div>
          )}
        </Field>

        <Field label="Subjects Needed" hint="select all that apply">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SUBJECTS.map(({ name, icon }) => {
              const sel = form.subjects.includes(name);
              return (
                <button key={name} type="button"
                  onClick={() => toggleSub(name)}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold border text-left transition-all"
                  style={sel
                    ? { background:'rgba(16,185,129,0.08)', border:'1.5px solid #10b981', color:'#047857' }
                    : { background:'#fff', border:'1px solid #e5e7eb', color:'#6b7280' }}>
                  <span className="text-base leading-none">{icon}</span>
                  {name}
                  {sel && <FiCheckCircle className="w-3.5 h-3.5 ml-auto text-emerald-500 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </Field>
      </div>
    );

    // ── STEP 2: Schedule ────────────────────────────────────────────────────────
    if (step === 2) return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Hours per Week" hint="1–40 hrs">
            <Inp icon={FiClock} type="number" min="1" max="40" value={form.hoursPerWeek}
              onChange={e => set('hoursPerWeek', Number(e.target.value))} />
          </Field>
          <Field label="Preferred Start Date">
            <Inp icon={FiCalendar} type="date" value={form.startDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => set('startDate', e.target.value)} />
          </Field>
        </div>

        <Field label="Preferred Days & Times" hint="optional">
          <Inp value={form.preferredSchedule}
            onChange={e => set('preferredSchedule', e.target.value)}
            placeholder="e.g. Mon, Wed & Fri — afternoons after 3 PM" />
        </Field>

        <Field label="Additional Notes" hint="optional">
          <Textarea rows={4} value={form.message}
            onChange={e => set('message', e.target.value)}
            placeholder="Special requirements, topics to focus on, any questions for us…" />
        </Field>
      </div>
    );

    // ── STEP 3: Location ────────────────────────────────────────────────────────
    if (step === 3) return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="City" required error={errors.city}>
            <Inp value={form.city} error={errors.city}
              onChange={e => set('city', e.target.value)}
              placeholder="e.g. Addis Ababa, Bahir Dar" />
          </Field>
          <Field label="Sub-city / Woreda">
            <Inp value={form.subcity}
              onChange={e => set('subcity', e.target.value)}
              placeholder="e.g. Bole, Kirkos, Arada" />
          </Field>
          <Field label="Street / Road">
            <Inp value={form.street}
              onChange={e => set('street', e.target.value)}
              placeholder="e.g. Bole Road, Meskel Square area" />
          </Field>
          <Field label="House No. / Main Address" required error={errors.address}>
            <Inp icon={FiMapPin} value={form.address} error={errors.address}
              onChange={e => set('address', e.target.value)}
              placeholder="e.g. House 42, Block B" />
          </Field>
        </div>

        <Field label="Additional Address Description"
          hint="landmarks, gate colour, floor…">
          <Textarea rows={2} value={form.additionalAddress}
            onChange={e => set('additionalAddress', e.target.value)}
            placeholder="e.g. Blue gate, near St. Gabriel Church, 2nd floor on the left" />
        </Field>

        {/* GPS */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-sm font-semibold text-gray-700">GPS Location</p>
            <span className="text-xs text-gray-400">optional</span>
          </div>
          <button type="button" onClick={captureGPS} disabled={locating}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl
                       text-sm font-bold border-2 transition-all disabled:opacity-60"
            style={form.location.lat
              ? { background:'rgba(16,185,129,0.06)', borderColor:'#10b981', color:'#047857' }
              : { background:'#fff', borderColor:'#e5e7eb', color:'#6b7280' }}>
            {locating
              ? <><FiLoader className="w-4 h-4 animate-spin" /> Detecting your location…</>
              : form.location.lat
                ? <><FiCheckCircle className="w-4 h-4 text-emerald-500" /> Location Captured — <span className="font-mono text-xs text-emerald-600">{form.location.lat.toFixed(4)}, {form.location.lng.toFixed(4)}</span></>
                : <><FiNavigation className="w-4 h-4" /> Share My GPS Location</>}
          </button>
          {form.location.lat && (
            <a href={form.mapLink} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:underline mt-2">
              View on Google Maps ↗
            </a>
          )}
        </div>
      </div>
    );

    // ── STEP 4: Review ──────────────────────────────────────────────────────────
    if (step === 4) return (
      <div className="space-y-4">
        <p className="text-sm text-gray-500 mb-4">
          Please review your information below before submitting.
        </p>

        {[
          { title:'Personal',  color:'#3b82f6', rows:[
            ['Full Name',   form.fullName],
            ['Age',         form.age ? `${form.age} years` : null],
            ['Sex',         form.sex ? form.sex.charAt(0).toUpperCase()+form.sex.slice(1) : null],
            ['Phone',       form.phone],
            ['Email',       form.email],
          ]},
          { title:'Academic',  color:'#10b981', rows:[
            ['Grade Level', form.gradeLevel ? `${form.gradeLevel} — ${GRADE_LABEL[form.gradeLevel]}` : null],
            ['Subjects',    form.subjects.length ? form.subjects.join(', ') : 'Not specified'],
          ]},
          { title:'Schedule',  color:'#8b5cf6', rows:[
            ['Hours/Week',  `${form.hoursPerWeek} hours`],
            ['Start Date',  form.startDate || 'Not specified'],
            ['Preferred',   form.preferredSchedule || 'Not specified'],
          ]},
          { title:'Location',  color:'#f59e0b', rows:[
            ['City',        form.city],
            ['Sub-city',    form.subcity || null],
            ['Street',      form.street  || null],
            ['Address',     form.address],
            ['Additional',  form.additionalAddress || null],
            ['GPS',         form.location.lat ? `${form.location.lat.toFixed(5)}, ${form.location.lng.toFixed(5)}` : 'Not shared'],
          ]},
        ].map(sec => (
          <div key={sec.title} className="rounded-2xl overflow-hidden border border-gray-100">
            <div className="px-4 py-2.5 flex items-center gap-2"
              style={{ background: `${sec.color}0a` }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: sec.color }} />
              <p className="text-xs font-black uppercase tracking-wider" style={{ color: sec.color }}>
                {sec.title}
              </p>
            </div>
            <div className="px-4 divide-y divide-gray-50">
              {sec.rows.filter(([,v]) => v).map(([label, value]) => (
                <RRow key={label} label={label} value={value} />
              ))}
            </div>
          </div>
        ))}

        <div className="flex items-start gap-2.5 p-4 rounded-xl mt-2"
          style={{ background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.15)' }}>
          <FiShield className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color:'#10b981' }} />
          <p className="text-xs text-gray-500 leading-relaxed">
            By submitting you agree to be contacted within 24 hours. Your data is private and used
            only to match you with the right tutor.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ background: dark ? '#020817' : '#f8fafc' }}>
      <div className="min-h-screen max-w-5xl mx-auto lg:flex lg:shadow-2xl lg:rounded-none" style={{ background:'transparent' }}>

        {/* ── Left panel ── */}
        <StepPanel current={step} />

        {/* ── Right panel ── */}
        <div className="flex-1 flex flex-col bg-white">
          <MobileProgress current={step} />

          {/* Header */}
          <div className="px-6 sm:px-10 pt-8 pb-6" style={{ borderBottom:'1px solid #f3f4f6' }}>
            <div className="flex items-center gap-2 mb-1">
              {step > 0 && (
                <button onClick={prev}
                  className="mr-1 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                  style={{ color:'#9ca3af' }}>
                  <FiArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900">{STEPS[step].label}</h1>
                <p className="text-sm text-gray-400 mt-0.5">{STEPS[step].desc}</p>
              </div>
            </div>
          </div>

          {/* Step content */}
          <div className="flex-1 px-6 sm:px-10 py-8 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div key={step}
                initial={{ opacity:0, x:20 }}
                animate={{ opacity:1, x:0 }}
                exit={{ opacity:0, x:-20 }}
                transition={{ duration:0.2 }}>
                {stepContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer nav */}
          <div className="px-6 sm:px-10 py-5 flex items-center gap-3"
            style={{ borderTop:'1px solid #f3f4f6' }}>
            {step > 0 && (
              <button onClick={prev}
                className="px-5 py-3 rounded-xl text-sm font-bold border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all">
                Back
              </button>
            )}

            {step < STEPS.length - 1 ? (
              <button onClick={next}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ background:`linear-gradient(135deg,${stepColor},${stepColor}cc)`,
                         boxShadow:`0 4px 16px ${stepColor}40` }}>
                Continue
                <FiChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white disabled:opacity-60 transition-all"
                style={{ background:'linear-gradient(135deg,#10b981,#0d9488)',
                         boxShadow:'0 4px 20px rgba(16,185,129,0.4)' }}>
                {submitting
                  ? <><FiLoader className="w-4 h-4 animate-spin" /> Submitting…</>
                  : <><FiCheckCircle className="w-4 h-4" /> Submit Registration</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
