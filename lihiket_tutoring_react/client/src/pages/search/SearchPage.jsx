import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from '../../store/theme/ThemeContext';
import { globalSearch } from '../../api/search.api';
import { FiSearch, FiX } from 'react-icons/fi';
import SearchResultItem from './SearchResultItem';
import {
  TYPE_CONFIG, RESULT_KEYS,
} from '../../components/layout/HeaderSearch';

const CATEGORIES = [
  { key: '', label: 'All' },
  ...RESULT_KEYS.map(key => ({ key, label: TYPE_CONFIG[key]?.label + 's' })),
];

export default function SearchPage() {
  const { theme } = useTheme();
  const dark      = theme === 'dark';
  const [searchParams, setSearchParams] = useSearchParams();

  const [query,    setQuery]    = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('type') || '');
  const [results,  setResults]  = useState(null);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);

  const inputRef = useRef();
  const debounce = useRef(null);

  const doSearch = useCallback(async (q, cat) => {
    if (!q || q.trim().length < 2) { setResults(null); setTotal(0); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    try {
      const res = await globalSearch(q.trim(), cat);
      setResults(res.data || {});
      setTotal(res.total || 0);
      setSearchParams({ q: q.trim(), ...(cat ? { type: cat } : {}) }, { replace: true });
    } catch { setResults({}); setTotal(0); }
    finally { setLoading(false); }
  }, [setSearchParams]);

  useEffect(() => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => doSearch(query, category), 400);
    return () => clearTimeout(debounce.current);
  }, [query, category, doSearch]);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) doSearch(q, category);
    inputRef.current?.focus();
  }, []);

  const countFor = key => results?.[key]?.length || 0;

  const displayed = !results ? [] : category
    ? (results[category] || []).map(item => ({ type: category, item }))
    : RESULT_KEYS.flatMap(key => (results[key] || []).map(item => ({ type: key, item })));

  return (
    <div className={`min-h-screen ${dark ? 'bg-slate-900' : 'bg-slate-50'}`}>

      {/* â”€â”€ Search hero â”€â”€ */}
      <div className={`border-b px-4 py-8 ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="max-w-3xl mx-auto">
          <h1 className={`text-2xl font-extrabold mb-1 ${dark ? 'text-white' : 'text-slate-900'}`}>
            Search
          </h1>
          <p className={`text-sm mb-5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
            Search across subjects, courses, lessons, documents, quizzes, exams and more
          </p>

          {/* Input */}
          <div className="relative">
            <FiSearch className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${dark ? 'text-slate-400' : 'text-slate-400'}`} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Type to search everythingâ€¦"
              autoComplete="off"
              spellCheck={false}
              className={`w-full pl-12 pr-12 py-4 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                dark
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-gray-400'
              }`}
            />
            {loading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {!loading && query && (
              <button
                onClick={() => { setQuery(''); setResults(null); setTotal(0); setSearched(false); inputRef.current?.focus(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category tabs */}
          {searched && (
            <div className="flex flex-wrap gap-2 mt-4">
              {CATEGORIES.map(cat => {
                const count  = cat.key ? countFor(cat.key) : total;
                const cfg    = cat.key ? TYPE_CONFIG[cat.key] : null;
                const Icon   = cfg?.icon;
                const active = category === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setCategory(cat.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                      active
                        ? `${cfg ? cfg.colorBg : 'bg-blue-50 dark:bg-blue-500/10'} ${cfg ? cfg.colorIcon : 'text-blue-600 dark:text-blue-400'} border-current`
                        : dark ? 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
                               : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    {cat.label}
                    {count > 0 && (
                      <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                        active
                          ? 'bg-white/30 text-inherit'
                          : dark ? 'bg-slate-600 text-slate-300' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* â”€â”€ Results area â”€â”€ */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">

        {/* Empty state â€” not searched */}
        {!searched && (
          <div className={`rounded-2xl border p-12 text-center ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${dark ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <FiSearch className={`w-8 h-8 ${dark ? 'text-slate-400' : 'text-slate-400'}`} />
            </div>
            <p className={`font-semibold text-lg ${dark ? 'text-slate-200' : 'text-slate-800'}`}>What are you looking for?</p>
            <p className={`text-sm mt-2 max-w-xs mx-auto ${dark ? 'text-slate-500' : 'text-slate-500'}`}>
              Search subjects, courses, lessons, documents, assignments, quizzes, exams and live classes
            </p>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className={`rounded-2xl border overflow-hidden ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            {[1,2,3,4,5].map(i => (
              <div key={i} className={`flex items-center gap-4 px-5 py-4 border-b last:border-0 animate-pulse ${
                dark ? 'border-slate-700' : 'border-gray-50'
              }`}>
                <div className={`w-10 h-10 rounded-xl flex-shrink-0 ${dark ? 'bg-slate-700' : 'bg-slate-100'}`} />
                <div className="flex-1 space-y-2">
                  <div className={`h-3.5 rounded-lg ${dark ? 'bg-slate-700' : 'bg-slate-100'}`} style={{ width: `${50 + i * 8}%` }} />
                  <div className={`h-2.5 rounded-lg w-1/3 ${dark ? 'bg-slate-700' : 'bg-slate-100'}`} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results */}
        {!loading && searched && displayed.length === 0 && (
          <div className={`rounded-2xl border p-12 text-center ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${dark ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <FiSearch className={`w-8 h-8 ${dark ? 'text-slate-400' : 'text-slate-400'}`} />
            </div>
            <p className={`font-semibold ${dark ? 'text-slate-200' : 'text-slate-800'}`}>
              No results for "<span className="font-bold">{query}</span>"
            </p>
            <p className={`text-sm mt-2 ${dark ? 'text-slate-500' : 'text-slate-500'}`}>
              Try different keywords or check your spelling
            </p>
            {category && (
              <button onClick={() => setCategory('')}
                className="mt-4 text-sm font-semibold text-blue-500 hover:text-blue-600 transition">
                Search all categories
              </button>
            )}
          </div>
        )}

        {/* Results */}
        {!loading && displayed.length > 0 && (
          <div className={`rounded-2xl border overflow-hidden shadow-sm ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>

            {/* Count bar */}
            <div className={`px-5 py-3 border-b flex items-center justify-between ${dark ? 'border-slate-700 bg-slate-900/40' : 'border-slate-100 bg-slate-50'}`}>
              <p className={`text-xs font-semibold ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                <span className="font-bold text-blue-500">{total}</span> result{total !== 1 ? 's' : ''} for "
                <span className={`font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>{query}</span>"
                {category && ` in ${TYPE_CONFIG[category]?.label}s`}
              </p>
            </div>

            {/* Grouped or flat */}
            {!category ? (
              RESULT_KEYS.map(key => {
                const items = results?.[key] || [];
                if (!items.length) return null;
                const cfg = TYPE_CONFIG[key];
                const Icon = cfg.icon;
                return (
                  <div key={key}>
                    <div className={`flex items-center gap-2 px-5 py-2.5 border-b ${
                      dark ? 'border-slate-700 bg-slate-900/30' : 'border-slate-100 bg-slate-50/80'
                    }`}>
                      <Icon className={`w-3.5 h-3.5 ${cfg.colorIcon}`} />
                      <span className={`text-xs font-bold uppercase tracking-wider ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {cfg.label}s
                      </span>
                      <span className={`ml-auto text-xs font-semibold ${cfg.colorIcon}`}>{items.length}</span>
                    </div>
                    <div className={`divide-y ${dark ? 'divide-slate-700' : 'divide-gray-50'}`}>
                      {items.map(item => (
                        <SearchResultItem key={item._id} type={key} item={item} query={query} theme={theme} />
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={`divide-y ${dark ? 'divide-slate-700' : 'divide-gray-50'}`}>
                {displayed.map(({ type, item }) => (
                  <SearchResultItem key={item._id} type={type} item={item} query={query} theme={theme} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

