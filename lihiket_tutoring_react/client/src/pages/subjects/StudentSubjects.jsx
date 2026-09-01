import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../store/theme/ThemeContext';
import { getAllSubjects } from '../../api/subject.api';
import { getMyEnrollments, enrollInSubject, unenrollFromSubject } from '../../api/enrollment.api';
import toast from 'react-hot-toast';
import {
  FiArrowLeft, FiSearch, FiX, FiBook, FiCheckCircle,
  FiPlusCircle, FiMinusCircle, FiCreditCard,
  FiUsers, FiFilter, FiEye, FiBookOpen,
  FiZap, FiAward, FiFileText, FiRadio, FiGrid, FiList,
  FiLock, FiTag, FiDollarSign,
} from 'react-icons/fi';

const GRADE_LEVELS = ['KG1','KG2','G1','G2','G3','G4','G5','G6','G7','G8','G9','G10','G11','G12','HL'];
const CATEGORIES   = ['STEM','Languages','Arts','Social Studies','Physical Education','Other'];

// ── Stat card ─────────────────────────────────────────────────────────────────
function Stat({ value, label, color, icon: Icon }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-4 flex items-center gap-4 shadow-sm">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-gray-900 dark:text-white leading-none">{value}</p>
        <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ── Enroll / pay / drop button ────────────────────────────────────────────────
function EnrollButton({ subject, enrolled, enrolling, onEnroll, onUnenroll }) {
  const isFree = !subject.price || subject.price === 0;
  const id     = subject._id;
  const busy   = enrolling === id;

  if (enrolled) return (
    <button onClick={() => onUnenroll(id, subject.name)} disabled={busy}
      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold
                 border-2 border-red-200 text-red-600 hover:bg-red-50
                 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10 transition disabled:opacity-50">
      {busy ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            : <FiMinusCircle className="w-4 h-4" />}
      {busy ? 'Dropping…' : 'Drop Subject'}
    </button>
  );

  if (isFree) return (
    <button onClick={() => onEnroll(id, subject.name, false)} disabled={busy}
      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold
                 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition disabled:opacity-50">
      {busy ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <FiPlusCircle className="w-4 h-4" />}
      {busy ? 'Enrolling…' : 'Enroll for Free'}
    </button>
  );

  return (
    <button onClick={() => onEnroll(id, subject.name, true)} disabled={busy}
      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold
                 bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition disabled:opacity-50">
      {busy ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <FiCreditCard className="w-4 h-4" />}
      {busy ? 'Redirecting…' : `Pay ETB ${Number(subject.price).toLocaleString()}`}
    </button>
  );
}

// ── Subject card ──────────────────────────────────────────────────────────────
function SubjectCard({ subject, enrolled, enrolling, onEnroll, onUnenroll, dark }) {
  const isFree = !subject.price || subject.price === 0;
  const slug   = subject.slug || subject._id;

  return (
    <div className={`flex flex-col rounded-2xl border overflow-hidden shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 ${
      enrolled
        ? 'border-emerald-300 dark:border-emerald-500/40'
        : 'border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/40'
    } bg-white dark:bg-slate-800`}>

      {/* Green banner with initials avatar, title, code */}
      <div className="relative h-28 bg-gradient-to-br from-emerald-500 to-green-600 flex items-center p-4 gap-3">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

        {/* Initials avatar */}
        <div className="relative w-12 h-12 rounded-xl bg-white/25 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="text-white font-extrabold text-base tracking-tight leading-none">
            {(subject.name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
          </span>
        </div>

        {/* Title + code */}
        <div className="relative flex-1 min-w-0">
          <h3 className="text-white font-extrabold text-base leading-tight truncate drop-shadow-sm">
            {subject.name}
          </h3>
          <p className="text-white/80 text-xs font-mono mt-0.5 font-semibold">{subject.code}</p>
        </div>

        {/* Badges */}
        <div className="relative flex flex-col items-end gap-1 flex-shrink-0">
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white">
            {isFree ? 'Free' : `ETB ${Number(subject.price).toLocaleString()}`}
          </span>
          {enrolled && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-white/25 text-white">
              <FiCheckCircle className="w-3 h-3" /> Enrolled
            </span>
          )}
          {!enrolled && !isFree && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white">
              <FiLock className="w-3 h-3" /> Paid
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-base leading-tight text-gray-900 dark:text-white mb-0.5">
          {subject.name}
        </h3>
        <p className="text-xs font-mono text-blue-600 dark:text-blue-400 mb-2">{subject.code}</p>

        {subject.description && (
          <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 mb-3">
            {subject.description}
          </p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {subject.gradeLevel && (
            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
              {subject.gradeLevel}
            </span>
          )}
          {subject.category && (
            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400">
              {subject.category}
            </span>
          )}
        </div>

        {/* Teachers */}
        {subject.assignedTeachers?.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 mb-3">
            <FiUsers className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">
              {subject.assignedTeachers.map(t => `${t.firstName} ${t.lastName}`).join(', ')}
            </span>
          </div>
        )}

        {/* Enrolled actions */}
        {enrolled && (
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            <Link to={`/subjects/${slug}/courses`}
              className="flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold
                         bg-blue-100 text-blue-700 hover:bg-blue-200
                         dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30 transition">
              <FiBookOpen className="w-3.5 h-3.5" /> Courses
            </Link>
            <Link to={`/subjects/${slug}/quizzes`}
              className="flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold
                         bg-violet-100 text-violet-700 hover:bg-violet-200
                         dark:bg-violet-500/20 dark:text-violet-400 dark:hover:bg-violet-500/30 transition">
              <FiZap className="w-3.5 h-3.5" /> Quizzes
            </Link>
            <Link to={`/subjects/${slug}/exams`}
              className="flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold
                         bg-amber-100 text-amber-700 hover:bg-amber-200
                         dark:bg-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/30 transition">
              <FiAward className="w-3.5 h-3.5" /> Exams
            </Link>
            <Link to={`/subjects/${slug}/assignments`}
              className="flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold
                         bg-emerald-100 text-emerald-700 hover:bg-emerald-200
                         dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30 transition">
              <FiFileText className="w-3.5 h-3.5" /> Tasks
            </Link>
            <Link to={`/subjects/${slug}/live-classes`}
              className="flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold
                         bg-red-100 text-red-700 hover:bg-red-200
                         dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30 transition">
              <FiRadio className="w-3.5 h-3.5" /> Live
            </Link>
            <Link to={`/subjects/${slug}/classroom`}
              className="flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold
                         bg-gray-100 text-gray-700 hover:bg-gray-200
                         dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 transition">
              <FiEye className="w-3.5 h-3.5" /> View
            </Link>
          </div>
        )}

        <div className="mt-auto">
          <EnrollButton
            subject={subject} enrolled={enrolled} enrolling={enrolling}
            onEnroll={onEnroll} onUnenroll={onUnenroll}
          />
        </div>
      </div>
    </div>
  );
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden animate-pulse">
      <div className="h-24 bg-gray-200 dark:bg-slate-700" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 bg-gray-200 dark:bg-slate-700 rounded-lg" />
        <div className="h-3 w-1/4 bg-gray-100 dark:bg-slate-700/60 rounded" />
        <div className="h-3 w-full bg-gray-100 dark:bg-slate-700/60 rounded" />
        <div className="h-3 w-2/3 bg-gray-100 dark:bg-slate-700/60 rounded" />
        <div className="h-9 bg-gray-200 dark:bg-slate-700 rounded-xl mt-4" />
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function StudentSubjects() {
  const { theme } = useTheme();
  const dark      = theme === 'dark';
  const navigate  = useNavigate();

  const [subjects,    setSubjects]    = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [loading,     setLoading]     = useState(true);
  const [enrolling,   setEnrolling]   = useState(null);

  const [search,      setSearch]      = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [catFilter,   setCatFilter]   = useState('');
  const [activeTab,   setActiveTab]   = useState('all');
  const [view,        setView]        = useState('grid');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [subRes, enrRes] = await Promise.all([getAllSubjects(), getMyEnrollments()]);
      setSubjects((subRes.data || []).filter(s => s.isActive));
      setEnrolledIds(new Set(
        (enrRes.data || []).map(e => e.subject?._id?.toString() ?? e.subject?.toString())
      ));
    } catch (err) {
      toast.error(err.message || 'Failed to load subjects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleEnroll = async (subjectId, name, isPaid) => {
    setEnrolling(subjectId);
    try {
      if (isPaid) {
        setEnrolling(null);
        navigate(`/payment/checkout?subjectId=${subjectId}`);
        return;
      }
      await enrollInSubject(subjectId);
      toast.success(`Enrolled in ${name}`);
      setEnrolledIds(prev => new Set([...prev, subjectId]));
    } catch (err) {
      toast.error(err.message || 'Failed to enroll');
    } finally {
      setEnrolling(null);
    }
  };

  const handleUnenroll = async (subjectId, name) => {
    if (!window.confirm(`Drop "${name}"? You can re-enroll later.`)) return;
    setEnrolling(subjectId);
    try {
      await unenrollFromSubject(subjectId);
      toast.success(`Dropped ${name}`);
      setEnrolledIds(prev => { const s = new Set(prev); s.delete(subjectId); return s; });
    } catch (err) {
      toast.error(err.message || 'Failed to drop subject');
    } finally {
      setEnrolling(null);
    }
  };

  const isEnrolled     = s => enrolledIds.has(s._id) || enrolledIds.has(s._id?.toString());
  const enrolledCount  = subjects.filter(isEnrolled).length;
  const freeCount      = subjects.filter(s => !s.price || s.price === 0).length;

  const filtered = useMemo(() => {
    return subjects
      .filter(s => activeTab === 'enrolled' ? isEnrolled(s) : true)
      .filter(s => {
        const q = search.trim().toLowerCase();
        return (
          (!q || s.name?.toLowerCase().includes(q) || s.code?.toLowerCase().includes(q) ||
            s.assignedTeachers?.some(t => `${t.firstName} ${t.lastName}`.toLowerCase().includes(q))) &&
          (!gradeFilter || s.gradeLevel === gradeFilter) &&
          (!catFilter   || s.category   === catFilter)
        );
      });
  }, [subjects, activeTab, search, gradeFilter, catFilter, enrolledIds]);

  const hasFilter = search || gradeFilter || catFilter;

  return (
    <div className={`min-h-screen ${dark ? 'bg-slate-900' : 'bg-gray-50'}`}>

      {/* ── Hero banner ── */}
      <div className={`relative overflow-hidden border-b ${
        dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-5">
            <button onClick={() => navigate('/dashboard')}
              className={`p-2 rounded-xl border transition flex-shrink-0 ${
                dark ? 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
                     : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 shadow-sm'
              }`}>
              <FiArrowLeft className="w-4 h-4" />
            </button>
            <nav className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500">
              <Link to="/dashboard" className="hover:text-blue-500 transition">Dashboard</Link>
              <span>/</span>
              <span className="text-gray-600 dark:text-slate-300 font-medium">Subjects</span>
            </nav>
          </div>

          {/* Title row */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 flex-shrink-0">
                <FiBook className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
                  Browse Subjects
                </h1>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                  {loading ? '…' : (
                    <>
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">{subjects.length} subjects</span>
                      {' '}available · {enrolledCount} enrolled
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-7 space-y-6">

        {/* ── Stats ── */}
        {!loading && subjects.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Stat value={subjects.length}  label="Total Subjects"  color="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"     icon={FiBook}         />
            <Stat value={enrolledCount}    label="Enrolled"        color="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" icon={FiCheckCircle} />
            <Stat value={freeCount}        label="Free Subjects"   color="bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400"   icon={FiTag}          />
            <Stat value={subjects.length - freeCount} label="Paid Subjects" color="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400" icon={FiDollarSign} />
          </div>
        )}

        {/* ── Toolbar ── */}
        <div className="space-y-3">
          {/* Tabs */}
          <div className={`flex items-center gap-1 p-1 rounded-xl border w-fit ${
            dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200 shadow-sm'
          }`}>
            {[
              { key: 'all',      label: 'All Subjects' },
              { key: 'enrolled', label: `Enrolled (${enrolledCount})` },
            ].map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
                  activeTab === t.key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : dark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search subjects…"
                className={`w-full pl-10 pr-9 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                  dark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                       : 'bg-white border-gray-200 text-gray-900 shadow-sm'
                }`}
              />
              {search && (
                <button onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
                  <FiX className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Grade filter */}
            <select value={gradeFilter} onChange={e => setGradeFilter(e.target.value)}
              className={`px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                dark ? 'bg-slate-800 border-slate-700 text-white'
                     : 'bg-white border-gray-200 text-gray-900 shadow-sm'
              }`}>
              <option value="">All Grades</option>
              {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>

            {/* Category filter */}
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
              className={`px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                dark ? 'bg-slate-800 border-slate-700 text-white'
                     : 'bg-white border-gray-200 text-gray-900 shadow-sm'
              }`}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Clear filters */}
            {hasFilter && (
              <button onClick={() => { setSearch(''); setGradeFilter(''); setCatFilter(''); }}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition">
                <FiX className="w-4 h-4" /> Clear
              </button>
            )}

            {/* View toggle */}
            <div className={`flex items-center gap-1 p-1 rounded-xl border ${
              dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <button onClick={() => setView('grid')}
                className={`p-2 rounded-lg transition ${
                  view === 'grid' ? 'bg-blue-600 text-white' : dark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700'
                }`}>
                <FiGrid className="w-4 h-4" />
              </button>
              <button onClick={() => setView('list')}
                className={`p-2 rounded-lg transition ${
                  view === 'list' ? 'bg-blue-600 text-white' : dark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700'
                }`}>
                <FiList className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className={`grid gap-4 ${
            view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
          }`}>
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-20 rounded-2xl border ${
            dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          }`}>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
              dark ? 'bg-slate-700' : 'bg-gray-100'
            }`}>
              {hasFilter
                ? <FiFilter className={`w-7 h-7 ${dark ? 'text-slate-500' : 'text-gray-400'}`} />
                : <FiBook   className={`w-7 h-7 ${dark ? 'text-slate-500' : 'text-gray-400'}`} />
              }
            </div>
            <h3 className={`font-bold text-lg ${dark ? 'text-slate-200' : 'text-gray-800'}`}>
              {hasFilter ? 'No subjects match' : activeTab === 'enrolled' ? 'Not enrolled yet' : 'No subjects available'}
            </h3>
            <p className={`text-sm mt-1 ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
              {hasFilter ? 'Try adjusting your search or filters'
                : activeTab === 'enrolled' ? 'Enroll in a subject to get started'
                : 'Check back later for available subjects'}
            </p>
            {hasFilter && (
              <button onClick={() => { setSearch(''); setGradeFilter(''); setCatFilter(''); }}
                className="mt-5 px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className={`text-sm ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                {hasFilter
                  ? `${filtered.length} of ${subjects.length} subjects`
                  : `${filtered.length} subject${filtered.length !== 1 ? 's' : ''}`
                }
              </p>
              {hasFilter && (
                <button onClick={() => { setSearch(''); setGradeFilter(''); setCatFilter(''); }}
                  className="text-xs text-blue-500 hover:text-blue-600 font-semibold transition">
                  Clear filters
                </button>
              )}
            </div>

            <div className={`grid gap-4 ${
              view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
            }`}>
              {filtered.map(s => (
                <SubjectCard
                  key={s._id}
                  subject={s}
                  enrolled={isEnrolled(s)}
                  enrolling={enrolling}
                  onEnroll={handleEnroll}
                  onUnenroll={handleUnenroll}
                  dark={dark}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
