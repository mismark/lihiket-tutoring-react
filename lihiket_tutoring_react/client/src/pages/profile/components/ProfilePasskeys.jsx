import { useState, useEffect, useCallback } from 'react';
import {
  LuFingerprint, LuTrash2, LuPencil, LuPlus, LuCheck, LuX,
  LuShieldCheck, LuInfo,
} from 'react-icons/lu';
import { startRegistration } from '@simplewebauthn/browser';
import {
  listPasskeys, removePasskey, renamePasskey,
  webauthnRegisterBegin, webauthnRegisterFinish,
} from '../../../api/auth.api';
import { isWebAuthnSupported, isPlatformAuthenticatorAvailable } from '../../../utils/webauthn';
import { useTheme } from '../../../store/theme/ThemeContext';
import toast from 'react-hot-toast';
import { Section } from './profile.utils.jsx';

// ── helpers ──────────────────────────────────────────────────────────────────
function deviceLabel() {
  const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
  if (/Windows/i.test(ua)) return 'Windows device';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iPhone / iPad';
  if (/Mac/i.test(ua)) return 'Mac';
  if (/Android/i.test(ua)) return 'Android device';
  return 'This device';
}

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch {
    return '';
  }
}

/**
 * Fingerprint / passkey management tab.
 * - Enrols the current device as a passkey (registration ceremony)
 * - Lists enrolled devices with rename + remove
 */
