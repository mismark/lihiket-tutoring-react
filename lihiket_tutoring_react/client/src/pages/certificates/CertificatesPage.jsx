import { useState, useEffect } from 'react';
import { useAuth }  from '../../store/auth/AuthContext';
import { useTheme } from '../../store/theme/ThemeContext';
import {
  getMyCertificates,
  getCertificateDownloadUrl,
} from '../../api/certificate.api';
import {
  FiAward, FiDownload, FiCalendar, FiBook,
  FiCheckCircle, FiXCircle, FiAlertCircle,
  FiSearch, FiRefreshCw, FiHash, FiShield,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

// ── helpers ───────────────────────────────────────────────────────────────────
function fmt(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

// ── Certificate card ──────────────────────────────────────────────────────────
function CertCard({ cert }) {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const handleDownload = () => {
    const url = getCertificateDownloadUrl(cert._id);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`rounded-2xl border shadow-sm flex flex-col overflow-hidden transition-all hover:shadow-md ${
      dark
        ? 'bg-slate-800 border-slate-700 hover:border-amber-500/30'
        : 'bg-white  border-slate-200 hover:border-amber-400/50'
    }`}>

      {/* Top colour band */}
      <div className={`h-2 w-full ${cert.isValid ? 'bg-gradient-to-r from-amber-400 to-yellow-500' : 'bg-slate-400'}`} />

      <div className="p-5 flex flex-col gap-4 flex-1">

        {/* Icon + title */}
        <div className="flex items-start gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            cert.isValid
              ? dark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600'
              : dark ? 'bg-slate-700 text-slate-500'    : 'bg-slate-100 text-slate-400'
          }`}>
            <FiAward className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold text-base leading-tight ${dark ? 'text-white' : 'text-slate-900'}`}>
              {cert.subject?.name || 'Unknown Subject'}
            </h3>
            <p className={`text-xs mt-0.5 font-mono ${dark ? 'text-blue-400' : 'text-blue-600'}`}>
              {cert.subject?.code}
            </p>
          </div>

          {/* Valid / revoked badge */}
          {cert.isValid ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 flex-shrink-0">
              <FiCheckCircle className="w-3 h-3" /> Valid
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 flex-shrink-0">
              <FiXCircle className="w-3 h-3" /> Revoked
            </span>
          )}
        </div>

        {/* Details */}
        <div className="space-y-1.5">
          {cert.subject?.gradeLevel && (
            <div className={`flex items-center gap-2 text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              <FiBook className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{cert.subject.gradeLevel}</span>
            </div>
          )}
          <div className={`flex items-center gap-2 text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
            <FiCalendar className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Completed {fmt(cert.completionDate)}</span>
          </div>
          {cert.grade && (
            <div className={`flex items-center gap-2 text-sm font-semibold ${dark ? 'text-amber-400' : 'text-amber-600'}`}>
              <FiAward className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Grade: {cert.grade}</span>
            </div>
          )}
          <div className={`flex items-center gap-2 text-xs font-mono ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
            <FiHash className="w-3 h-3 flex-shrink-0" />
            <span>{cert.certificateId}</span>
          </div>
        </div>

        {/* Revoke reason */}
        {!cert.isValid && cert.revokedReason && (
          <p className={`text-xs px-3 py-2 rounded-lg ${
            dark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'
          }`}>
            Revoked: {cert.revokedReason}
          </p>
        )}
      </div>

      {/* Footer: download button */}
      {cert.isValid && (
        <div className={`px-5 pb-5`}>
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white transition shadow-sm"
          >
            <FiDownload className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      )}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function Empty({ dark }) {
  return (
    <div className={`rounded-2xl border p-12 text-center col-span-full ${
      dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
    }`}>
      <FiAward className={`w-12 h-12 mx-auto mb-4 ${dark ? 'text-slate-600' : 'text-slate-300'}`} />
      <p className={`font-semibold ${dark ? 'text-slate-300' : 'text-slate-700'}`}>No certificates yet</p>
      <p className={`text-sm mt-1 ${dark ? 'text-slate-500' : 'text-slate-500'}`}>
        Complete a subject to earn your certificate.
      </p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CertificatesPage() {
  const { theme }  = useTheme();
  const { user }   = useAuth();
  const dark       = theme === 'dark';

  const [certs,     setCerts]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,    setSearch]    = useState('');

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await getMyCertificates();
      setCerts(res.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load certificates');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = certs.filter(c => {
    const q = search.toLowerCase();
    return (
      !q ||
      c.subject?.name?.toLowerCase().includes(q) ||
      c.subject?.code?.toLowerCase().includes(q) ||
      c.certificateId?.toLowerCase().includes(q)
    );
  });

  const validCount   = certs.filter(c => c.isValid).length;
  const revokedCount = certs.length - validCount;

  return (
    <div className={`min-h-screen ${dark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                dark ? 'bg-amber-500/20' : 'bg-amber-100'
              }`}>
                <FiAward className="w-5 h-5 text-amber-500" />
              </div>
              <h1 className={`text-2xl font-extrabold ${dark ? 'text-white' : 'text-slate-900'}`}>
                My Certificates
              </h1>
            </div>
            <p className={`text-sm ml-13 pl-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              {user?.firstName} {user?.lastName} · {certs.length} total · {validCount} valid
            </p>
          </div>

          <button
            onClick={() => load(true)}
            disabled={refreshing}
            title="Refresh"
            className={`p-2.5 rounded-xl border transition ${
              dark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300'
                   : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
            }`}
          >
            <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Summary bar */}
        {!loading && certs.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Total',   value: certs.length, color: 'text-slate-700 dark:text-white',           bg: dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200' },
              { label: 'Valid',   value: validCount,   color: 'text-emerald-600 dark:text-emerald-400',   bg: dark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200' },
              { label: 'Revoked', value: revokedCount, color: 'text-red-600 dark:text-red-400',           bg: dark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`rounded-2xl border p-4 flex items-center gap-3 ${bg}`}>
                <FiAward className={`w-5 h-5 ${color}`} />
                <div>
                  <p className={`text-xl font-extrabold ${color}`}>{value}</p>
                  <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        {certs.length > 0 && (
          <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${
            dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          }`}>
            <FiSearch className={`w-4 h-4 flex-shrink-0 ${dark ? 'text-slate-400' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Search by subject name, code, or certificate ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`flex-1 bg-transparent outline-none text-sm placeholder:text-slate-400 ${
                dark ? 'text-white' : 'text-slate-900'
              }`}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className={`text-xs font-semibold ${dark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Certificate grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className={`mt-3 text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              Loading certificates…
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="grid grid-cols-1">
            {search ? (
              <div className={`rounded-2xl border p-10 text-center ${
                dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
              }`}>
                <FiSearch className={`w-10 h-10 mx-auto mb-3 ${dark ? 'text-slate-600' : 'text-slate-300'}`} />
                <p className={`font-semibold ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
                  No certificates match "{search}"
                </p>
              </div>
            ) : (
              <Empty dark={dark} />
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(cert => (
              <CertCard key={cert._id} cert={cert} />
            ))}
          </div>
        )}

        {/* Verify info panel */}
        <div className={`rounded-2xl border p-5 flex gap-4 ${
          dark ? 'bg-slate-800/60 border-slate-700' : 'bg-blue-50 border-blue-200'
        }`}>
          <FiShield className={`w-5 h-5 flex-shrink-0 mt-0.5 ${dark ? 'text-blue-400' : 'text-blue-600'}`} />
          <div>
            <p className={`text-sm font-semibold ${dark ? 'text-blue-300' : 'text-blue-700'}`}>
              Certificate Verification
            </p>
            <p className={`text-xs mt-1 ${dark ? 'text-slate-400' : 'text-blue-600'}`}>
              Anyone can verify the authenticity of your certificate by visiting{' '}
              <span className={`font-mono font-semibold ${dark ? 'text-blue-300' : 'text-blue-700'}`}>
                /certificates/verify/CERT-ID
              </span>.
              Share your Certificate ID to let employers or schools confirm it online.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
