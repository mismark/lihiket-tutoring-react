import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../store/theme/ThemeContext';
import { getAllSubjects } from '../../api/subject.api';
import { getMyEnrollments, enrollInSubject, unenrollFromSubject } from '../../api/enrollment.api';
import { initiatePayment } from '../../api/payment.api';
import toast from 'react-hot-toast';
import {
  FiArrowLeft, FiSearch, FiX, FiBook, FiCheckCircle,
  FiPlusCircle, FiMinusCircle, FiCreditCard, FiDollarSign,
  FiUsers, FiFilter, FiEye, FiMail, FiPhone, FiCopy,
  FiCode, FiCalendar, FiTag, FiExternalLink, FiBookOpen,
} from 'react-icons/fi';

const GRADE_LEVELS = ['KG1','KG2','G1','G2','G3','G4','G5','G6','G7','G8','G9','G10','G11','G12','HL'];
const CATEGORIES   = ['STEM','Languages','Arts','Social Studies','Physical Education','Other'];

// â”€â”€ copy hook â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function useCopy() {
  const [copied, setCopied] = useState(null);
  const copy = async (text, key) => {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const el = document.createElement('textarea');
      el.value = text; el.style.position = 'fixed'; el.style.opacity = '0';
      document.body.appendChild(el); el.select(); document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };
  return { copied, copy };
}

// â”€â”€ enroll / pay button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function EnrollButton({ subject, enrolled, enrolling, onEnroll, onUnenroll }) {
  const isFree = !subject.price || subject.price === 0;
  if (enrolled) return (
    <button
      onClick={() => onUnenroll(subject._id, subject.name)}
      disabled={enrolling === subject._id}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border-2 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10 transition disabled:opacity-50"
    >
      {enrolling === subject._id
        ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        : <FiMinusCircle className="w-4 h-4" />}
      {enrolling === subject._id ? 'Droppingâ€¦' : 'Drop Subject'}
    </button>
  );
  if (isFree) return (
    <button
      onClick={() => onEnroll(subject._id, subject.name, false)}
      disabled={enrolling === subject._id}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50 shadow-sm shadow-emerald-600/30"
    >
      {enrolling === subject._id
        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        : <FiPlusCircle className="w-4 h-4" />}
      {enrolling === subject._id ? 'Enrollingâ€¦' : 'Enroll for Free'}
    </button>
  );
  return (
    <button
      onClick={() => onEnroll(subject._id, subject.name, true)}
      disabled={enrolling === subject._id}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white transition disabled:opacity-50 shadow-sm shadow-amber-500/30"
    >
      {enrolling === subject._id
        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        : <FiCreditCard className="w-4 h-4" />}
      {enrolling === subject._id
        ? 'Redirecting to Chapaâ€¦'
        : `Pay ETB ${Number(subject.price).toLocaleString()} & Enroll`}
    </button>
  );
}

