import { FiBookOpen, FiUser, FiUsers, FiShield } from 'react-icons/fi';

const TABS = [
  { key: 'teacher',  label: 'Teachers', icon: FiBookOpen, color: 'blue'    },
  { key: 'student',  label: 'Students', icon: FiUser,     color: 'emerald' },
  { key: 'parent',   label: 'Parents',  icon: FiUsers,    color: 'purple'  },
  { key: 'admin',    label: 'Admins',   icon: FiShield,   color: 'amber'   },
];

const ACTIVE_COLORS = {
  amber:   'bg-amber-500 text-white shadow-amber-500/30',
  blue:    'bg-blue-600 text-white shadow-blue-600/30',
  emerald: 'bg-emerald-600 text-white shadow-emerald-600/30',
  purple:  'bg-purple-600 text-white shadow-purple-600/30',
};

const BADGE_COLORS = {
  amber:   'bg-amber-400/20 text-amber-200',
  blue:    'bg-blue-400/20 text-blue-100',
  emerald: 'bg-emerald-400/20 text-emerald-100',
  purple:  'bg-purple-400/20 text-purple-100',
};

const INACTIVE_BADGE = {
  amber:   'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  blue:    'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  purple:  'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
};

export default function UserTabs({ activeTab, onTabChange, counts, theme }) {
  return (
    <div className={`flex flex-wrap gap-2 mb-6`}>
      {TABS.map(({ key, label, icon: Icon, color }) => {
        const isActive = activeTab === key;
        const count = counts?.[key] ?? 0;
        return (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
              isActive
                ? `${ACTIVE_COLORS[color]} shadow-lg`
                : theme === 'dark'
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            <span className={`px-1.5 py-0.5 rounded-md text-xs font-bold min-w-[20px] text-center ${
              isActive ? BADGE_COLORS[color] : INACTIVE_BADGE[color]
            }`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
