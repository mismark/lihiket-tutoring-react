/**
 * PaymentCheckoutPage
 *
 * Shows:
 *  - Subject details + price
 *  - Payment method selector (Telebirr, CBE, BOA, Dashen, M-Pesa, card…)
 *  - Pay button → redirects to Chapa hosted checkout
 *
 * Route: /payment/checkout?subjectId=...
 */
import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../store/theme/ThemeContext';
import { getSubjectById } from '../../api/subject.api';
import { initiatePayment } from '../../api/payment.api';
import {
  FiArrowLeft, FiCheckCircle, FiLock, FiShield,
  FiBook, FiLoader, FiAlertCircle,
} from 'react-icons/fi';

// ── Payment method icon components ───────────────────────────────────────────
// Using SVG text badges since no icon pack has Ethiopian bank logos
const METHOD_META = {
  telebirr:       { label: 'Telebirr',        badge: 'TB',  color: 'from-blue-500 to-blue-700',     text: 'Ethio Telecom mobile money'   },
  cbebirr:        { label: 'CBE Birr',         badge: 'CBE', color: 'from-green-600 to-green-800',   text: 'Commercial Bank of Ethiopia'  },
  boa:            { label: 'BOA',              badge: 'BOA', color: 'from-red-600 to-red-800',       text: 'Bank of Abyssinia'            },
  dashen_bank:    { label: 'Dashen Bank',      badge: 'DB',  color: 'from-purple-600 to-purple-800', text: 'Dashen Bank mobile banking'   },
  awash_bank:     { label: 'Awash Bank',       badge: 'AB',  color: 'from-amber-600 to-amber-700',   text: 'Awash Bank internet banking'  },
  abyssinia_bank: { label: 'Abyssinia Bank',   badge: 'AIB', color: 'from-teal-600 to-teal-800',    text: 'Abyssinia Bank'               },
  mpesa:          { label: 'M-Pesa',           badge: 'MP',  color: 'from-green-500 to-emerald-700', text: 'Safaricom M-Pesa'             },
  hello_cash:     { label: 'Hello Cash',       badge: 'HC',  color: 'from-orange-500 to-orange-700', text: 'Lion International Bank'      },
  ebirr:          { label: 'eBirr',            badge: 'EB',  color: 'from-blue-600 to-indigo-700',   text: 'Cooperative Bank of Oromia'   },
  card:           { label: 'Debit / Credit',   badge: '💳',  color: 'from-slate-600 to-slate-800',   text: 'Visa / Mastercard'            },
};

