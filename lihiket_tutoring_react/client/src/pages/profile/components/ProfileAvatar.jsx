import { FiCheckCircle } from 'react-icons/fi';
import { ROLE_STYLE, ROLE_ICON, AVATAR_GRADIENT } from './profile.utils.jsx';

/**
 * The top card shown on every tab — avatar, full name, username, role badge,
 * verification status, grade/subject tag, and bio.
 */
export default function ProfileAvatar({ profile, fetching, theme }) {
  const dark  = theme === 'dark';
  const role  = profile?.role || 'student';

  const RoleIcon  = ROLE_ICON[role]     || ROLE_ICON.student;
  const gradient  = AVATAR_GRADIENT[role] || AVATAR_GRADIENT.student;
  const roleStyle = ROLE_STYLE[role]    || '';

  return (
    <div className={`rounded-2xl border p-6 shadow-sm ${
      dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">

        {/* Avatar */}
        <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-3xl font-extrabold shadow-lg flex-shrink-0`}>
          {(profile?.firstName || '?')[0]}
          {(profile?.lastName  || '')[0]}
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left">
          {fetching ? (
            <div className="space-y-2">
              <div className={`h-6 w-48 rounded-lg animate-pulse ${dark ? 'bg-slate-700' : 'bg-gray-200'}`} />
              <div className={`h-4 w-32 rounded-lg animate-pulse ${dark ? 'bg-slate-700' : 'bg-gray-200'}`} />
            </div>
          ) : (
            <>
              <h2 className={`text-xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
                {profile?.firstName} {profile?.lastName}
              </h2>
              <p className={`text-sm mt-0.5 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                @{profile?.username}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${roleStyle}`}>
                  <RoleIcon className="w-3.5 h-3.5" />
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </span>

                {profile?.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <FiCheckCircle className="w-3 h-3" /> Verified
                  </span>
                )}

                {profile?.gradeLevel && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                    {profile.gradeLevel}
                  </span>
                )}

                {profile?.specializedSubject && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400">
                    {profile.specializedSubject}
                  </span>
                )}
              </div>

              {profile?.bio && (
                <p className={`mt-3 text-sm leading-relaxed ${dark ? 'text-slate-400' : 'text-gray-600'}`}>
                  {profile.bio}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
