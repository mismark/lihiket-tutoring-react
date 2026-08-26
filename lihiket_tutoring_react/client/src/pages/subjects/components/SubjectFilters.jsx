import { FiSearch, FiX } from 'react-icons/fi';

const GRADE_LEVELS = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
  'Grade 11', 'Grade 12'
];

const CATEGORIES = [
  'Mathematics', 'Science', 'Language Arts', 'Social Studies',
  'Foreign Languages', 'Arts', 'Physical Education', 'Technology', 'Other'
];

export default function SubjectFilters({ filters, onFilterChange, onReset, theme }) {
  return (
    <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl border shadow-sm p-4 mb-6`}>
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search subjects..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === 'dark' 
                  ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>
        </div>
        <select
          value={filters.gradeLevel}
          onChange={(e) => onFilterChange('gradeLevel', e.target.value)}
          className={`px-4 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            theme === 'dark' 
              ? 'bg-slate-900 border-slate-600 text-white' 
              : 'bg-gray-50 border-gray-300 text-gray-900'
          }`}
        >
          <option value="">All Grade Levels</option>
          {GRADE_LEVELS.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
        <select
          value={filters.category}
          onChange={(e) => onFilterChange('category', e.target.value)}
          className={`px-4 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            theme === 'dark' 
              ? 'bg-slate-900 border-slate-600 text-white' 
              : 'bg-gray-50 border-gray-300 text-gray-900'
          }`}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <button
          onClick={onReset}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition ${
            theme === 'dark' 
              ? 'border-slate-600 text-slate-300 hover:bg-slate-700' 
              : 'border-gray-300 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FiX className="w-4 h-4" /> Clear
        </button>
      </div>
    </div>
  );
}

export { GRADE_LEVELS, CATEGORIES };
