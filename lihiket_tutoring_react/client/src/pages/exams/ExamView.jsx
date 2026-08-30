import { useState } from 'react';
import {
  FiX, FiClock, FiAward, FiBook, FiPlay,
  FiEdit2, FiBarChart2, FiCheckCircle,
  FiCalendar, FiUser, FiHash,
} from 'react-icons/fi';
import ExamResults  from './ExamResults';
import ExamMyResult from './ExamMyResult';

const STATUS_STYLE = {
  draft:     'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
  published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  closed:    'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
};

function fmtDT(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

export default function ExamView({ exam, canManage, onClose, onEdit, onTake, theme }) {
  const dark = theme === 'dark';
  const r    = exam?.myResult;

  const [showResults,  setShowResults]  = useState(false);
  const [showMyResult, setShowMyResult] = useState(false);

  if (!exam) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className={`flex flex-col w-full max-w-lg max-h-[92vh] rounded-2xl border shadow-2xl ${
          dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          {/* Header */}
          <div className={`flex items-start justify-between px-6 py-4 border-b flex-shrink-0 ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">{exam.title}</h2>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLE[exam.status]}`}>
                {exam.status}
              </span>
            </div>
            <button onClick={onClose}
              className={`p-2 rounded-xl flex-shrink-0 transition ${dark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: FiClock,  label: 'Duration',    value: `${exam.duration} min` },
                { icon: FiAward,  label: 'Total Marks', value: exam.totalMarks },
                { icon: FiAward,  label: `Pass (${exam.passMarkPercent ?? 50}%)`, value: `${exam.passMark} marks` },
                { icon: FiHash,   label: 'Questions',   value: exam.questionCount || exam.questions?.length || 0 },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className={`p-3 rounded-xl ${dark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                  <div className={`flex items-center gap-1.5 text-xs mb-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <Icon className="w-3 h-3" /> {label}
                  </div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
                </div>
              ))}
            </div>

            {/* Schedule */}
            {(exam.startTime || exam.endTime) && (
              <div className={`rounded-xl p-3 flex items-start gap-2 ${dark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
                <FiCalendar className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 dark:text-slate-300">
                  {exam.startTime && <p><span className="font-semibold">Start:</span> {fmtDT(exam.startTime)}</p>}
                  {exam.endTime   && <p><span className="font-semibold">End:</span>   {fmtDT(exam.endTime)}</p>}
                </div>
              </div>
            )}

            {/* Feature badges */}
            <div className="flex flex-wrap gap-2">
              {exam.allowReview && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400">
                  <FiCheckCircle className="w-3 h-3" /> Review allowed after submit
                </span>
              )}
            </div>

            {/* Subject */}
            {exam.subject && (
              <div className={`flex items-center gap-2 text-sm ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
                <FiBook className="w-4 h-4 text-amber-500" />
                {exam.subject.name} · {exam.subject.gradeLevel}
              </div>
            )}

            {/* Description + Instructions */}
            {exam.description && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-slate-500">Description</p>
                <p className={`text-sm leading-relaxed ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{exam.description}</p>
              </div>
            )}
            {exam.instructions && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-slate-500">Instructions</p>
                <p className={`text-sm leading-relaxed ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{exam.instructions}</p>
              </div>
            )}

            {/* Created by */}
            {exam.createdBy && (
              <div className={`flex items-center gap-2 text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                <FiUser className="w-3.5 h-3.5" />
                Created by {exam.createdBy.firstName} {exam.createdBy.lastName}
              </div>
            )}

            {/* Student: my result */}
            {!canManage && r && (
              <button onClick={() => setShowMyResult(true)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition ${
                  r.passed
                    ? dark ? 'border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10' : 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                    : dark ? 'border-red-500/30 bg-red-500/5 hover:bg-red-500/10'             : 'border-red-200 bg-red-50 hover:bg-red-100'
                }`}>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1 text-slate-400 dark:text-slate-500">My Result</p>
                  <span className={`text-sm font-bold ${r.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {r.passed ? 'Passed' : 'Failed'}
                  </span>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-extrabold text-slate-900 dark:text-white">{r.score} / {r.totalMarks}</p>
                  <p className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Tap to review</p>
                </div>
              </button>
            )}
          </div>

          {/* Footer */}
          <div className={`px-6 py-4 border-t flex-shrink-0 flex flex-wrap gap-2 ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
            {!canManage && exam.status === 'published' && !r && (
              <button onClick={onTake}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-600 text-white transition shadow-sm">
                <FiPlay className="w-4 h-4" /> Take Exam
              </button>
            )}
            {!canManage && r && (
              <button onClick={() => setShowMyResult(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition ${dark ? 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}>
                <FiAward className="w-4 h-4" /> My Result
              </button>
            )}
            {canManage && (
              <>
                <button onClick={onEdit}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition ${dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                  <FiEdit2 className="w-4 h-4" /> Edit
                </button>
                <button onClick={() => setShowResults(true)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition ${dark ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}>
                  <FiBarChart2 className="w-4 h-4" /> All Results
                </button>
              </>
            )}
            <button onClick={onClose}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition ${dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              Close
            </button>
          </div>
        </div>
      </div>

      {showResults  && <ExamResults  exam={exam} theme={theme} onClose={() => setShowResults(false)}  />}
      {showMyResult && <ExamMyResult exam={exam} theme={theme} onClose={() => setShowMyResult(false)} />}
    </>
  );
}
