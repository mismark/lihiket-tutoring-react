/**
 * Professional inline header search with:
 *  - Debounced live search (350ms)
 *  - Keyboard navigation (â†‘ â†“ Enter Esc)
 *  - Recent searches (localStorage)
 *  - Query term highlighted in results
 *  - Grouped sections by type
 *  - Loading skeleton
 *  - Deep navigation per result type
 */
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../store/theme/ThemeContext';
import { useAuth } from '../../store/auth/AuthContext';
import { globalSearch } from '../../api/search.api';
import {
  FiSearch, FiX, FiArrowRight, FiClock,
  FiBook, FiBookOpen, FiPlayCircle, FiFileText,
  FiClipboard, FiZap, FiAward, FiVideo,
} from 'react-icons/fi';

// â”€â”€ Shared config (used by SearchPage too via export) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const TYPE_CONFIG = {
  subjects:    { icon: FiBook,       colorIcon: 'text-blue-500',    colorBg: 'bg-blue-50 dark:bg-blue-500/10',    label: 'Subject'    },
  courses:     { icon: FiBookOpen,   colorIcon: 'text-emerald-500', colorBg: 'bg-emerald-50 dark:bg-emerald-500/10', label: 'Course'  },
  lessons:     { icon: FiPlayCircle, colorIcon: 'text-teal-500',    colorBg: 'bg-teal-50 dark:bg-teal-500/10',    label: 'Lesson'     },
  documents:   { icon: FiFileText,   colorIcon: 'text-amber-500',   colorBg: 'bg-amber-50 dark:bg-amber-500/10',  label: 'Document'   },
  assignments: { icon: FiClipboard,  colorIcon: 'text-purple-500',  colorBg: 'bg-purple-50 dark:bg-purple-500/10',label: 'Assignment' },
  quizzes:     { icon: FiZap,        colorIcon: 'text-indigo-500',  colorBg: 'bg-indigo-50 dark:bg-indigo-500/10',label: 'Quiz'       },
  exams:       { icon: FiAward,      colorIcon: 'text-red-500',     colorBg: 'bg-red-50 dark:bg-red-500/10',      label: 'Exam'       },
  liveClasses: { icon: FiVideo,      colorIcon: 'text-pink-500',    colorBg: 'bg-pink-50 dark:bg-pink-500/10',    label: 'Live Class' },
};

export const RESULT_KEYS = ['subjects','courses','lessons','documents','assignments','quizzes','exams','liveClasses'];

// â”€â”€ Deep navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function getDeepLink(type, item) {
  switch (type) {
    case 'subjects':
      return '/subjects';
    case 'courses': {
      const sid = item.subject?.slug || item.subject?._id || item.subject;
      return sid ? `/subjects/${sid}/courses` : '/subjects';
    }
    case 'lessons': {
      const cid = item.course?.slug || item.course?._id || item.course;
      const sid = item.subject?.slug || item.subject?._id || item.subject
               || item.course?.subject?.slug || item.course?.subject?._id;
      if (sid && cid) return `/subjects/${sid}/courses/${cid}/lessons`;
      return '/subjects';
    }
    case 'liveClasses':  return '/live-classes';
    case 'documents':    return '/documents';
    case 'assignments':  return '/assignments';
    case 'quizzes':      return '/quizzes';
    case 'exams':        return '/exams';
    default:             return '/search';
  }
}

// â”€â”€ Subtitle per type â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function getSubtitle(type, item) {
  const parts = [];
  switch (type) {
    case 'subjects':
      if (item.gradeLevel) parts.push(item.gradeLevel);
      if (item.category)   parts.push(item.category);
      parts.push(item.price > 0 ? `ETB ${Number(item.price).toLocaleString()}` : 'Free');
      break;
    case 'courses':
      if (item.subject?.name)      parts.push(item.subject.name);
      if (item.subject?.gradeLevel)parts.push(item.subject.gradeLevel);
      break;
    case 'lessons':
      if (item.type)        parts.push(item.type);
      if (item.duration)    parts.push(item.duration);
      if (item.course?.title) parts.push(item.course.title);
      break;
    case 'liveClasses':
      if (item.platform)    parts.push(item.platform);
      if (item.status)      parts.push(item.status);
      if (item.scheduledAt) parts.push(new Date(item.scheduledAt).toLocaleDateString());
      break;
    case 'documents':
      if (item.category)    parts.push(item.category);
      if (item.gradeLevel)  parts.push(item.gradeLevel);
      if (item.subject?.name) parts.push(item.subject.name);
      break;
    case 'assignments':
      if (item.subject?.name) parts.push(item.subject.name);
      if (item.dueDate)     parts.push(`Due ${new Date(item.dueDate).toLocaleDateString()}`);
      if (item.totalMarks)  parts.push(`${item.totalMarks} marks`);
      break;
    case 'quizzes':
    case 'exams':
      if (item.subject?.name) parts.push(item.subject.name);
      if (item.duration)    parts.push(`${item.duration} min`);
      if (item.totalMarks)  parts.push(`${item.totalMarks} marks`);
      break;
    default: break;
  }
  return parts.filter(Boolean).join(' Â· ');
}

