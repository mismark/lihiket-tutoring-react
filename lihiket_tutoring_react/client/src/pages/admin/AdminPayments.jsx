import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../store/theme/ThemeContext';
import { getAllPayments } from '../../api/payment.api';
import toast from 'react-hot-toast';
import {
  FiArrowLeft, FiDollarSign, FiCheckCircle, FiXCircle,
  FiClock, FiAlertCircle, FiRefreshCw, FiHash, FiBook,
  FiUser, FiCalendar, FiCreditCard, FiCopy, FiCheck,
  FiChevronLeft, FiChevronRight, FiFilter, FiSearch,
} from 'react-icons/fi';

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUSES = [
  { value: '',          label: 'All'       },
  { value: 'paid',      label: 'Paid'      },
  { value: 'pending',   label: 'Pending'   },
  { value: 'failed',    label: 'Failed'    },
  { value: 'refunded',  label: 'Refunded'  },
  { value: 'cancelled', label: 'Cancelled' },
];

const STATUS_STYLE = {
  paid:      { icon: FiCheckCircle, cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' },
  pending:   { icon: FiClock,       cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'         },
  failed:    { icon: FiXCircle,     cls: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'                 },
  refunded:  { icon: FiRefreshCw,   cls: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400'     },
  cancelled: { icon: FiAlertCircle, cls: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'            },
};

const METHOD_LABEL = {
  telebirr:       'Telebirr',
  cbebirr:        'CBE Birr',
  boa:            'BOA',
  dashen_bank:    'Dashen',
  awash_bank:     'Awash',
  abyssinia_bank: 'Abyssinia',
  mpesa:          'M-Pesa',
  hello_cash:     'Hello Cash',
  ebirr:          'eBirr',
  card:           'Card',
};

const PAGE_SIZE = 20;

// ── CopyButton ────────────────────────────────────────────────────────────────

function CopyButton({ text, dark }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <button
      onClick={handleCopy}
      title={copied ? 'Copied!' : 'Copy transaction ID'}
      className={`flex-shrink-0 p-1 rounded-md transition ${
        copied
          ? 'text-emerald-500'
          : dark
            ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-700'
            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
      }`}
    >
      {copied ? <FiCheck className="w-3.5 h-3.5" /> : <FiCopy className="w-3.5 h-3.5" />}
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminPayments() {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const [payments,    setPayments]    = useState([]);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [loading,     setLoading]     = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search,      setSearch]      = useState('');

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllPayments({ status: statusFilter || undefined, page, limit: PAGE_SIZE });
      setPayments(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      toast.error(err.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  // Reset to page 1 when filter changes
  const handleStatusChange = (val) => {
    setStatusFilter(val);
    setPage(1);
  };

  // Client-side search filter (applied on top of server status filter)
  const displayed = search.trim()
    ? payments.filter(p => {
        const q = search.toLowerCase();
        return (
          p.txRef?.toLowerCase().includes(q) ||
          p.student?.firstName?.toLowerCase().includes(q) ||
          p.student?.lastName?.toLowerCase().includes(q) ||
          p.student?.email?.toLowerCase().includes(q) ||
          p.subject?.name?.toLowerCase().includes(q)
        );
      })
    : payments;

  // Summary totals from current page (server-filtered)
  const paidCount  = payments.filter(p => p.status === 'paid').length;
  const totalETB   = payments.filter(p => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <div className={`min-h-screen p-4 md:p-8 ${dark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className={`p-2 rounded-xl border transition ${
              dark
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
                : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-200'
            }`}
          >
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className={`text-2xl font-extrabold ${dark ? 'text-white' : 'text-gray-900'}`}>
              💳 All Payments
            </h1>
            <p className={`text-sm mt-0.5 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
              {total.toLocaleString()} total transaction{total !== 1 ? 's' : ''}
            </p>
          </div>
          {/* Verify shortcut */}
          <Link
            to="/admin/verify-payment"
            className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition ${
              dark
                ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
                : 'bg-white border-gray-200 text-amber-600 hover:bg-amber-50'
            }`}
          >
            <FiSearch className="w-4 h-4" /> Verify by ID
          </Link>
        </div>

        {/* ── Summary strip ── */}
        {!loading && payments.length > 0 && (
          <div className={`rounded-2xl border p-4 flex flex-wrap gap-4 shadow-sm ${
            dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                <FiDollarSign className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                  ETB {totalETB.toLocaleString()}
                </p>
                <p className={`text-xs ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                  Paid on this page · {paidCount} tx
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Status tabs */}
          <div className={`flex items-center gap-1 p-1 rounded-xl border flex-wrap ${
            dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          }`}>
            <FiFilter className={`w-4 h-4 ml-2 flex-shrink-0 ${dark ? 'text-slate-500' : 'text-gray-400'}`} />
            {STATUSES.map(s => (
              <button
                key={s.value}
                onClick={() => handleStatusChange(s.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  statusFilter === s.value
                    ? 'bg-amber-500 text-white shadow-sm'
                    : dark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className={`flex items-center gap-2 flex-1 px-3 py-2 rounded-xl border ${
            dark
              ? 'bg-slate-800 border-slate-700 focus-within:border-amber-500/60'
              : 'bg-white border-gray-200 focus-within:border-amber-400'
          }`}>
            <FiSearch className={`w-4 h-4 flex-shrink-0 ${dark ? 'text-slate-500' : 'text-gray-400'}`} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, subject, tx ref…"
              className={`flex-1 bg-transparent text-sm outline-none ${
                dark ? 'text-slate-100 placeholder:text-slate-500' : 'text-gray-900 placeholder:text-gray-400'
              }`}
            />
            {search && (
              <button onClick={() => setSearch('')} className={`${dark ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'}`}>
                <FiCheck className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ── Table / Cards ── */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className={`mt-3 text-sm ${dark ? 'text-slate-400' : 'text-gray-500'}`}>Loading payments…</p>
          </div>
        ) : displayed.length === 0 ? (
          <div className={`rounded-2xl border p-12 text-center shadow-sm ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <FiDollarSign className={`w-12 h-12 mx-auto mb-4 ${dark ? 'text-slate-600' : 'text-gray-300'}`} />
            <p className={`font-semibold ${dark ? 'text-slate-300' : 'text-gray-700'}`}>No payments found</p>
            <p className={`text-sm mt-1 ${dark ? 'text-slate-500' : 'text-gray-500'}`}>
              Try a different filter or search term
            </p>
          </div>
        ) : (
          <div className={`rounded-2xl border shadow-sm overflow-hidden ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b text-xs font-bold uppercase tracking-wide ${
                    dark ? 'border-slate-700 text-slate-400 bg-slate-800/80' : 'border-gray-100 text-gray-500 bg-gray-50'
                  }`}>
                    <th className="px-5 py-3 text-left">Student</th>
                    <th className="px-5 py-3 text-left">Subject</th>
                    <th className="px-5 py-3 text-left">Transaction ID</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                    <th className="px-5 py-3 text-left">Method</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${dark ? 'divide-slate-700' : 'divide-gray-100'}`}>
                  {displayed.map(p => {
                    const st     = STATUS_STYLE[p.status] || STATUS_STYLE.pending;
                    const StIcon = st.icon;
                    const name   = [p.student?.firstName, p.student?.lastName].filter(Boolean).join(' ') || '—';
                    const date   = p.paidAt || p.createdAt;
                    return (
                      <tr
                        key={p._id}
                        className={`transition ${dark ? 'hover:bg-slate-700/40' : 'hover:bg-gray-50'}`}
                      >
                        {/* Student */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              dark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
                            }`}>
                              <FiUser className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className={`font-semibold truncate max-w-[140px] ${dark ? 'text-slate-100' : 'text-gray-900'}`}>{name}</p>
                              <p className={`text-xs truncate max-w-[140px] ${dark ? 'text-slate-500' : 'text-gray-400'}`}>{p.student?.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Subject */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <FiBook className={`w-3.5 h-3.5 flex-shrink-0 ${dark ? 'text-slate-500' : 'text-gray-400'}`} />
                            <span className={`truncate max-w-[140px] font-medium ${dark ? 'text-slate-200' : 'text-gray-800'}`}>
                              {p.subject?.name || '—'}
                            </span>
                          </div>
                        </td>

                        {/* Transaction ID */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5 max-w-[200px]">
                            <span className={`font-mono text-xs truncate ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                              {p.txRef}
                            </span>
                            <CopyButton text={p.txRef} dark={dark} />
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="px-5 py-3.5 text-right">
                          <span className={`font-bold ${
                            p.status === 'paid'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : dark ? 'text-slate-300' : 'text-gray-700'
                          }`}>
                            ETB {Number(p.amount || 0).toLocaleString()}
                          </span>
                        </td>

                        {/* Method */}
                        <td className="px-5 py-3.5">
                          <span className={`text-xs ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                            {p.paymentMethod ? (METHOD_LABEL[p.paymentMethod] || p.paymentMethod) : '—'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${st.cls}`}>
                            <StIcon className="w-3 h-3" />
                            {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-3.5">
                          <div className={`flex items-center gap-1.5 text-xs ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                            <FiCalendar className="w-3 h-3 flex-shrink-0" />
                            {date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-slate-700">
              {displayed.map(p => {
                const st     = STATUS_STYLE[p.status] || STATUS_STYLE.pending;
                const StIcon = st.icon;
                const name   = [p.student?.firstName, p.student?.lastName].filter(Boolean).join(' ') || '—';
                const date   = p.paidAt || p.createdAt;
                return (
                  <div key={p._id} className="p-4 space-y-3">
                    {/* Top row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          dark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
                        }`}>
                          <FiUser className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className={`font-bold text-sm truncate ${dark ? 'text-white' : 'text-gray-900'}`}>{name}</p>
                          <p className={`text-xs truncate ${dark ? 'text-slate-500' : 'text-gray-400'}`}>{p.student?.email}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold flex-shrink-0 ${st.cls}`}>
                        <StIcon className="w-3 h-3" />
                        {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                      </span>
                    </div>

                    {/* Subject + amount */}
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center gap-1.5 text-sm ${dark ? 'text-slate-300' : 'text-gray-700'}`}>
                        <FiBook className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="font-medium truncate max-w-[180px]">{p.subject?.name || '—'}</span>
                      </div>
                      <span className={`font-bold text-sm ${p.status === 'paid' ? 'text-emerald-600 dark:text-emerald-400' : dark ? 'text-slate-300' : 'text-gray-700'}`}>
                        ETB {Number(p.amount || 0).toLocaleString()}
                      </span>
                    </div>

                    {/* Tx ref row */}
                    <div className={`flex items-center gap-2 rounded-lg px-3 py-2 ${dark ? 'bg-slate-700/60' : 'bg-gray-50'}`}>
                      <FiHash className={`w-3.5 h-3.5 flex-shrink-0 ${dark ? 'text-slate-500' : 'text-gray-400'}`} />
                      <span className={`font-mono text-xs flex-1 truncate ${dark ? 'text-slate-400' : 'text-gray-500'}`}>{p.txRef}</span>
                      <CopyButton text={p.txRef} dark={dark} />
                    </div>

                    {/* Date + method */}
                    <div className={`flex items-center justify-between text-xs ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-3 h-3" />
                        {date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </div>
                      <span>{p.paymentMethod ? (METHOD_LABEL[p.paymentMethod] || p.paymentMethod) : 'Unknown method'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Pagination ── */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between gap-4">
            <p className={`text-sm ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
              Page {page} of {totalPages} · {total.toLocaleString()} records
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`p-2 rounded-xl border transition disabled:opacity-40 disabled:cursor-not-allowed ${
                  dark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>

              {/* Page number pills */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around current page
                let start = Math.max(1, page - 2);
                const end = Math.min(totalPages, start + 4);
                start = Math.max(1, end - 4);
                return start + i;
              }).map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-9 h-9 rounded-xl text-sm font-bold border transition ${
                    n === page
                      ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                      : dark
                        ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {n}
                </button>
              ))}

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`p-2 rounded-xl border transition disabled:opacity-40 disabled:cursor-not-allowed ${
                  dark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
