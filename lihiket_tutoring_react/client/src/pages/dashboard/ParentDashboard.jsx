import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth }  from '../../store/auth/AuthContext';
import { useTheme } from '../../store/theme/ThemeContext';
import {
  getMyChildren,
  linkChild,
  unlinkChild,
  getChildProgress,
} from '../../api/user.api';
import toast from 'react-hot-toast';
import {
  FiUsers, FiBook, FiCheckCircle, FiMail, FiPhone,
  FiCalendar, FiRefreshCw, FiHash, FiMapPin, FiUser,
  FiPlusCircle, FiXCircle, FiChevronRight, FiChevronDown,
  FiAward, FiVideo, FiFileText, FiBarChart2, FiAlertCircle,
  FiClock, FiDollarSign, FiTrendingUp, FiLoader,
  FiSearch, FiLink, FiUserX,
} from 'react-icons/fi';

// ── tiny helpers ──────────────────────────────────────────────────────────────
function fmt(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
function pct(earned, total) {
  if (!total) return null;
  return Math.round((earned / total) * 100);
}
function scoreColor(p) {
  if (p === null || p === undefined) return 'text-slate-400';
  if (p >= 80) return 'text-emerald-500';
  if (p >= 50) return 'text-amber-500';
  return 'text-red-500';
}
function ScoreBadge({ score, total, passed }) {
  const p = pct(score, total);
  return (
    <span className={`font-bold text-sm ${scoreColor(p)}`}>
      {score}/{total}
      {p !== null && <span className="text-xs ml-1 opacity-75">({p}%)</span>}
      {passed !== undefined && (
        <span className={`ml-1.5 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
          passed
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
            : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
        }`}>
          {passed ? 'Passed' : 'Failed'}
        </span>
      )}
    </span>
  );
}

// ── stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }) {
  const p = {
    blue:    'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    purple:  'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
    amber:   'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
    red:     'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
  }[color] || 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300';

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 flex items-center gap-3 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${p}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-lg font-extrabold text-slate-900 dark:text-white leading-none">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ── TABS ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',    label: 'Overview',    icon: FiBarChart2 },
  { id: 'assignments', label: 'Assignments', icon: FiFileText  },
  { id: 'quizzes',     label: 'Quizzes',     icon: FiAward     },
  { id: 'exams',       label: 'Exams',       icon: FiBook      },
  { id: 'liveclasses', label: 'Live Classes', icon: FiVideo    },
];

