import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../store/theme/ThemeContext';
import { useAuth } from '../../store/auth/AuthContext';
import { getDocuments } from '../../api/document.api';
import { getAllSubjects } from '../../api/subject.api';
import toast from 'react-hot-toast';
import {
  FiPlus, FiSearch, FiX, FiFilter, FiFileText,
  FiEye, FiEyeOff,
} from 'react-icons/fi';

import DocumentCard   from './DocumentCard';
import DocumentCreate from './DocumentCreate';
import DocumentEdit   from './DocumentEdit';
import DocumentDelete from './DocumentDelete';
import DocumentView   from './DocumentView';

const CATEGORIES = [
  { value: '',          label: 'All Categories' },
  { value: 'notes',     label: 'Notes'          },
  { value: 'worksheet', label: 'Worksheet'      },
  { value: 'past_paper',label: 'Past Paper'     },
  { value: 'syllabus',  label: 'Syllabus'       },
  { value: 'reference', label: 'Reference'      },
  { value: 'other',     label: 'Other'          },
];

const GRADE_LEVELS = [
  'KG1','KG2','G1','G2','G3','G4','G5','G6',
  'G7','G8','G9','G10','G11','G12','HL',
];

const LIMIT = 12;

export default function DocumentsPage() {
  const { theme } = useTheme();
  const { user }  = useAuth();
  const dark      = theme === 'dark';
  const canManage = user?.role === 'admin' || user?.role === 'teacher';

  const [docs,      setDocs]      = useState([]);
  const [subjects,  setSubjects]  = useState([]);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(1);
  const [loading,   setLoading]   = useState(true);

  // Filters
  const [search,     setSearch]     = useState('');
  const [subjectF,   setSubjectF]   = useState('');
  const [gradeF,     setGradeF]     = useState('');
  const [catF,       setCatF]       = useState('');
  const [showDrafts, setShowDrafts] = useState(canManage);
  const [showFilter, setShowFilter] = useState(false);

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [viewDoc,    setViewDoc]    = useState(null);
  const [editDoc,    setEditDoc]    = useState(null);
  const [deleteDoc,  setDeleteDoc]  = useState(null);

  const loadDocs = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: LIMIT };
      if (search)   params.search     = search;
      if (subjectF) params.subject    = subjectF;
      if (gradeF)   params.gradeLevel = gradeF;
      if (catF)     params.category   = catF;
      if (canManage && !showDrafts) params.isPublished = true;

      const res = await getDocuments(params);
      setDocs(res.data || []);
      setTotal(res.total || 0);
      setPage(p);
    } catch (err) {
      toast.error(err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [search, subjectF, gradeF, catF, showDrafts, canManage]);

  useEffect(() => { loadDocs(1); }, [loadDocs]);

  useEffect(() => {
    getAllSubjects()
      .then(res => setSubjects(res.data || []))
      .catch(() => {});
  }, []);

  const clearFilters = () => { setSearch(''); setSubjectF(''); setGradeF(''); setCatF(''); };
  const hasFilter = search || subjectF || gradeF || catF;
  const totalPages = Math.ceil(total / LIMIT);

  const inputCls = `px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    dark ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-gray-300 text-gray-900'
  }`;

  return (
    <div className={`min-h-screen p-4 md:p-8 ${dark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className={`text-2xl font-extrabold ${dark ? 'text-white' : 'text-gray-900'}`}>
              📄 Documents
            </h1>
            <p className={`text-sm mt-0.5 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
              {loading ? '…' : `${total} document${total !== 1 ? 's' : ''}`}
            </p>
          </div>
          {canManage && (
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-lg shadow-blue-600/25 text-sm">
              <FiPlus className="w-4 h-4" /> Upload Document
            </button>
          )}
        </div>

        {/* Search + filter bar */}
        <div className={`rounded-2xl border shadow-sm p-4 space-y-3 ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dark ? 'text-slate-400' : 'text-gray-400'}`} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search documents…"
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  dark ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-300 text-gray-900'
                }`} />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>
            <button onClick={() => setShowFilter(v => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition ${
                showFilter || hasFilter
                  ? 'bg-blue-600 text-white border-blue-600'
                  : dark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}>
              <FiFilter className="w-4 h-4" />
              Filters{hasFilter ? ` (${[search,subjectF,gradeF,catF].filter(Boolean).length})` : ''}
            </button>
          </div>

          {showFilter && (
            <div className="flex flex-wrap gap-3 pt-1 items-center">
              <select value={catF} onChange={e => setCatF(e.target.value)} className={`${inputCls} flex-1 min-w-[140px]`}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <select value={gradeF} onChange={e => setGradeF(e.target.value)} className={`${inputCls} flex-1 min-w-[120px]`}>
                <option value="">All Grades</option>
                {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <select value={subjectF} onChange={e => setSubjectF(e.target.value)} className={`${inputCls} flex-1 min-w-[160px]`}>
                <option value="">All Subjects</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.gradeLevel})</option>)}
              </select>
              {canManage && (
                <button onClick={() => setShowDrafts(v => !v)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition ${
                    showDrafts
                      ? dark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      : 'bg-amber-500 text-white border-amber-500'
                  }`}>
                  {showDrafts ? <><FiEye className="w-4 h-4" /> Showing drafts</> : <><FiEyeOff className="w-4 h-4" /> Hiding drafts</>}
                </button>
              )}
              {hasFilter && (
                <button onClick={clearFilters}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-semibold transition ${dark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}>
                  <FiX className="w-4 h-4" /> Clear
                </button>
              )}
            </div>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className={`mt-4 text-sm ${dark ? 'text-slate-400' : 'text-gray-500'}`}>Loading documents…</p>
          </div>
        ) : docs.length === 0 ? (
          <div className={`rounded-2xl border p-12 text-center ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <FiFileText className={`w-12 h-12 mx-auto mb-4 ${dark ? 'text-slate-600' : 'text-gray-300'}`} />
            <p className={`font-semibold ${dark ? 'text-slate-300' : 'text-gray-700'}`}>
              {hasFilter ? 'No documents match your filters' : 'No documents yet'}
            </p>
            <p className={`text-sm mt-1 ${dark ? 'text-slate-500' : 'text-gray-500'}`}>
              {canManage ? 'Click "Upload Document" to add the first one' : 'No documents have been uploaded yet'}
            </p>
            {hasFilter && (
              <button onClick={clearFilters} className="mt-4 text-sm font-semibold text-blue-500 hover:text-blue-600 transition">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {docs.map(doc => (
                <DocumentCard
                  key={doc._id}
                  doc={doc}
                  onView={setViewDoc}
                  onEdit={canManage ? setEditDoc   : () => {}}
                  onDelete={canManage ? setDeleteDoc : () => {}}
                  canManage={canManage}
                  theme={theme}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button onClick={() => loadDocs(page - 1)} disabled={page <= 1}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-40 ${dark ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'}`}>
                  ← Prev
                </button>
                <span className={`text-sm font-semibold ${dark ? 'text-slate-400' : 'text-gray-600'}`}>
                  Page {page} of {totalPages}
                </span>
                <button onClick={() => loadDocs(page + 1)} disabled={page >= totalPages}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-40 ${dark ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'}`}>
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showCreate && (
        <DocumentCreate subjects={subjects} theme={theme}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); loadDocs(1); }} />
      )}
      {editDoc && (
        <DocumentEdit doc={editDoc} subjects={subjects} theme={theme}
          onClose={() => setEditDoc(null)}
          onUpdated={() => { setEditDoc(null); loadDocs(page); }} />
      )}
      {deleteDoc && (
        <DocumentDelete doc={deleteDoc} theme={theme}
          onClose={() => setDeleteDoc(null)}
          onDeleted={() => { setDeleteDoc(null); loadDocs(page); }} />
      )}
      {viewDoc && (
        <DocumentView doc={viewDoc} theme={theme}
          onClose={() => setViewDoc(null)} />
      )}
    </div>
  );
}
