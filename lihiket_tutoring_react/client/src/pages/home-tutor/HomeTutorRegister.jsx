import { useState, useEffect } from 'react';
import { useTheme } from '../../store/theme/ThemeContext';
import { useAuth }  from '../../store/auth/AuthContext';
import { motion }   from 'framer-motion';
import toast        from 'react-hot-toast';
import {
  FiUser, FiPhone, FiMail, FiMapPin, FiNavigation,
  FiCheckCircle, FiLoader, FiBook, FiClock, FiCalendar,
  FiHome, FiAlertCircle,
} from 'react-icons/fi';
import { submitRegistration } from '../../api/hometutorregistration.api';

// ΓöÇΓöÇΓöÇ Constants ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const GRADE_LEVELS = [
  'KG1','KG2',
  'G1','G2','G3','G4','G5','G6',
  'G7','G8','G9',
  'G10','G11','G12',
  'HL',
];

const GRADE_LABEL = {
  KG1:'Kindergarten 1', KG2:'Kindergarten 2',
  G1:'Grade 1',  G2:'Grade 2',  G3:'Grade 3',  G4:'Grade 4',
  G5:'Grade 5',  G6:'Grade 6',  G7:'Grade 7',  G8:'Grade 8',
  G9:'Grade 9',  G10:'Grade 10', G11:'Grade 11', G12:'Grade 12',
  HL:'Higher Level',
};