function MethodCard({ value, selected, onSelect, theme }) {
  const dark = theme === 'dark';
  const m = METHOD_META[value];
  if (!m) return null;

  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all text-left w-full ${
        selected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 shadow-sm'
          : dark
            ? 'border-slate-700 hover:border-slate-600 hover:bg-slate-700/40'
            : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
      }`}
    >
      {/* Badge */}
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0 shadow-sm`}>
        {m.badge}
      </div>

      {/* Label */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold leading-tight ${dark ? 'text-white' : 'text-slate-900'}`}>
          {m.label}
        </p>
        <p className={`text-xs mt-0.5 truncate ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
          {m.text}
        </p>
      </div>

      {/* Checkmark */}
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
        selected
          ? 'bg-blue-600 border-blue-600'
          : dark ? 'border-slate-600' : 'border-slate-300'
      }`}>
        {selected && <FiCheckCircle className="w-3 h-3 text-white" strokeWidth={3} />}
      </div>
    </button>
  );
}

export default function PaymentCheckoutPage() {
  const [searchParams]         = useSearchParams();
  const navigate               = useNavigate();
  const { theme }              = useTheme();
  const dark                   = theme === 'dark';

  const subjectId              = searchParams.get('subjectId');

  const [subject,   setSubject]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [method,    setMethod]    = useState('telebirr'); // default to most popular
  const [paying,    setPaying]    = useState(false);
  const [error,     setError]     = useState('');

  // Load subject info
  useEffect(() => {
    if (!subjectId) { setLoading(false); return; }
    getSubjectById(subjectId)
      .then(res => setSubject(res.data))
      .catch(() => setError('Subject not found'))
      .finally(() => setLoading(false));
  }, [subjectId]);

  const handlePay = async () => {
    if (!subjectId || !method) return;
    setError('');
    setPaying(true);
    try {
      const res = await initiatePayment(subjectId, method);
      if (res.checkoutUrl) {
        // Redirect to Chapa hosted checkout
        window.location.href = res.checkoutUrl;
      } else {
        setError('Could not get payment URL. Please try again.');
        setPaying(false);
      }
    } catch (err) {
      setError(err.message || 'Payment initiation failed. Please try again.');
      setPaying(false);
    }
  };

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${dark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <FiLoader className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  if (!subjectId || (!loading && !subject && !error)) return (
    <div className={`min-h-screen flex items-center justify-center ${dark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="text-center">
        <FiAlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="font-semibold text-slate-700 dark:text-slate-300">No subject selected</p>
        <Link to="/subjects" className="mt-3 text-sm text-blue-500 hover:text-blue-600">Browse Subjects</Link>
      </div>
    </div>
  );

  const price = subject?.price ? `ETB ${Number(subject.price).toLocaleString()}` : '—';

  return (
    <div className={`min-h-screen ${dark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="max-w-lg mx-auto px-4 py-10">

        {/* Back */}
        <button onClick={() => navigate(-1)}
          className={`flex items-center gap-2 text-sm font-semibold mb-6 transition ${
            dark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
          }`}>
          <FiArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Subject card */}
        {subject && (
          <div className={`rounded-2xl border p-5 mb-6 shadow-sm ${
            dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <FiBook className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className={`text-lg font-extrabold ${dark ? 'text-white' : 'text-slate-900'}`}>
                  {subject.name}
                </h2>
                <p className={`text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {subject.gradeLevel}{subject.category ? ` · ${subject.category}` : ''}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                  {price}
                </p>
                <p className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>one-time</p>
              </div>
            </div>

            {/* What you get */}
            <div className={`mt-4 pt-4 border-t flex flex-wrap gap-x-4 gap-y-1 text-xs ${
              dark ? 'border-slate-700 text-slate-400' : 'border-slate-100 text-slate-500'
            }`}>
              {['Full course access', 'All lessons & materials', 'Assignments & exams', 'Live classes', 'Certificate on completion'].map(item => (
                <span key={item} className="flex items-center gap-1">
                  <FiCheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" /> {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Payment method selector */}
        <div className={`rounded-2xl border p-5 mb-5 shadow-sm ${
          dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${
            dark ? 'text-slate-400' : 'text-slate-500'
          }`}>
            Choose Payment Method
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {Object.keys(METHOD_META).map(value => (
              <MethodCard
                key={value}
                value={value}
                selected={method === value}
                onSelect={setMethod}
                theme={theme}
              />
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm mb-4">
            <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Pay button */}
        <button
          onClick={handlePay}
          disabled={paying || !method}
          className="w-full py-4 rounded-2xl font-extrabold text-base text-white
                     bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90
                     transition shadow-lg shadow-blue-600/30 disabled:opacity-50
                     disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-3"
        >
          {paying
            ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Redirecting to payment…</>
            : <><FiLock className="w-5 h-5" /> Pay {price} with {METHOD_META[method]?.label || 'Chapa'}</>
          }
        </button>

        {/* Security note */}
        <div className={`flex items-center justify-center gap-2 mt-4 text-xs ${
          dark ? 'text-slate-500' : 'text-slate-400'
        }`}>
          <FiShield className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          Secured by Chapa · 256-bit SSL encryption · Your payment info is never stored on our servers
        </div>

        {/* Test mode banner */}
        {import.meta.env.DEV && (
          <div className={`mt-6 rounded-xl border p-4 text-xs space-y-1.5 ${
            dark ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <p className="font-bold text-sm">Test Mode — Chapa Sandbox</p>
            <div className="space-y-1">
              <p><span className="font-semibold">Card:</span> 4242 4242 4242 4242 · Exp: 12/26 · CVV: 123</p>
              <p><span className="font-semibold">Telebirr / CBE / other:</span> Use test options on the Chapa checkout page</p>
              <p><span className="font-semibold">OTP:</span> 123456 (for all test mobile payments)</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
