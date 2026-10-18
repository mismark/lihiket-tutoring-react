import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../store/theme/ThemeContext';
import { getAllPayments } from '../../api/payment.api';
import toast from 'react-hot-toast';
import {
  FiArrowLeft, FiDollarSign, FiCheckCircle, FiXCircle,
  FiClock, FiAlertCircle, FiRefreshCw, FiHash, FiBook,
  FiUser, FiCalendar, FiCreditCard, FiCopy, FiCheck,
  FiChevronLeft, FiChevronRight, FiSearch, FiX,
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
  pending:   { icon: FiClock,       cls: 'bg-amber-100  text-amber-700  dark:bg-amber-500/20  dark:text-amber-400'      },
  failed:    { icon: FiXCircle,     cls: 'bg-red-100    text-red-700    dark:bg-red-500/20    dark:text-red-400'         },
  refunded:  { icon: FiRefreshCw,   cls: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400'     },
  cancelled: { icon: FiAlertCircle, cls: 'bg-slate-100  text-slate-600  dark:bg-slate-700     dark:text-slate-400'      },
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
  const handle = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied!', { duration: 1500 });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Copy failed');
    }
  };
  return (
    <button
      onClick={handle}
      title={copied ? 'Copied!' : 'Copy transaction ID'}
      aria-label="Copy transaction ID"
      className={`flex-shrink-0 p-1.5 rounded-lg transition active:scale-90 ${
        copied
          ? 'text-emerald-500'
          : dark
            ? 'text-slate-500 hover:text-slate-200 hover:bg-slate-600'
            : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
      }`}
    >
      {copied ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
    </button>
  );
}

// ── Payment card (mobile) ─────────────────────────────────────────────────────

