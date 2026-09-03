import { useState } from 'react';
import { FiToggleLeft, FiToggleRight, FiShield,
         FiBookOpen, FiUser, FiUsers,
         FiFileText, FiExternalLink, FiPhone, FiCopy, FiCheckCircle,
         FiEdit2, FiTrash2 } from 'react-icons/fi';

const ROLE_ICONS  = { teacher: FiBookOpen, student: FiUser, parent: FiUsers, admin: FiShield };
const ROLE_COLORS = { teacher: 'blue', student: 'emerald', parent: 'purple', admin: 'amber' };

const COLOR_MAP = {
  blue:    { bg: 'bg-blue-100 dark:bg-blue-500/20',       text: 'text-blue-600 dark:text-blue-400',       badge: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' },
  emerald: { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' },
  purple:  { bg: 'bg-purple-100 dark:bg-purple-500/20',   text: 'text-purple-600 dark:text-purple-400',   badge: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' },
  amber:   { bg: 'bg-amber-100 dark:bg-amber-500/20',     text: 'text-amber-600 dark:text-amber-400',     badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' },
};

function cvUrl(cvDocument) {
  if (!cvDocument) return null;
  // Cloudinary URL — return as-is
  if (cvDocument.startsWith('http://') || cvDocument.startsWith('https://')) return cvDocument;
  // Legacy local path — build full server URL
  const clean = cvDocument.replace(/\\/g, '/');
  const idx   = clean.indexOf('uploads/');
  if (idx === -1) return null;
  const base  = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${base}/${clean.slice(idx)}`;
}

// ── Phone field with call + copy buttons ──────────────────────────────────────
function PhoneField({ phone, label, theme }) {
  const [copied, setCopied] = useState(false);
  if (!phone) return null;

  const dim = theme === 'dark' ? 'text-slate-400' : 'text-gray-500';
  const val = theme === 'dark' ? 'text-slate-200' : 'text-gray-800';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(phone);
    } catch {
      // fallback for older browsers
      const el = document.createElement('textarea');
      el.value = phone;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.focus();
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {label && <span className={`text-xs ${dim}`}>{label}:</span>}

      {/* Clickable number → opens dialer */}
      <a
        href={`tel:${phone}`}
        className={`text-xs font-medium ${val} hover:text-blue-500 dark:hover:text-blue-400 transition-colors underline-offset-2 hover:underline`}
        title={`Call ${phone}`}
      >
        {phone}
      </a>

      {/* Call button */}
      <a
        href={`tel:${phone}`}
        className="p-1 rounded-md text-emerald-600 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-500/20 transition-colors"
        title={`Call ${phone}`}
        aria-label={`Call ${phone}`}
      >
        <FiPhone className="w-3 h-3" />
      </a>

      {/* Copy button */}
      <button
        type="button"
        onClick={handleCopy}
        className={`p-1 rounded-md transition-colors ${
          copied
            ? 'text-emerald-500 bg-emerald-100 dark:bg-emerald-500/20'
            : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-500 dark:hover:text-blue-400'
        }`}
        title={copied ? 'Copied!' : `Copy ${phone}`}
        aria-label={copied ? 'Copied!' : `Copy ${phone}`}
      >
        {copied ? <FiCheckCircle className="w-3 h-3" /> : <FiCopy className="w-3 h-3" />}
      </button>
    </div>
  );
}

// ── Details cell — role-specific ───────────────────────────────────────────────
function DetailsCell({ user, theme }) {
  const dim = theme === 'dark' ? 'text-slate-400' : 'text-gray-500';
  const val = theme === 'dark' ? 'text-slate-200' : 'text-gray-800';

  if (user.userType === 'teacher') return (
    <div className="space-y-1 text-sm">
      {user.specializedSubject && (
        <p><span className={dim}>Subject:</span>{' '}
          <span className={`font-medium ${val}`}>{user.specializedSubject}</span>
        </p>
      )}
      {user.qualifications && (
        <p><span className={dim}>Quals:</span>{' '}
          <span className={val}>{user.qualifications}</span>
        </p>
      )}
      {user.experience != null && (
        <p><span className={dim}>Exp:</span>{' '}
          <span className={val}>{user.experience} yr{user.experience !== 1 ? 's' : ''}</span>
        </p>
      )}
      <PhoneField phone={user.phone} label="Phone" theme={theme} />
    </div>
  );

  if (user.userType === 'student') return (
    <div className="space-y-1 text-sm">
      {user.gradeLevel && (
        <p><span className={dim}>Grade:</span>{' '}
          <span className={`font-medium ${val}`}>{user.gradeLevel}</span>
        </p>
      )}
      {user.parentFullName && (
        <p><span className={dim}>Parent:</span>{' '}
          <span className={val}>{user.parentFullName}</span>
        </p>
      )}
      <PhoneField phone={user.parentPhone} label="Parent Ph" theme={theme} />
      <PhoneField phone={user.phone}       label="Phone"     theme={theme} />
    </div>
  );

  if (user.userType === 'parent') return (
    <div className="space-y-1 text-sm">
      {user.country && (
        <p><span className={dim}>Country:</span>{' '}
          <span className={`font-medium ${val}`}>{user.country}</span>
        </p>
      )}
      <PhoneField phone={user.phone} label="Phone" theme={theme} />
    </div>
  );

  // admin
  return <PhoneField phone={user.phone} label="Phone" theme={theme} />;
}

// ── Row ────────────────────────────────────────────────────────────────────────
export default function UserRow({ user, activeTab, onApprove, onReject, onToggleActive, onEdit, onDelete, theme }) {
  const RoleIcon  = ROLE_ICONS[user.userType]  || FiUser;
  const roleColor = ROLE_COLORS[user.userType] || 'amber';
  const colors    = COLOR_MAP[roleColor];
  const cv        = cvUrl(user.cvDocument);

  return (
    <tr className={`transition ${theme === 'dark' ? 'hover:bg-slate-700/40' : 'hover:bg-gray-50'}`}>

      {/* User */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors.bg} ${colors.text}`}>
            <RoleIcon className="w-5 h-5" />
          </div>
          <div>
            <p className={`font-semibold leading-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {user.firstName} {user.lastName}
            </p>
            <p className={`text-xs mt-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
              {user.email}
            </p>
            <p className={`text-xs mt-0.5 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${colors.badge}`}>
          <RoleIcon className="w-3.5 h-3.5" />
          {user.userType}
        </span>
      </td>

      {/* Details */}
      <td className="px-6 py-4 min-w-[200px]">
        <DetailsCell user={user} theme={theme} />
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <div className="flex flex-col gap-1.5">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${
            user.isVerified
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
              : 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400'
          }`}>
            {user.isVerified ? '✓ Verified' : '○ Unverified'}
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${
            user.isActive
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
              : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
          }`}>
            {user.isActive ? '● Active' : '○ Inactive'}
          </span>
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 flex-wrap">

          {/* CV — teachers only */}
          {user.userType === 'teacher' && (
            cv ? (
              <a
                href={cv}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:hover:bg-indigo-500/30 transition"
                title="View CV"
              >
                <FiFileText className="w-3.5 h-3.5" />
                View CV <FiExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500">
                <FiFileText className="w-3.5 h-3.5" /> No CV
              </span>
            )
          )}

          {user.userType !== 'admin' && (
              <button
                onClick={() => onToggleActive(user._id, user.userType)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  user.isActive
                    ? 'bg-slate-100 text-slate-700 hover:bg-red-100 hover:text-red-700 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-red-500/20 dark:hover:text-red-400'
                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30'
                }`}
              >
                {user.isActive
                  ? <><FiToggleRight className="w-3.5 h-3.5" /> Deactivate</>
                  : <><FiToggleLeft  className="w-3.5 h-3.5" /> Activate</>
                }
              </button>
            )}

          {/* Edit button — all roles */}
          <button
            onClick={() => onEdit(user)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30 transition"
            title="Edit user"
          >
            <FiEdit2 className="w-3.5 h-3.5" /> Edit
          </button>

          {/* Delete button — not for admins */}
          {user.userType !== 'admin' && (
            <button
              onClick={() => onDelete(user)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30 transition"
              title="Delete user"
            >
              <FiTrash2 className="w-3.5 h-3.5" /> Delete
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
