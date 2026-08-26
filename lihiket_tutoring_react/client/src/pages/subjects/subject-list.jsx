import { FiBook, FiX } from 'react-icons/fi';
import SubjectFilters from './components/SubjectFilters';
import SubjectCard from './components/SubjectCard';

export default function SubjectList({
  subjects,
  loading,
  filters,
  onFilterChange,
  onResetFilters,
  onEdit,
  onAssign,
  onDelete,
  onView,
  onViewStudents,
  onCreateCourse,
  theme,
}) {
  const hasActiveFilter = filters.search || filters.gradeLevel || filters.category;

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = !filters.search ||
      subject.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      subject.code.toLowerCase().includes(filters.search.toLowerCase());
    const matchesGrade    = !filters.gradeLevel || subject.gradeLevel === filters.gradeLevel;
    const matchesCategory = !filters.category   || subject.category   === filters.category;
    return matchesSearch && matchesGrade && matchesCategory;
  });

  return (
    <div>
      {/* ── Filters — always visible ── */}
      <SubjectFilters
        filters={filters}
        onFilterChange={onFilterChange}
        onReset={onResetFilters}
        theme={theme}
      />

      {/* ── Loading ── */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className={`mt-4 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
            Loading subjects...
          </p>
        </div>

      /* ── Empty state ── */
      ) : filteredSubjects.length === 0 ? (
        <div className={`rounded-2xl border shadow-sm p-12 text-center ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          <FiBook className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-slate-600' : 'text-gray-300'}`} />
          <p className={`font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
            {hasActiveFilter ? 'No subjects match your search' : 'No subjects available'}
          </p>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
            {hasActiveFilter ? 'Try a different search term or clear the filters' : 'Create your first subject to get started'}
          </p>
          {hasActiveFilter && (
            <button
              onClick={onResetFilters}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10 transition"
            >
              <FiX className="w-4 h-4" /> Clear filters
            </button>
          )}
        </div>

      /* ── Grid ── */
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubjects.map(subject => (
              <SubjectCard
                key={subject._id}
                subject={subject}
                onEdit={onEdit}
                onAssign={onAssign}
                onDelete={onDelete}
                onView={onView}
                onViewStudents={onViewStudents}
                onCreateCourse={onCreateCourse}
                theme={theme}
              />
            ))}
          </div>
          <div className={`mt-6 text-center text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
            {hasActiveFilter
              ? `${filteredSubjects.length} of ${subjects.length} subjects match`
              : `${subjects.length} subject${subjects.length !== 1 ? 's' : ''}`
            }
          </div>
        </>
      )}
    </div>
  );
}
