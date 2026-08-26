import { useState } from 'react';
import { FiLock, FiEye, FiEyeOff, FiX } from 'react-icons/fi';
import { changePassword } from '../../../api/auth.api';
import { useTheme } from '../../../store/theme/ThemeContext';
import toast from 'react-hot-toast';
import { Section } from './profile.utils.jsx';

// ── password input with show/hide toggle ──────────────────────────────────────
function PasswordField({ label, name, value, onChange, show, onToggle, theme }) {
  const dark = theme === 'dark';
  return (
    <div>
      <label className={`block text-xs font-semibold mb-1.5 ${dark ? 'text-slate-300' : 'text-gray-600'}`}>
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full px-3 py-2.5 pr-10 rounded-xl border text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            dark
              ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500'
              : 'bg-gray-50 border-gray-300 text-gray-900'
          }`}
        />
        <button
          type="button"
          onClick={onToggle}
          className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${
            dark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600'
          }`}
          tabIndex={-1}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

/**
 * Change-password tab.
 * Calls PUT /api/auth/change-password and resets the form on success.
 */
export default function ProfilePassword({ onCancel }) {
  const { theme } = useTheme();
  const dark      = theme === 'dark';

  const [form, setForm] = useState({
    currentPassword:  '',
    newPassword:      '',
    confirmPassword:  '',
  });

  const [show, setShow] = useState({
    current: false,
    newPw:   false,
    confirm: false,
  });

  const [saving, setSaving] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const toggle = key  => setShow(p => ({ ...p, [key]: !p[key] }));

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await changePassword(form);
      toast.success('Password changed successfully');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      onCancel(); // return to view tab
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const allFilled = form.currentPassword && form.newPassword && form.confirmPassword;

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-2xl border shadow-sm ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}
    >
      <div className="p-6 space-y-5">
        <Section title="Change Password" theme={theme}>

          <PasswordField
            label="Current Password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            show={show.current}
            onToggle={() => toggle('current')}
            theme={theme}
          />

          <PasswordField
            label="New Password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            show={show.newPw}
            onToggle={() => toggle('newPw')}
            theme={theme}
          />

          <PasswordField
            label="Confirm New Password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            show={show.confirm}
            onToggle={() => toggle('confirm')}
            theme={theme}
          />

          {/* Requirements hint */}
          <div className={`p-3 rounded-xl text-xs space-y-0.5 ${
            dark ? 'bg-slate-700/50 text-slate-400' : 'bg-gray-50 text-gray-500'
          }`}>
            <p className="font-semibold mb-1">Requirements:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>At least 8 characters long</li>
              <li>Must be different from your current password</li>
              <li>New password and confirmation must match</li>
            </ul>
          </div>
        </Section>
      </div>

      {/* Footer */}
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
          disabled={saving || !allFilled}
          className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating…</>
            : <><FiLock className="w-4 h-4" /> Change Password</>
          }
        </button>
      </div>
    </form>
  );
}