export default function ProfilePasskeys() {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const [passkeys, setPasskeys]     = useState([]);
  const [loading,   setLoading]     = useState(true);
  const [adding,    setAdding]      = useState(false);
  const [hasPlatform, setHasPlatform] = useState(false);

  // inline rename state
  const [editingId, setEditingId] = useState(null);
  const [editName,  setEditName]  = useState('');

  // WebAuthn supported on this browser?
  const [supported] = useState(() => isWebAuthnSupported());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listPasskeys();
      setPasskeys(res.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load fingerprint devices.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    isPlatformAuthenticatorAvailable().then(setHasPlatform).catch(() => {});
  }, [load]);

  // ── Enrol the current device ───────────────────────────────────────────────
  const handleAdd = async () => {
    setAdding(true);
    try {
      const begin = await webauthnRegisterBegin();
      const attResp = await startRegistration({ optionsJSON: begin.data.options });
      await webauthnRegisterFinish({
        response: attResp,
        requestId: begin.data.requestId,
        deviceName: deviceLabel(),
      });
      toast.success('Fingerprint login enabled for this device.');
      await load();
    } catch (err) {
      const msg = String(err?.message || '').toLowerCase();
      if (
        msg.includes('cancel') ||
        msg.includes('not allowed') ||
        msg.includes('timed out') ||
        msg.includes('abort') ||
        msg.includes('excluded')
      ) {
        toast.error('Fingerprint setup was cancelled or this device is already enrolled.');
      } else {
        toast.error(err?.message || 'Could not set up fingerprint login.');
      }
    } finally {
      setAdding(false);
    }
  };

  // ── Remove a passkey ────────────────────────────────────────────────────────
  const handleRemove = async (id) => {
    if (!window.confirm('Remove fingerprint login for this device? You will not be able to sign in with it afterwards.')) return;
    try {
      await removePasskey(id);
      toast.success('Fingerprint login removed.');
      setPasskeys((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      toast.error(err.message || 'Failed to remove fingerprint login.');
    }
  };

  // ── Rename a passkey ────────────────────────────────────────────────────────
  const startEdit = (p) => { setEditingId(p.id); setEditName(p.deviceName || ''); };
  const cancelEdit = () => { setEditingId(null); setEditName(''); };

  const saveEdit = async (id) => {
    const name = editName.trim();
    if (!name) return;
    try {
      const res = await renamePasskey(id, name);
      setPasskeys((prev) => prev.map((p) => (p.id === id ? { ...p, deviceName: res.data.deviceName } : p)));
      toast.success('Label updated.');
      cancelEdit();
    } catch (err) {
      toast.error(err.message || 'Failed to update label.');
    }
  };

  // ── Not supported ───────────────────────────────────────────────────────────
  if (!supported) {
    return (
      <div className={`rounded-2xl border shadow-sm ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
        <div className="p-6">
          <Section title="Fingerprint Login" theme={theme}>
            <div className={`flex items-start gap-3 p-4 rounded-xl text-sm ${
              dark ? 'bg-amber-500/10 text-amber-300' : 'bg-amber-50 text-amber-700'
            }`}>
              <LuInfo className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p>
                Your current browser does not support fingerprint login.
                Use a modern browser (Chrome, Edge, Safari) over HTTPS — or
                <code> http://localhost</code> during development — to enable it.
              </p>
            </div>
          </Section>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border shadow-sm ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
      <div className="p-6 space-y-5">
        <Section title="Fingerprint Login" theme={theme}>

          {/* Info banner */}
          <div className={`flex items-start gap-3 p-4 rounded-xl text-sm ${
            dark ? 'bg-slate-700/50 text-slate-300' : 'bg-gray-50 text-gray-600'
          }`}>
            <LuFingerprint className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-500" />
            <div>
              <p>
                Sign in instantly with your device&rsquo;s fingerprint, Face&nbsp;ID, or Windows&nbsp;Hello.
                Your password still works and you can remove this any time.
              </p>
              <p className={`mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold ${
                hasPlatform ? 'text-emerald-500' : 'text-slate-400'
              }`}>
                <LuShieldCheck className="w-3.5 h-3.5" />
                {hasPlatform ? 'Biometric authenticator detected' : 'WebAuthn available (security key / passkey)'}
              </p>
            </div>
          </div>

          {/* Add button */}
          <button
            type="button"
            onClick={handleAdd}
            disabled={adding}
            className="w-full py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {adding ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Setting up…</span>
              </>
            ) : (
              <>
                <LuPlus className="w-4 h-4" />
                <span>Add fingerprint login</span>
              </>
            )}
          </button>

          {/* List */}
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[...Array(2)].map((_, i) => (
                <div key={i} className={`h-12 rounded-xl ${dark ? 'bg-slate-700' : 'bg-gray-200'}`} />
              ))}
            </div>
          ) : passkeys.length === 0 ? (
            <div className={`text-center py-6 rounded-xl border border-dashed text-sm ${
              dark ? 'border-slate-700 text-slate-500' : 'border-gray-200 text-gray-400'
            }`}>
              No fingerprint devices yet. Click <span className="font-semibold">&ldquo;Add fingerprint login&rdquo;</span> to set one up.
            </div>
          ) : (
            <ul className="space-y-2.5">
              {passkeys.map((p) => (
                <li
                  key={p.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    dark ? 'bg-slate-900/40 border-slate-700' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    dark ? 'bg-blue-500/15 text-blue-400' : 'bg-blue-100 text-blue-600'
                  }`}>
                    <LuFingerprint className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {editingId === p.id ? (
                      <input
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(p.id); if (e.key === 'Escape') cancelEdit(); }}
                        maxLength={60}
                        className={`w-full px-2 py-1 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          dark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    ) : (
                      <>
                        <p className={`text-sm font-semibold truncate ${dark ? 'text-slate-200' : 'text-gray-800'}`}>
                          {p.deviceName || 'Unnamed device'}
                        </p>
                        <p className={`text-xs ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
                          Added {formatDate(p.createdAt)}
                          {p.backedUp ? ' · synced passkey' : ' · this device only'}
                        </p>
                      </>
                    )}
                  </div>

                  {editingId === p.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => saveEdit(p.id)}
                        className={`p-1.5 rounded-lg transition ${dark ? 'text-emerald-400 hover:bg-slate-700' : 'text-emerald-600 hover:bg-emerald-50'}`}
                        aria-label="Save label"
                      >
                        <LuCheck className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className={`p-1.5 rounded-lg transition ${dark ? 'text-slate-400 hover:bg-slate-700' : 'text-gray-500 hover:bg-gray-100'}`}
                        aria-label="Cancel rename"
                      >
                        <LuX className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(p)}
                        className={`p-1.5 rounded-lg transition ${dark ? 'text-slate-400 hover:bg-slate-700 hover:text-slate-200' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
                        aria-label="Rename device"
                      >
                        <LuPencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(p.id)}
                        className={`p-1.5 rounded-lg transition ${dark ? 'text-red-400 hover:bg-slate-700' : 'text-red-500 hover:bg-red-50'}`}
                        aria-label="Remove fingerprint login"
                      >
                        <LuTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}
