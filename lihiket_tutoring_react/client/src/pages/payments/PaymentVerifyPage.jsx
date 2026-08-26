import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTheme } from '../../store/theme/ThemeContext';
import { verifyPayment } from '../../api/payment.api';
import {
  FiCheckCircle, FiXCircle, FiLoader, FiArrowLeft,
  FiBook, FiCalendar, FiHash, FiDollarSign,
  FiRefreshCw, FiHome, FiAward,
} from 'react-icons/fi';

// ── receipt row ────────────────────────────────────────────────────────────────
function ReceiptRow({ icon: Icon, label, value, highlight, theme }) {
  const dark = theme === 'dark';
  if (!value && value !== 0) return null;
  return (
    <div className={`flex items-center justify-between py-2.5 border-b last:border-0 ${
      dark ? 'border-slate-700' : 'border-gray-100'
    }`}>
      <div className={`flex items-center gap-2 text-xs font-medium ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <span className={`text-xs font-bold ${
        highlight
          ? 'text-emerald-600 dark:text-emerald-400'
          : dark ? 'text-white' : 'text-gray-900'
      }`}>
        {value}
      </span>
    </div>
  );
}

export default function PaymentVerifyPage() {
  const [searchParams] = useSearchParams();
  const { theme }      = useTheme();
  const dark           = theme === 'dark';

  const [status,     setStatus]     = useState('loading'); // loading | success | failed
  const [message,    setMessage]    = useState('');
  const [enrollment, setEnrollment] = useState(null);
  const [retrying,   setRetrying]   = useState(false);

  const txRef = searchParams.get('tx_ref');

  const runVerify = (showRetrySpinner = false) => {
    if (!txRef) { setStatus('failed'); setMessage('No transaction reference found.'); return; }
    if (showRetrySpinner) setRetrying(true);

    verifyPayment(txRef)
      .then(res => {
        setStatus('success');
        setMessage(res.message || 'Enrollment confirmed!');
        setEnrollment(res.data || null);
      })
      .catch(err => {
        setStatus('failed');
        setMessage(err.message || 'Payment verification failed. Please try again.');
      })
      .finally(() => setRetrying(false));
  };

  useEffect(() => { runVerify(); }, [txRef]);

  const subject   = enrollment?.subject;
  const paidAt    = enrollment?.paidAt    ? new Date(enrollment.paidAt).toLocaleString()    : null;
  const amountPaid = enrollment?.amountPaid ? `ETB ${Number(enrollment.amountPaid).toLocaleString()}` : null;

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${dark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="w-full max-w-md space-y-4">

        {/* ── Main card ── */}
        <div className={`rounded-2xl border shadow-xl overflow-hidden ${
          dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        }`}>

          {/* Status banner */}
          <div className={`px-8 py-8 text-center ${
            status === 'success'
              ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
              : status === 'failed'
                ? 'bg-gradient-to-br from-red-500 to-rose-600'
                : dark ? 'bg-slate-700' : 'bg-blue-600'
          }`}>
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              {status === 'loading' && <FiLoader className="w-8 h-8 text-white animate-spin" />}
              {status === 'success' && <FiCheckCircle className="w-9 h-9 text-white" />}
              {status === 'failed'  && <FiXCircle    className="w-9 h-9 text-white" />}
            </div>
            <h1 className="text-xl font-extrabold text-white mb-1">
              {status === 'loading' ? 'Verifying Payment…'
               : status === 'success' ? 'Payment Successful!'
               : 'Payment Failed'}
            </h1>
            <p className="text-white/80 text-sm">
              {status === 'loading'
                ? 'Confirming your payment with Chapa'
                : message}
            </p>
          </div>

          {/* ── Success receipt ── */}
          {status === 'success' && (
            <div className="px-6 py-5 space-y-5">

              {/* Subject info */}
              {subject && (
                <div className={`flex items-center gap-3 p-4 rounded-xl ${
                  dark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'
                }`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    dark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-200 text-emerald-700'
                  }`}>
                    <FiBook className="w-6 h-6" />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
                      {subject.name}
                    </p>
                    <p className={`text-xs mt-0.5 ${dark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      {subject.gradeLevel} · {subject.category}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                      <FiCheckCircle className="w-3 h-3" /> Enrolled
                    </span>
                  </div>
                </div>
              )}

              {/* Receipt */}
              <div className={`rounded-xl border p-4 ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
                <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                  Payment Receipt
                </p>
                <ReceiptRow icon={FiHash}      label="Transaction Ref" value={txRef}      theme={theme} />
                <ReceiptRow icon={FiDollarSign} label="Amount Paid"    value={amountPaid} highlight theme={theme} />
                <ReceiptRow icon={FiCalendar}  label="Paid At"         value={paidAt}     theme={theme} />
                <ReceiptRow icon={FiBook}      label="Subject Code"    value={subject?.code} theme={theme} />
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2.5">
                <Link
                  to="/dashboard"
                  className="w-full py-3 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white transition text-center flex items-center justify-center gap-2"
                >
                  <FiHome className="w-4 h-4" /> Go to Dashboard
                </Link>
                <Link
                  to="/profile"
                  className={`w-full py-2.5 rounded-xl font-semibold text-sm transition text-center flex items-center justify-center gap-2 ${
                    dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FiAward className="w-4 h-4" /> View My Profile
                </Link>
              </div>
            </div>
          )}

          {/* ── Failed state ── */}
          {status === 'failed' && (
            <div className="px-6 py-6 space-y-4">
              <div className={`p-4 rounded-xl border text-sm ${
                dark ? 'bg-red-500/10 border-red-500/20 text-slate-300' : 'bg-red-50 border-red-200 text-gray-700'
              }`}>
                <p className="font-semibold mb-1">What may have happened:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Payment was cancelled or timed out</li>
                  <li>Insufficient funds or card declined</li>
                  <li>Network issue during payment</li>
                </ul>
              </div>

              {/* Tx ref for support */}
              {txRef && (
                <div className={`p-3 rounded-xl text-xs font-mono break-all ${
                  dark ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-500'
                }`}>
                  Ref: {txRef}
                </div>
              )}

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => runVerify(true)}
                  disabled={retrying}
                  className="w-full py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {retrying
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Checking…</>
                    : <><FiRefreshCw className="w-4 h-4" /> Check Again</>
                  }
                </button>
                <Link
                  to="/dashboard"
                  className={`w-full py-2.5 rounded-xl font-semibold text-sm transition text-center flex items-center justify-center gap-2 ${
                    dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FiArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>
              </div>
            </div>
          )}

          {/* ── Loading state footer ── */}
          {status === 'loading' && (
            <div className="px-6 py-6 text-center">
              <p className={`text-xs ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
                Do not close this page — this usually takes just a few seconds
              </p>
            </div>
          )}
        </div>

        {/* ── Test mode hint ── */}
        {import.meta.env.DEV && (
          <div className={`rounded-xl border p-4 text-xs space-y-1 ${
            dark ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-700'
          }`}>
            <p className="font-bold">🧪 Test Mode — Chapa Test Credentials</p>
            <p>Card: <span className="font-mono">4242 4242 4242 4242</span>  Exp: <span className="font-mono">12/26</span>  CVV: <span className="font-mono">123</span></p>
            <p>Telebirr / CBE test options are shown on the Chapa checkout page</p>
          </div>
        )}

        {/* Lihiket branding */}
        <p className={`text-center text-xs ${dark ? 'text-slate-600' : 'text-gray-400'}`}>
          Secured by <span className="font-semibold">Chapa</span> · Lihiket Tutoring Platform
        </p>
      </div>
    </div>
  );
}