const SUBJECTS = [
  'Mathematics','Physics','Chemistry','Biology',
  'English','Amharic','History','Geography',
  'ICT','Economics','Civics','Art',
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

// ΓöÇΓöÇΓöÇ Small helpers ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const Required = () => <span className="text-red-400 ml-0.5">*</span>;

// ΓöÇΓöÇΓöÇ Main page ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
export default function HomeTutorRegister() {
  const { theme } = useTheme();
  const { user }  = useAuth();
  const dark      = theme === 'dark';

  // ΓöÇΓöÇ Design tokens ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  const pageBg  = dark ? '#020817'                   : '#f0f4ff';
  const cardBg  = dark ? '#0f172a'                   : '#ffffff';
  const bd      = dark ? 'rgba(255,255,255,0.08)'    : 'rgba(0,0,0,0.09)';
  const txt     = dark ? '#f1f5f9'                   : '#0f172a';
  const txtSub  = dark ? '#94a3b8'                   : '#475569';
  const txtMute = dark ? '#64748b'                   : '#9ca3af';
  const iBg     = dark ? 'rgba(255,255,255,0.05)'    : '#f8fafc';
  const iBd     = dark ? 'rgba(255,255,255,0.10)'    : 'rgba(0,0,0,0.12)';
  const iClr    = dark ? '#f1f5f9'                   : '#0f172a';

  const iBase  = 'w-full px-3.5 py-2.5 rounded-xl text-sm outline-none ' +
                 'focus:ring-2 focus:ring-blue-500/40 transition-all';
  const iStyle = { background: iBg, border: `1px solid ${iBd}`, color: iClr };

  // ΓöÇΓöÇ State ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  const [form, setForm]       = useState({
    ...EMPTY,
    fullName: user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '',
    email:    user?.email    || '',
    phone:    user?.phone    || '',
    gradeLevel: user?.gradeLevel || '',
  });
  const [errors,     setErrors]     = useState({});
  const [locating,   setLocating]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);

  // Pre-fill gradeLevel if student logs in after mount
  useEffect(() => {
    if (user?.gradeLevel) setForm(p => ({ ...p, gradeLevel: p.gradeLevel || user.gradeLevel }));
  }, [user]);

  const set   = (k, v) => { setForm(p => ({ ...p, [k]: v })); clearErr(k); };
  const clearErr = k  => setErrors(e => { const n = { ...e }; delete n[k]; return n; });

  const toggleSubject = s =>
    setForm(p => ({
      ...p,
      subjects: p.subjects.includes(s)
        ? p.subjects.filter(x => x !== s)
        : [...p.subjects, s],
    }));

  // ΓöÇΓöÇ GPS ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  const captureGPS = () => {
    if (!navigator.geolocation) { toast.error('Geolocation is not supported.'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude: lat, longitude: lng } }) => {
        setForm(p => ({ ...p, location: { lat, lng }, mapLink: `https://www.google.com/maps?q=${lat},${lng}` }));
        toast.success('Location captured!');
        setLocating(false);
      },
      err => { toast.error(`Location error: ${err.message}`); setLocating(false); },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  // ΓöÇΓöÇ Validation ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  const validate = () => {
    const e = {};
    if (!form.fullName.trim())                        e.fullName   = 'Full name is required';
    if (!form.age || +form.age < 3 || +form.age > 100) e.age       = 'Enter a valid age (3ΓÇô100)';
    if (!form.sex)                                    e.sex        = 'Please select your sex';
    if (!form.phone.trim())                           e.phone      = 'Phone number is required';
    if (!form.email.trim())                           e.email      = 'Email address is required';
    if (!form.gradeLevel)                             e.gradeLevel = 'Please select your grade level';
    if (!form.city.trim())                            e.city       = 'City is required';
    if (!form.address.trim())                         e.address    = 'House No. / address is required';
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.error('Please fix the highlighted fields.');
      return false;
    }
    return true;
  };

  // ΓöÇΓöÇ Submit ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await submitRegistration(form);
      setSubmitted(true);
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  //  SUCCESS SCREEN
  // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: pageBg }}>
        <motion.div
          className="w-full max-w-md rounded-3xl p-10 text-center shadow-2xl"
          style={{ background: cardBg, border: `1px solid ${bd}` }}
          initial={{ opacity: 0, scale: 0.88, y: 40 }}
          animate={{ opacity: 1, scale: 1,   y: 0  }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}>

          <motion.div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(16,185,129,0.12)' }}
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.15 }}>
            <FiCheckCircle style={{ color: '#10b981', width: 48, height: 48 }} />
          </motion.div>

          <h2 className="text-2xl font-black mb-3" style={{ color: txt }}>
            Registration Submitted!
          </h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: txtSub }}>
            Thank you, <strong style={{ color: txt }}>{form.fullName}</strong>!<br />
            We received your request for home tutoring.<br />
            Our team will contact <strong style={{ color: txt }}>{form.phone}</strong> within
            <strong style={{ color: txt }}> 24 hours</strong> to confirm your assigned tutor.
          </p>

          {form.mapLink && (
            <a href={form.mapLink} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold mb-6 hover:opacity-80 transition"
              style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)', color: '#60a5fa' }}>
              <FiNavigation className="w-4 h-4" /> View your shared location Γåù
            </a>
          )}

          <button
            onClick={() => { setSubmitted(false); setForm({ ...EMPTY }); setErrors({}); }}
            className="w-full py-3 rounded-2xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#10b981,#0d9488)' }}>
            Register Another Student
          </button>
        </motion.div>
      </div>
    );
  }

  // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  //  FORM
  // ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  const Err = ({ field }) =>
    errors[field]
      ? <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><FiAlertCircle className="w-3 h-3" />{errors[field]}</p>
      : null;

  const secHdr = (label, color) => (
    <div className="flex items-center gap-3 mb-5">
      <div className="h-px flex-1 rounded-full" style={{ background: `${color}30` }} />
      <span className="text-xs font-black uppercase tracking-widest px-2" style={{ color }}>{label}</span>
      <div className="h-px flex-1 rounded-full" style={{ background: `${color}30` }} />
    </div>
  );

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: pageBg }}>
      <div className="max-w-2xl mx-auto">

        {/* ΓöÇΓöÇ Page header ΓöÇΓöÇ */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.28)', color: '#34d399' }}>
            <FiHome className="w-3.5 h-3.5" /> Home Tutoring
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-2" style={{ color: txt }}>
            Register for Home Tutoring
          </h1>
          <p className="text-sm" style={{ color: txtSub }}>
            Fill in the form below and we will match you with the right tutor within 24 hours.
          </p>
        </div>

        {/* ΓöÇΓöÇ Card ΓöÇΓöÇ */}
        <motion.div
          className="rounded-3xl shadow-xl"
          style={{ background: cardBg, border: `1px solid ${bd}` }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}>

          <form onSubmit={handleSubmit} noValidate>

            {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ PERSONAL INFORMATION ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
            <div className="px-6 sm:px-8 pt-8 pb-6"
              style={{ borderBottom: `1px solid ${bd}` }}>
              {secHdr('Personal Information', '#3b82f6')}

              <div className="space-y-4">
                {/* Full name */}
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: txtSub }}>
                    Full Name <Required />
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: txtMute }} />
                    <input value={form.fullName} onChange={e => set('fullName', e.target.value)}
                      placeholder="e.g. Abebe Girma Tadesse"
                      className={`${iBase} ${errors.fullName ? 'ring-2 ring-red-400/50' : ''}`}
                      style={{ ...iStyle, paddingLeft: '2.5rem' }} />
                  </div>
                  <Err field="fullName" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Age */}
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: txtSub }}>
                      Age <Required />
                    </label>
                    <input type="number" min="3" max="100" value={form.age}
                      onChange={e => set('age', e.target.value)}
                      placeholder="e.g. 14"
                      className={`${iBase} ${errors.age ? 'ring-2 ring-red-400/50' : ''}`}
                      style={iStyle} />
                    <Err field="age" />
                  </div>

                  {/* Sex */}
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: txtSub }}>
                      Sex <Required />
                    </label>
                    <div className="flex gap-2">
                      {['Male','Female','Other'].map(s => (
                        <button key={s} type="button"
                          onClick={() => set('sex', s.toLowerCase())}
                          className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all"
                          style={form.sex === s.toLowerCase()
                            ? { background: '#3b82f6', color: '#fff', border: '1px solid #3b82f6' }
                            : { background: iBg, color: txtSub, border: `1px solid ${iBd}` }}>
                          {s}
                        </button>
                      ))}
                    </div>
                    <Err field="sex" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: txtSub }}>
                      Phone Number <Required />
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: txtMute }} />
                      <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                        placeholder="09XXXXXXXX"
                        className={`${iBase} ${errors.phone ? 'ring-2 ring-red-400/50' : ''}`}
                        style={{ ...iStyle, paddingLeft: '2.5rem' }} />
                    </div>
                    <Err field="phone" />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: txtSub }}>
                      Email Address <Required />
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: txtMute }} />
                      <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                        placeholder="abebe@example.com"
                        className={`${iBase} ${errors.email ? 'ring-2 ring-red-400/50' : ''}`}
                        style={{ ...iStyle, paddingLeft: '2.5rem' }} />
                    </div>
                    <Err field="email" />
                  </div>
                </div>
              </div>
            </div>

            {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ ACADEMIC ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
            <div className="px-6 sm:px-8 py-6"
              style={{ borderBottom: `1px solid ${bd}` }}>
              {secHdr('Academic Details', '#10b981')}

              <div className="space-y-4">
                {/* Grade level */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: txtSub }}>
                    Grade Level <Required />
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-2">
                    {GRADE_LEVELS.map(g => (
                      <button key={g} type="button"
                        title={GRADE_LABEL[g]}
                        onClick={() => set('gradeLevel', g)}
                        className="py-2 rounded-xl text-xs font-bold border transition-all"
                        style={form.gradeLevel === g
                          ? { background: '#10b981', color: '#fff', border: '1px solid #10b981' }
                          : { background: iBg, color: txtSub, border: `1px solid ${iBd}` }}>
                        {g}
                      </button>
                    ))}
                  </div>
                  {form.gradeLevel && (
                    <p className="text-xs mt-1.5 font-semibold" style={{ color: '#34d399' }}>
                      Γ£ô {GRADE_LABEL[form.gradeLevel]}
                    </p>
                  )}
                  <Err field="gradeLevel" />
                </div>

                {/* Subjects */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: txtSub }}>
                    Subjects Needed
                    <span className="font-normal text-xs ml-2" style={{ color: txtMute }}>select all that apply</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SUBJECTS.map(s => (
                      <button key={s} type="button"
                        onClick={() => toggleSubject(s)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                        style={form.subjects.includes(s)
                          ? { background: '#10b981', color: '#fff', border: '1px solid #10b981' }
                          : { background: iBg, color: txtSub, border: `1px solid ${iBd}` }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ SCHEDULE ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
            <div className="px-6 sm:px-8 py-6"
              style={{ borderBottom: `1px solid ${bd}` }}>
              {secHdr('Schedule Preferences', '#8b5cf6')}

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Hours/week */}
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: txtSub }}>
                      Hours per Week
                    </label>
                    <div className="relative">
                      <FiClock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: txtMute }} />
                      <input type="number" min="1" max="40" value={form.hoursPerWeek}
                        onChange={e => set('hoursPerWeek', Number(e.target.value))}
                        className={iBase} style={{ ...iStyle, paddingLeft: '2.5rem' }} />
                    </div>
                  </div>

                  {/* Start date */}
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: txtSub }}>
                      Preferred Start Date
                    </label>
                    <div className="relative">
                      <FiCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: txtMute }} />
                      <input type="date" value={form.startDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={e => set('startDate', e.target.value)}
                        className={iBase} style={{ ...iStyle, paddingLeft: '2.5rem' }} />
                    </div>
                  </div>
                </div>

                {/* Preferred schedule */}
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: txtSub }}>
                    Preferred Days &amp; Times
                  </label>
                  <input value={form.preferredSchedule}
                    onChange={e => set('preferredSchedule', e.target.value)}
                    placeholder="e.g. Mon, Wed &amp; Fri ΓÇö afternoons after 3 PM"
                    className={iBase} style={iStyle} />
                </div>
              </div>
            </div>

            {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ LOCATION ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
            <div className="px-6 sm:px-8 py-6"
              style={{ borderBottom: `1px solid ${bd}` }}>
              {secHdr('Your Location', '#f59e0b')}

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* City */}
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: txtSub }}>
                      City <Required />
                    </label>
                    <input value={form.city} onChange={e => set('city', e.target.value)}
                      placeholder="e.g. Addis Ababa, Bahir Dar"
                      className={`${iBase} ${errors.city ? 'ring-2 ring-red-400/50' : ''}`}
                      style={iStyle} />
                    <Err field="city" />
                  </div>

                  {/* Sub-city */}
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: txtSub }}>
                      Sub-city / Woreda
                    </label>
                    <input value={form.subcity} onChange={e => set('subcity', e.target.value)}
                      placeholder="e.g. Bole, Kirkos, Arada"
                      className={iBase} style={iStyle} />
                  </div>

                  {/* Street */}
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: txtSub }}>
                      Street / Road
                    </label>
                    <input value={form.street} onChange={e => set('street', e.target.value)}
                      placeholder="e.g. Bole Road, Meskel Square area"
                      className={iBase} style={iStyle} />
                  </div>

                  {/* House No. */}
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: txtSub }}>
                      House No. / Main Address <Required />
                    </label>
                    <div className="relative">
                      <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: txtMute }} />
                      <input value={form.address} onChange={e => set('address', e.target.value)}
                        placeholder="e.g. House 42, Block B"
                        className={`${iBase} ${errors.address ? 'ring-2 ring-red-400/50' : ''}`}
                        style={{ ...iStyle, paddingLeft: '2.5rem' }} />
                    </div>
                    <Err field="address" />
                  </div>
                </div>

                {/* Additional description */}
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: txtSub }}>
                    Additional Address Description
                    <span className="font-normal text-xs ml-2" style={{ color: txtMute }}>landmarks, gate colour, floorΓÇª</span>
                  </label>
                  <textarea rows={2} value={form.additionalAddress}
                    onChange={e => set('additionalAddress', e.target.value)}
                    placeholder="e.g. Blue gate, near St. Gabriel Church, 2nd floor on the left"
                    className={`${iBase} resize-none`} style={iStyle} />
                </div>

                {/* GPS share */}
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: txtSub }}>
                    GPS Location
                    <span className="font-normal text-xs ml-2" style={{ color: txtMute }}>optional ΓÇö helps the tutor find you faster</span>
                  </label>
                  <button type="button" onClick={captureGPS} disabled={locating}
                    className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl
                               text-sm font-semibold border transition-all disabled:opacity-60"
                    style={form.location.lat
                      ? { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981' }
                      : { background: iBg, border: `1px solid ${iBd}`, color: txtSub }}>
                    {locating
                      ? <><FiLoader className="w-4 h-4 animate-spin" /> Getting your locationΓÇª</>
                      : form.location.lat
                        ? <><FiCheckCircle className="w-4 h-4" /> GPS Location Captured Γ£ô</>
                        : <><FiNavigation className="w-4 h-4" /> Share My GPS Location</>}
                  </button>

                  {form.location.lat && (
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <code className="text-xs px-2.5 py-1 rounded-lg"
                        style={{ background: 'rgba(16,185,129,0.08)', color: '#10b981' }}>
                        {form.location.lat.toFixed(6)}, {form.location.lng.toFixed(6)}
                      </code>
                      <a href={form.mapLink} target="_blank" rel="noreferrer"
                        className="text-xs font-semibold hover:underline" style={{ color: '#60a5fa' }}>
                        Preview on Google Maps Γåù
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ EXTRA MESSAGE ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
            <div className="px-6 sm:px-8 py-6"
              style={{ borderBottom: `1px solid ${bd}` }}>
              {secHdr('Additional Notes', '#64748b')}
              <textarea rows={3} value={form.message}
                onChange={e => set('message', e.target.value)}
                placeholder="Any extra requirements, topics to focus on, special needs, or questions for usΓÇª"
                className={`${iBase} resize-none`} style={iStyle} />
            </div>

            {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ SUBMIT ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
            <div className="px-6 sm:px-8 py-6">
              <p className="text-xs text-center mb-5" style={{ color: txtMute }}>
                Fields marked <span className="text-red-400 font-bold">*</span> are required.
                Your information is private and used only to match you with a tutor.
              </p>
              <button type="submit" disabled={submitting}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl
                           font-bold text-base text-white disabled:opacity-60 transition-all"
                style={{
                  background: 'linear-gradient(135deg,#10b981,#0d9488)',
                  boxShadow: '0 4px 24px rgba(16,185,129,0.35)',
                }}>
                {submitting
                  ? <><FiLoader className="w-5 h-5 animate-spin" /> SubmittingΓÇª</>
                  : <><FiCheckCircle className="w-5 h-5" /> Submit Registration</>}
              </button>
            </div>

          </form>
        </motion.div>

        <p className="text-center text-xs mt-6 pb-6" style={{ color: txtMute }}>
          ≡ƒöÆ Your data is kept private and only used to assign you the right tutor.
        </p>
      </div>
    </div>
  );
}