function PaymentCard({ p, dark }) {
  const st     = STATUS_STYLE[p.status] || STATUS_STYLE.pending;
  const StIcon = st.icon;
  const name   = [p.student?.firstName, p.student?.lastName].filter(Boolean).join(' ') || '—';
  const date   = p.paidAt || p.createdAt;

  return (
    <div className={`rounded-2xl border shadow-sm p-4 space-y-3 ${
      dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
    }`}>
      {/* Row 1 — student + status */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
            dark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
          }`}>
            <FiUser className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className={`font-bold text-sm leading-tight ${dark ? 'text-white' : 'text-gray-900'}`}>{name}</p>
            <p className={`text-xs truncate mt-0.5 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>{p.student?.email || '—'}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ${st.cls}`}>
          <StIcon className="w-3 h-3" />
          {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
        </span>
      </div>

      {/* Row 2 — subject + amount */}
      <div className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 ${
        dark ? 'bg-slate-700/50' : 'bg-gray-50'
      }`}>
        <div className="flex items-center gap-1.5 min-w-0">
          <FiBook className={`w-3.5 h-3.5 flex-shrink-0 ${dark ? 'text-slate-400' : 'text-gray-400'}`} />
          <span className={`text-sm font-medium truncate ${dark ? 'text-slate-200' : 'text-gray-700'}`}>
            {p.subject?.name || '—'}
          </span>
        </div>
        <span className={`text-sm font-extrabold flex-shrink-0 ${
          p.status === 'paid' ? 'text-emerald-600 dark:text-emerald-400' : dark ? 'text-slate-200' : 'text-gray-800'
        }`}>
          ETB {Number(p.amount || 0).toLocaleString()}
        </span>
      </div>

      {/* Row 3 — transaction ID (copyable) */}
      <div className={`flex items-center gap-2 rounded-xl px-3 py-2 ${
        dark ? 'bg-slate-700/50' : 'bg-gray-50'
      }`}>
        <FiHash className={`w-3.5 h-3.5 flex-shrink-0 ${dark ? 'text-slate-500' : 'text-gray-400'}`} />
        <span className={`font-mono text-xs flex-1 min-w-0 break-all ${dark ? 'text-slate-300' : 'text-gray-600'}`}>
          {p.txRef}
        </span>
        <CopyButton text={p.txRef} dark={dark} />
      </div>

      {/* Row 4 — method + date */}
      <div className={`flex items-center justify-between text-xs ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
        <span className="flex items-center gap-1">
          <FiCreditCard className="w-3 h-3" />
          {p.paymentMethod ? (METHOD_LABEL[p.paymentMethod] || p.paymentMethod) : '—'}
        </span>
        <span className="flex items-center gap-1">
          <FiCalendar className="w-3 h-3" />
          {date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
        </span>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminPayments() {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const [payments,     setPayments]     = useState([]);
  const [total,        setTotal]        = useState(0);
  const [page,         setPage]         = useState(1);
  const [loading,      setLoading]      = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search,       setSearch]       = useState('');

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

  const handleStatusChange = (val) => { setStatusFilter(val); setPage(1); };

  // Client-side search on top of the server-filtered page
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

  const paidCount = payments.filter(p => p.status === 'paid').length;
  const totalETB  = payments.filter(p => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0);

  // Pagination window — up to 3 pills on mobile, 5 on desktop
  const buildPages = (max) => {
    let start = Math.max(1, page - Math.floor(max / 2));
    const end = Math.min(totalPages, start + max - 1);
    start = Math.max(1, end - max + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <div className={`min-h-screen ${dark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-5xl mx-auto px-3 py-4 md:px-8 md:py-8 space-y-5">

        {/* ── Header ── */}
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className={`p-2 rounded-xl border transition flex-shrink-0 ${
              dark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
                   : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-200'
            }`}
          >
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className={`text-xl md:text-2xl font-extrabold leading-tight ${dark ? 'text-white' : 'text-gray-900'}`}>
              💳 All Payments
            </h1>
            <p className={`text-xs md:text-sm mt-0.5 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
              {total.toLocaleString()} transaction{total !== 1 ? 's' : ''}
            </p>
          </div>
          {/* Verify shortcut — icon-only on xs, text on sm+ */}
          <Link
            to="/admin/verify-payment"
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold transition flex-shrink-0 ${
              dark ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
                   : 'bg-white border-gray-200 text-amber-600 hover:bg-amber-50'
            }`}
          >
            <FiSearch className="w-4 h-4" />
            <span className="hidden sm:inline">Verify by ID</span>
          </Link>
        </div>

        {/* ── Summary strip ── */}
        {!loading && payments.length > 0 && (
          <div className={`rounded-2xl border p-4 flex items-center gap-3 shadow-sm ${
            dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              dark ? 'bg-emerald-500/10' : 'bg-emerald-50'
            }`}>
              <FiDollarSign className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                ETB {totalETB.toLocaleString()}
              </p>
              <p className={`text-xs ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                Paid on this page · {paidCount} transaction{paidCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}

        {/* ── Status filter — scrollable chips ── */}
        <div className={`flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none`}>
          {STATUSES.map(s => (
            <button
              key={s.value}
              onClick={() => handleStatusChange(s.value)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 border transition ${
                statusFilter === s.value
                  ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                  : dark
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* ── Search ── */}
        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl border transition ${
          dark
            ? 'bg-slate-800 border-slate-700 focus-within:border-amber-500/60 focus-within:ring-2 focus-within:ring-amber-500/20'
            : 'bg-white border-gray-200 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20'
        }`}>
          <FiSearch className={`w-4 h-4 flex-shrink-0 ${dark ? 'text-slate-500' : 'text-gray-400'}`} />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, subject, tx ref…"
            className={`flex-1 bg-transparent text-sm outline-none ${
              dark ? 'text-slate-100 placeholder:text-slate-500' : 'text-gray-900 placeholder:text-gray-400'
            }`}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className={`p-1 rounded-lg transition ${
                dark ? 'text-slate-500 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className={`mt-3 text-sm ${dark ? 'text-slate-400' : 'text-gray-500'}`}>Loading payments…</p>
          </div>
        ) : displayed.length === 0 ? (
          <div className={`rounded-2xl border p-12 text-center shadow-sm ${
            dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          }`}>
            <FiDollarSign className={`w-12 h-12 mx-auto mb-4 ${dark ? 'text-slate-600' : 'text-gray-300'}`} />
            <p className={`font-semibold ${dark ? 'text-slate-300' : 'text-gray-700'}`}>No payments found</p>
            <p className={`text-sm mt-1 ${dark ? 'text-slate-500' : 'text-gray-500'}`}>
              Try a different filter or search term
            </p>
          </div>
        ) : (
          <>
            {/* Mobile cards — visible below md */}
            <div className="md:hidden space-y-3">
              {displayed.map(p => (
                <PaymentCard key={p._id} p={p} dark={dark} />
              ))}
            </div>

            {/* Desktop table — visible from md */}
            <div className={`hidden md:block rounded-2xl border shadow-sm overflow-hidden ${
              dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`border-b text-xs font-bold uppercase tracking-wide ${
                      dark ? 'border-slate-700 text-slate-400 bg-slate-800/80'
                           : 'border-gray-100 text-gray-500 bg-gray-50'
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
                        <tr key={p._id} className={`transition ${dark ? 'hover:bg-slate-700/40' : 'hover:bg-gray-50/70'}`}>
                          {/* Student */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                dark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
                              }`}>
                                <FiUser className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0">
                                <p className={`font-semibold truncate max-w-[130px] ${dark ? 'text-slate-100' : 'text-gray-900'}`}>{name}</p>
                                <p className={`text-xs truncate max-w-[130px] ${dark ? 'text-slate-500' : 'text-gray-400'}`}>{p.student?.email}</p>
                              </div>
                            </div>
                          </td>
                          {/* Subject */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <FiBook className={`w-3.5 h-3.5 flex-shrink-0 ${dark ? 'text-slate-500' : 'text-gray-400'}`} />
                              <span className={`truncate max-w-[130px] font-medium ${dark ? 'text-slate-200' : 'text-gray-800'}`}>
                                {p.subject?.name || '—'}
                              </span>
                            </div>
                          </td>
                          {/* Tx ID */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5 max-w-[200px]">
                              <span className={`font-mono text-xs truncate ${dark ? 'text-slate-400' : 'text-gray-500'}`}>{p.txRef}</span>
                              <CopyButton text={p.txRef} dark={dark} />
                            </div>
                          </td>
                          {/* Amount */}
                          <td className="px-5 py-3.5 text-right">
                            <span className={`font-bold ${p.status === 'paid' ? 'text-emerald-600 dark:text-emerald-400' : dark ? 'text-slate-300' : 'text-gray-700'}`}>
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
                            <span className={`flex items-center gap-1.5 text-xs whitespace-nowrap ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                              <FiCalendar className="w-3 h-3 flex-shrink-0" />
                              {date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ── Pagination ── */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between gap-2 pt-1">
            <p className={`text-xs ${dark ? 'text-slate-500' : 'text-gray-400'} hidden sm:block`}>
              Page {page} / {totalPages} · {total.toLocaleString()} records
            </p>

            <div className="flex items-center gap-1.5 mx-auto sm:mx-0">
              {/* Prev */}
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous page"
                className={`p-2 rounded-xl border transition disabled:opacity-40 disabled:cursor-not-allowed ${
                  dark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                       : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>

              {/* Page pills — 3 on mobile, 5 on desktop */}
              <div className="flex items-center gap-1 sm:hidden">
                {buildPages(3).map(n => (
                  <button key={n} onClick={() => setPage(n)}
                    className={`w-9 h-9 rounded-xl text-sm font-bold border transition ${
                      n === page
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                        : dark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                               : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >{n}</button>
                ))}
              </div>
              <div className="hidden sm:flex items-center gap-1">
                {buildPages(5).map(n => (
                  <button key={n} onClick={() => setPage(n)}
                    className={`w-9 h-9 rounded-xl text-sm font-bold border transition ${
                      n === page
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                        : dark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                               : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >{n}</button>
                ))}
              </div>

              {/* Next */}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Next page"
                className={`p-2 rounded-xl border transition disabled:opacity-40 disabled:cursor-not-allowed ${
                  dark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                       : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
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