// ── Progress modal / panel ────────────────────────────────────────────────────
function ChildProgressPanel({ child, onClose }) {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const [tab,      setTab]      = useState('overview');
  const [progress, setProgress] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    setLoading(true);
    getChildProgress(child._id)
      .then(res => setProgress(res.data))
      .catch(err => toast.error(err.message || 'Failed to load progress'))
      .finally(() => setLoading(false));
  }, [child._id]);

  const s = progress?.summary;

  // ── tab content renderers ────────────────────────────────────────────────
  const renderOverview = () => {
    if (!progress) return null;
    const { enrollments, summary } = progress;

    const overallPct = summary.overallPercent;

    return (
      <div className="space-y-5">
        {/* Overall score ring */}
        {summary.overallScore && (
          <div className={`rounded-2xl border p-5 flex flex-col sm:flex-row items-center gap-4 ${
            dark ? 'bg-slate-700/40 border-slate-600' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
          }`}>
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none"
                  className="stroke-slate-200 dark:stroke-slate-600" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none"
                  stroke={overallPct >= 80 ? '#10b981' : overallPct >= 50 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="3"
                  strokeDasharray={`${overallPct} ${100 - overallPct}`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-sm font-extrabold ${scoreColor(overallPct)}`}>
                  {overallPct}%
                </span>
              </div>
            </div>
            <div>
              <p className={`text-lg font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
                Overall Score
              </p>
              <p className={`text-2xl font-extrabold ${scoreColor(overallPct)}`}>
                {summary.overallScore}
              </p>
              <p className={`text-xs mt-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                Across {summary.assignmentsGraded} assignments,{' '}
                {summary.quizzesAttempted} quizzes, {summary.examsAttempted} exams
              </p>
            </div>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard icon={FiBook}     label="Enrolled Subjects"  value={summary.enrollments}       color="blue"    />
          <StatCard icon={FiFileText} label="Assignments Done"   value={`${summary.assignmentsGraded}/${summary.assignmentsTotal}`} color="purple" />
          <StatCard icon={FiAward}    label="Quizzes Taken"      value={summary.quizzesAttempted}  color="emerald" />
          <StatCard icon={FiBook}     label="Exams Taken"        value={summary.examsAttempted}    color="amber"   />
          <StatCard icon={FiVideo}    label="Live Classes"       value={summary.liveClassesTotal}  color="blue"    />
        </div>

        {/* Enrolled subjects list */}
        {enrollments.length > 0 && (
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              Enrolled Subjects
            </p>
            <div className="space-y-2">
              {enrollments.map(e => (
                <div key={e._id}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
                    dark ? 'border-slate-700 bg-slate-700/30' : 'border-slate-100 bg-slate-50'
                  }`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <FiBook className={`w-4 h-4 flex-shrink-0 ${dark ? 'text-blue-400' : 'text-blue-500'}`} />
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate ${dark ? 'text-white' : 'text-slate-900'}`}>
                        {e.subject?.name}
                      </p>
                      <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {e.subject?.code} · {e.subject?.gradeLevel}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${
                    e.subject?.isActive
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                  }`}>
                    {e.subject?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAssignments = () => {
    const items = progress?.assignments || [];
    if (!items.length) return <EmptyState icon={FiFileText} label="No assignment submissions yet" />;
    return (
      <div className="space-y-3">
        {items.map(sub => {
          const graded = sub.marks !== null && sub.marks !== undefined;
          const p = graded ? pct(sub.marks, sub.assignment?.totalMarks) : null;
          return (
            <div key={sub._id}
              className={`rounded-xl border p-4 ${dark ? 'border-slate-700 bg-slate-700/30' : 'border-slate-200 bg-white'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className={`font-semibold text-sm ${dark ? 'text-white' : 'text-slate-900'}`}>
                    {sub.assignment?.title || 'Untitled Assignment'}
                  </p>
                  <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {sub.assignment?.subject?.name}
                    {sub.assignment?.dueDate && ` · Due ${fmt(sub.assignment.dueDate)}`}
                    {sub.late && <span className="ml-2 text-amber-500 font-semibold">Late</span>}
                  </p>
                </div>
                <div className="flex-shrink-0 text-right">
                  {graded
                    ? <ScoreBadge score={sub.marks} total={sub.assignment?.totalMarks} />
                    : <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        dark ? 'bg-slate-600 text-slate-300' : 'bg-slate-100 text-slate-500'
                      }`}>Pending grade</span>
                  }
                </div>
              </div>
              {sub.feedback && (
                <p className={`mt-2 text-xs italic border-l-2 pl-3 ${
                  dark ? 'border-blue-500/40 text-slate-400' : 'border-blue-300 text-slate-500'
                }`}>
                  "{sub.feedback}"
                </p>
              )}
              <p className={`mt-2 text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                Submitted {fmt(sub.submittedAt)} ·{' '}
                <span className={`font-semibold capitalize ${
                  sub.status === 'graded'    ? 'text-emerald-500' :
                  sub.status === 'returned'  ? 'text-blue-500'    : 'text-amber-500'
                }`}>{sub.status}</span>
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  const renderQuizzes = () => {
    const items = progress?.quizzes || [];
    if (!items.length) return <EmptyState icon={FiAward} label="No quiz attempts yet" />;
    return (
      <div className="space-y-3">
        {items.map(r => (
          <div key={r._id}
            className={`rounded-xl border p-4 ${dark ? 'border-slate-700 bg-slate-700/30' : 'border-slate-200 bg-white'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className={`font-semibold text-sm ${dark ? 'text-white' : 'text-slate-900'}`}>
                  {r.quiz?.title || 'Quiz'}
                </p>
                <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {r.quiz?.subject?.name}
                  {r.timeTaken > 0 && ` · ${Math.floor(r.timeTaken / 60)}m ${r.timeTaken % 60}s`}
                  {r.attempt > 1 && ` · Attempt #${r.attempt}`}
                </p>
              </div>
              <ScoreBadge score={r.score} total={r.totalMarks} passed={r.passed} />
            </div>
            <p className={`mt-2 text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
              Taken {fmt(r.createdAt)}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const renderExams = () => {
    const items = progress?.exams || [];
    if (!items.length) return <EmptyState icon={FiBook} label="No exam attempts yet" />;
    return (
      <div className="space-y-3">
        {items.map(r => (
          <div key={r._id}
            className={`rounded-xl border p-4 ${dark ? 'border-slate-700 bg-slate-700/30' : 'border-slate-200 bg-white'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className={`font-semibold text-sm ${dark ? 'text-white' : 'text-slate-900'}`}>
                  {r.exam?.title || 'Exam'}
                </p>
                <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {r.exam?.subject?.name}
                  {r.timeTaken > 0 && ` · ${Math.floor(r.timeTaken / 60)}m taken`}
                </p>
              </div>
              <ScoreBadge score={r.score} total={r.totalMarks} passed={r.passed} />
            </div>
            <p className={`mt-2 text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
              Submitted {fmt(r.submittedAt)}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const renderLiveClasses = () => {
    const items = progress?.liveClasses || [];
    if (!items.length) return <EmptyState icon={FiVideo} label="No live classes for enrolled subjects" />;
    const now = new Date();
    return (
      <div className="space-y-3">
        {items.map(lc => {
          const scheduled = new Date(lc.scheduledAt);
          const isPast    = lc.status === 'ended' || scheduled < now;
          const isLive    = lc.status === 'live';
          return (
            <div key={lc._id}
              className={`rounded-xl border p-4 ${
                isLive
                  ? dark ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-emerald-300 bg-emerald-50'
                  : dark ? 'border-slate-700 bg-slate-700/30' : 'border-slate-200 bg-white'
              }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`font-semibold text-sm ${dark ? 'text-white' : 'text-slate-900'}`}>
                      {lc.title}
                    </p>
                    {isLive && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white animate-pulse">
                        LIVE
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {lc.subject?.name} · {lc.platform?.toUpperCase()}
                    {lc.duration && ` · ${lc.duration}min`}
                  </p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 capitalize ${
                  isLive    ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                  isPast    ? 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400' :
                              'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                }`}>{lc.status}</span>
              </div>
              <p className={`mt-2 text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                <FiCalendar className="inline w-3 h-3 mr-1" />
                {fmt(lc.scheduledAt)}
              </p>
              {(isLive || !isPast) && lc.meetingLink && (
                <a href={lc.meetingLink} target="_blank" rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:text-blue-600">
                  <FiVideo className="w-3.5 h-3.5" /> Join class
                </a>
              )}
              {lc.recordingUrl && (
                <a href={lc.recordingUrl} target="_blank" rel="noopener noreferrer"
                  className="mt-2 ml-3 inline-flex items-center gap-1.5 text-xs font-semibold text-purple-500 hover:text-purple-600">
                  Watch recording
                </a>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const tabRenderers = {
    overview:    renderOverview,
    assignments: renderAssignments,
    quizzes:     renderQuizzes,
    exams:       renderExams,
    liveclasses: renderLiveClasses,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden ${
        dark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
      }`}>

        {/* Panel header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b flex-shrink-0 ${
          dark ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {child.firstName?.[0]}{child.lastName?.[0]}
            </div>
            <div>
              <p className={`font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
                {child.firstName} {child.lastName}
              </p>
              <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                {child.gradeLevel} · {child.userId}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className={`p-2 rounded-xl transition ${dark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
            <FiXCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className={`flex gap-1 px-4 pt-3 pb-0 flex-shrink-0 overflow-x-auto border-b ${
          dark ? 'border-slate-700' : 'border-slate-200'
        }`}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}>
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
              {t.id === 'assignments' && s && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  {s.assignmentsTotal}
                </span>
              )}
              {t.id === 'quizzes' && s && s.quizzesAttempted > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  {s.quizzesAttempted}
                </span>
              )}
              {t.id === 'exams' && s && s.examsAttempted > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  {s.examsAttempted}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab body */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className={`text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Loading progress…</p>
            </div>
          ) : (
            tabRenderers[tab]?.()
          )}
        </div>
      </div>
    </div>
  );
}

// ── Small empty state helper ──────────────────────────────────────────────────
function EmptyState({ icon: Icon, label }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400 dark:text-slate-600">
      <Icon className="w-10 h-10 opacity-40" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

// ── Child summary card (dashboard list) ───────────────────────────────────────
function ChildCard({ child, onViewProgress, onUnlink }) {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const [unlinking, setUnlinking] = useState(false);

  const handleUnlink = async () => {
    if (!window.confirm(`Unlink ${child.firstName} from your account? You can re-link them later.`)) return;
    setUnlinking(true);
    try {
      await onUnlink(child._id);
    } finally {
      setUnlinking(false);
    }
  };

  return (
    <div className={`rounded-2xl border shadow-sm ${
      dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
    }`}>
      <div className="p-5 flex items-start gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
          {child.firstName?.[0]}{child.lastName?.[0]}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className={`font-bold text-base ${dark ? 'text-white' : 'text-slate-900'}`}>
              {child.firstName} {child.lastName}
            </p>
            {child.isVerified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                <FiCheckCircle className="w-3 h-3" /> Verified
              </span>
            )}
            {child.gradeLevel && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                {child.gradeLevel}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3 mt-1">
            {child.userId && (
              <span className={`inline-flex items-center gap-1 text-xs font-mono font-semibold px-2 py-0.5 rounded-lg ${
                dark ? 'bg-slate-700 text-emerald-400' : 'bg-slate-100 text-emerald-700'
              }`}>
                <FiHash className="w-3 h-3" />{child.userId}
              </span>
            )}
            {child.email && (
              <span className={`text-xs truncate ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                {child.email}
              </span>
            )}
          </div>

          <p className={`text-xs mt-1 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
            {child.enrollmentCount ?? 0} subject{child.enrollmentCount !== 1 ? 's' : ''} enrolled
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className={`flex gap-2 px-5 pb-5`}>
        <button
          onClick={() => onViewProgress(child)}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition"
        >
          <FiBarChart2 className="w-4 h-4" /> View Progress
        </button>
        <button
          onClick={handleUnlink}
          disabled={unlinking}
          className={`px-3 py-2 rounded-xl text-sm font-semibold border transition ${
            dark
              ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
              : 'border-red-200 text-red-500 hover:bg-red-50'
          } disabled:opacity-50`}
          title="Unlink child"
        >
          {unlinking
            ? <FiLoader className="w-4 h-4 animate-spin" />
            : <FiUserX className="w-4 h-4" />
          }
        </button>
      </div>
    </div>
  );
}

// ── Link child form ───────────────────────────────────────────────────────────
function LinkChildForm({ onLinked }) {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const val = input.trim();
    if (!val) return;
    setLoading(true);
    try {
      const res = await linkChild(val.toUpperCase());
      toast.success(res.message);
      setInput('');
      onLinked();
    } catch (err) {
      toast.error(err.message || 'Failed to link child');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`rounded-2xl border p-5 ${
      dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
    }`}>
      <div className="flex items-center gap-2 mb-3">
        <FiLink className={`w-4 h-4 ${dark ? 'text-blue-400' : 'text-blue-600'}`} />
        <p className={`font-bold text-sm ${dark ? 'text-white' : 'text-slate-900'}`}>
          Link a Child
        </p>
      </div>
      <p className={`text-xs mb-3 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
        Enter your child's Student ID (e.g. <span className="font-mono font-bold">LIKST10001</span>).
        They can find it on their dashboard or profile.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="LIKST10001"
          className={`flex-1 px-3 py-2 rounded-xl border text-sm font-mono outline-none transition ${
            dark
              ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500'
              : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-500'
          }`}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 flex items-center gap-1.5"
        >
          {loading
            ? <FiLoader className="w-4 h-4 animate-spin" />
            : <FiPlusCircle className="w-4 h-4" />
          }
          Link
        </button>
      </form>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function ParentDashboard() {
  const { user }  = useAuth();
  const { theme } = useTheme();
  const dark      = theme === 'dark';

  const [children,   setChildren]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected,   setSelected]   = useState(null); // child being viewed in progress panel

  const loadChildren = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const res = await getMyChildren();
      setChildren(res.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load children');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadChildren(); }, [loadChildren]);

  const handleUnlink = async (studentId) => {
    try {
      await unlinkChild(studentId);
      toast.success('Child unlinked');
      setChildren(prev => prev.filter(c => c._id !== studentId));
    } catch (err) {
      toast.error(err.message || 'Failed to unlink child');
    }
  };

  const totalEnrollments = children.reduce((s, c) => s + (c.enrollmentCount || 0), 0);
  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  return (
    <div className={`min-h-screen ${dark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Progress panel overlay */}
      {selected && (
        <ChildProgressPanel child={selected} onClose={() => setSelected(null)} />
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className={`text-2xl font-extrabold ${dark ? 'text-white' : 'text-slate-900'}`}>
              Parent Dashboard
            </h1>
            <p className={`text-sm mt-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              Welcome back,{' '}
              <span className={`font-semibold ${dark ? 'text-white' : 'text-slate-800'}`}>
                {user?.firstName} {user?.lastName}
              </span>
            </p>
          </div>
          <button
            onClick={() => loadChildren(true)}
            disabled={refreshing}
            className={`p-2.5 rounded-xl border transition ${
              dark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300'
                   : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
            }`}
            title="Refresh"
          >
            <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Profile card */}
        <div className={`rounded-2xl border p-6 shadow-sm ${
          dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <div className="flex flex-col sm:flex-row gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg flex-shrink-0">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h2 className={`text-xl font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
                  {user?.firstName} {user?.lastName}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400">
                  Parent
                </span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <FiCheckCircle className="w-3 h-3" /> Verified
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {user?.userId && (
                  <div className="sm:col-span-2 flex items-center gap-1.5 text-xs font-bold font-mono px-2.5 py-1.5 rounded-lg w-fit bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <FiHash className="w-3.5 h-3.5 flex-shrink-0" /> {user.userId}
                  </div>
                )}
                {user?.email && (
                  <div className={`flex items-center gap-2 text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <FiMail className="w-4 h-4 flex-shrink-0" />
                    <a href={`mailto:${user.email}`} className="hover:text-purple-500 truncate">{user.email}</a>
                  </div>
                )}
                {user?.phone && (
                  <div className={`flex items-center gap-2 text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <FiPhone className="w-4 h-4 flex-shrink-0" />
                    <a href={`tel:${user.phone}`} className="hover:text-emerald-500">{user.phone}</a>
                  </div>
                )}
                {user?.country && (
                  <div className={`flex items-center gap-2 text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <FiMapPin className="w-4 h-4 flex-shrink-0" /> {user.country}
                  </div>
                )}
                <div className={`flex items-center gap-2 text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <FiCalendar className="w-4 h-4 flex-shrink-0" /> Joined {joinedDate}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={FiUsers}       label="My Children"       value={loading ? '…' : children.length}    color="purple"  />
          <StatCard icon={FiCheckCircle} label="Verified"          value={loading ? '…' : children.filter(c => c.isVerified).length} color="emerald" />
          <StatCard icon={FiBook}        label="Total Enrollments" value={loading ? '…' : totalEnrollments}   color="blue"    />
          <StatCard icon={FiLink}        label="Linked Accounts"   value={loading ? '…' : children.length}    color="amber"   />
        </div>

        {/* Link a child */}
        <LinkChildForm onLinked={() => loadChildren(true)} />

        {/* Children section */}
        <div>
          <h2 className={`text-base font-bold mb-4 ${dark ? 'text-white' : 'text-slate-900'}`}>
            My Children ({children.length})
          </h2>

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              <p className={`mt-4 text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Loading…</p>
            </div>
          ) : children.length === 0 ? (
            <div className={`rounded-2xl border p-12 text-center ${
              dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
            }`}>
              <FiUsers className={`w-12 h-12 mx-auto mb-4 ${dark ? 'text-slate-600' : 'text-slate-300'}`} />
              <p className={`font-semibold ${dark ? 'text-slate-300' : 'text-slate-700'}`}>No children linked yet</p>
              <p className={`text-sm mt-2 max-w-sm mx-auto ${dark ? 'text-slate-500' : 'text-slate-500'}`}>
                Use the form above to link your child by entering their Student ID code.
                Your child's ID is shown on their dashboard profile.
              </p>
              <p className={`text-xs mt-3 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                If your child registered with <strong>{user?.email}</strong> as their parent email,
                they are auto-linked when they register.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {children.map(child => (
                <ChildCard
                  key={child._id}
                  child={child}
                  onViewProgress={setSelected}
                  onUnlink={handleUnlink}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link to="/profile"
            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-md ${
              dark ? 'bg-slate-800 border-slate-700 hover:border-blue-500/40' : 'bg-white border-slate-200 hover:border-blue-300'
            }`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${dark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
              <FiUser className="w-5 h-5" />
            </div>
            <div>
              <p className={`font-semibold text-sm ${dark ? 'text-white' : 'text-slate-900'}`}>My Profile</p>
              <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>View and edit your account</p>
            </div>
          </Link>
          <button onClick={() => loadChildren(true)}
            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-md text-left ${
              dark ? 'bg-slate-800 border-slate-700 hover:border-purple-500/40' : 'bg-white border-slate-200 hover:border-purple-300'
            }`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${dark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
              <FiRefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <p className={`font-semibold text-sm ${dark ? 'text-white' : 'text-slate-900'}`}>Refresh Data</p>
              <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Reload children and enrollments</p>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
}
