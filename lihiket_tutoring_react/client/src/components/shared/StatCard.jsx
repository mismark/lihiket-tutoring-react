/**
 * Shared stat card used across all dashboards.
 * Consistent design, dark-mode aware, no theme prop needed (uses Tailwind dark:).
 */
const PALETTE = {
  blue:    { bg: 'bg-blue-50    dark:bg-blue-500/10',    icon: 'text-blue-500',    val: 'text-blue-600    dark:text-blue-400'    },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: 'text-emerald-500', val: 'text-emerald-600 dark:text-emerald-400' },
  amber:   { bg: 'bg-amber-50   dark:bg-amber-500/10',   icon: 'text-amber-500',   val: 'text-amber-600   dark:text-amber-400'   },
  purple:  { bg: 'bg-purple-50  dark:bg-purple-500/10',  icon: 'text-purple-500',  val: 'text-purple-600  dark:text-purple-400'  },
  indigo:  { bg: 'bg-indigo-50  dark:bg-indigo-500/10',  icon: 'text-indigo-500',  val: 'text-indigo-600  dark:text-indigo-400'  },
  red:     { bg: 'bg-red-50     dark:bg-red-500/10',     icon: 'text-red-500',     val: 'text-red-600     dark:text-red-400'     },
};

export default function StatCard({ icon: Icon, label, value, sub, color = 'blue' }) {
  const c = PALETTE[color] || PALETTE.blue;
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${c.bg}`}>
        <Icon className={`w-6 h-6 ${c.icon}`} />
      </div>
      <div className="min-w-0">
        <p className={`text-2xl font-extrabold leading-none ${c.val}`}>{value}</p>
        <p className="text-xs font-medium mt-1 text-slate-500 dark:text-slate-400 truncate">{label}</p>
        {sub && <p className="text-xs mt-0.5 text-slate-400 dark:text-slate-500 truncate">{sub}</p>}
      </div>
    </div>
  );
}
