import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../store/theme/ThemeContext';
import { adminLookupPayment } from '../../api/payment.api';
import toast from 'react-hot-toast';
import {
  FiArrowLeft, FiSearch, FiX, FiCheckCircle, FiXCircle,
  FiClock, FiAlertCircle, FiHash, FiDollarSign, FiBook,
  FiUser, FiCalendar, FiCreditCard, FiInfo, FiRefreshCw,
  FiCopy, FiCheck,
} from 'react-icons/fi';

// ── Status map ────────────────────────────────────────────────────────────────
const STATUS = {
  paid: {
    icon:  FiCheckCircle,
    cls:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
    ring:  'ring-emerald-500/30',
    label: 'Paid',
  },
  pending: {
    icon:  FiClock,
    cls:   'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
    ring:  'ring-amber-500/30',
    label: 'Pending',
  },
  failed: {
    icon:  FiXCircle,
    cls:   'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
    ring:  'ring-red-500/30',
    label: 'Failed',
  },
  refunded: {
    icon:  FiRefreshCw,
    cls:   'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
    ring:  'ring-purple-500/30',
    label: 'Refunded',
  },
  cancelled: {
    icon:  FiAlertCircle,
    cls:   'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
    ring:  'ring-slate-500/30',
    label: 'Cancelled',
  },
};

const METHOD_LABEL = {
  telebirr:       'Telebirr',
  cbebirr:        'CBE Birr',
  boa:            'Bank of Abyssinia (BOA)',
  dashen_bank:    'Dashen Bank',
  awash_bank:     'Awash Bank',
  abyssinia_bank: 'Abyssinia Bank',
  mpesa:          'M-Pesa',
  hello_cash:     'Hello Cash',
  ebirr:          'eBirr',
  card:           'Debit / Credit Card',
};

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
      title={copied ? 'Copied!' : 'Copy'}
      aria-label="Copy"
      className={`flex-shrink-0 p-1.5 rounded-lg transition active:scale-90 ${
        copied
          ? 'text-emerald-500'
          : dark
            ? 'text-slate-500 hover:text-slate-200 hover:bg-slate-600'
            : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
      }`}
    >
      {copied ? <FiCheck className="w-3.5 h-3.5" /> : <FiCopy className="w-3.5 h-3.5" />}
    </button>
  );
}

