import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../store/auth/AuthContext';
import { useTheme } from '../../store/theme/ThemeContext';
import { getAllSubjects } from '../../api/subject.api';
import toast from 'react-hot-toast';
import {
  FiBook, FiArrowLeft, FiDollarSign, FiUsers,
  FiUserCheck, FiBookOpen, FiSearch, FiX, FiSettings, FiDatabase,
  FiZap, FiAward, FiFileText, FiRadio,
} from 'react-icons/fi';

import SubjectStudentsModal from './components/SubjectStudentsModal';
import SubjectCoursesModal  from './components/SubjectCoursesModal';

// ── individual subject card ────────────────────────────────────────────────────
function TeacherSubjectCard({ subject, onViewStudents, onViewCourses, theme }) {
  const dark   = theme === 'dark';
  const isFree = !subject.price || subject.price === 0;

  return (
    <div className={`flex flex-col rounded-2xl border shadow-sm p-5 transition-all hover:shadow-md ${
      dark
        ? 'bg-slate-800 border-slate-700 hover:border-blue-500/40'
        : 'bg-white border-gray-200 hover:border-blue-300'
    }`}>

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1">
          <h3 className={`font-bold text-base leading-tight ${dark ? 'text-white' : 'text-gray-900'}`}>
            {subject.name}
          </h3>
          <p className={`text-xs font-mono mt-0.5 ${dark ? 'text-blue-400' : 'text-blue-600'}`}>
            {subject.code}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 ml-3 flex-shrink-0">
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            subject.isActive
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
              : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400'
          }`}>
            {subject.isActive ? 'Active' : 'Inactive'}
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
            isFree
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
          }`}>
            <FiDollarSign className="w-3 h-3" />
            {isFree ? 'Free' : `ETB ${Number(subject.price).toLocaleString()}`}
          </span>
        </div>
      </div>

      {/* ── Description ── */}
      {subject.description && (
        <p className={`text-xs mb-3 line-clamp-2 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
          {subject.description}
        </p>
      )}

      {/* ── Tags ── */}
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

      {/* ── Stats row ── */}
      <div className={`flex items-center justify-between text-xs pb-3 mb-3 border-b ${
        dark ? 'border-slate-700 text-slate-400' : 'border-gray-100 text-gray-500'
      }`}>
        <span className="flex items-center gap-1.5">
          <FiUserCheck className="w-3.5 h-3.5" />
          {subject.enrolledCount ?? 0} student{subject.enrolledCount !== 1 ? 's' : ''} enrolled
        </span>
        <span className="flex items-center gap-1.5">
          <FiUsers className="w-3.5 h-3.5" />
          {subject.assignedTeachers?.length || 0} teacher{subject.assignedTeachers?.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Action buttons ── */}
      <div className="grid grid-cols-3 gap-2 mt-auto">
        <button
          onClick={() => onViewStudents(subject)}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition ${
            dark ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30'
                 : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
          }`}
        >
          <FiUserCheck className="w-3.5 h-3.5" /> Students
        </button>
        <Link
          to={`/subjects/${subject.slug || subject._id}/courses`}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition ${
            dark ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                 : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          <FiBookOpen className="w-3.5 h-3.5" /> Courses
        </Link>
        <Link
          to={`/subjects/${subject.slug || subject._id}/quizzes`}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition ${
            dark ? 'bg-violet-600/20 text-violet-400 hover:bg-violet-600/30'
                 : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
          }`}
        >
          <FiZap className="w-3.5 h-3.5" /> Quizzes
        </Link>
        <Link
          to={`/subjects/${subject.slug || subject._id}/exams`}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition ${
            dark ? 'bg-amber-600/20 text-amber-400 hover:bg-amber-600/30'
                 : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
          }`}
        >
          <FiAward className="w-3.5 h-3.5" /> Exams
        </Link>
        <Link
          to={`/subjects/${subject.slug || subject._id}/assignments`}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition ${
            dark ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                 : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          <FiFileText className="w-3.5 h-3.5" /> Assignments
        </Link>
        <Link
          to={`/subjects/${subject.slug || subject._id}/live-classes`}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition ${
            dark ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                 : 'bg-red-100 text-red-700 hover:bg-red-200'
          }`}
        >
          <FiRadio className="w-3.5 h-3.5" /> Live
        </Link>
        <button
          onClick={() => onViewCourses(subject)}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition ${
            dark ? 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30'
                 : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
          }`}
        >
          <FiSettings className="w-3.5 h-3.5" /> Manage
        </button>
      </div>
    </div>
  );
}

