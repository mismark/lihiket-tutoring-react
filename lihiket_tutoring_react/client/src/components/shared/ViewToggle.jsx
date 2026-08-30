import { FiGrid, FiList } from 'react-icons/fi';

export default function ViewToggle({ view, onChange }) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl border
                    bg-white border-gray-200 shadow-sm
                    dark:bg-slate-800 dark:border-slate-700">
      <button onClick={() => onChange('grid')} title="Grid view"
        className={`p-2 rounded-lg transition ${
          view === 'grid'
            ? 'bg-blue-600 text-white'
            : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
        }`}>
        <FiGrid className="w-4 h-4" />
      </button>
      <button onClick={() => onChange('list')} title="List view"
        className={`p-2 rounded-lg transition ${
          view === 'list'
            ? 'bg-blue-600 text-white'
            : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
        }`}>
        <FiList className="w-4 h-4" />
      </button>
    </div>
  );
}
