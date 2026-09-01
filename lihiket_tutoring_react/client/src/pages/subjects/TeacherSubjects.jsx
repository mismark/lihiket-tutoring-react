import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/auth/AuthContext';
import { useTheme } from '../../store/theme/ThemeContext';
import { getAllSubjects } from '../../api/subject.api';
import toast from 'react-hot-toast';
import {
  FiBook, FiArrowLeft, FiDollarSign, FiUsers,
  FiUserCheck, FiBookOpen, FiSearch, FiX,
  FiZap, FiAward, FiFileText, FiRadio,
  FiGrid, FiList, FiCheckCircle, FiFilter, FiSettings,
} from 'react-icons/fi';

import SubjectStudentsModal from './components/SubjectStudentsModal';
import SubjectCoursesModal  from './components/SubjectCoursesModal';

// ── Gradient colours per category ─────────────────────────────────────────────
const GRAD = {
  STEM:                'from-blue-500 to-indigo-600',
  Languages:           'from-emerald-500 to-teal-600',
  Arts:                'from-pink-500 to-rose-600',
  'Social Studies':    'from-amber-500 to-orange-600',
  'Physical Education':'from-green-500 to-emerald-600',
  Other:               'from-slate-500 to-slate-600',
};
const grad = (cat) => GRAD[cat] || 'from-blue-500 to-indigo-600';

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