// ── main page ──────────────────────────────────────────────────────────────────
export default function TeacherSubjects() {
  const { user }  = useAuth();
  const { theme } = useTheme();
  const dark      = theme === 'dark';

  const [subjects,  setSubjects]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');

  const [selectedSubject,  setSelectedSubject]  = useState(null);
  const [showStudents,     setShowStudents]      = useState(false);
  const [showCourses,      setShowCourses]       = useState(false);

  const fetchAssignedSubjects = useCallback(async () => {
    if (!user?.id) return; // wait until user is hydrated
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

  // client-side search
  const filtered = subjects.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q)       ||
      s.code?.toLowerCase().includes(q)       ||
      s.gradeLevel?.toLowerCase().includes(q) ||
      s.category?.toLowerCase().includes(q)
    );
  });

  return (
    <div className={`min-h-screen p-6 md:p-10 ${dark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="max-w-6xl mx-auto">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className={`p-2 rounded-xl transition ${
                dark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 shadow-sm'
              }`}
            >
              <FiArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className={`text-2xl font-extrabold ${dark ? 'text-white' : 'text-slate-900'}`}>
                My Assigned Subjects
              </h1>
              <p className={`text-sm mt-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                {loading ? '…' : `${subjects.length} subject${subjects.length !== 1 ? 's' : ''} assigned to you`}
              </p>
            </div>
          </div>
        </div>

        {/* ── Search bar ── */}
        {!loading && subjects.length > 0 && (
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-sm mb-6 ${
            dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          }`}>
            <FiSearch className={`w-4 h-4 flex-shrink-0 ${dark ? 'text-slate-400' : 'text-slate-400'}`} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, code, grade or category…"
              className={`flex-1 text-sm bg-transparent outline-none ${
                dark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
              }`}
            />
            {search && (
              <>
                <button onClick={() => setSearch('')} className={`p-1 rounded-lg transition ${dark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}>
                  <FiX className="w-4 h-4" />
                </button>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                  {filtered.length} of {subjects.length}
                </span>
              </>
            )}
          </div>
        )}

        {/* ── Content ── */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className={`mt-4 text-sm ${dark ? 'text-slate-400' : 'text-gray-500'}`}>Loading subjects…</p>
          </div>

        ) : subjects.length === 0 ? (
          <div className={`rounded-2xl border shadow-sm p-12 text-center ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <FiBook className={`w-12 h-12 mx-auto mb-4 ${dark ? 'text-slate-600' : 'text-slate-300'}`} />
            <p className={`font-semibold ${dark ? 'text-slate-300' : 'text-slate-700'}`}>No subjects assigned yet</p>
            <p className={`text-sm mt-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              Contact your admin to get subjects assigned to you
            </p>
          </div>

        ) : filtered.length === 0 ? (
          <div className={`rounded-2xl border shadow-sm p-12 text-center ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <FiSearch className={`w-12 h-12 mx-auto mb-4 ${dark ? 'text-slate-600' : 'text-slate-300'}`} />
            <p className={`font-semibold ${dark ? 'text-slate-300' : 'text-slate-700'}`}>No subjects match "{search}"</p>
            <button onClick={() => setSearch('')} className="mt-4 text-sm font-semibold text-blue-500 hover:text-blue-600 transition">
              Clear search
            </button>
          </div>

        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(subject => (
              <TeacherSubjectCard
                key={subject._id}
                subject={subject}
                onViewStudents={openStudents}
                onViewCourses={openCourses}
                theme={theme}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <SubjectStudentsModal
        isOpen={showStudents}
        onClose={() => setShowStudents(false)}
        subject={selectedSubject}
        theme={theme}
      />
      <SubjectCoursesModal
        isOpen={showCourses}
        onClose={() => setShowCourses(false)}
        subject={selectedSubject}
        theme={theme}
      />
    </div>
  );
}
