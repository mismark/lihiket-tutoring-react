import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../store/auth/AuthContext';
import { useTheme } from '../../store/theme/ThemeContext';
import { getAllSubjects } from '../../api/subject.api';
import { getMyEnrollments, enrollInSubject, unenrollFromSubject } from '../../api/enrollment.api';
import { initiatePayment } from '../../api/payment.api';
import toast from 'react-hot-toast';
import {
  FiBook, FiAward, FiClock, FiFileText, FiVideo,
  FiCheckCircle, FiAlertCircle, FiChevronRight,
  FiMail, FiPhone, FiCalendar, FiUser, FiLogOut,
  FiUsers, FiStar, FiTrendingUp, FiPlusCircle,
  FiMinusCircle, FiCopy, FiExternalLink, FiDollarSign,
  FiCreditCard,
} from 'react-icons/fi';

// ── stat card ──────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, theme }) {
  const dark = theme === 'dark';
  const p = {
    emerald: { ring: dark ? 'bg-emerald-500/10':'bg-emerald-50', ico:'text-emerald-500', val: dark?'text-emerald-400':'text-emerald-600' },
    blue:    { ring: dark ? 'bg-blue-500/10'   :'bg-blue-50',    ico:'text-blue-500',    val: dark?'text-blue-400'   :'text-blue-600'    },
    amber:   { ring: dark ? 'bg-amber-500/10'  :'bg-amber-50',   ico:'text-amber-500',   val: dark?'text-amber-400'  :'text-amber-600'   },
    purple:  { ring: dark ? 'bg-purple-500/10' :'bg-purple-50',  ico:'text-purple-500',  val: dark?'text-purple-400' :'text-purple-600'  },
    indigo:  { ring: dark ? 'bg-indigo-500/10' :'bg-indigo-50',  ico:'text-indigo-500',  val: dark?'text-indigo-400' :'text-indigo-600'  },
  }[color] || { ring:'bg-blue-50', ico:'text-blue-500', val:'text-blue-600' };

  return (
    <div className={`rounded-2xl border p-5 flex items-center gap-4 shadow-sm ${
      dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
    }`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${p.ring}`}>
        <Icon className={`w-6 h-6 ${p.ico}`} />
      </div>
      <div>
        <p className={`text-2xl font-extrabold leading-none ${p.val}`}>{value}</p>
        <p className={`text-xs font-medium mt-1 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>{label}</p>
        {sub && <p className={`text-xs mt-0.5 ${dark ? 'text-slate-500' : 'text-gray-400'}`}>{sub}</p>}
      </div>
    </div>
  );
}

// ── copy helper ────────────────────────────────────────────────────────────────
function useCopy() {
  const [copied, setCopied] = useState(null);
  const copy = async (text, key) => {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const el = document.createElement('textarea');
      el.value = text; el.style.position = 'fixed'; el.style.opacity = '0';
      document.body.appendChild(el); el.select();
      document.execCommand('copy'); document.body.removeChild(el);
    }
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };
  return { copied, copy };
}