// â”€â”€ subject detail modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SubjectDetailModal({ subject, enrolled, enrolling, onEnroll, onUnenroll, onClose, theme }) {
  const dark   = theme === 'dark';
  const isFree = !subject.price || subject.price === 0;
  const { copied, copy } = useCopy();

  if (!subject) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`flex flex-col w-full max-w-lg max-h-[92vh] rounded-2xl border shadow-2xl ${
        dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>

        {/* â”€â”€ Header â”€â”€ */}
        <div className={`flex items-center justify-between px-6 py-4 border-b flex-shrink-0 ${
          dark ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-lg font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>Subject Details</h2>
          <button onClick={onClose} className={`p-2 rounded-lg transition ${dark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* â”€â”€ Scrollable body â”€â”€ */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Title row */}
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
              dark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
            }`}>
              <FiBook className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{subject.name}</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${dark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>
                  <FiCode className="w-3 h-3" /> {subject.code}
                </span>
                {subject.gradeLevel && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                    {subject.gradeLevel}
                  </span>
                )}
                {subject.category && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400">
                    <FiTag className="w-3 h-3" /> {subject.category}
                  </span>
                )}
                {enrolled && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <FiCheckCircle className="w-3 h-3" /> Enrolled
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Price */}
          <div className={`flex items-center justify-between p-4 rounded-xl border ${
            isFree
              ? dark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'
              : dark ? 'bg-amber-500/10 border-amber-500/20'    : 'bg-amber-50 border-amber-200'
          }`}>
            <div className="flex items-center gap-2">
              <FiDollarSign className={`w-5 h-5 ${isFree ? 'text-emerald-500' : 'text-amber-500'}`} />
              <span className={`text-sm font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>
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
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                About this subject
              </p>
              <p className={`text-sm leading-relaxed ${dark ? 'text-slate-300' : 'text-gray-700'}`}>
                {subject.description}
              </p>
            </div>
          )}

          {/* Teachers */}
          {subject.assignedTeachers?.length > 0 && (
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                Your Teacher{subject.assignedTeachers.length > 1 ? 's' : ''}
              </p>
              <div className="space-y-3">
                {subject.assignedTeachers.map(t => (
                  <div key={t._id} className={`rounded-xl border p-4 ${dark ? 'bg-slate-700/40 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {t.firstName?.[0]}{t.lastName?.[0]}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
                          {t.firstName} {t.lastName}
                        </p>
                        {t.specializedSubject && (
                          <p className={`text-xs ${dark ? 'text-slate-400' : 'text-gray-500'}`}>{t.specializedSubject}</p>
                        )}
                      </div>
                    </div>
                    {/* Contact buttons */}
                    <div className="flex flex-wrap gap-2">
                      {t.email && (
                        <>
                          <a href={`mailto:${t.email}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30 transition">
                            <FiMail className="w-3 h-3" /> Email <FiExternalLink className="w-2.5 h-2.5" />
                          </a>
                          <button onClick={() => copy(t.email, `email-${t._id}`)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                              copied === `email-${t._id}` ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-600 dark:text-slate-300 dark:hover:bg-slate-500'
                            }`}>
                            <FiCopy className="w-3 h-3" /> {copied === `email-${t._id}` ? 'Copied!' : 'Copy email'}
                          </button>
                        </>
                      )}
                      {t.phone && (
                        <>
                          <a href={`tel:${t.phone}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30 transition">
                            <FiPhone className="w-3 h-3" /> Call
                          </a>
                          <button onClick={() => copy(t.phone, `phone-${t._id}`)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                              copied === `phone-${t._id}` ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-600 dark:text-slate-300 dark:hover:bg-slate-500'
                            }`}>
                            <FiCopy className="w-3 h-3" /> {copied === `phone-${t._id}` ? 'Copied!' : 'Copy no.'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* What you get after enrolling */}
          <div className={`rounded-xl border p-4 ${dark ? 'bg-slate-700/30 border-slate-600' : 'bg-blue-50 border-blue-200'}`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${dark ? 'text-blue-400' : 'text-blue-600'}`}>
              What you get
            </p>
            <ul className={`text-xs space-y-1.5 ${dark ? 'text-slate-300' : 'text-gray-700'}`}>
              <li className="flex items-center gap-2"><FiCheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" /> Access to all course materials</li>
              <li className="flex items-center gap-2"><FiCheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" /> Live class participation</li>
              <li className="flex items-center gap-2"><FiCheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" /> Assignments and exams</li>
              <li className="flex items-center gap-2"><FiCheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" /> Certificate on completion</li>
              <li className="flex items-center gap-2"><FiCheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" /> Direct teacher contact</li>
            </ul>
          </div>

          {/* Meta */}
          <div className={`flex items-center gap-1.5 text-xs ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
            <FiCalendar className="w-3.5 h-3.5" />
            Added on {new Date(subject.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* â”€â”€ Sticky footer with action â”€â”€ */}
        <div className={`px-6 py-4 border-t flex-shrink-0 space-y-2 ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
          {enrolled && (
            <Link
              to={`/subjects/${subject.slug || subject._id}/classroom`}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
            >
              <FiBookOpen className="w-4 h-4" /> Enter Subject Classroom
            </Link>
          )}
          <EnrollButton
            subject={subject}
            enrolled={enrolled}
            enrolling={enrolling}
            onEnroll={onEnroll}
            onUnenroll={onUnenroll}
          />
          <button onClick={onClose} className={`w-full py-2 rounded-xl text-sm font-semibold transition ${
            dark ? 'text-slate-400 hover:bg-slate-700' : 'text-gray-500 hover:bg-gray-100'
          }`}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// â”€â”€ subject card (grid) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SubjectCard({ subject, enrolled, enrolling, onEnroll, onUnenroll, onViewDetails, theme }) {
  const dark   = theme === 'dark';
  const isFree = !subject.price || subject.price === 0;

  return (
    <div className={`flex flex-col rounded-2xl border shadow-sm transition-all hover:shadow-md ${
      enrolled
        ? dark ? 'bg-emerald-500/5 border-emerald-500/40' : 'bg-emerald-50 border-emerald-200'
        : dark  ? 'bg-slate-800 border-slate-700 hover:border-blue-500/40'
                : 'bg-white border-gray-200 hover:border-blue-300'
    }`}>
      <div className="p-5 flex-1">

        {/* Header */}
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
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
              isFree ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                     : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
            }`}>
              <FiDollarSign className="w-3 h-3" />
              {isFree ? 'Free' : `ETB ${Number(subject.price).toLocaleString()}`}
            </span>
            {enrolled && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
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

        {/* Teachers */}
        {subject.assignedTeachers?.length > 0 && (
          <div className={`flex items-center gap-2 text-xs ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
            <FiUsers className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">
              {subject.assignedTeachers.map(t => `${t.firstName} ${t.lastName}`).join(', ')}
            </span>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="px-5 pb-5 space-y-2">
        {/* View Details */}
        <button
          onClick={() => onViewDetails(subject)}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition ${
            dark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-200 text-gray-700 hover:bg-gray-100'
          }`}
        >
          <FiEye className="w-4 h-4" /> View Details
        </button>

        {/* Enter Classroom â€” enrolled only */}
        {enrolled && (
          <Link
            to={`/subjects/${subject.slug || subject._id}/classroom`}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
          >
            <FiBookOpen className="w-4 h-4" /> Enter Subject
          </Link>
        )}

        {/* Enroll / Pay / Drop */}
        <EnrollButton
          subject={subject}
          enrolled={enrolled}
          enrolling={enrolling}
          onEnroll={onEnroll}
          onUnenroll={onUnenroll}
        />
      </div>
    </div>
  );
}

// â”€â”€ main page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function StudentSubjects() {
  const { theme } = useTheme();
  const dark      = theme === 'dark';

  const [subjects,      setSubjects]      = useState([]);
  const [enrolledIds,   setEnrolledIds]   = useState(new Set());
  const [loading,       setLoading]       = useState(true);
  const [enrolling,     setEnrolling]     = useState(null);
  const [detailSubject, setDetailSubject] = useState(null); // modal

  // filters
  const [search,      setSearch]      = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [catFilter,   setCatFilter]   = useState('');
  const [showFilter,  setShowFilter]  = useState(false);
  const [activeTab,   setActiveTab]   = useState('all'); // 'all' | 'enrolled'

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
        toast.success('Redirecting to Chapa paymentâ€¦');
        setTimeout(() => { window.location.href = res.checkoutUrl; }, 600);
      } else {
        await enrollInSubject(subjectId);
        toast.success(`âœ… Enrolled in ${name}`);
        setEnrolledIds(prev => new Set([...prev, subjectId]));
        setEnrolling(null);
        setDetailSubject(null); // close modal after free enroll
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

  const isEnrolled = (s) => enrolledIds.has(s._id) || enrolledIds.has(s._id?.toString());

  const hasFilter = search || gradeFilter || catFilter;
  const clearFilters = () => { setSearch(''); setGradeFilter(''); setCatFilter(''); };

  const filtered = subjects
    .filter(s => activeTab === 'enrolled' ? isEnrolled(s) : true)
    .filter(s => {
      const q = search.trim().toLowerCase();
      return (!q || s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) ||
              s.assignedTeachers?.some(t => `${t.firstName} ${t.lastName}`.toLowerCase().includes(q)))
          && (!gradeFilter || s.gradeLevel === gradeFilter)
          && (!catFilter   || s.category   === catFilter);
    });

  const enrolledCount = subjects.filter(isEnrolled).length;

  const inputCls = `px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    dark ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-gray-300 text-gray-900'
  }`;

  return (
    <div className={`min-h-screen p-4 md:p-8 ${dark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto space-y-5">

        {/* â”€â”€ Header â”€â”€ */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link to="/dashboard" className={`p-2 rounded-xl border transition flex-shrink-0 ${
            dark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700' : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-200'
          }`}>
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className={`text-2xl font-extrabold ${dark ? 'text-white' : 'text-gray-900'}`}>ðŸ“š Browse Subjects</h1>
            <p className={`text-sm mt-0.5 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
              {loading ? 'â€¦' : `${subjects.length} available Â· ${enrolledCount} enrolled`}
            </p>
          </div>
          <button
            onClick={() => setShowFilter(v => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition ${
              showFilter || hasFilter
                ? 'bg-blue-600 text-white border-blue-600'
                : dark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <FiFilter className="w-4 h-4" />
            Filters{hasFilter ? ` (${[search,gradeFilter,catFilter].filter(Boolean).length})` : ''}
          </button>
        </div>

        {/* â”€â”€ Tabs â”€â”€ */}
        <div className={`flex gap-1 p-1 rounded-2xl ${dark ? 'bg-slate-800' : 'bg-gray-100'}`}>
          {[['all','All Subjects'], ['enrolled','My Enrolled']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${
                activeTab === key
                  ? dark ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm'
                  : dark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}{key === 'enrolled' && enrolledCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                  {enrolledCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* â”€â”€ Search + filters â”€â”€ */}
        <div className={`rounded-2xl border shadow-sm p-4 space-y-3 ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <div className="relative">
            <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dark ? 'text-slate-400' : 'text-gray-400'}`} />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, code or teacherâ€¦"
              className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                dark ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-300 text-gray-900'
              }`}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>

          {showFilter && (
            <div className="flex flex-wrap gap-3 pt-1">
              <select value={gradeFilter} onChange={e => setGradeFilter(e.target.value)} className={`${inputCls} flex-1 min-w-[140px]`}>
                <option value="">All Grades</option>
                {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className={`${inputCls} flex-1 min-w-[160px]`}>
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {hasFilter && (
                <button onClick={clearFilters} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-semibold transition ${
                  dark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                }`}>
                  <FiX className="w-4 h-4" /> Clear
                </button>
              )}
            </div>
          )}

          {hasFilter && !loading && (
            <p className={`text-xs ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
              {filtered.length} of {subjects.length} subjects match
            </p>
          )}
        </div>

        {/* â”€â”€ Grid â”€â”€ */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className={`mt-4 text-sm ${dark ? 'text-slate-400' : 'text-gray-500'}`}>Loading subjectsâ€¦</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={`rounded-2xl border p-12 text-center ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <FiBook className={`w-12 h-12 mx-auto mb-4 ${dark ? 'text-slate-600' : 'text-gray-300'}`} />
            <p className={`font-semibold ${dark ? 'text-slate-300' : 'text-gray-700'}`}>
              {activeTab === 'enrolled' ? 'You are not enrolled in any subjects yet' : hasFilter ? 'No subjects match your filters' : 'No subjects available yet'}
            </p>
            {activeTab === 'enrolled' ? (
              <button onClick={() => setActiveTab('all')} className="mt-4 text-sm font-semibold text-blue-500 hover:text-blue-600 transition">
                Browse all subjects
              </button>
            ) : hasFilter && (
              <button onClick={clearFilters} className="mt-4 text-sm font-semibold text-blue-500 hover:text-blue-600 transition">
                Clear filters
              </button>
            )}
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
                theme={theme}
              />
            ))}
          </div>
        )}
      </div>

      {/* â”€â”€ Detail modal â”€â”€ */}
      {detailSubject && (
        <SubjectDetailModal
          subject={detailSubject}
          enrolled={isEnrolled(detailSubject)}
          enrolling={enrolling}
          onEnroll={handleEnroll}
          onUnenroll={handleUnenroll}
          onClose={() => setDetailSubject(null)}
          theme={theme}
        />
      )}
    </div>
  );
}

