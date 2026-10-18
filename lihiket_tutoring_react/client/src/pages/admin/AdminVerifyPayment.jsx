import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../store/theme/ThemeContext';
import { adminLookupPayment } from '../../api/payment.api';
import toast from 'react-hot-toast';
import {
  FiArrowLeft, FiSearch, FiX, FiCheckCircle, FiXCircle,
  FiClock, FiAlertCircle, FiHash, FiDollarSign, FiBook,
  FiUser, FiCalendar, FiCreditCard, FiInfo, FiRefreshCw,
} from 'react-icons/fi';

// ── Status presentation map ────────────────────────────────────────────────────
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

// ── Payment method display names ───────────────────────────────────────────────
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

// ── Small helper components ────────────────────────────────────────────────────

function DetailRow({ icon: Icon, label, value, mono = false, accent = false }) {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b last:border-b-0 border-slate-100 dark:border-slate-700/60">
      <span className={`flex items-center gap-2 text-sm flex-shrink-0 w-36 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
        {label}
      </span>
      <span className={`text-sm text-right break-all ${
        mono    ? 'font-mono'    : 'font-medium'
      } ${
        accent  ? 'text-emerald-600 dark:text-emerald-400 font-bold text-base' :
        dark    ? 'text-slate-100' : 'text-gray-900'
      }`}>
        {value}
      </span>
    </div>
  );
}

function SectionCard({ title, icon: Icon, iconCls, children, dark }) {
  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden ${
      dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
    }`}>
      <div className={`flex items-center gap-3 px-5 py-4 border-b ${
        dark ? 'border-slate-700 bg-slate-800/80' : 'border-gray-100 bg-gray-50/80'
      }`}>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconCls}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h2 className={`font-bold text-sm ${dark ? 'text-slate-200' : 'text-gray-700'}`}>{title}</h2>
      </div>
      <div className="px-5 py-1">
        {children}
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function AdminVerifyPayment() {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const [query,   setQuery]   = useState('');
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);   // payment data
  const [notFound, setNotFound] = useState(false);
  const inputRef = useRef(null);

  const handleClear = () => {
    setQuery('');
    setResult(null);
    setNotFound(false);
    inputRef.current?.focus();
  };

  const handleLookup = async (e) => {
    e?.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      toast.error('Enter a transaction ID first');
      return;
    }
    setLoading(true);
    setResult(null);
    setNotFound(false);
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

  // Derived display values
  const st         = result ? (STATUS[result.status] || STATUS.pending) : null;
  const StIcon     = st?.icon;
  const student    = result?.student;
  const subject    = result?.subject;
  const enrollment = result?.enrollment;

  return (
    <div className={`min-h-screen p-4 md:p-8 ${dark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-2xl mx-auto space-y-6">

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
              🔍 Verify Payment
            </h1>
            <p className={`text-sm mt-0.5 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
              Enter a transaction ID to inspect its full details
            </p>
          </div>
        </div>

        {/* ── Search bar ── */}
        <form onSubmit={handleLookup}>
          <div className={`flex items-center gap-2 rounded-2xl border px-4 py-3 shadow-sm transition-all ${
            dark
              ? 'bg-slate-800 border-slate-700 focus-within:border-amber-500/60 focus-within:ring-2 focus-within:ring-amber-500/20'
              : 'bg-white border-gray-200 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20'
          }`}>
            <FiHash className={`w-5 h-5 flex-shrink-0 ${dark ? 'text-slate-400' : 'text-gray-400'}`} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setResult(null); setNotFound(false); }}
              placeholder="e.g. lihiket-abc123-def456-a1b2c3d4"
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
                className={`p-1 rounded-lg transition ${dark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600'}`}
                aria-label="Clear"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed ${
                dark
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-900'
                  : 'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiSearch className="w-4 h-4" />
              )}
              {loading ? 'Looking up…' : 'Lookup'}
            </button>
          </div>
        </form>

        {/* ── Not found state ── */}
        {notFound && (
          <div className={`rounded-2xl border p-8 text-center shadow-sm ${
            dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          }`}>
            <FiAlertCircle className={`w-12 h-12 mx-auto mb-3 ${dark ? 'text-slate-600' : 'text-gray-300'}`} />
            <p className={`font-bold ${dark ? 'text-slate-300' : 'text-gray-700'}`}>
              Transaction not found
            </p>
            <p className={`text-sm mt-1 ${dark ? 'text-slate-500' : 'text-gray-500'}`}>
              No payment record matches <span className="font-mono font-semibold">"{query.trim()}"</span>.
              Double-check the transaction ID and try again.
            </p>
          </div>
        )}

        {/* ── Result ── */}
        {result && (
          <div className="space-y-4">

            {/* Status banner */}
            <div className={`rounded-2xl border p-5 flex items-center gap-4 shadow-sm ring-1 ${
              dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
            } ${st?.ring}`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${st?.cls}`}>
                <StIcon className="w-7 h-7" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-lg font-extrabold ${dark ? 'text-white' : 'text-gray-900'}`}>
                    ETB {Number(result.amount || 0).toLocaleString()}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${st?.cls}`}>
                    {st?.label}
                  </span>
                </div>
                <p className={`text-xs mt-1 font-mono truncate ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {result.txRef}
                </p>
              </div>
            </div>

            {/* Transaction details */}
            <SectionCard
              title="Transaction Details"
              icon={FiCreditCard}
              iconCls={dark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}
              dark={dark}
            >
              <DetailRow icon={FiHash}       label="Transaction ID" value={result.txRef}                           mono />
              <DetailRow icon={FiHash}       label="Chapa Ref"      value={result.chapaRef || '—'}                mono />
              <DetailRow icon={FiDollarSign} label="Amount"         value={`ETB ${Number(result.amount || 0).toLocaleString()}`} accent />
              <DetailRow icon={FiInfo}       label="Currency"       value={result.currency || 'ETB'} />
              <DetailRow icon={FiCreditCard} label="Method"         value={result.paymentMethod ? (METHOD_LABEL[result.paymentMethod] || result.paymentMethod) : 'Not specified'} />
              <DetailRow icon={FiInfo}       label="Status"         value={st?.label} />
              <DetailRow icon={FiCalendar}   label="Initiated"      value={result.createdAt  ? new Date(result.createdAt).toLocaleString()  : null} />
              <DetailRow icon={FiCalendar}   label="Paid at"        value={result.paidAt     ? new Date(result.paidAt).toLocaleString()     : null} />
              <DetailRow icon={FiCalendar}   label="Failed at"      value={result.failedAt   ? new Date(result.failedAt).toLocaleString()   : null} />
              <DetailRow icon={FiInfo}       label="Initiated from" value={result.initiatedFrom || null} mono />
            </SectionCard>

            {/* Subject details */}
            {subject && (
              <SectionCard
                title="Subject / Course"
                icon={FiBook}
                iconCls={dark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}
                dark={dark}
              >
                <DetailRow icon={FiBook}        label="Name"        value={subject.name} />
                <DetailRow icon={FiInfo}        label="Code"        value={subject.code} />
                <DetailRow icon={FiInfo}        label="Grade Level" value={subject.gradeLevel} />
                <DetailRow icon={FiDollarSign}  label="Price"       value={subject.price != null ? `ETB ${Number(subject.price).toLocaleString()}` : null} />
              </SectionCard>
            )}

            {/* Student details */}
            {student && (
              <SectionCard
                title="Student"
                icon={FiUser}
                iconCls={dark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'}
                dark={dark}
              >
                <DetailRow icon={FiUser}  label="Full Name"   value={[student.firstName, student.lastName].filter(Boolean).join(' ') || '—'} />
                <DetailRow icon={FiInfo}  label="Student ID"  value={student.userId}      mono />
                <DetailRow icon={FiInfo}  label="Email"       value={student.email}       mono />
                <DetailRow icon={FiInfo}  label="Phone"       value={student.phone} />
                <DetailRow icon={FiInfo}  label="Grade Level" value={student.gradeLevel} />
              </SectionCard>
            )}

            {/* Enrollment status */}
            {enrollment && (
              <SectionCard
                title="Enrollment Status"
                icon={FiCheckCircle}
                iconCls={dark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600'}
                dark={dark}
              >
                <DetailRow icon={FiInfo}       label="Status"         value={enrollment.status} />
                <DetailRow icon={FiInfo}       label="Payment Status" value={enrollment.paymentStatus} />
                <DetailRow icon={FiDollarSign} label="Amount Paid"    value={enrollment.amountPaid > 0 ? `ETB ${Number(enrollment.amountPaid).toLocaleString()}` : null} />
                <DetailRow icon={FiCalendar}   label="Enrolled at"    value={enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleString() : null} />
                <DetailRow icon={FiCalendar}   label="Paid at"        value={enrollment.paidAt     ? new Date(enrollment.paidAt).toLocaleString()     : null} />
              </SectionCard>
            )}

          </div>
        )}

        {/* ── Idle hint ── */}
        {!result && !notFound && !loading && (
          <div className={`rounded-2xl border border-dashed p-10 text-center ${
            dark ? 'border-slate-700' : 'border-gray-200'
          }`}>
            <FiSearch className={`w-10 h-10 mx-auto mb-3 ${dark ? 'text-slate-700' : 'text-gray-300'}`} />
            <p className={`text-sm font-medium ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
              Paste a transaction ID above and press <span className="font-bold">Lookup</span>
            </p>
            <p className={`text-xs mt-1 ${dark ? 'text-slate-600' : 'text-gray-300'}`}>
              Transaction IDs look like: <span className="font-mono">lihiket-xxxxxx-xxxxxx-xxxxxxxx</span>
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