// ── teacher contact row ────────────────────────────────────────────────────────
function TeacherContact({ teacher, theme }) {
  const dark = theme === 'dark';
  const { copied, copy } = useCopy();

  return (
    <div className={`rounded-xl border p-3 ${dark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
      {/* Name + avatar */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {teacher.firstName?.[0]}{teacher.lastName?.[0]}
        </div>
        <div>
          <p className={`text-sm font-semibold leading-tight ${dark ? 'text-white' : 'text-gray-900'}`}>
            {teacher.firstName} {teacher.lastName}
          </p>
          {teacher.specializedSubject && (
            <p className={`text-xs ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
              {teacher.specializedSubject}
            </p>
          )}
        </div>
      </div>

      {/* Contact buttons */}
      <div className="flex flex-wrap gap-1.5">
        {/* Email */}
        {teacher.email && (
          <>
            <a
              href={`mailto:${teacher.email}`}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30 transition"
              title={`Email ${teacher.email}`}
            >
              <FiMail className="w-3 h-3" /> Email
              <FiExternalLink className="w-2.5 h-2.5" />
            </a>
            <button
              onClick={() => copy(teacher.email, `email-${teacher._id}`)}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition ${
                copied === `email-${teacher._id}`
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-600 dark:text-slate-300 dark:hover:bg-slate-500'
              }`}
              title="Copy email"
            >
              <FiCopy className="w-3 h-3" />
              {copied === `email-${teacher._id}` ? 'Copied!' : 'Copy email'}
            </button>
          </>
        )}

        {/* Phone */}
        {teacher.phone && (
          <>
            <a
              href={`tel:${teacher.phone}`}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30 transition"
              title={`Call ${teacher.phone}`}
            >
              <FiPhone className="w-3 h-3" /> Call
            </a>
            <button
              onClick={() => copy(teacher.phone, `phone-${teacher._id}`)}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition ${
                copied === `phone-${teacher._id}`
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-600 dark:text-slate-300 dark:hover:bg-slate-500'
              }`}
              title="Copy phone"
            >
              <FiCopy className="w-3 h-3" />
              {copied === `phone-${teacher._id}` ? 'Copied!' : 'Copy no.'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── subject card with enroll + teacher contact ─────────────────────────────────
function SubjectCard({ subject, enrolled, enrolling, onEnroll, onUnenroll, theme }) {
  const dark   = theme === 'dark';
  const isFree = !subject.price || subject.price === 0;

  return (
    <div className={`rounded-2xl border flex flex-col transition-all hover:shadow-md ${
      enrolled
        ? dark ? 'bg-emerald-500/5 border-emerald-500/40' : 'bg-emerald-50 border-emerald-200'
        : dark  ? 'bg-slate-800 border-slate-700 hover:border-blue-500/40'
                : 'bg-white border-gray-200 hover:border-blue-300'
    }`}>
      <div className="p-5 flex-1">

        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="min-w-0">
            <h3 className={`font-bold text-base leading-tight truncate ${dark ? 'text-white' : 'text-gray-900'}`}>
              {subject.name}
            </h3>
            <p className={`text-xs font-mono mt-0.5 ${dark ? 'text-blue-400' : 'text-blue-600'}`}>
              {subject.code}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 ml-2 flex-shrink-0">
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              subject.isActive
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                : 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400'
            }`}>
              {subject.isActive ? 'Active' : 'Inactive'}
            </span>
            {/* Price badge */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
              isFree
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
            }`}>
              <FiDollarSign className="w-3 h-3" />
              {isFree ? 'Free' : `ETB ${Number(subject.price).toLocaleString()}`}
            </span>
            {enrolled && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                <FiCheckCircle className="w-3 h-3" /> Enrolled
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {subject.description && (
          <p className={`text-xs mb-3 line-clamp-2 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
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

        {/* Teachers with contact */}
        {subject.assignedTeachers?.length > 0 && (
          <div className={`pt-3 border-t mb-3 ${dark ? 'border-slate-700' : 'border-gray-100'}`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
              Teacher{subject.assignedTeachers.length > 1 ? 's' : ''}
            </p>
            <div className="space-y-2">
              {subject.assignedTeachers.map(t => (
                <TeacherContact key={t._id} teacher={t} theme={theme} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Enroll / Drop / Pay button ── */}
      <div className="px-5 pb-5">
        {enrolled ? (
          <button
            onClick={() => onUnenroll(subject._id, subject.name)}
            disabled={enrolling === subject._id}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10 transition disabled:opacity-50"
          >
            {enrolling === subject._id
              ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              : <FiMinusCircle className="w-4 h-4" />
            }
            {enrolling === subject._id ? 'Dropping…' : 'Drop Subject'}
          </button>
        ) : isFree ? (
          /* Free subject — enroll directly */
          <button
            onClick={() => onEnroll(subject._id, subject.name, false)}
            disabled={!subject.isActive || enrolling === subject._id}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {enrolling === subject._id
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <FiPlusCircle className="w-4 h-4" />
            }
            {enrolling === subject._id
              ? 'Enrolling…'
              : subject.isActive ? 'Enroll Free' : 'Not Available'
            }
          </button>
        ) : (
          /* Paid subject — go to Chapa checkout */
          <button
            onClick={() => onEnroll(subject._id, subject.name, true)}
            disabled={!subject.isActive || enrolling === subject._id}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {enrolling === subject._id
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <FiCreditCard className="w-4 h-4" />
            }
            {enrolling === subject._id
              ? 'Redirecting…'
              : subject.isActive
                ? `Pay & Enroll · ETB ${Number(subject.price).toLocaleString()}`
                : 'Not Available'
            }
          </button>
        )}
      </div>
    </div>
  );
}

// ── quick action ───────────────────────────────────────────────────────────────
function QuickAction({ icon: Icon, title, description, to, color, theme }) {
  const dark = theme === 'dark';
  const pal = {
    blue:    dark ? 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20'          : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
    emerald: dark ? 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100',
    purple:  dark ? 'bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20'    : 'bg-purple-50 text-purple-600 group-hover:bg-purple-100',
    amber:   dark ? 'bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20'       : 'bg-amber-50 text-amber-600 group-hover:bg-amber-100',
    indigo:  dark ? 'bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20'    : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100',
  };
  return (
    <Link to={to} className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-md ${
      dark ? 'bg-slate-800 border-slate-700 hover:border-blue-500/40' : 'bg-white border-gray-200 hover:border-blue-300'
    }`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${pal[color] || pal.blue}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm ${dark ? 'text-white' : 'text-gray-900'}`}>{title}</p>
        <p className={`text-xs mt-0.5 truncate ${dark ? 'text-slate-400' : 'text-gray-500'}`}>{description}</p>
      </div>
      <FiChevronRight className={`w-4 h-4 flex-shrink-0 ${dark ? 'text-slate-500' : 'text-gray-400'}`} />
    </Link>
  );
}

// ── main ───────────────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const { theme }        = useTheme();
  const dark             = theme === 'dark';

  const [subjects,     setSubjects]     = useState([]);
  const [enrolledIds,  setEnrolledIds]  = useState(new Set());
  const [loading,      setLoading]      = useState(true);
  const [enrolling,    setEnrolling]    = useState(null); // subjectId being mutated

  // Fetch subjects + enrollments in parallel
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [subRes, enrRes] = await Promise.all([
        getAllSubjects(),
        getMyEnrollments(),
      ]);

      const all = subRes.data || [];
      // Show ALL active subjects — students can enroll in any subject they want
      const availableSubjects = all.filter(s => s.isActive);
      setSubjects(availableSubjects);

      const ids = new Set((enrRes.data || []).map(e =>
        e.subject?._id?.toString() ?? e.subject?.toString()
      ));
      setEnrolledIds(ids);
    } catch {
      // silent — individual toasts will handle mutations
    } finally {
      setLoading(false);
    }
  }, [user?.gradeLevel]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleEnroll = async (subjectId, name, isPaid) => {
    setEnrolling(subjectId);
    try {
      if (isPaid) {
        // Paid subject → initiate Chapa payment, redirect to checkout
        const res = await initiatePayment(subjectId);
        toast.success('Redirecting to payment…');
        // Small delay so the toast is visible, then redirect
        setTimeout(() => { window.location.href = res.checkoutUrl; }, 800);
      } else {
        // Free subject → enroll directly
        await enrollInSubject(subjectId);
        toast.success(`Enrolled in ${name}`);
        setEnrolledIds(prev => new Set([...prev, subjectId]));
        setEnrolling(null);
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
    } catch (err) {
      toast.error(err.message || 'Failed to drop subject');
    } finally {
      setEnrolling(null);
    }
  };

  const enrolledCount = [...enrolledIds].filter(id =>
    subjects.some(s => s._id === id || s._id?.toString() === id)
  ).length;

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })
    : '—';

  return (
    <div className={`min-h-screen p-4 md:p-8 lg:p-10 ${dark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className={`text-2xl font-extrabold ${dark ? 'text-white' : 'text-gray-900'}`}>🎓 Student Dashboard</h1>
            <p className={`text-sm mt-1 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
              Welcome back,{' '}
              <span className={`font-semibold ${dark ? 'text-white' : 'text-gray-800'}`}>{user?.firstName} {user?.lastName}</span>
            </p>
          </div>
          <button
            onClick={logout}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border transition ${
              dark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <FiLogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        {/* ── Profile card ── */}
        <div className={`rounded-2xl border p-6 shadow-sm ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg flex-shrink-0">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h2 className={`text-xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{user?.firstName} {user?.lastName}</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">Student</span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <FiCheckCircle className="w-3 h-3" /> Verified
                </span>
                {user?.gradeLevel && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                    {user.gradeLevel}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {user?.email && (
                  <div className={`flex items-center gap-2 text-sm ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                    <FiMail className="w-4 h-4 flex-shrink-0" />
                    <a href={`mailto:${user.email}`} className="hover:text-emerald-500 truncate">{user.email}</a>
                  </div>
                )}
                {user?.phone && (
                  <div className={`flex items-center gap-2 text-sm ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                    <FiPhone className="w-4 h-4 flex-shrink-0" />
                    <a href={`tel:${user.phone}`} className="hover:text-emerald-500">{user.phone}</a>
                  </div>
                )}
                {user?.parentFullName && (
                  <div className={`flex items-center gap-2 text-sm ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                    <FiUsers className="w-4 h-4 flex-shrink-0" />
                    <span>Parent: <span className={`font-medium ${dark ? 'text-slate-300' : 'text-gray-700'}`}>{user.parentFullName}</span></span>
                  </div>
                )}
                <div className={`flex items-center gap-2 text-sm ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                  <FiCalendar className="w-4 h-4 flex-shrink-0" />
                  <span>Joined {joinedDate}</span>
                </div>
              </div>
              {user?.bio && (
                <p className={`mt-3 text-sm leading-relaxed ${dark ? 'text-slate-400' : 'text-gray-600'}`}>{user.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={FiBook}       label="Available Subjects" value={loading ? '…' : subjects.length}  sub={user?.gradeLevel || ''} color="emerald" theme={theme} />
          <StatCard icon={FiCheckCircle} label="Enrolled"          value={loading ? '…' : enrolledCount}                                color="blue"    theme={theme} />
          <StatCard icon={FiFileText}   label="Assignments"        value="—"                                                            color="purple"  theme={theme} />
          <StatCard icon={FiTrendingUp} label="Progress"           value="—"                                                            color="indigo"  theme={theme} />
        </div>

        {/* ── Main layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Quick Actions */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className={`text-base font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h2>
            <QuickAction icon={FiBook}     title="Browse Subjects"   description="Enroll in subjects for your grade"  to="/subjects"         color="emerald" theme={theme} />
            <QuickAction icon={FiVideo}    title="Live Classes"      description="Join an ongoing live class"          to="/dashboard"        color="blue"    theme={theme} />
            <QuickAction icon={FiFileText} title="Assignments"       description="View and submit assignments"         to="/dashboard"        color="purple"  theme={theme} />
            <QuickAction icon={FiClock}    title="Exams"             description="Upcoming timed exams"                to="/dashboard"        color="amber"   theme={theme} />
            <QuickAction icon={FiAward}    title="Certificates"      description="View your earned certificates"       to="/dashboard"        color="indigo"  theme={theme} />
            <QuickAction icon={FiCreditCard} title="Payment History" description="View your payment receipts"          to="/payment/history"  color="blue"    theme={theme} />
          </div>

          {/* Upcoming + Activity */}
          <div className="lg:col-span-2 space-y-5">
            <div className={`rounded-2xl border shadow-sm p-5 ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
              <h2 className={`text-base font-bold mb-3 ${dark ? 'text-white' : 'text-gray-900'}`}>📅 Upcoming</h2>
              <div className={`text-center py-4 ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
                <FiClock className="w-7 h-7 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No upcoming classes yet</p>
              </div>
            </div>
            <div className={`rounded-2xl border shadow-sm p-5 ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
              <h2 className={`text-base font-bold mb-3 ${dark ? 'text-white' : 'text-gray-900'}`}>⚡ Recent Activity</h2>
              <div className={`text-center py-4 ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
                <FiStar className="w-7 h-7 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No recent activity yet</p>
                <p className="text-xs mt-1">Enroll in a subject to get started</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Subjects grid ── */}
        <div id="subjects">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h2 className={`text-base font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
                📚 Subjects for {user?.gradeLevel || 'Your Grade'}
              </h2>
              <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                Free subjects enroll instantly · Paid subjects go through Chapa checkout
              </p>
            </div>
            {enrolledCount > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                {enrolledCount} enrolled
              </span>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-7 h-7 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <p className={`text-sm mt-3 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>Loading subjects…</p>
            </div>
          ) : subjects.length === 0 ? (
            <div className={`rounded-2xl border p-10 text-center ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
              <FiAlertCircle className={`w-10 h-10 mx-auto mb-3 ${dark ? 'text-slate-600' : 'text-gray-300'}`} />
              <p className={`font-semibold ${dark ? 'text-slate-300' : 'text-gray-700'}`}>
                No subjects available for {user?.gradeLevel || 'your grade'} yet
              </p>
              <p className={`text-sm mt-1 ${dark ? 'text-slate-500' : 'text-gray-500'}`}>
                Subjects will appear here once your admin adds them
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map(s => (
                <SubjectCard
                  key={s._id}
                  subject={s}
                  enrolled={enrolledIds.has(s._id) || enrolledIds.has(s._id?.toString())}
                  enrolling={enrolling}
                  onEnroll={handleEnroll}
                  onUnenroll={handleUnenroll}
                  theme={theme}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
