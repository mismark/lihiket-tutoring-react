import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../store/theme/ThemeContext';
import { getAllSubjects } from '../../api/subject.api';
import { getMyEnrollments, enrollInSubject, unenrollFromSubject } from '../../api/enrollment.api';
import { initiatePayment } from '../../api/payment.api';
import useCopy from '../../hooks/useCopy';
import toast from 'react-hot-toast';
import {
  FiArrowLeft, FiSearch, FiX, FiBook, FiCheckCircle,
  FiPlusCircle, FiMinusCircle, FiCreditCard, FiDollarSign,
  FiUsers, FiFilter, FiEye, FiMail, FiPhone, FiCopy,
  FiCode, FiCalendar, FiTag, FiExternalLink, FiBookOpen,
  FiZap, FiAward, FiFileText,
} from 'react-icons/fi';

const GRADE_LEVELS = ['KG1','KG2','G1','G2','G3','G4','G5','G6','G7','G8','G9','G10','G11','G12','HL'];
const CATEGORIES   = ['STEM','Languages','Arts','Social Studies','Physical Education','Other'];

// ── enroll / pay / drop button ────────────────────────────────────────────────
function EnrollButton({ subject, enrolled, enrolling, onEnroll, onUnenroll }) {
  const isFree = !subject.price || subject.price === 0;
  const id     = subject._id;
  const busy   = enrolling === id;

  if (enrolled) return (
    <button
      onClick={() => onUnenroll(id, subject.name)}
      disabled={busy}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold
                 border-2 border-red-200 text-red-600 hover:bg-red-50
                 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10
                 transition disabled:opacity-50"
    >
      {busy ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            : <FiMinusCircle className="w-4 h-4" />}
      {busy ? 'Dropping\u2026' : 'Drop Subject'}
    </button>
  );

  if (isFree) return (
    <button
      onClick={() => onEnroll(id, subject.name, false)}
      disabled={busy}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold
                 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm
                 transition disabled:opacity-50"
    >
      {busy ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <FiPlusCircle className="w-4 h-4" />}
      {busy ? 'Enrolling\u2026' : 'Enroll for Free'}
    </button>
  );

  return (
    <button
      onClick={() => onEnroll(id, subject.name, true)}
      disabled={busy}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold
                 bg-amber-500 hover:bg-amber-600 text-white shadow-sm
                 transition disabled:opacity-50"
    >
      {busy ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <FiCreditCard className="w-4 h-4" />}
      {busy ? 'Redirecting to Chapa\u2026' : `Pay ETB ${Number(subject.price).toLocaleString()} & Enroll`}
    </button>
  );
}

