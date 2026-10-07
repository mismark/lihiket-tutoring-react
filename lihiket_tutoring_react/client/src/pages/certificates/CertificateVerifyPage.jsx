import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTheme } from '../../store/theme/ThemeContext';
import { verifyCertificate } from '../../api/certificate.api';
import {
  FiAward, FiCheckCircle, FiXCircle, FiLoader,
  FiCalendar, FiBook, FiHash, FiAlertCircle,
} from 'react-icons/fi';

function fmt(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function CertificateVerifyPage() {
  const { certId }  = useParams();
  const { theme }   = useTheme();
  const dark        = theme === 'dark';

  const [state,  setState]  = useState('loading'); // 'loading' | 'valid' | 'revoked' | 'notfound' | 'error'
  const [data,   setData]   = useState(null);

  useEffect(() => {
    if (!certId) { setState('notfound'); return; }
    verifyCertificate(certId)
      .then(res => {
        if (!res.success || !res.data) { setState('notfound'); return; }
        setData(res.data);
        setState(res.valid ? 'valid' : 'revoked');
      })
      .catch(() => setState('error'));
  }, [certId]);

  // ── loading ──────────────────────────────────────────────────────────────────
  if (state === 'loading') {
    return (
      <div className={`min-h-screen flex items-center justify-center ${dark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className={`text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Verifying certificate…</p>
        </div>
      </div>
    );
  }

  // ── not found / error ────────────────────────────────────────────────────────
  if (state === 'notfound' || state === 'error') {
    return (
      <div className={`min-h-screen flex items-center justify-center px-4 ${dark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className={`max-w-md w-full rounded-2xl border p-10 text-center ${
          dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <FiAlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h1 className={`text-xl font-bold mb-2 ${dark ? 'text-white' : 'text-slate-900'}`}>
            Certificate Not Found
          </h1>
          <p className={`text-sm mb-6 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
            The certificate ID <span className="font-mono font-bold">{certId}</span> could not be found
            in our system. Please double-check the ID and try again.
          </p>
          <Link to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  // ── valid / revoked ───────────────────────────────────────────────────────────
  const isValid = state === 'valid';

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-10 ${dark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className={`max-w-lg w-full rounded-2xl border overflow-hidden shadow-lg ${
        dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}>

        {/* Status band */}
        <div className={`h-2 w-full ${isValid ? 'bg-gradient-to-r from-amber-400 to-yellow-500' : 'bg-red-500'}`} />

        <div className="p-8 space-y-6">

          {/* Status header */}
          <div className="flex flex-col items-center text-center gap-3">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              isValid
                ? dark ? 'bg-emerald-500/20' : 'bg-emerald-100'
                : dark ? 'bg-red-500/20'     : 'bg-red-100'
            }`}>
              {isValid
                ? <FiCheckCircle className="w-8 h-8 text-emerald-500" />
                : <FiXCircle     className="w-8 h-8 text-red-500" />
              }
            </div>
            <div>
              <h1 className={`text-xl font-extrabold ${dark ? 'text-white' : 'text-slate-900'}`}>
                {isValid ? 'Valid Certificate' : 'Revoked Certificate'}
              </h1>
              <p className={`text-sm mt-1 ${isValid ? 'text-emerald-500' : 'text-red-500'}`}>
                {isValid
                  ? 'This certificate is authentic and currently valid.'
                  : 'This certificate has been revoked and is no longer valid.'}
              </p>
            </div>
          </div>

          {/* Details */}
          {data && (
            <div className={`rounded-xl border p-5 space-y-3 ${
              dark ? 'border-slate-700 bg-slate-700/30' : 'border-slate-100 bg-slate-50'
            }`}>
              {/* Recipient */}
              <div>
                <p className={`text-xs uppercase tracking-wider font-semibold mb-1 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Awarded To
                </p>
                <p className={`text-lg font-extrabold ${dark ? 'text-white' : 'text-slate-900'}`}>
                  {data.studentName}
                </p>
                {data.studentId && (
                  <p className={`text-xs font-mono ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                    ID: {data.studentId}
                  </p>
                )}
              </div>

              <div className={`border-t ${dark ? 'border-slate-600' : 'border-slate-200'}`} />

              {/* Subject */}
              <div className="flex items-start gap-2">
                <FiBook className={`w-4 h-4 mt-0.5 flex-shrink-0 ${dark ? 'text-blue-400' : 'text-blue-500'}`} />
                <div>
                  <p className={`text-sm font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
                    {data.subjectName}
                  </p>
                  {data.subjectCode && (
                    <p className={`text-xs font-mono ${dark ? 'text-blue-400' : 'text-blue-600'}`}>
                      {data.subjectCode} · {data.gradeLevel}
                    </p>
                  )}
                </div>
              </div>

              {/* Grade */}
              {data.grade && (
                <div className="flex items-center gap-2">
                  <FiAward className={`w-4 h-4 flex-shrink-0 ${dark ? 'text-amber-400' : 'text-amber-500'}`} />
                  <p className={`text-sm font-semibold ${dark ? 'text-amber-300' : 'text-amber-600'}`}>
                    Grade: {data.grade}
                  </p>
                </div>
              )}

              {/* Dates */}
              <div className="flex items-center gap-2">
                <FiCalendar className={`w-4 h-4 flex-shrink-0 ${dark ? 'text-slate-400' : 'text-slate-400'}`} />
                <p className={`text-sm ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Completed {fmt(data.completionDate)} · Issued {fmt(data.issuedAt)}
                </p>
              </div>

              {/* Certificate ID */}
              <div className="flex items-center gap-2">
                <FiHash className={`w-4 h-4 flex-shrink-0 ${dark ? 'text-slate-500' : 'text-slate-400'}`} />
                <p className={`text-xs font-mono ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {data.certificateId}
                </p>
              </div>

              {/* Revoke reason */}
              {!isValid && data.revokedReason && (
                <div className={`mt-2 px-3 py-2 rounded-lg text-xs ${
                  dark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'
                }`}>
                  Revoked reason: {data.revokedReason}
                </div>
              )}
            </div>
          )}

          {/* Platform stamp */}
          <div className={`flex items-center justify-center gap-2 text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
            <FiAward className="w-3.5 h-3.5 text-amber-500" />
            <span>Issued by <span className="font-semibold text-amber-500">Lihiket Tutoring</span></span>
          </div>

          <div className="text-center">
            <Link to="/"
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition ${
                dark
                  ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Go to Lihiket Tutoring
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
