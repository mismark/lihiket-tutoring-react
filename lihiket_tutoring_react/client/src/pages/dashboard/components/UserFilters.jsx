export default function UserFilters({ filters, onFilterChange, onReset, theme, hideRoleFilter }) {
  return (
    <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl border shadow-sm p-4 mb-6`}>
      <div className="flex flex-wrap gap-4 items-center">
        {!hideRoleFilter && (
          <select
            value={filters.role || ''}
            onChange={(e) => onFilterChange('role', e.target.value)}
            className={`px-4 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-600 text-white'
                : 'bg-gray-50 border-gray-300 text-gray-900'
            }`}
          >
            <option value="">All Roles</option>
            <option value="teacher">Teachers</option>
            <option value="student">Students</option>
            <option value="parent">Parents</option>
            <option value="admin">Admins</option>
          </select>
        )}
        <select
          value={filters.isActive}
          onChange={(e) => onFilterChange('isActive', e.target.value)}
          className={`px-4 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            theme === 'dark' 
              ? 'bg-slate-900 border-slate-600 text-white' 
              : 'bg-gray-50 border-gray-300 text-gray-900'
          }`}
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button
          onClick={onReset}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition ${
            theme === 'dark' 
              ? 'border-slate-600 text-slate-300 hover:bg-slate-700' 
              : 'border-gray-300 text-gray-600 hover:bg-gray-100'
          }`}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
