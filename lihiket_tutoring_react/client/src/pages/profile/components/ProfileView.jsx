import {
  FiUser, FiMail, FiPhone, FiMapPin, FiCalendar,
  FiBook, FiAward, FiUsers, FiEdit2, FiCheckCircle,
} from 'react-icons/fi';
import { InfoRow, Section } from './profile.utils.jsx';

/**
 * Read-only profile view tab.
 * Shows all personal, role-specific, and account-status fields.
 */
export default function ProfileView({ profile, onEdit, theme }) {
  const dark = theme === 'dark';
  const role = profile?.role || 'student';

  const joinedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '—';

  return (
    <div className={`rounded-2xl border p-6 shadow-sm space-y-7 ${
      dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
    }`}>

      {/* ── Personal information ── */}
      <Section title="Personal Information" theme={theme}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <InfoRow icon={FiUser}     label="Full Name"     value={`${profile?.firstName} ${profile?.lastName}`}                                   theme={theme} />
          <InfoRow icon={FiUser}     label="Username"      value={`@${profile?.username}`}                                                        theme={theme} />
          <InfoRow icon={FiMail}     label="Email"         value={profile?.email}                                                                  theme={theme} />
          <InfoRow icon={FiPhone}    label="Phone"         value={profile?.phone}                                                                  theme={theme} />
          <InfoRow icon={FiCalendar} label="Date of Birth" value={profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : null} theme={theme} />
          <InfoRow icon={FiCalendar} label="Joined"        value={joinedDate}                                                                      theme={theme} />
          <InfoRow icon={FiMapPin}   label="Address"       value={profile?.address}                                                                theme={theme} />
        </div>
        {profile?.bio && (
          <div className={`mt-2 p-3 rounded-xl text-sm ${
            dark ? 'bg-slate-700/50 text-slate-300' : 'bg-gray-50 text-gray-700'
          }`}>
            {profile.bio}
          </div>
        )}
      </Section>

      {/* ── Teacher details ── */}
      {role === 'teacher' && (
        <Section title="Teaching Details" theme={theme}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InfoRow icon={FiBook}  label="Specialized Subject" value={profile?.specializedSubject} theme={theme} />
            <InfoRow
              icon={FiAward}
              label="Years of Experience"
              value={profile?.experience != null
                ? `${profile.experience} year${profile.experience !== 1 ? 's' : ''}`
                : null}
              theme={theme}
            />
          </div>
          {profile?.qualifications && (
            <InfoRow icon={FiAward} label="Qualifications" value={profile.qualifications} theme={theme} />
          )}
        </Section>
      )}

      {/* ── Student details ── */}
      {role === 'student' && (
        <Section title="Student Details" theme={theme}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InfoRow icon={FiBook}   label="Grade Level"     value={profile?.gradeLevel}    theme={theme} />
            <InfoRow icon={FiUsers}  label="Parent"          value={profile?.parentFullName} theme={theme} />
            <InfoRow icon={FiMail}   label="Parent Email"    value={profile?.parentEmail}    theme={theme} />
            <InfoRow icon={FiPhone}  label="Parent Phone"    value={profile?.parentPhone}    theme={theme} />
            <InfoRow icon={FiMapPin} label="Parent Country"  value={profile?.parentCountry}  theme={theme} />
          </div>
        </Section>
      )}

      {/* ── Parent details ── */}
      {role === 'parent' && (
        <Section title="Parent Details" theme={theme}>
          <InfoRow icon={FiMapPin} label="Country" value={profile?.country} theme={theme} />
        </Section>
      )}

      {/* ── Account status ── */}
      <Section title="Account Status" theme={theme}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-1.5 ${
              dark ? 'text-slate-500' : 'text-gray-400'
            }`}>Verification</p>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              profile?.isVerified
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
            }`}>
              <FiCheckCircle className="w-3.5 h-3.5" />
              {profile?.isVerified ? 'Verified' : 'Pending'}
            </span>
          </div>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-1.5 ${
              dark ? 'text-slate-500' : 'text-gray-400'
            }`}>Status</p>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              profile?.isActive
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
            }`}>
              {profile?.isActive ? '● Active' : '○ Inactive'}
            </span>
          </div>
        </div>
      </Section>

      {/* ── Edit button ── */}
      <button
        onClick={onEdit}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
      >
        <FiEdit2 className="w-4 h-4" /> Edit Profile
      </button>
    </div>
  );
}
