/**
 * UserAvatar — shows a profile photo when available, otherwise initials.
 * Used everywhere across the app (header, sidebar, chats, feed, dashboards…).
 *
 * Props:
 *   pic     – Cloudinary URL (or any HTTPS URL)
 *   name    – Full name string used to derive initials
 *   role    – 'student' | 'teacher' | 'parent' | 'admin'  (drives fallback gradient)
 *   size    – Tailwind width/height number (default 9 → w-9 h-9)
 *   rounded – 'full' | '2xl' | 'xl' | 'lg'  (default 'full')
 *   className – extra classes
 */

const ROLE_GRADIENT = {
  admin:   'from-amber-500 to-orange-600',
  teacher: 'from-blue-500 to-indigo-600',
  student: 'from-emerald-500 to-teal-600',
  parent:  'from-purple-500 to-violet-600',
};

function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

export default function UserAvatar({ pic, name, role = 'student', size = 9, rounded = 'full', className = '' }) {
  const sz   = `w-${size} h-${size}`;
  const rnd  = `rounded-${rounded}`;
  const grad = ROLE_GRADIENT[role] || ROLE_GRADIENT.student;

  // Font size scales with avatar size
  const textSz = size <= 7  ? 'text-xs'
               : size <= 10 ? 'text-sm'
               : size <= 14 ? 'text-base'
               : 'text-xl';

  return (
    <div className={`${sz} ${rnd} overflow-hidden flex-shrink-0 ${className}`}
      style={{ background: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))` }}>
      {pic ? (
        <img
          src={pic}
          alt={name || 'avatar'}
          className="w-full h-full object-cover"
          onError={e => { e.currentTarget.style.display = 'none'; }}
        />
      ) : (
        <div className={`bg-gradient-to-br ${grad} w-full h-full flex items-center justify-center
                         text-white font-black ${textSz} select-none`}>
          {initials(name)}
        </div>
      )}
    </div>
  );
}
