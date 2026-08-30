import { useState } from 'react';
import {
  FiX, FiClock, FiAward, FiBook, FiPlay, FiEdit2,
  FiRefreshCw, FiCheckCircle, FiUser, FiBarChart2,
} from 'react-icons/fi';
import QuizResults  from './QuizResults';
import QuizMyResult from './QuizMyResult';

const STATUS_STYLE = {
  draft:     'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
  published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  closed:    'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
};

export default function QuizView({ quiz, canManage, onClose, onEdit, onTake, theme }) {
  const dark = theme === 'dark';
  const r    = quiz?.myResult;

  const [showResults,  setShowResults]  = useState(false);
  const [showMyResult, setShowMyResult] = useState(false);

  if (!quiz) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className={`flex flex-col w-full max-w-lg max-h-[92vh] rounded-2xl border shadow-2xl ${
          dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        }`}>

          {/* Header */}
          <div className={`flex items-start justify-between px-6 py-4 border-b flex-shrink-0 ${
            dark ? 'border-slate-700' : 'border-slate-200'
          }`}>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">{quiz.title}</h2>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLE[quiz.status]}`}>
                {quiz.status}
              </span>
            </div>
            <button onClick={onClose}
              className={`p-2 rounded-xl flex-shrink-0 transition ${
                dark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
              }`}>
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: FiClock, label: 'Duration',       value: `${quiz.duration} min` },
                { icon: FiAward, label: 'Total Marks',    value: quiz.totalMarks        },
                { icon: FiAward, label: `Pass (${quiz.passMarkPercent}%)`, value: `${quiz.passMark} marks` },
                { icon: FiBook,  label: 'Questions',      value: quiz.questionCount || quiz.questions?.length || 0 },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className={`p-3 rounded-xl ${dark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                  <div className={`flex items-center gap-1.5 text-xs mb-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <Icon className="w-3 h-3" /> {label}
                  </div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
                </div>
              ))}
            </div>

            {/* Feature badges */}
            <div className="flex flex-wrap gap-2">
              {quiz.allowRetake && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                  <FiRefreshCw className="w-3 h-3" /> Retakes allowed
                </span>
              )}
              {quiz.showAnswers && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400">
                  <FiCheckCircle className="w-3 h-3" /> Answers shown after submit
                </span>
              )}
            </div>

            {/* Subject */}
            {quiz.subject && (
              <div className={`flex items-center gap-2 text-sm ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
                <FiBook className="w-4 h-4 text-blue-500" />
                {quiz.subject.name} · {quiz.subject.gradeLevel}
              </div>
            )}

            {/* Description */}
            {quiz.description && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400 dark:text-slate-500">
                  Description
                </p>
                <p className={`text-sm leading-relaxed ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {quiz.description}
                </p>
              </div>
            )}

            {/* Created by */}
            {quiz.createdBy && (
              <div className={`flex items-center gap-2 text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                <FiUser className="w-3.5 h-3.5" />
                Created by {quiz.createdBy.firstName} {quiz.createdBy.lastName}
              </div>
            )}

            {/* Student: my best result */}
            {!canManage && r && (
              <button
                onClick={() => setShowMyResult(true)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition ${
                  r.passed
                    ? 'border-emerald-400/40 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/15'
                    : 'border-amber-400/40 bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/15'
                }`}
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1 text-slate-400 dark:text-slate-500">
                    My Best Result
                  </p>
                  <span className={`text-sm font-bold ${r.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {r.passed ? 'Passed' : 'Not passed'} · Attempt {r.attempt}
                  </span>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {r.score} / {r.totalMarks}
                  </p>
                  <p className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Tap to review
                  </p>
                </div>
              </button>
            )}
          </div>

          {/* Footer buttons */}
          <div className={`px-6 py-4 border-t flex-shrink-0 flex flex-wrap gap-2 ${
            dark ? 'border-slate-700' : 'border-slate-200'
          }`}>

            {/* Student: take / retake */}
            {!canManage && quiz.status === 'published' && (quiz.allowRetake || !r) && (
              <button onClick={onTake}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm
                           bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm">
                {r
                  ? <><FiRefreshCw className="w-4 h-4" /> Retake</>
                  : <><FiPlay      className="w-4 h-4" /> Start Quiz</>}
              </button>
            )}

            {/* Student: view my results */}
            {!canManage && r && (
              <button onClick={() => setShowMyResult(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition ${
                  dark ? 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20'
                       : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}>
                <FiAward className="w-4 h-4" /> My Results
              </button>
            )}

            {/* Teacher / Admin: edit + view all results */}
            {canManage && (
              <>
                <button onClick={onEdit}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition ${
                    dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                         : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}>
                  <FiEdit2 className="w-4 h-4" /> Edit
                </button>
                <button onClick={() => setShowResults(true)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition ${
                    dark ? 'bg-violet-500/10 text-violet-400 hover:bg-violet-500/20'
                         : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
                  }`}>
                  <FiBarChart2 className="w-4 h-4" /> All Results
                </button>
              </>
            )}

            <button onClick={onClose}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition ${
                dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                     : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}>
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Teacher: all results modal */}
      {showResults && (
        <QuizResults quiz={quiz} theme={theme} onClose={() => setShowResults(false)} />
      )}

      {/* Student: my results modal */}
      {showMyResult && (
        <QuizMyResult quiz={quiz} theme={theme} onClose={() => setShowMyResult(false)} />
      )}
    </>
  );
}
