/**
 * InstallPage — /install
 * Works for ALL devices: Android, iPhone, Desktop.
 * Shows the native install dialog if available, otherwise shows manual steps.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import {
  FiDownload, FiSmartphone, FiMonitor, FiShare2,
  FiCheckCircle, FiArrowLeft, FiExternalLink,
} from 'react-icons/fi';

// Step component
function Step({ number, text }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
        style={{ background: 'linear-gradient(135deg,#10b981,#0d9488)' }}>
        {number}
      </div>
      <p className="text-sm text-slate-300 leading-relaxed pt-0.5">{text}</p>
    </div>
  );
}

// Platform card
function PlatformCard({ icon: Icon, title, color, children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border transition-all ${
        active
          ? 'border-emerald-500/50 bg-emerald-500/10'
          : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="font-bold text-white text-sm">{title}</span>
        {active && <FiCheckCircle className="w-4 h-4 text-emerald-400 ml-auto" />}
      </div>
      {active && <div className="space-y-3">{children}</div>}
    </button>
  );
}

export default function InstallPage() {
  const { canInstall, isInstalled, install } = usePWAInstall();
  const [tab, setTab]       = useState('android');
  const [installing, setInstalling] = useState(false);
  const [done, setDone]     = useState(false);

  const handleInstall = async () => {
    setInstalling(true);
    const accepted = await install();
    setInstalling(false);
    if (accepted) setDone(true);
  };

  if (isInstalled || done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
        style={{ background: '#020817' }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: 'linear-gradient(135deg,#10b981,#0d9488)' }}>
          <FiCheckCircle className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-2">App Installed!</h1>
        <p className="text-slate-400 text-sm mb-8 max-w-xs">
          Lihiket is now on your home screen. Open it anytime without a browser.
        </p>
        <Link to="/"
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#10b981,#0d9488)' }}>
          Open Lihiket
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-lg mx-auto" style={{ background: '#020817' }}>

      {/* Back */}
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
        <FiArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      {/* Hero */}
      <div className="flex items-center gap-4 mb-8">
        <img src="/icon-192.png" alt="Lihiket"
          className="w-16 h-16 rounded-2xl shadow-lg shadow-emerald-500/20" />
        <div>
          <h1 className="text-2xl font-extrabold text-white">Install Lihiket</h1>
          <p className="text-sm text-slate-400 mt-0.5">Free · Works offline · No App Store needed</p>
        </div>
      </div>

      {/* One-tap install — Android Chrome / Desktop */}
      {canInstall && (
        <button
          onClick={handleInstall}
          disabled={installing}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-base font-bold text-white mb-8 transition-all active:scale-[0.98] disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg,#10b981,#0d9488)', boxShadow: '0 0 30px rgba(16,185,129,0.35)' }}
        >
          <FiDownload className="w-5 h-5" />
          {installing ? 'Installing…' : 'Install App Now'}
        </button>
      )}

      {/* Platform tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { id: 'android', label: '🤖 Android' },
          { id: 'ios',     label: '🍎 iPhone' },
          { id: 'desktop', label: '💻 Desktop' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === t.id
                ? 'text-white'
                : 'text-slate-400 bg-white/[0.04] hover:bg-white/[0.08]'
            }`}
            style={tab === t.id ? { background: 'linear-gradient(135deg,#10b981,#0d9488)' } : {}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Instructions */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">

        {tab === 'android' && (
          <>
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Android — Chrome Browser</p>
            <div className="space-y-3">
              <Step number="1" text="Open Chrome on your Android phone (not Edge or Firefox)" />
              <Step number="2" text={`Go to: lihiket-tutoring.vercel.app`} />
              <Step number="3" text="Tap the ⋮ menu (three dots) at the top right of Chrome" />
              <Step number="4" text='Tap "Add to Home screen" or "Install app"' />
              <Step number="5" text='Tap "Install" on the popup — done! Icon appears on home screen' />
            </div>
            <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-xs text-emerald-400 font-semibold">💡 Tip</p>
              <p className="text-xs text-slate-300 mt-1">
                If you see an "Install" banner at the bottom of the screen — just tap it directly.
              </p>
            </div>
          </>
        )}

        {tab === 'ios' && (
          <>
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">iPhone / iPad — Safari Browser</p>
            <div className="space-y-3">
              <Step number="1" text="Open Safari on your iPhone (must be Safari, not Chrome)" />
              <Step number="2" text={`Go to: lihiket-tutoring.vercel.app`} />
              <Step number="3" text="Tap the Share button at the bottom (box with an arrow pointing up ↑)" />
              <Step number="4" text='Scroll down and tap "Add to Home Screen"' />
              <Step number="5" text='Tap "Add" at the top right — Lihiket icon appears on your home screen' />
            </div>
            <div className="mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-blue-400 font-semibold">⚠️ Important</p>
              <p className="text-xs text-slate-300 mt-1">
                iPhone only supports install from Safari. Chrome and other browsers on iOS do not show the "Add to Home Screen" option.
              </p>
            </div>
          </>
        )}

        {tab === 'desktop' && (
          <>
            <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Windows / Mac — Chrome or Edge</p>
            <div className="space-y-3">
              <Step number="1" text="Open Chrome or Edge on your computer" />
              <Step number="2" text={`Go to: lihiket-tutoring.vercel.app`} />
              <Step number="3" text="Look for the install icon (⊕) in the address bar on the right side" />
              <Step number="4" text='Click it, then click "Install" on the popup' />
              <Step number="5" text="Lihiket opens as a standalone app window — no browser bar" />
            </div>
            <div className="mt-4 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <p className="text-xs text-purple-400 font-semibold">💡 Tip</p>
              <p className="text-xs text-slate-300 mt-1">
                If you don't see the install icon, try the Chrome menu (⋮) → "Save and share" → "Install page as app".
              </p>
            </div>
          </>
        )}
      </div>

      {/* Share link */}
      <div className="mt-6 p-4 rounded-2xl border border-white/10 bg-white/[0.03]">
        <p className="text-xs font-semibold text-slate-400 mb-2">Share with friends & students</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-xl truncate">
            lihiket-tutoring.vercel.app
          </code>
          <button
            onClick={() => navigator.clipboard?.writeText('https://lihiket-tutoring.vercel.app')}
            className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0"
          >
            Copy
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <a href="https://wa.me/?text=Install%20Lihiket%20Tutoring%20App%3A%20https%3A%2F%2Flihiket-tutoring.vercel.app"
            target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white bg-green-600/80 hover:bg-green-600 transition-colors">
            WhatsApp
          </a>
          <a href="https://t.me/share/url?url=https%3A%2F%2Flihiket-tutoring.vercel.app&text=Install%20Lihiket%20Tutoring%20App"
            target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600/80 hover:bg-blue-600 transition-colors">
            Telegram
          </a>
        </div>
      </div>

    </div>
  );
}