// ── Subject card ──────────────────────────────────────────────────────────────
function TeacherSubjectCard({ subject, onViewStudents, onViewCourses, dark }) {
  const isFree = !subject.price || subject.price === 0;
  const slug   = subject.slug || subject._id;

  return (
    <div className={`flex flex-col rounded-2xl border overflow-hidden shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 ${
      dark ? 'bg-slate-800 border-slate-700 hover:border-blue-500/40'
           : 'bg-white border-gray-200 hover:border-blue-300'
    }`}>

      {/* Gradient banner */}
      <div className={`relative h-24 bg-gradient-to-br ${grad(subject.category)} flex items-end p-4`}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative flex items-center justify-between w-full">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <FiBook className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white">
              <FiDollarSign className="w-3 h-3 inline mr-0.5" />
              {isFree ? 'Free' : `ETB ${Number(subject.price).toLocaleString()}`}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              subject.isActive ? 'bg-emerald-400/30 text-white' : 'bg-white/20 text-white/70'
            }`}>
              {subject.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
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

        {/* Stats row */}
        <div className={`flex items-center justify-between text-xs pb-3 mb-3 border-b ${
          dark ? 'border-slate-700 text-slate-400' : 'border-gray-100 text-gray-500'
        }`}>
          <span className="flex items-center gap-1.5">
            <FiUserCheck className="w-3.5 h-3.5" />
            {subject.enrolledCount ?? 0} students
          </span>
          <span className="flex items-center gap-1.5">
            <FiUsers className="w-3.5 h-3.5" />
            {subject.assignedTeachers?.length || 0} teachers
          </span>
        </div>

        {/* Navigation grid */}
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
          <button onClick={() => onViewStudents(subject)}
            className="flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold
                       bg-teal-100 text-teal-700 hover:bg-teal-200
                       dark:bg-teal-500/20 dark:text-teal-400 dark:hover:bg-teal-500/30 transition">
            <FiUsers className="w-3.5 h-3.5" /> Students
          </button>
        </div>

        {/* Manage button */}
        <button onClick={() => onViewCourses(subject)}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition ${
            dark ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}>
          <FiSettings className="w-4 h-4" /> Manage Subject
        </button>
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
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[1,2,3].map(i => <div key={i} className="h-8 bg-gray-200 dark:bg-slate-700 rounded-xl" />)}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function TeacherSubjects() {
  const { user }    = useAuth();
  const { theme }   = useTheme();
  const dark        = theme === 'dark';
  const navigate    = useNavigate();

  const [subjects,        setSubjects]        = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [search,          setSearch]          = useState('');
  const [view,            setView]            = useState('grid');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showStudents,    setShowStudents]     = useState(false);
  const [showCourses,     setShowCourses]      = useState(false);

  const fetchAssignedSubjects = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const response = await getAllSubjects();
      const assigned = (response.data || []).filter(s =>
        s.assignedTeachers?.some(t => {
          const tid = (t._id || t.id || '').toString();
          const uid = (user.id || user._id || '').toString();
          return tid && uid && tid === uid;
        })
      );
      setSubjects(assigned);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch assigned subjects');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) fetchAssignedSubjects();
  }, [user?.id, fetchAssignedSubjects]);

  const openStudents = (subject) => { setSelectedSubject(subject); setShowStudents(true); };
  const openCourses  = (subject) => { setSelectedSubject(subject); setShowCourses(true);  };

  const filtered = useMemo(() => {
    if (!search.trim()) return subjects;
    const q = search.toLowerCase();
    return subjects.filter(s =>
      s.name?.toLowerCase().includes(q) ||
      s.code?.toLowerCase().includes(q) ||
      s.gradeLevel?.toLowerCase().includes(q) ||
      s.category?.toLowerCase().includes(q)
    );
  }, [subjects, search]);

  const totalStudents = subjects.reduce((sum, s) => sum + (s.enrolledCount || 0), 0);
  const activeCount   = subjects.filter(s => s.isActive).length;

  return (
    <div className={`min-h-screen ${dark ? 'bg-slate-900' : 'bg-gray-50'}`}>

      {/* ── Hero banner ── */}
      <div className={`relative overflow-hidden border-b ${
        dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-8">
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
              <span className="text-gray-600 dark:text-slate-300 font-medium">My Subjects</span>
            </nav>
          </div>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 flex-shrink-0">
                <FiBook className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
                  My Assigned Subjects
                </h1>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                  {loading ? '…' : (
                    <>
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">{subjects.length} subjects</span>
                      {' '}assigned to you
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
            <Stat value={subjects.length} label="Total Subjects"   color="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"     icon={FiBook}         />
            <Stat value={activeCount}     label="Active"           color="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" icon={FiCheckCircle} />
            <Stat value={totalStudents}   label="Total Students"   color="bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400" icon={FiUsers}       />
            <Stat value={subjects.filter(s => !s.price || s.price === 0).length} label="Free Subjects"
              color="bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400" icon={FiDollarSign} />
          </div>
        )}

        {/* ── Toolbar ── */}
        <div className="flex items-center gap-3 flex-wrap">
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
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${dark ? 'bg-slate-700' : 'bg-gray-100'}`}>
              {search
                ? <FiFilter className={`w-7 h-7 ${dark ? 'text-slate-500' : 'text-gray-400'}`} />
                : <FiBook   className={`w-7 h-7 ${dark ? 'text-slate-500' : 'text-gray-400'}`} />
              }
            </div>
            <h3 className={`font-bold text-lg ${dark ? 'text-slate-200' : 'text-gray-800'}`}>
              {search ? 'No subjects match' : 'No subjects assigned yet'}
            </h3>
            <p className={`text-sm mt-1 ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
              {search ? 'Try a different search term' : 'Ask your admin to assign subjects to you'}
            </p>
            {search && (
              <button onClick={() => setSearch('')}
                className="mt-5 px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition">
                Clear search
              </button>
            )}
          </div>

        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className={`text-sm ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                {search
                  ? `${filtered.length} of ${subjects.length} subjects`
                  : `${filtered.length} subject${filtered.length !== 1 ? 's' : ''}`
                }
              </p>
              {search && (
                <button onClick={() => setSearch('')}
                  className="text-xs text-blue-500 hover:text-blue-600 font-semibold transition">
                  Clear search
                </button>
              )}
            </div>

            <div className={`grid gap-4 ${
              view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
            }`}>
              {filtered.map(s => (
                <TeacherSubjectCard
                  key={s._id}
                  subject={s}
                  onViewStudents={openStudents}
                  onViewCourses={openCourses}
                  dark={dark}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {showStudents && selectedSubject && (
        <SubjectStudentsModal
          isOpen={showStudents}
          onClose={() => setShowStudents(false)}
          subject={selectedSubject}
          theme={theme}
        />
      )}
      {showCourses && selectedSubject && (
        <SubjectCoursesModal
          isOpen={showCourses}
          onClose={() => setShowCourses(false)}
          subject={selectedSubject}
          theme={theme}
        />
      )}
    </div>
  );
}