// ── DetailRow — stacks on xs, inline on sm+ ───────────────────────────────────
function DetailRow({ icon: Icon, label, value, mono = false, accent = false, copyable = false, dark }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-0.5 sm:gap-4 py-2.5 border-b last:border-b-0 border-slate-100 dark:border-slate-700/60">
      <span className={`flex items-center gap-2 text-xs sm:text-sm flex-shrink-0 sm:w-36 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
        {label}
      </span>
      <div className={`flex items-center gap-1.5 sm:justify-end min-w-0 ${
        accent ? 'text-emerald-600 dark:text-emerald-400 font-extrabold text-base' :
        mono   ? `font-mono text-xs ${dark ? 'text-slate-300' : 'text-gray-600'}` :
                 `font-medium text-sm ${dark ? 'text-slate-100' : 'text-gray-900'}`
      }`}>
        <span className="break-all sm:text-right">{value}</span>
        {copyable && <CopyButton text={String(value)} dark={dark} />}
      </div>
    </div>
  );
}

// ── SectionCard ───────────────────────────────────────────────────────────────
function SectionCard({ title, icon: Icon, iconCls, children, dark }) {
  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden ${
      dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
    }`}>
      <div className={`flex items-center gap-3 px-4 py-3.5 border-b ${
        dark ? 'border-slate-700 bg-slate-800/80' : 'border-gray-100 bg-gray-50/80'
      }`}>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconCls}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h2 className={`font-bold text-sm ${dark ? 'text-slate-200' : 'text-gray-700'}`}>{title}</h2>
      </div>
      <div className="px-4 py-0.5">
        {children}
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function AdminVerifyPayment() {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const [query,    setQuery]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [notFound, setNotFound] = useState(false);
  const inputRef = useRef(null);

  const reset = () => { setResult(null); setNotFound(false); };

  const handleClear = () => { setQuery(''); reset(); inputRef.current?.focus(); };

  const handleLookup = async (e) => {
    e?.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) { toast.error('Enter a transaction ID first'); return; }
    setLoading(true);
    reset();
    try {
      const res = await adminLookupPayment(trimmed);
      setResult(res.data);
    } catch (err) {
      if (err.message?.toLowerCase().includes('not found') || err.status === 404) {
        setNotFound(true);
      } else {
        toast.error(err.message || 'Lookup failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const st         = result ? (STATUS[result.status] || STATUS.pending) : null;
  const StIcon     = st?.icon;
  const student    = result?.student;
  const subject    = result?.subject;
  const enrollment = result?.enrollment;

  return (
    <div className={`min-h-screen ${dark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-2xl mx-auto px-3 py-4 md:px-8 md:py-8 space-y-5">

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
          <div>
            <h1 className={`text-xl md:text-2xl font-extrabold leading-tight ${dark ? 'text-white' : 'text-gray-900'}`}>
              🔍 Verify Payment
            </h1>
            <p className={`text-xs md:text-sm mt-0.5 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
              Enter a transaction ID to inspect its full details
            </p>
          </div>
        </div>

        {/* ── Search form — stacks on mobile, inline on sm ── */}
        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-2">
          {/* Input */}
          <div className={`flex items-center gap-2 flex-1 px-3 py-2.5 rounded-2xl border transition-all ${
            dark
              ? 'bg-slate-800 border-slate-700 focus-within:border-amber-500/60 focus-within:ring-2 focus-within:ring-amber-500/20'
              : 'bg-white border-gray-200 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20'
          }`}>
            <FiHash className={`w-4 h-4 flex-shrink-0 ${dark ? 'text-slate-400' : 'text-gray-400'}`} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); reset(); }}
              placeholder="Paste transaction ID here…"
              className={`flex-1 bg-transparent text-sm font-mono outline-none placeholder:font-sans ${
                dark ? 'text-slate-100 placeholder:text-slate-500' : 'text-gray-900 placeholder:text-gray-400'
              }`}
              autoFocus
              autoComplete="off"
              spellCheck={false}
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear"
                className={`p-1 rounded-lg transition flex-shrink-0 ${
                  dark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Lookup button — full-width on xs, auto on sm */}
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed ${
              dark ? 'bg-amber-500 hover:bg-amber-400 text-slate-900'
                   : 'bg-amber-500 hover:bg-amber-600 text-white'
            }`}
          >
            {loading
              ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              : <FiSearch className="w-4 h-4" />
            }
            {loading ? 'Looking up…' : 'Lookup'}
          </button>
        </form>

        {/* ── Hint under search ── */}
        {!result && !notFound && !loading && (
          <p className={`text-xs text-center ${dark ? 'text-slate-600' : 'text-gray-300'}`}>
            e.g. <span className="font-mono">lihiket-xxxxxx-xxxxxx-xxxxxxxx</span>
          </p>
        )}

        {/* ── Not found ── */}
        {notFound && (
          <div className={`rounded-2xl border p-8 text-center shadow-sm ${
            dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          }`}>
            <FiAlertCircle className={`w-10 h-10 mx-auto mb-3 ${dark ? 'text-slate-600' : 'text-gray-300'}`} />
            <p className={`font-bold ${dark ? 'text-slate-300' : 'text-gray-700'}`}>Transaction not found</p>
            <p className={`text-sm mt-1 ${dark ? 'text-slate-500' : 'text-gray-500'}`}>
              No record matches <span className="font-mono font-semibold break-all">"{query.trim()}"</span>.
              Double-check and try again.
            </p>
          </div>
        )}

        {/* ── Result ── */}
        {result && (
          <div className="space-y-4">

            {/* Status banner */}
            <div className={`rounded-2xl border p-4 flex items-center gap-4 shadow-sm ring-1 ${
              dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
            } ${st?.ring}`}>
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${st?.cls}`}>
                <StIcon className="w-6 h-6 md:w-7 md:h-7" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-lg font-extrabold ${dark ? 'text-white' : 'text-gray-900'}`}>
                    ETB {Number(result.amount || 0).toLocaleString()}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${st?.cls}`}>
                    {st?.label}
                  </span>
                </div>
                {/* Tx ref + copy */}
                <div className="flex items-center gap-1 mt-1 min-w-0">
                  <p className={`text-xs font-mono truncate ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                    {result.txRef}
                  </p>
                  <CopyButton text={result.txRef} dark={dark} />
                </div>
              </div>
            </div>

            {/* Transaction details */}
            <SectionCard
              title="Transaction Details"
              icon={FiCreditCard}
              iconCls={dark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}
              dark={dark}
            >
              <DetailRow dark={dark} icon={FiHash}       label="Transaction ID" value={result.txRef}       mono copyable />
              <DetailRow dark={dark} icon={FiHash}       label="Chapa Ref"      value={result.chapaRef}    mono />
              <DetailRow dark={dark} icon={FiDollarSign} label="Amount"         value={`ETB ${Number(result.amount || 0).toLocaleString()}`} accent />
              <DetailRow dark={dark} icon={FiInfo}       label="Currency"       value={result.currency || 'ETB'} />
              <DetailRow dark={dark} icon={FiCreditCard} label="Method"         value={result.paymentMethod ? (METHOD_LABEL[result.paymentMethod] || result.paymentMethod) : 'Not specified'} />
              <DetailRow dark={dark} icon={FiInfo}       label="Status"         value={st?.label} />
              <DetailRow dark={dark} icon={FiCalendar}   label="Initiated"      value={result.createdAt ? new Date(result.createdAt).toLocaleString() : null} />
              <DetailRow dark={dark} icon={FiCalendar}   label="Paid at"        value={result.paidAt    ? new Date(result.paidAt).toLocaleString()    : null} />
              <DetailRow dark={dark} icon={FiCalendar}   label="Failed at"      value={result.failedAt  ? new Date(result.failedAt).toLocaleString()  : null} />
              <DetailRow dark={dark} icon={FiInfo}       label="IP address"     value={result.initiatedFrom} mono />
            </SectionCard>

            {/* Subject */}
            {subject && (
              <SectionCard
                title="Subject / Course"
                icon={FiBook}
                iconCls={dark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}
                dark={dark}
              >
                <DetailRow dark={dark} icon={FiBook}       label="Name"        value={subject.name} />
                <DetailRow dark={dark} icon={FiInfo}       label="Code"        value={subject.code} />
                <DetailRow dark={dark} icon={FiInfo}       label="Grade Level" value={subject.gradeLevel} />
                <DetailRow dark={dark} icon={FiDollarSign} label="Price"       value={subject.price != null ? `ETB ${Number(subject.price).toLocaleString()}` : null} />
              </SectionCard>
            )}

            {/* Student */}
            {student && (
              <SectionCard
                title="Student"
                icon={FiUser}
                iconCls={dark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'}
                dark={dark}
              >
                <DetailRow dark={dark} icon={FiUser} label="Full Name"   value={[student.firstName, student.lastName].filter(Boolean).join(' ') || '—'} />
                <DetailRow dark={dark} icon={FiInfo} label="Student ID"  value={student.userId} mono />
                <DetailRow dark={dark} icon={FiInfo} label="Email"       value={student.email}  mono copyable />
                <DetailRow dark={dark} icon={FiInfo} label="Phone"       value={student.phone} />
                <DetailRow dark={dark} icon={FiInfo} label="Grade Level" value={student.gradeLevel} />
              </SectionCard>
            )}

            {/* Enrollment */}
            {enrollment && (
              <SectionCard
                title="Enrollment Status"
                icon={FiCheckCircle}
                iconCls={dark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600'}
                dark={dark}
              >
                <DetailRow dark={dark} icon={FiInfo}       label="Status"         value={enrollment.status} />
                <DetailRow dark={dark} icon={FiInfo}       label="Payment Status" value={enrollment.paymentStatus} />
                <DetailRow dark={dark} icon={FiDollarSign} label="Amount Paid"    value={enrollment.amountPaid > 0 ? `ETB ${Number(enrollment.amountPaid).toLocaleString()}` : null} />
                <DetailRow dark={dark} icon={FiCalendar}   label="Enrolled at"    value={enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleString() : null} />
                <DetailRow dark={dark} icon={FiCalendar}   label="Paid at"        value={enrollment.paidAt     ? new Date(enrollment.paidAt).toLocaleString()     : null} />
              </SectionCard>
            )}

          </div>
        )}

        {/* ── Idle placeholder ── */}
        {!result && !notFound && !loading && (
          <div className={`rounded-2xl border border-dashed p-10 text-center ${
            dark ? 'border-slate-700' : 'border-gray-200'
          }`}>
            <FiSearch className={`w-10 h-10 mx-auto mb-3 ${dark ? 'text-slate-700' : 'text-gray-300'}`} />
            <p className={`text-sm font-medium ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
              Paste a transaction ID above and tap <span className="font-bold">Lookup</span>
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
