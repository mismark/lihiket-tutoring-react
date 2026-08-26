import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../store/theme/ThemeContext';
import { getMyPayments } from '../../api/payment.api';
import toast from 'react-hot-toast';
import {
  FiArrowLeft, FiDollarSign, FiCheckCircle,
  FiXCircle, FiClock, FiBook, FiCalendar, FiHash,
} from 'react-icons/fi';

const STATUS_STYLE = {
  paid:    { icon: FiCheckCircle, cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400', label: 'Paid'    },
  pending: { icon: FiClock,       cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',         label: 'Pending' },
  failed:  { icon: FiXCircle,     cls: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',                 label: 'Failed'  },
};

export default function PaymentHistoryPage() {
  const { theme }    = useTheme();
  const dark         = theme === 'dark';
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    getMyPayments()
      .then(res => setPayments(res.data || []))
      .catch(err => toast.error(err.message || 'Failed to load payments'))
      .finally(() => setLoading(false));
  }, []);

  const totalPaid = payments
    .filter(p => p.paymentStatus === 'paid')
    .reduce((sum, p) => sum + (p.amountPaid || 0), 0);

  return (
    <div className={`min-h-screen p-4 md:p-8 ${dark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className={`p-2 rounded-xl border transition ${
            dark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700' : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-200'
          }`}>
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className={`text-2xl font-extrabold ${dark ? 'text-white' : 'text-gray-900'}`}>
              💳 Payment History
            </h1>
            <p className={`text-sm mt-0.5 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
              Your enrollment payments
            </p>
          </div>
        </div>

        {/* Summary card */}
        {!loading && payments.length > 0 && (
          <div className={`rounded-2xl border p-5 flex items-center gap-4 shadow-sm ${
            dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          }`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              dark ? 'bg-emerald-500/10' : 'bg-emerald-50'
            }`}>
              <FiDollarSign className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                ETB {totalPaid.toLocaleString()}
              </p>
              <p className={`text-xs font-medium mt-0.5 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                Total paid · {payments.filter(p => p.paymentStatus === 'paid').length} successful payment{payments.filter(p => p.paymentStatus === 'paid').length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className={`mt-3 text-sm ${dark ? 'text-slate-400' : 'text-gray-500'}`}>Loading payments…</p>
          </div>
        ) : payments.length === 0 ? (
          <div className={`rounded-2xl border p-12 text-center shadow-sm ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <FiDollarSign className={`w-12 h-12 mx-auto mb-4 ${dark ? 'text-slate-600' : 'text-gray-300'}`} />
            <p className={`font-semibold ${dark ? 'text-slate-300' : 'text-gray-700'}`}>No payments yet</p>
            <p className={`text-sm mt-1 ${dark ? 'text-slate-500' : 'text-gray-500'}`}>
              Enroll in a paid subject to see your payment history here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map(p => {
              const st      = STATUS_STYLE[p.paymentStatus] || STATUS_STYLE.pending;
              const StIcon  = st.icon;
              const subject = p.subject;
              return (
                <div key={p._id} className={`rounded-2xl border p-5 shadow-sm ${
                  dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    {/* Subject */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        dark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                      }`}>
                        <FiBook className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-bold truncate ${dark ? 'text-white' : 'text-gray-900'}`}>
                          {subject?.name || 'Unknown Subject'}
                        </p>
                        <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                          {subject?.code} · {subject?.gradeLevel}
                        </p>
                      </div>
                    </div>

                    {/* Status badge */}
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ${st.cls}`}>
                      <StIcon className="w-3.5 h-3.5" /> {st.label}
                    </span>
                  </div>

                  {/* Receipt details */}
                  <div className={`rounded-xl p-3 space-y-1.5 ${dark ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                    {p.amountPaid > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className={`flex items-center gap-1.5 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                          <FiDollarSign className="w-3.5 h-3.5" /> Amount
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          ETB {Number(p.amountPaid).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {p.paidAt && (
                      <div className="flex justify-between text-xs">
                        <span className={`flex items-center gap-1.5 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                          <FiCalendar className="w-3.5 h-3.5" /> Paid at
                        </span>
                        <span className={`font-medium ${dark ? 'text-slate-200' : 'text-gray-800'}`}>
                          {new Date(p.paidAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {p.txRef && (
                      <div className="flex justify-between text-xs gap-4">
                        <span className={`flex items-center gap-1.5 flex-shrink-0 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                          <FiHash className="w-3.5 h-3.5" /> Tx Ref
                        </span>
                        <span className={`font-mono text-xs truncate ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                          {p.txRef}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