// ── subject detail modal ──────────────────────────────────────────────────────
function SubjectDetailModal({ subject, enrolled, enrolling, onEnroll, onUnenroll, onClose }) {
  const isFree = !subject.price || subject.price === 0;
  const { copied, copy } = useCopy();

  if (!subject) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="flex flex-col w-full max-w-lg max-h-[92vh] rounded-2xl border shadow-2xl
                      bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Subject Details</h2>
          <button onClick={onClose}
            className="p-2 rounded-xl transition text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-700">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Title + tags */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0
                            bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <FiBook className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{subject.name}</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold
                                 bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  <FiCode className="w-3 h-3" /> {subject.code}
                </span>
                {subject.gradeLevel && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold
                                   bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                    {subject.gradeLevel}
                  </span>
                )}
                {subject.category && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold
                                   bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400">
                    <FiTag className="w-3 h-3" /> {subject.category}
                  </span>
                )}
                {enrolled && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold
                                   bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <FiCheckCircle className="w-3 h-3" /> Enrolled
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Price banner */}
          <div className={`flex items-center justify-between p-4 rounded-xl border ${
            isFree
              ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20'
              : 'bg-amber-50  border-amber-200  dark:bg-amber-500/10  dark:border-amber-500/20'
          }`}>
            <div className="flex items-center gap-2">
              <FiDollarSign className={`w-5 h-5 ${isFree ? 'text-emerald-500' : 'text-amber-500'}`} />
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {isFree ? 'This subject is free' : 'Enrollment fee required'}
              </span>
            </div>
            <span className={`text-lg font-extrabold ${
              isFree ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
            }`}>
              {isFree ? 'Free' : `ETB ${Number(subject.price).toLocaleString()}`}
            </span>
          </div>

          {/* Description */}
          {subject.description && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-2
                            text-slate-400 dark:text-slate-500">
                About this subject
              </p>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {subject.description}
              </p>
            </div>
          )}

          {/* Teachers */}
          {subject.assignedTeachers?.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-3
                            text-slate-400 dark:text-slate-500">
                Your Teacher{subject.assignedTeachers.length > 1 ? 's' : ''}
              </p>
              <div className="space-y-3">
                {subject.assignedTeachers.map(t => (
                  <div key={t._id}
                    className="rounded-xl border p-4
                               bg-slate-50 border-slate-200
                               dark:bg-slate-700/40 dark:border-slate-600">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600
                                      flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {t.firstName?.[0]}{t.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {t.firstName} {t.lastName}
                        </p>
                        {t.specializedSubject && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">{t.specializedSubject}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {t.email && (
                        <>
                          <a href={`mailto:${t.email}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold
                                       bg-blue-100 text-blue-700 hover:bg-blue-200
                                       dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30 transition">
                            <FiMail className="w-3 h-3" /> Email <FiExternalLink className="w-2.5 h-2.5" />
                          </a>
                          <button onClick={() => copy(t.email, `email-${t._id}`)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                              copied === `email-${t._id}`
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-600 dark:text-slate-300 dark:hover:bg-slate-500'
                            }`}>
                            <FiCopy className="w-3 h-3" />
                            {copied === `email-${t._id}` ? 'Copied!' : 'Copy email'}
                          </button>
                        </>
                      )}
                      {t.phone && (
                        <>
                          <a href={`tel:${t.phone}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold
                                       bg-emerald-100 text-emerald-700 hover:bg-emerald-200
                                       dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30 transition">
                            <FiPhone className="w-3 h-3" /> Call
                          </a>
                          <button onClick={() => copy(t.phone, `phone-${t._id}`)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                              copied === `phone-${t._id}`
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-600 dark:text-slate-300 dark:hover:bg-slate-500'
                            }`}>
                            <FiCopy className="w-3 h-3" />
                            {copied === `phone-${t._id}` ? 'Copied!' : 'Copy no.'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* What you get */}
          <div className="rounded-xl border p-4
                          bg-blue-50 border-blue-200
                          dark:bg-slate-700/30 dark:border-slate-600">
            <p className="text-xs font-bold uppercase tracking-wider mb-2
                          text-blue-600 dark:text-blue-400">
              What you get
            </p>
            <ul className="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
              {['Access to all course materials', 'Live class participation',
                'Assignments and exams', 'Certificate on completion',
                'Direct teacher contact'].map(item => (
                <li key={item} className="flex items-center gap-2">
                  <FiCheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Added date */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
            <FiCalendar className="w-3.5 h-3.5" />
            Added on {new Date(subject.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Sticky footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0 space-y-2">
          {enrolled && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to={`/subjects/${subject.slug || subject._id}/courses`}
                  onClick={onClose}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold
                             bg-blue-100 text-blue-700 hover:bg-blue-200
                             dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30 transition"
                >
                  <FiBookOpen className="w-3.5 h-3.5" /> Courses
                </Link>
                <Link
                  to={`/subjects/${subject.slug || subject._id}/quizzes`}
                  onClick={onClose}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold
                             bg-violet-100 text-violet-700 hover:bg-violet-200
                             dark:bg-violet-500/20 dark:text-violet-400 dark:hover:bg-violet-500/30 transition"
                >
                  <FiZap className="w-3.5 h-3.5" /> Quizzes
                </Link>
                <Link
                  to={`/subjects/${subject.slug || subject._id}/exams`}
                  onClick={onClose}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold
                             bg-amber-100 text-amber-700 hover:bg-amber-200
                             dark:bg-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/30 transition"
                >
                  <FiAward className="w-3.5 h-3.5" /> Exams
                </Link>
                <Link
                  to={`/subjects/${subject.slug || subject._id}/assignments`}
                  onClick={onClose}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold
                             bg-emerald-100 text-emerald-700 hover:bg-emerald-200
                             dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30 transition"
                >
                  <FiFileText className="w-3.5 h-3.5" /> Assignments
                </Link>
              </div>
              <Link
                to={`/subjects/${subject.slug || subject._id}/classroom`}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold
                           bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
              >
                <FiBookOpen className="w-4 h-4" /> Enter Subject Classroom
              </Link>
            </>
          )}
          <EnrollButton
            subject={subject} enrolled={enrolled} enrolling={enrolling}
            onEnroll={onEnroll} onUnenroll={onUnenroll}
          />
          <button onClick={onClose}
            className="w-full py-2 rounded-xl text-sm font-semibold transition
                       text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── subject grid card ─────────────────────────────────────────────────────────
function SubjectCard({ subject, enrolled, enrolling, onEnroll, onUnenroll, onViewDetails }) {
  const isFree = !subject.price || subject.price === 0;

  return (
    <div className={`flex flex-col rounded-2xl border shadow-sm transition-all hover:shadow-md ${
      enrolled
        ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/5 dark:border-emerald-500/40'
        : 'bg-white border-slate-200 hover:border-blue-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-blue-500/40'
    }`}>
      <div className="p-5 flex-1">
        {/* Name + price badge */}
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-base leading-tight text-slate-900 dark:text-white">
              {subject.name}
            </h3>
            <p className="text-xs font-mono mt-0.5 text-blue-600 dark:text-blue-400">
              {subject.code}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 ml-3 flex-shrink-0">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
              isFree
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
            }`}>
              <FiDollarSign className="w-3 h-3" />
              {isFree ? 'Free' : `ETB ${Number(subject.price).toLocaleString()}`}
            </span>
            {enrolled && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold
                               bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                <FiCheckCircle className="w-3 h-3" /> Enrolled
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {subject.description && (
          <p className="text-xs mb-3 line-clamp-2 text-slate-500 dark:text-slate-400">
            {subject.description}
          </p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {subject.gradeLevel && (
            <span className="px-2 py-0.5 rounded-md text-xs font-medium
                             bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
              {subject.gradeLevel}
            </span>
          )}
          {subject.category && (
            <span className="px-2 py-0.5 rounded-md text-xs font-medium
                             bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400">
              {subject.category}
            </span>
          )}
        </div>

        {/* Teachers */}
        {subject.assignedTeachers?.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <FiUsers className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">
              {subject.assignedTeachers.map(t => `${t.firstName} ${t.lastName}`).join(', ')}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 space-y-2">
        <button
          onClick={() => onViewDetails(subject)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold
                     border border-slate-200 text-slate-700 hover:bg-slate-50
                     dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 transition"
        >
          <FiEye className="w-4 h-4" /> View Details
        </button>
        {enrolled && (
          <>
            {/* Subject navigation grid */}
            <div className="grid grid-cols-2 gap-2">
              <Link
                to={`/subjects/${subject.slug || subject._id}/courses`}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold
                           bg-blue-100 text-blue-700 hover:bg-blue-200
                           dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30 transition"
              >
                <FiBookOpen className="w-3.5 h-3.5" /> Courses
              </Link>
              <Link
                to={`/subjects/${subject.slug || subject._id}/quizzes`}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold
                           bg-violet-100 text-violet-700 hover:bg-violet-200
                           dark:bg-violet-500/20 dark:text-violet-400 dark:hover:bg-violet-500/30 transition"
              >
                <FiZap className="w-3.5 h-3.5" /> Quizzes
              </Link>
              <Link
                to={`/subjects/${subject.slug || subject._id}/exams`}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold
                           bg-amber-100 text-amber-700 hover:bg-amber-200
                           dark:bg-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/30 transition"
              >
                <FiAward className="w-3.5 h-3.5" /> Exams
              </Link>
              <Link
                to={`/subjects/${subject.slug || subject._id}/assignments`}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold
                           bg-emerald-100 text-emerald-700 hover:bg-emerald-200
                           dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30 transition"
              >
                <FiFileText className="w-3.5 h-3.5" /> Assignments
              </Link>
            </div>
            {/* Classroom shortcut */}
            <Link
              to={`/subjects/${subject.slug || subject._id}/classroom`}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold
                         bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
            >
              <FiBookOpen className="w-4 h-4" /> Enter Subject
            </Link>
          </>
        )}
        <EnrollButton
          subject={subject} enrolled={enrolled} enrolling={enrolling}
          onEnroll={onEnroll} onUnenroll={onUnenroll}
        />
      </div>
    </div>
  );
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="space-y-2 flex-1">
          <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-3 w-1/4 bg-slate-100 dark:bg-slate-700/60 rounded" />
        </div>
        <div className="h-5 w-14 bg-slate-200 dark:bg-slate-700 rounded-full" />
      </div>
      <div className="h-3 w-full bg-slate-100 dark:bg-slate-700/60 rounded mb-1" />
      <div className="h-3 w-2/3 bg-slate-100 dark:bg-slate-700/60 rounded mb-4" />
      <div className="space-y-2 pt-2">
        <div className="h-9 bg-slate-100 dark:bg-slate-700/60 rounded-xl" />
        <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded-xl" />
      </div>
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────
export default function StudentSubjects() {
  const { theme } = useTheme();
  const dark      = theme === 'dark';

  const [subjects,      setSubjects]      = useState([]);
  const [enrolledIds,   setEnrolledIds]   = useState(new Set());
  const [loading,       setLoading]       = useState(true);
  const [enrolling,     setEnrolling]     = useState(null);
  const [detailSubject, setDetailSubject] = useState(null);

  const [search,      setSearch]      = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [catFilter,   setCatFilter]   = useState('');
  const [showFilter,  setShowFilter]  = useState(false);
  const [activeTab,   setActiveTab]   = useState('all');

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
        const res = await initiatePayment(subjectId);
        toast.success('Redirecting to Chapa payment\u2026');
        setTimeout(() => { window.location.href = res.checkoutUrl; }, 600);
      } else {
        await enrollInSubject(subjectId);
        toast.success(`Enrolled in ${name}`);
        setEnrolledIds(prev => new Set([...prev, subjectId]));
        setEnrolling(null);
        setDetailSubject(null);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to enroll');
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
      setDetailSubject(null);
    } catch (err) {
      toast.error(err.message || 'Failed to drop subject');
    } finally {
      setEnrolling(null);
    }
  };

  const isEnrolled    = s => enrolledIds.has(s._id) || enrolledIds.has(s._id?.toString());
  const enrolledCount = subjects.filter(isEnrolled).length;
  const hasFilter     = search || gradeFilter || catFilter;
  const clearFilters  = () => { setSearch(''); setGradeFilter(''); setCatFilter(''); };

  const filtered = subjects
    .filter(s => activeTab === 'enrolled' ? isEnrolled(s) : true)
    .filter(s => {
      const q = search.trim().toLowerCase();
      return (
        (!q || s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) ||
               s.assignedTeachers?.some(t => `${t.firstName} ${t.lastName}`.toLowerCase().includes(q))) &&
        (!gradeFilter || s.gradeLevel === gradeFilter) &&
        (!catFilter   || s.category   === catFilter)
      );
    });

  const inputCls = `px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
    bg-white border-slate-200 text-slate-900
    dark:bg-slate-900 dark:border-slate-600 dark:text-white dark:placeholder-slate-500`;

  return (
    <div className={`min-h-screen ${dark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Page header */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link to="/dashboard"
            className="p-2 rounded-xl border transition flex-shrink-0
                       bg-white border-slate-200 text-slate-600 hover:bg-slate-50
                       dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700">
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Browse Subjects</h1>
            <p className="text-sm mt-0.5 text-slate-500 dark:text-slate-400">
              {loading ? '\u2026' : `${subjects.length} available · ${enrolledCount} enrolled`}
            </p>
          </div>
          <button
            onClick={() => setShowFilter(v => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition ${
              showFilter || hasFilter
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <FiFilter className="w-4 h-4" />
            Filters{hasFilter ? ` (${[search,gradeFilter,catFilter].filter(Boolean).length})` : ''}
          </button>
        </div>

        {/* Tabs */}
        <div className={`flex gap-1 p-1 rounded-2xl ${dark ? 'bg-slate-800' : 'bg-slate-100'}`}>
          {[['all','All Subjects'], ['enrolled','My Enrolled']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${
                activeTab === key
                  ? dark ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm'
                  : dark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {label}
              {key === 'enrolled' && enrolledCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs font-bold
                                 bg-emerald-100 text-emerald-700
                                 dark:bg-emerald-500/20 dark:text-emerald-400">
                  {enrolledCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search + filters card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 space-y-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, code or teacher\u2026"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                         bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400
                         dark:bg-slate-900 dark:border-slate-600 dark:text-white dark:placeholder-slate-500"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>

          {showFilter && (
            <div className="flex flex-wrap gap-3 pt-1">
              <select value={gradeFilter} onChange={e => setGradeFilter(e.target.value)}
                className={`${inputCls} flex-1 min-w-[140px]`}>
                <option value="">All Grades</option>
                {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
                className={`${inputCls} flex-1 min-w-[160px]`}>
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {hasFilter && (
                <button onClick={clearFilters}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-semibold transition
                             border-slate-200 text-slate-600 hover:bg-slate-50
                             dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
                  <FiX className="w-4 h-4" /> Clear
                </button>
              )}
            </div>
          )}

          {hasFilter && !loading && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {filtered.length} of {subjects.length} subjects match
            </p>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <FiBook className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              {activeTab === 'enrolled'
                ? 'You are not enrolled in any subjects yet'
                : hasFilter ? 'No subjects match your filters' : 'No subjects available yet'}
            </p>
            {activeTab === 'enrolled'
              ? <button onClick={() => setActiveTab('all')}
                  className="mt-4 text-sm font-semibold text-blue-500 hover:text-blue-600 transition">
                  Browse all subjects
                </button>
              : hasFilter &&
                <button onClick={clearFilters}
                  className="mt-4 text-sm font-semibold text-blue-500 hover:text-blue-600 transition">
                  Clear filters
                </button>
            }
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(s => (
              <SubjectCard
                key={s._id}
                subject={s}
                enrolled={isEnrolled(s)}
                enrolling={enrolling}
                onEnroll={handleEnroll}
                onUnenroll={handleUnenroll}
                onViewDetails={setDetailSubject}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {detailSubject && (
        <SubjectDetailModal
          subject={detailSubject}
          enrolled={isEnrolled(detailSubject)}
          enrolling={enrolling}
          onEnroll={handleEnroll}
          onUnenroll={handleUnenroll}
          onClose={() => setDetailSubject(null)}
        />
      )}
    </div>
  );
}
