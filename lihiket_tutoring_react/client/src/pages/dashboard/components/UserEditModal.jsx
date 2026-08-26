import { useState, useEffect } from 'react';
import { FiX, FiSave } from 'react-icons/fi';
import { getUser, updateUser } from '../../../api/user.api';
import toast from 'react-hot-toast';

const GRADE_LEVELS = [
  'KG1','KG2','G1','G2','G3','G4','G5','G6',
  'G7','G8','G9','G10','G11','G12','HL',
];

// ── reusable field ─────────────────────────────────────────────────────────────
function Field({ label, name, type = 'text', value, onChange, options, theme, required, span2, hint }) {
  const inputCls = `w-full px-3 py-2 rounded-xl border text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    theme === 'dark'
      ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500'
      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
  }`;
  const lblCls = `block text-xs font-semibold mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`;

  return (
    <div className={span2 ? 'sm:col-span-2' : ''}>
      <label className={lblCls}>
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {options ? (
        <select name={name} value={value} onChange={onChange} className={inputCls}>
          <option value="">— select —</option>
          {options.map(o =>
            typeof o === 'string'
              ? <option key={o} value={o}>{o}</option>
              : <option key={o.value} value={o.value}>{o.label}</option>
          )}
        </select>
      ) : (
        <input type={type} name={name} value={value} onChange={onChange} className={inputCls} />
      )}
      {hint && <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>{hint}</p>}
    </div>
  );
}

function Section({ title, color, theme }) {
  const cls = {
    blue:    theme === 'dark' ? 'text-blue-400 border-blue-400/30'      : 'text-blue-600 border-blue-200',
    emerald: theme === 'dark' ? 'text-emerald-400 border-emerald-400/30': 'text-emerald-600 border-emerald-200',
    sky:     theme === 'dark' ? 'text-sky-400 border-sky-400/30'        : 'text-sky-600 border-sky-200',
    purple:  theme === 'dark' ? 'text-purple-400 border-purple-400/30'  : 'text-purple-600 border-purple-200',
    amber:   theme === 'dark' ? 'text-amber-400 border-amber-400/30'    : 'text-amber-600 border-amber-200',
  };
  return (
    <p className={`text-xs font-bold uppercase tracking-wider pb-1.5 border-b mb-4 ${cls[color] || cls.blue}`}>
      {title}
    </p>
  );
}

const BOOL_OPTIONS = [
  { value: 'true',  label: 'Yes' },
  { value: 'false', label: 'No'  },
];

const EMPTY = {
  firstName: '', lastName: '', username: '', email: '',
  phone: '', bio: '', address: '', dateOfBirth: '',
  isVerified: 'false', isActive: 'true',
  // teacher
  specializedSubject: '', qualifications: '', experience: '',
  // student
  gradeLevel: '', parentFullName: '', parentEmail: '', parentPhone: '', parentCountry: '',
  // parent
  country: '',
};

