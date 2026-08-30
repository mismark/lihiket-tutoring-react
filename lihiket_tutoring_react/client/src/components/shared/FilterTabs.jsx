/**
 * Reusable status filter pills — matches CourseManagePage's filter-pill style.
 * activeColor: Tailwind bg class for the active pill, e.g. 'bg-violet-600'
 */
export default function FilterTabs({ tabs, active, onChange, activeColor = 'bg-blue-600' }) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl border
                    bg-white border-gray-200 shadow-sm
                    dark:bg-slate-800 dark:border-slate-700">
      {tabs.map(t => (
        <button key={t.value} onClick={() => onChange(t.value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
            active === t.value
              ? `${activeColor} text-white shadow-sm`
              : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}>
          {t.label}
        </button>
      ))}
    </div>
  );
}
