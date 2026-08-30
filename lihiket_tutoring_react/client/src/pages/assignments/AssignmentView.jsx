import { useState, useEffect } from 'react';
import { FiX, FiCalendar, FiAward, FiBook, FiUpload, FiEdit2,
         FiExternalLink, FiCheckCircle, FiUsers, FiUser } from 'react-icons/fi';
import { getSubmissions, gradeSubmission } from '../../api/assignment.api';
import toast from 'react-hot-toast';

const SERVER = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

function fmt(dt) { return dt ? new Date(dt).toLocaleString() : 'â€”'; }

function GradePanel({ sub, totalMarks, onGraded, theme }) {
  const dark = theme === 'dark';
  const [marks,    setMarks]    = useState(sub.marks ?? '');
  const [feedback, setFeedback] = useState(sub.feedback || '');
  const [saving,   setSaving]   = useState(false);
  const inputCls = `w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${dark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-slate-50 border-gray-300 text-slate-900'}`;

  const handleGrade = async () => {
    setSaving(true);
    try {
      await gradeSubmission(sub.assignment, sub.student._id, { marks: Number(marks), feedback });
      toast.success('Graded!');
      onGraded();
    } catch (err) { toast.error(err.message || 'Failed to grade'); }
    finally { setSaving(false); }
  };

  return (
    <div className={`p-4 rounded-xl border space-y-3 ${dark ? 'border-slate-700 bg-slate-700/30' : 'border-slate-200 bg-slate-50'}`}>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={`block text-xs font-semibold mb-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Marks (/ {totalMarks})</label>
          <input type="number" value={marks} onChange={e => setMarks(e.target.value)} min="0" max={totalMarks} className={inputCls} />
        </div>
        <div>
          <label className={`block text-xs font-semibold mb-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Feedback</label>
          <input value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Optionalâ€¦" className={inputCls} />
        </div>
      </div>
      <button onClick={handleGrade} disabled={saving || marks === ''}
        className="w-full py-2 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50 flex items-center justify-center gap-2">
        {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiCheckCircle className="w-4 h-4" />}
        {saving ? 'Savingâ€¦' : 'Save Grade'}
      </button>
    </div>
  );
}

export default function AssignmentView({ assignment: a, canManage, onClose, onEdit, onSubmit, theme }) {
  const dark = theme === 'dark';
  const [subs, setSubs]   = useState([]);
  const [showSubs, setShowSubs] = useState(false);
  if (!a) return null;
  const sub = a.mySubmission;

  const loadSubs = async () => {
    try { const res = await getSubmissions(a._id); setSubs(res.data || []); }
    catch {}
  };

  useEffect(() => { if (canManage && showSubs) loadSubs(); }, [canManage, showSubs]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`flex flex-col w-full max-w-xl max-h-[92vh] rounded-2xl border shadow-2xl ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>

        <div className={`flex items-start justify-between px-6 py-4 border-b flex-shrink-0 ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div>
            <h2 className={`text-base font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>{a.title}</h2>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${a.status === 'published' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : a.status === 'closed' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>{a.status}</span>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg flex-shrink-0 ${dark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}><FiX className="w-5 h-5" /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: FiCalendar, label: 'Due',        value: a.dueDate ? new Date(a.dueDate).toLocaleString() : 'No deadline' },
              { icon: FiAward,    label: 'Total Marks', value: a.totalMarks },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className={`p-3 rounded-xl ${dark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                <div className={`flex items-center gap-1.5 text-xs mb-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}><Icon className="w-3 h-3" />{label}</div>
                <p className={`text-sm font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>{String(value)}</p>
              </div>
            ))}
          </div>

          {a.subject && <p className={`flex items-center gap-2 text-sm ${dark ? 'text-slate-300' : 'text-slate-700'}`}><FiBook className="w-4 h-4 text-blue-500" />{a.subject.name} Â· {a.subject.gradeLevel}</p>}
          {a.description && <p className={`text-sm ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{a.description}</p>}
          {a.instructions && (
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider mb-1.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Instructions</p>
              <p className={`text-sm leading-relaxed whitespace-pre-line ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{a.instructions}</p>
            </div>
          )}
          {a.attachmentUrl && (
            <a href={`${SERVER}${a.attachmentUrl}`} target="_blank" rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${dark ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-slate-100 text-gray-800 hover:bg-slate-200'}`}>
              <FiExternalLink className="w-4 h-4" /> {a.attachmentName || 'Download Attachment'}
            </a>
          )}

          {/* Student submission */}
          {sub && (
            <div className={`p-4 rounded-xl border ${sub.status === 'graded' ? 'border-emerald-400/40 bg-emerald-50 dark:bg-emerald-500/10' : 'border-blue-400/40 bg-blue-50 dark:bg-blue-500/10'}`}>
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>My Submission</p>
              {sub.text && <p className={`text-sm mb-2 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{sub.text}</p>}
              {sub.fileUrl && <a href={`${SERVER}${sub.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline block mb-2">{sub.fileName}</a>}
              <div className="flex justify-between items-center">
                <span className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{fmt(sub.submittedAt)}{sub.late ? ' Â· Late' : ''}</span>
                {sub.marks != null && <span className={`text-sm font-extrabold ${dark ? 'text-white' : 'text-slate-900'}`}>{sub.marks} / {a.totalMarks}</span>}
              </div>
              {sub.feedback && <p className={`text-xs mt-1 italic ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{sub.feedback}</p>}
            </div>
          )}

          {/* Submissions list for staff */}
          {canManage && (
            <div>
              <button onClick={() => setShowSubs(v => !v)}
                className={`flex items-center gap-2 text-sm font-semibold mb-3 ${dark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
                <FiUsers className="w-4 h-4" /> {showSubs ? 'Hide' : 'View'} Submissions ({subs.length})
              </button>
              {showSubs && subs.map(s => (
                <div key={s._id} className={`rounded-xl border p-4 mb-3 ${dark ? 'border-slate-700 bg-slate-700/30' : 'border-slate-200'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {s.student?.firstName?.[0]}{s.student?.lastName?.[0]}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>{s.student?.firstName} {s.student?.lastName}</p>
                      <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{fmt(s.submittedAt)}{s.late ? ' Â· Late' : ''}</p>
                    </div>
                    {s.marks != null && <span className={`ml-auto text-sm font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>{s.marks}/{a.totalMarks}</span>}
                  </div>
                  {s.text && <p className={`text-xs mb-2 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>{s.text}</p>}
                  {s.fileUrl && <a href={`${SERVER}${s.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline block mb-3">{s.fileName}</a>}
                  <GradePanel sub={{ ...s, assignment: a._id }} totalMarks={a.totalMarks} onGraded={loadSubs} theme={theme} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`px-6 py-4 border-t flex-shrink-0 flex gap-3 ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
          {!canManage && a.status === 'published' && !sub && (
            <button onClick={onSubmit} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white transition">
              <FiUpload className="w-4 h-4" /> Submit Assignment
            </button>
          )}
          {canManage && <button onClick={onEdit} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition ${dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}><FiEdit2 className="w-4 h-4" /> Edit</button>}
          <button onClick={onClose} className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition ${dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>Close</button>
        </div>
      </div>
    </div>
  );
}

