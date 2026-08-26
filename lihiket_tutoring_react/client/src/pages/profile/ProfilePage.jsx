import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../store/auth/AuthContext';
import { useTheme } from '../../store/theme/ThemeContext';
import { getMe } from '../../api/auth.api';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiUser, FiEdit2, FiLock } from 'react-icons/fi';

import ProfileAvatar   from './components/ProfileAvatar';
import ProfileView     from './components/ProfileView';
import ProfileEdit     from './components/ProfileEdit';
import ProfilePassword from './components/ProfilePassword';

const TABS = [
  { key: 'view',     label: 'Profile',         icon: FiUser  },
  { key: 'edit',     label: 'Edit',            icon: FiEdit2 },
  { key: 'password', label: 'Change Password', icon: FiLock  },
];

export default function ProfilePage() {
  const { user }  = useAuth();
  const { theme } = useTheme();
  const dark      = theme === 'dark';

  const [profile,  setProfile]  = useState(null);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState('view');

  // Fetch the full user record on mount
  useEffect(() => {
    setFetching(true);
    getMe()
      .then(res => setProfile(res.data))
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setFetching(false));
  }, []);

  // Called by ProfileEdit after a successful save
  const handleProfileSaved = (updated) => {
    setProfile(updated);
    setActiveTab('view');
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 lg:p-10 ${dark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* ── Page header ── */}
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className={`p-2 rounded-xl border transition ${
              dark
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
                : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-200'
            }`}
            aria-label="Back to dashboard"
          >
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className={`text-2xl font-extrabold ${dark ? 'text-white' : 'text-gray-900'}`}>
              My Profile
            </h1>
            <p className={`text-sm mt-0.5 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
              View and manage your account details
            </p>
          </div>
        </div>

        {/* ── Avatar / name banner — always visible ── */}
        <ProfileAvatar
          profile={profile || { firstName: user?.firstName, lastName: user?.lastName, username: user?.username, role: user?.role }}
          fetching={fetching}
          theme={theme}
        />

        {/* ── Tab bar ── */}
        <div className={`flex gap-1 p-1 rounded-2xl ${dark ? 'bg-slate-800' : 'bg-gray-100'}`}>
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition ${
                activeTab === key
                  ? dark ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm'
                  : dark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* ── Loading skeleton ── */}
        {fetching ? (
          <div className={`rounded-2xl border p-6 shadow-sm ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <div className="space-y-4 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`h-4 rounded-lg ${dark ? 'bg-slate-700' : 'bg-gray-200'}`}
                  style={{ width: `${55 + i * 6}%` }}
                />
              ))}
            </div>
          </div>

        /* ── Tab content ── */
        ) : activeTab === 'view' ? (
          <ProfileView
            profile={profile}
            onEdit={() => setActiveTab('edit')}
            theme={theme}
          />

        ) : activeTab === 'edit' ? (
          <ProfileEdit
            profile={profile}
            onSaved={handleProfileSaved}
            onCancel={() => setActiveTab('view')}
          />

        ) : (
          <ProfilePassword
            onCancel={() => setActiveTab('view')}
          />
        )}

      </div>
    </div>
  );
}
