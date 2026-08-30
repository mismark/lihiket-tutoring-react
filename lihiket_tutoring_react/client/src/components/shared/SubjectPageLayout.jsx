/**
 * Shared layout used by all subject-scoped pages
 * (Quizzes, Exams, Assignments, Documents, Lessons).
 */
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSearch, FiX } from 'react-icons/fi';

// ── Skeleton card ─────────────────────────────────────────────────────────────
export function SkeletonCard({ lines = 2 }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700
                    overflow-hidden animate-pulse">
      <div className="h-1.5 bg-slate-200 dark:bg-slate-700" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex gap-2.5 flex-1">
            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="h-3 w-2/5 bg-slate-100 dark:bg-slate-700/60 rounded" />
            </div>
          </div>
          <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full flex-shrink-0" />
        </div>
        <div className="flex gap-1.5">
          <div className="h-6 w-20 bg-slate-100 dark:bg-slate-700/60 rounded-lg" />
          <div className="h-6 w-16 bg-slate-100 dark:bg-slate-700/60 rounded-lg" />
        </div>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-3 bg-slate-100 dark:bg-slate-700/60 rounded"
            style={{ width: i === 0 ? '100%' : '65%' }} />
        ))}
      </div>
      <div className="flex border-t border-slate-100 dark:border-slate-700">
        <div className="flex-1 h-10 bg-slate-50 dark:bg-slate-800" />
        <div className="flex-1 h-10 bg-slate-50 dark:bg-slate-800 border-l border-slate-100 dark:border-slate-700" />
      </div>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
export function StatCard({ value, label, color, icon: Icon }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700
                    p-4 flex items-center gap-3.5 shadow-sm">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">{value}</p>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ── Main layout ───────────────────────────────────────────────────────────────
export default function SubjectPageLayout({
  subject,
  subjectSlug,
  section,
  icon: PageIcon,
  gradient,
  accentColor = 'blue',
  total,
  loading,
  itemLabel = 'item',
  stats,
  search,
  onSearch,
  filterSlot,
  toolbarRight,
  actionLabel,
  onAction,
  showAction = true,
  navLinks,
  children,
}) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">

      {/* ── Hero banner ── */}
      <div className="relative overflow-hidden border-b bg-white dark:bg-slate-800
                      border-slate-200 dark:border-slate-700">
        {/* Decorative blobs — tinted with the page's accent colour */}
        <div className={`absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl pointer-events-none
                         bg-${accentColor}-500/10`} />
        <div className={`absolute -bottom-16 -left-16 w-72 h-72 rounded-full blur-3xl pointer-events-none
                         bg-${accentColor}-400/10`} />

        <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-8">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-5">
            <button onClick={() => navigate(-1)}
              className="p-2 rounded-xl border transition flex-shrink-0 shadow-sm
                         bg-white border-slate-200 text-slate-600 hover:bg-slate-50
                         dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600">
              <FiArrowLeft className="w-4 h-4" />
            </button>
            <nav className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
              <Link to="/subjects"
                className={`transition hover:text-${accentColor}-500`}>
                Subjects
              </Link>
              <span>/</span>
              <span className="text-slate-600 dark:text-slate-300 font-medium truncate max-w-[140px]">
                {subject?.name || '…'}
              </span>
              <span>/</span>
              <span className="text-slate-900 dark:text-white font-semibold">{section}</span>
            </nav>
          </div>

          {/* Title row */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient}
                               flex items-center justify-center shadow-lg shadow-${accentColor}-600/20 flex-shrink-0`}>
                <PageIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {subject?.name ? `${subject.name}` : section}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {subject?.gradeLevel && <span className="font-medium">{subject.gradeLevel}</span>}
                  {subject?.category   && <> · {subject.category}</>}
                  {!loading && total !== undefined && (
                    <> · <span className={`font-semibold text-${accentColor}-600 dark:text-${accentColor}-400`}>
                      {total} {total === 1 ? itemLabel : `${itemLabel}s`}
                    </span></>
                  )}
                </p>
              </div>
            </div>

            {/* Nav links + action button */}
            <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
              {navLinks?.map(nl => (
                <Link key={nl.to} to={nl.to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-semibold transition ${nl.color}`}>
                  <nl.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{nl.label}</span>
                </Link>
              ))}
              {showAction && actionLabel && onAction && (
                <button onClick={onAction}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                              text-white transition shadow-lg shadow-${accentColor}-600/25
                              bg-gradient-to-r ${gradient} hover:opacity-90 active:scale-[0.98]`}>
                  <span className="text-base leading-none font-bold">+</span>
                  <span>{actionLabel}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-7 space-y-6">

        {/* ── Stat cards ── */}
        {!loading && stats?.length > 0 && (
          <div className={`grid gap-4 ${
            stats.length <= 2 ? 'grid-cols-2' :
            stats.length === 3 ? 'grid-cols-3' :
            'grid-cols-2 sm:grid-cols-4'
          }`}>
            {stats.map((s, i) => (
              <StatCard key={i} value={s.value} label={s.label} color={s.color} icon={s.icon} />
            ))}
          </div>
        )}

        {/* ── Toolbar ── */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => onSearch(e.target.value)}
              placeholder={`Search ${itemLabel}s…`}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm
                         bg-white border-slate-200 text-slate-900 placeholder-slate-400
                         dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
            />
            {search && (
              <button onClick={() => onSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <FiX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {filterSlot}
          {toolbarRight}
        </div>

        {/* ── Content ── */}
        {children}
      </div>
    </div>
  );
}
