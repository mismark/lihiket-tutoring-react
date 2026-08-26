import {
  FiShield, FiBookOpen, FiBook, FiUsers,
} from 'react-icons/fi';

// ── constants ──────────────────────────────────────────────────────────────────
export const GRADE_LEVELS = [
  'KG1','KG2','G1','G2','G3','G4','G5','G6',
  'G7','G8','G9','G10','G11','G12','HL',
];

export const ROLE_STYLE = {
  admin:   'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
  teacher: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  student: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  parent:  'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
};

export const ROLE_ICON = {
  admin:   FiShield,
  teacher: FiBookOpen,
  student: FiBook,
  parent:  FiUsers,
};

export const AVATAR_GRADIENT = {
  admin:   'from-amber-500 to-orange-600',
  teacher: 'from-blue-500 to-indigo-600',
  student: 'from-emerald-500 to-teal-600',
  parent:  'from-purple-500 to-violet-600',
};

// ── shared primitive components ────────────────────────────────────────────────

/** A labelled info row with an icon — used in ProfileView */
export function InfoRow({ icon: Icon, label, value, theme }) {
  const dark = theme === 'dark';
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="flex items-start gap-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
        dark ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-500'
      }`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className={`text-xs font-semibold uppercase tracking-wider ${
          dark ? 'text-slate-500' : 'text-gray-400'
        }`}>{label}</p>
        <p className={`text-sm font-medium mt-0.5 break-words ${
          dark ? 'text-slate-200' : 'text-gray-800'
        }`}>{value}</p>
      </div>
    </div>
  );
}

/** Section header with a bottom border */
export function Section({ title, children, theme }) {
  return (
    <div>
      <p className={`text-xs font-bold uppercase tracking-wider mb-4 pb-2 border-b ${
        theme === 'dark' ? 'text-slate-400 border-slate-700' : 'text-gray-500 border-gray-200'
      }`}>{title}</p>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

/** Generic input / select field */
export function Field({ label, name, type = 'text', value, onChange, options, theme, required, hint, span2 }) {
  const dark = theme === 'dark';
  const cls = `w-full px-3 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    dark
      ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500'
      : 'bg-gray-50 border-gray-300 text-gray-900'
  }`;
  return (
    <div className={span2 ? 'sm:col-span-2' : ''}>
      <label className={`block text-xs font-semibold mb-1.5 ${dark ? 'text-slate-300' : 'text-gray-600'}`}>
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {options ? (
        <select name={name} value={value} onChange={onChange} className={cls}>
          <option value="">— select —</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} name={name} value={value ?? ''} onChange={onChange} className={cls} />
      )}
      {hint && <p className={`text-xs mt-1 ${dark ? 'text-slate-500' : 'text-gray-400'}`}>{hint}</p>}
    </div>
  );
}