// â”€â”€ Highlight query match in text â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Highlight({ text, query }) {
  if (!query || !text) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 dark:bg-yellow-500/30 text-inherit rounded px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// â”€â”€ Recent searches (localStorage) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const RECENT_KEY = 'lihiket_recent_searches';
function getRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
}
function saveRecent(q) {
  const prev = getRecent().filter(x => x !== q).slice(0, 4);
  localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...prev]));
}
function clearRecent() { localStorage.removeItem(RECENT_KEY); }

// â”€â”€ Main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function HeaderSearch({ onClose }) {
  const { theme } = useTheme();
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const dark      = theme === 'dark';

  const [query,    setQuery]    = useState('');
  const [results,  setResults]  = useState({});
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(false);
  const [active,   setActive]   = useState(-1);   // keyboard nav index
  const [recent,   setRecent]   = useState(getRecent);

  const inputRef = useRef(null);
  const wrapRef  = useRef(null);
  const timer    = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Close on outside click
  useEffect(() => {
    const h = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const doSearch = useCallback(async (q) => {
    if (!q || q.trim().length < 2) { setResults({}); setTotal(0); return; }
    setLoading(true);
    try {
      const res = await globalSearch(q.trim());
      setResults(res.data || {});
      setTotal(res.total || 0);
    } catch { setResults({}); setTotal(0); }
    finally { setLoading(false); }
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setActive(-1);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => doSearch(val), 350);
  };

  // Flatten for keyboard nav
  const flatItems = useMemo(() =>
    RESULT_KEYS.flatMap(key => (results[key] || []).slice(0, 3).map(item => ({ key, item }))).slice(0, 10),
    [results]
  );

  const go = (type, item) => {
    const link = getDeepLink(type, item);
    saveRecent(item.title || item.name || query);
    setRecent(getRecent());
    navigate(link);
    onClose();
  };

  const viewAll = () => {
    if (query.trim()) {
      saveRecent(query.trim());
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
    onClose();
  };

  const handleKeyDown = (e) => {
    if (!flatItems.length && e.key === 'Enter' && query.trim()) { viewAll(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, flatItems.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, -1)); }
    else if (e.key === 'Enter') {
      if (active >= 0 && flatItems[active]) { go(flatItems[active].key, flatItems[active].item); }
      else if (query.trim()) viewAll();
    }
  };

  const hasQuery   = query.trim().length >= 2;
  const showRecent = !hasQuery && recent.length > 0;

  return (
    <div ref={wrapRef} className="relative w-full">

      {/* â”€â”€ Input â”€â”€ */}
      <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border-2 transition-all ${
        dark
          ? 'bg-slate-800 border-blue-500/70 shadow-xl shadow-blue-900/20'
          : 'bg-white border-blue-500/60 shadow-xl shadow-blue-200/40'
      }`}>
        {loading
          ? <div className="w-4 h-4 border-[2.5px] border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          : <FiSearch className={`w-4 h-4 flex-shrink-0 ${dark ? 'text-slate-400' : 'text-gray-400'}`} />
        }
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Search subjects, courses, lessons, documentsâ€¦"
          className={`flex-1 text-sm bg-transparent outline-none min-w-0 ${
            dark ? 'text-white placeholder-slate-500' : 'text-gray-900 placeholder-gray-400'
          }`}
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults({}); setActive(-1); inputRef.current?.focus(); }}
            className={`p-1 rounded-lg transition flex-shrink-0 ${dark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}>
            <FiX className="w-3.5 h-3.5" />
          </button>
        )}
        <kbd className={`flex-shrink-0 px-2 py-0.5 rounded-md border text-xs font-medium ${
          dark ? 'border-slate-600 text-slate-500 bg-slate-900' : 'border-gray-200 text-gray-400 bg-gray-50'
        }`}>
          Esc
        </kbd>
      </div>

      {/* â”€â”€ Dropdown â”€â”€ */}
      {(hasQuery || showRecent) && (
        <div className={`absolute top-full left-0 right-0 mt-2 rounded-2xl border shadow-2xl overflow-hidden z-50 ${
          dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        }`}
          style={{ maxHeight: '70vh', overflowY: 'auto' }}
        >

          {/* â”€â”€ Recent searches (shown when input is empty) â”€â”€ */}
          {showRecent && !hasQuery && (
            <div>
              <div className={`flex items-center justify-between px-4 pt-3 pb-1.5`}>
                <span className={`text-xs font-semibold uppercase tracking-wider ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
                  Recent
                </span>
                <button onClick={() => { clearRecent(); setRecent([]); }}
                  className={`text-xs font-medium transition ${dark ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'}`}>
                  Clear
                </button>
              </div>
              {recent.map((r, i) => (
                <button key={i}
                  onClick={() => { setQuery(r); doSearch(r); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition ${
                    dark ? 'hover:bg-slate-700/60' : 'hover:bg-gray-50'
                  }`}
                >
                  <FiClock className={`w-4 h-4 flex-shrink-0 ${dark ? 'text-slate-500' : 'text-gray-400'}`} />
                  <span className={`text-sm ${dark ? 'text-slate-300' : 'text-gray-700'}`}>{r}</span>
                </button>
              ))}
              <div className={`mx-4 my-1 border-t ${dark ? 'border-slate-700' : 'border-gray-100'}`} />
              <p className={`px-4 py-2 text-xs ${dark ? 'text-slate-600' : 'text-gray-400'}`}>
                Start typing to search everythingâ€¦
              </p>
            </div>
          )}

          {/* â”€â”€ Loading skeleton â”€â”€ */}
          {hasQuery && loading && flatItems.length === 0 && (
            <div className="p-4 space-y-3">
              {[80, 60, 70].map((w, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className={`w-9 h-9 rounded-xl flex-shrink-0 ${dark ? 'bg-slate-700' : 'bg-gray-100'}`} />
                  <div className="flex-1 space-y-2">
                    <div className={`h-3 rounded-lg ${dark ? 'bg-slate-700' : 'bg-gray-100'}`} style={{ width: `${w}%` }} />
                    <div className={`h-2.5 rounded-lg w-1/3 ${dark ? 'bg-slate-700' : 'bg-gray-100'}`} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* â”€â”€ No results â”€â”€ */}
          {hasQuery && !loading && flatItems.length === 0 && (
            <div className={`px-4 py-8 text-center`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 ${dark ? 'bg-slate-700' : 'bg-gray-100'}`}>
                <FiSearch className={`w-6 h-6 ${dark ? 'text-slate-400' : 'text-gray-400'}`} />
              </div>
              <p className={`text-sm font-semibold ${dark ? 'text-slate-300' : 'text-gray-700'}`}>
                No results for "<span className="font-bold">{query}</span>"
              </p>
              <p className={`text-xs mt-1 ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
                Try different keywords or check the spelling
              </p>
            </div>
          )}

          {/* â”€â”€ Results grouped by type â”€â”€ */}
          {hasQuery && flatItems.length > 0 && (
            <>
              {RESULT_KEYS.map(key => {
                const items = (results[key] || []).slice(0, 3);
                if (!items.length) return null;
                const cfg = TYPE_CONFIG[key];
                const Icon = cfg.icon;
                return (
                  <div key={key}>
                    {/* Section label */}
                    <div className={`flex items-center gap-2 px-4 pt-3 pb-1 ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
                      <Icon className={`w-3.5 h-3.5 ${cfg.colorIcon}`} />
                      <span className="text-xs font-bold uppercase tracking-wider">{cfg.label}s</span>
                      <span className={`text-xs ml-auto ${dark ? 'text-slate-600' : 'text-gray-300'}`}>
                        {(results[key] || []).length}
                      </span>
                    </div>

                    {items.map((item, idx) => {
                      const flatIdx = flatItems.findIndex(f => f.key === key && f.item._id === item._id);
                      const isActive = flatIdx === active;
                      const title    = item.title || item.name || '';
                      const subtitle = getSubtitle(key, item);

                      return (
                        <button
                          key={item._id}
                          onClick={() => go(key, item)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition ${
                            isActive
                              ? dark ? 'bg-blue-600/20' : 'bg-blue-50'
                              : dark ? 'hover:bg-slate-700/60' : 'hover:bg-gray-50'
                          }`}
                        >
                          {/* Icon */}
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.colorBg}`}>
                            <Icon className={`w-4 h-4 ${cfg.colorIcon}`} />
                          </div>

                          {/* Text */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold truncate ${dark ? 'text-white' : 'text-gray-900'}`}>
                              <Highlight text={title} query={query} />
                            </p>
                            {subtitle && (
                              <p className={`text-xs truncate mt-0.5 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                                {subtitle}
                              </p>
                            )}
                          </div>

                          {/* Arrow on active */}
                          {isActive && (
                            <FiArrowRight className={`w-4 h-4 flex-shrink-0 ${dark ? 'text-blue-400' : 'text-blue-600'}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}

              {/* â”€â”€ View all footer â”€â”€ */}
              <div className={`border-t ${dark ? 'border-slate-700' : 'border-gray-100'}`}>
                <button
                  onClick={viewAll}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold transition ${
                    dark ? 'text-blue-400 hover:bg-slate-700/50' : 'text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <span>
                    See all <span className="font-bold">{total}</span> results for "
                    <span className="font-bold">{query}</span>"
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs ${dark ? 'text-slate-500' : 'text-gray-400'}`}>Enter</span>
                    <FiArrowRight className="w-4 h-4" />
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