export default function UserEditModal({ user: userStub, onClose, onSaved, theme }) {
  const [form,     setForm]     = useState(EMPTY);
  const [fullUser, setFullUser] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [saving,   setSaving]   = useState(false);

  // Fetch full user record on open
  useEffect(() => {
    if (!userStub) return;
    let cancelled = false;
    setFetching(true);
    setForm(EMPTY);
    setFullUser(null);

    getUser(userStub._id, userStub.userType)
      .then(res => {
        if (cancelled) return;
        const u = res.data;
        setFullUser(u);
        setForm({
          firstName:          u.firstName          || '',
          lastName:           u.lastName           || '',
          username:           u.username           || '',
          email:              u.email              || '',
          phone:              u.phone              || '',
          bio:                u.bio                || '',
          address:            u.address            || '',
          dateOfBirth:        u.dateOfBirth ? u.dateOfBirth.slice(0, 10) : '',
          isVerified:         String(u.isVerified  ?? false),
          isActive:           String(u.isActive    ?? true),
          // teacher
          specializedSubject: u.specializedSubject || '',
          qualifications:     u.qualifications     || '',
          experience:         u.experience         ?? '',
          // student
          gradeLevel:         u.gradeLevel         || '',
          parentFullName:     u.parentFullName     || '',
          parentEmail:        u.parentEmail        || '',
          parentPhone:        u.parentPhone        || '',
          parentCountry:      u.parentCountry      || '',
          // parent
          country:            u.country            || '',
        });
      })
      .catch(err => {
        if (!cancelled) {
          toast.error(err.message || 'Failed to load user details');
          onClose();
        }
      })
      .finally(() => { if (!cancelled) setFetching(false); });

    return () => { cancelled = true; };
  }, [userStub]);

  if (!userStub) return null;

  const dark     = theme === 'dark';
  const userType = userStub.userType;

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      toast.error('First name, last name and email are required');
      return;
    }

    const payload = {
      firstName:   form.firstName.trim(),
      lastName:    form.lastName.trim(),
      username:    form.username.trim(),
      email:       form.email.trim().toLowerCase(),
      phone:       form.phone.trim(),
      bio:         form.bio.trim(),
      address:     form.address.trim(),
      dateOfBirth: form.dateOfBirth || null,
      isVerified:  form.isVerified === 'true',
      isActive:    form.isActive   === 'true',
    };

    if (userType === 'teacher') {
      payload.specializedSubject = form.specializedSubject.trim();
      payload.qualifications     = form.qualifications.trim();
      payload.experience         = Number(form.experience) || 0;
    }
    if (userType === 'student') {
      payload.gradeLevel     = form.gradeLevel;
      payload.parentFullName = form.parentFullName.trim();
      payload.parentEmail    = form.parentEmail.trim().toLowerCase();
      payload.parentPhone    = form.parentPhone.trim();
      payload.parentCountry  = form.parentCountry.trim();
    }
    if (userType === 'parent') {
      payload.country = form.country.trim();
    }

    setSaving(true);
    try {
      await updateUser(userStub._id, userType, payload);
      toast.success('User updated successfully');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl ${
        dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>

        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b flex-shrink-0 ${
          dark ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <div>
            <h2 className={`text-lg font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>Edit User</h2>
            <p className={`text-xs mt-0.5 capitalize ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
              {userType} · {userStub.firstName} {userStub.lastName}
            </p>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg transition ${dark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Loading */}
        {fetching ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className={`text-sm ${dark ? 'text-slate-400' : 'text-gray-500'}`}>Loading user details…</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-7">

              {/* ── Personal Information ── */}
              <div>
                <Section title="Personal Information" color="blue" theme={theme} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="First Name"    name="firstName"   value={form.firstName}   onChange={handleChange} theme={theme} required />
                  <Field label="Last Name"     name="lastName"    value={form.lastName}    onChange={handleChange} theme={theme} required />
                  <Field label="Username"      name="username"    value={form.username}    onChange={handleChange} theme={theme} hint="Must be unique" />
                  <Field label="Phone"         name="phone"       value={form.phone}       onChange={handleChange} theme={theme} type="tel" />
                  <Field label="Email"         name="email"       value={form.email}       onChange={handleChange} theme={theme} type="email" required span2 hint="Must be unique" />
                  <Field label="Date of Birth" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} theme={theme} type="date" />
                  <Field label="Address"       name="address"     value={form.address}     onChange={handleChange} theme={theme} span2 />
                  <div className="sm:col-span-2">
                    <label className={`block text-xs font-semibold mb-1 ${dark ? 'text-slate-300' : 'text-gray-600'}`}>Bio</label>
                    <textarea
                      name="bio"
                      value={form.bio}
                      onChange={handleChange}
                      rows={3}
                      className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                        dark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* ── Account Status ── */}
              <div>
                <Section title="Account Status" color="amber" theme={theme} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Verified"
                    name="isVerified"
                    value={form.isVerified}
                    onChange={handleChange}
                    theme={theme}
                    options={BOOL_OPTIONS}
                    hint="Verified users can log in"
                  />
                  <Field
                    label="Active"
                    name="isActive"
                    value={form.isActive}
                    onChange={handleChange}
                    theme={theme}
                    options={BOOL_OPTIONS}
                    hint="Inactive users are blocked"
                  />
                </div>
              </div>

              {/* ── Teacher Details ── */}
              {userType === 'teacher' && (
                <div>
                  <Section title="Teacher Details" color="emerald" theme={theme} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Specialized Subject" name="specializedSubject" value={form.specializedSubject} onChange={handleChange} theme={theme} required span2 />
                    <Field label="Qualifications"      name="qualifications"     value={form.qualifications}     onChange={handleChange} theme={theme} span2 />
                    <Field label="Years of Experience" name="experience"         value={form.experience}         onChange={handleChange} theme={theme} type="number" />
                  </div>
                </div>
              )}

              {/* ── Student Details ── */}
              {userType === 'student' && (
                <div>
                  <Section title="Student Details" color="sky" theme={theme} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Grade Level"      name="gradeLevel"     value={form.gradeLevel}     onChange={handleChange} theme={theme} options={GRADE_LEVELS} required />
                    <Field label="Parent Full Name" name="parentFullName" value={form.parentFullName} onChange={handleChange} theme={theme} />
                    <Field label="Parent Email"     name="parentEmail"    value={form.parentEmail}    onChange={handleChange} theme={theme} type="email" />
                    <Field label="Parent Phone"     name="parentPhone"    value={form.parentPhone}    onChange={handleChange} theme={theme} type="tel" />
                    <Field label="Parent Country"   name="parentCountry"  value={form.parentCountry}  onChange={handleChange} theme={theme} />
                  </div>
                </div>
              )}

              {/* ── Parent Details ── */}
              {userType === 'parent' && (
                <div>
                  <Section title="Parent Details" color="purple" theme={theme} />
                  <Field label="Country" name="country" value={form.country} onChange={handleChange} theme={theme} />
                </div>
              )}

            </div>

            {/* Sticky footer */}
            <div className={`flex gap-3 px-6 py-4 border-t flex-shrink-0 ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition ${
                  dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                  : <><FiSave className="w-4 h-4" /> Save Changes</>
                }
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
