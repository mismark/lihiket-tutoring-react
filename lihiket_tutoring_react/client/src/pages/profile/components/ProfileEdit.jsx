import { useState, useEffect } from 'react';
import { FiSave, FiX } from 'react-icons/fi';
import { updateProfile } from '../../../api/auth.api';
import { useAuth } from '../../../store/auth/AuthContext';
import { useTheme } from '../../../store/theme/ThemeContext';
import toast from 'react-hot-toast';
import { Field, Section, GRADE_LEVELS } from './profile.utils.jsx';

/**
 * Edit profile form tab.
 * Pre-populates from `profile` prop, submits to PUT /api/auth/profile,
 * then calls updateUser() to sync the AuthContext immediately.
 */
export default function ProfileEdit({ profile, onSaved, onCancel }) {
  const { updateUser }  = useAuth();
  const { theme }       = useTheme();
  const dark            = theme === 'dark';
  const role            = profile?.role || 'student';

  const [form,   setForm]   = useState({});
  const [saving, setSaving] = useState(false);

  // Pre-populate whenever profile changes
  useEffect(() => {
    if (!profile) return;
    setForm({
      firstName:          profile.firstName          || '',
      lastName:           profile.lastName           || '',
      username:           profile.username           || '',
      email:              profile.email              || '',
      phone:              profile.phone              || '',
      bio:                profile.bio                || '',
      address:            profile.address            || '',
      dateOfBirth:        profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : '',
      // teacher
      specializedSubject: profile.specializedSubject || '',
      qualifications:     profile.qualifications     || '',
      experience:         profile.experience         ?? '',
      // student
      gradeLevel:         profile.gradeLevel         || '',
      parentFullName:     profile.parentFullName     || '',
      parentEmail:        profile.parentEmail        || '',
      parentPhone:        profile.parentPhone        || '',
      parentCountry:      profile.parentCountry      || '',
      // parent
      country:            profile.country            || '',
    });
  }, [profile]);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      toast.error('First name, last name and email are required');
      return;
    }
    setSaving(true);
    try {
      const res     = await updateProfile(form);
      const updated = res.data;
      // Keep header / context in sync
      updateUser({
        firstName:          updated.firstName,
        lastName:           updated.lastName,
        username:           updated.username,
        email:              updated.email,
        phone:              updated.phone,
        bio:                updated.bio,
        profilePicture:     updated.profilePicture,
        gradeLevel:         updated.gradeLevel,
        specializedSubject: updated.specializedSubject,
      });
      toast.success('Profile updated successfully');
      onSaved(updated);
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-2xl border shadow-sm ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}
    >
      <div className="p-6 space-y-7">

        {/* ── Personal information ── */}
        <Section title="Personal Information" theme={theme}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First Name"    name="firstName"   value={form.firstName}   onChange={handleChange} theme={theme} required />
            <Field label="Last Name"     name="lastName"    value={form.lastName}    onChange={handleChange} theme={theme} required />
            <Field label="Username"      name="username"    value={form.username}    onChange={handleChange} theme={theme} hint="Must be unique across all accounts" />
            <Field label="Phone"         name="phone"       value={form.phone}       onChange={handleChange} theme={theme} type="tel" />
            <Field label="Email"         name="email"       value={form.email}       onChange={handleChange} theme={theme} type="email" required span2 hint="Must be unique across all accounts" />
            <Field label="Date of Birth" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} theme={theme} type="date" />
            <Field label="Address"       name="address"     value={form.address}     onChange={handleChange} theme={theme} span2 />
            <div className="sm:col-span-2">
              <label className={`block text-xs font-semibold mb-1.5 ${dark ? 'text-slate-300' : 'text-gray-600'}`}>Bio</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={3}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  dark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>
        </Section>

        {/* ── Teacher fields ── */}
        {role === 'teacher' && (
          <Section title="Teaching Details" theme={theme}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Specialized Subject" name="specializedSubject" value={form.specializedSubject} onChange={handleChange} theme={theme} required span2 />
              <Field label="Qualifications"      name="qualifications"     value={form.qualifications}     onChange={handleChange} theme={theme} span2 />
              <Field label="Years of Experience" name="experience"         value={form.experience}         onChange={handleChange} theme={theme} type="number" />
            </div>
          </Section>
        )}

        {/* ── Student fields ── */}
        {role === 'student' && (
          <Section title="Student Details" theme={theme}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Grade Level"      name="gradeLevel"     value={form.gradeLevel}     onChange={handleChange} theme={theme} options={GRADE_LEVELS} required />
              <Field label="Parent Full Name" name="parentFullName" value={form.parentFullName} onChange={handleChange} theme={theme} />
              <Field label="Parent Email"     name="parentEmail"    value={form.parentEmail}    onChange={handleChange} theme={theme} type="email" />
              <Field label="Parent Phone"     name="parentPhone"    value={form.parentPhone}    onChange={handleChange} theme={theme} type="tel" />
              <Field label="Parent Country"   name="parentCountry"  value={form.parentCountry}  onChange={handleChange} theme={theme} />
            </div>
          </Section>
        )}

        {/* ── Parent fields ── */}
        {role === 'parent' && (
          <Section title="Parent Details" theme={theme}>
            <Field label="Country" name="country" value={form.country} onChange={handleChange} theme={theme} />
          </Section>
        )}
      </div>

      {/* ── Sticky footer ── */}
      <div className={`flex gap-3 px-6 py-4 border-t ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
        <button
          type="button"
          onClick={onCancel}
          className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-1.5 ${
            dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FiX className="w-4 h-4" /> Cancel
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
  );
}
