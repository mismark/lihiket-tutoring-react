/**
 * InstallPage — /install
 *
 * Always shows an install button regardless of whether the
 * beforeinstallprompt event has fired. Auto-detects platform and
 * shows the correct install method.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useTheme } from '../../store/theme/ThemeContext';
import {
  FiDownload, FiCheckCircle, FiArrowLeft,
  FiSmartphone, FiMonitor, FiShare2, FiCopy,
} from 'react-icons/fi';

// Detect platform
function detectPlatform() {
  const ua = navigator.userAgent.toLowerCase();
  const isIOS     = /iphone|ipad|ipod/.test(ua);
  const isAndroid = /android/.test(ua);
  const isMac     = /macintosh/.test(ua) && !isIOS;
  if (isIOS)     return 'ios';
  if (isAndroid) return 'android';
  return 'desktop';
}

function Step({ number, text, color = '#10b981' }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white flex-shrink-0"
        style={{ background: `linear-gradient(135deg,${color},${color}cc)`, minWidth: 28 }}>
        {number}
      </div>
      <p className="text-sm leading-relaxed pt-0.5" style={{ color: '#cbd5e1' }}>{text}</p>
    </div>
  );
}

const TABS = [
  { id: 'android', emoji: '🤖', label: 'Android', color: '#10b981' },
  { id: 'ios',     emoji: '🍎', label: 'iPhone',  color: '#3b82f6' },
  { id: 'desktop', emoji: '💻', label: 'Desktop', color: '#8b5cf6' },
];

const STEPS = {
  android: {
    color: '#10b981',
    label: 'Android — Chrome Browser',
    tip: 'If you already see an "Install" banner at the bottom of the screen — just tap that directly.',
    tipColor: '#10b981',
    tipBg: 'rgba(16,185,129,0.1)',
    tipBd: 'rgba(16,185,129,0.25)',
    steps: [
      'Open Chrome on your Android phone (not Edge or Firefox)',
      'Go to: lihiket-tutoring.vercel.app',
      'Tap the ⋮ menu (three dots) at the top right',
      'Tap "Add to Home screen" or "Install app"',
      'Tap "Install" on the popup — done! App icon appears on your home screen',
    ],
  },
  ios: {
    color: '#3b82f6',
    label: 'iPhone / iPad — Safari Browser',
    tip: 'You must use Safari. Chrome and other iOS browsers do not support Add to Home Screen.',
    tipColor: '#60a5fa',
    tipBg: 'rgba(59,130,246,0.1)',
    tipBd: 'rgba(59,130,246,0.25)',
    steps: [
      'Open Safari on your iPhone (not Chrome)',
      'Go to: lihiket-tutoring.vercel.app',
      'Tap the Share button ↑ at the bottom of the screen',
      'Scroll down and tap "Add to Home Screen"',
      'Tap "Add" at the top right — Lihiket appears on your home screen',
    ],
  },
  desktop: {
    color: '#8b5cf6',
    label: 'Windows / Mac — Chrome or Edge',
    tip: 'If you don\'t see the install icon, try Chrome menu (⋮) → "Save and share" → "Install page as app".',
    tipColor: '#a78bfa',
    tipBg: 'rgba(139,92,246,0.1)',
    tipBd: 'rgba(139,92,246,0.25)',
    steps: [
      'Open Chrome or Edge on your computer',
      'Go to: lihiket-tutoring.vercel.app',
      'Click the install icon (⊕) in the address bar on the right side',
      'Click "Install" on the popup',
      'Lihiket opens as a standalone desktop app — no browser bar',
    ],
  },
};

export default function InstallPage() {
  const { canInstall, isInstalled, install } = usePWAInstall();
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const [tab, setTab]           = useState(() => detectPlatform());
  const [installing, setInstalling] = useState(false);
  const [done, setDone]         = useState(false);
  const [copied, setCopied]     = useState(false);

  // Auto-select correct tab based on platform
  useEffect(() => { setTab(detectPlatform()); }, []);

  const handleInstall = async () => {
    if (canInstall) {
      setInstalling(true);
      const accepted = await install();
      setInstalling(false);
      if (accepted) setDone(true);
    }
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText('https://lihiket-tutoring.vercel.app');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const bg      = dark ? '#020817' : '#f8fafc';
  const cardBg  = dark ? 'rgba(255,255,255,0.04)' : '#ffffff';
  const cardBd  = dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.09)';
  const txt     = dark ? '#ffffff' : '#0f172a';
  const sub     = dark ? '#94a3b8' : '#475569';
  const stepTxt = dark ? '#cbd5e1' : '#334155';

  if (isInstalled || done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
        style={{ background: bg }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: 'linear-gradient(135deg,#10b981,#0d9488)', boxShadow: '0 0 40px rgba(16,185,129,0.4)' }}>
          <FiCheckCircle className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-extrabold mb-2" style={{ color: txt }}>App Installed!</h1>
        <p className="text-sm mb-8 max-w-xs" style={{ color: sub }}>
          Lihiket is now on your home screen. Open it anytime without a browser.
        </p>
        <Link to="/" className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#10b981,#0d9488)' }}>
          Open Lihiket
        </Link>
      </div>
    );
  }

  const activeStep = STEPS[tab];

  return (
    <div style={{ background: bg, minHeight: '100vh' }}>
      <div className="max-w-lg mx-auto px-4 py-8">

        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm mb-6 transition-colors hover:text-emerald-500"
          style={{ color: sub }}>
          <FiArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* App hero */}
        <div className="flex items-center gap-4 mb-8">
          <img src="/icon-192.png" alt="Lihiket"
            className="w-16 h-16 rounded-2xl"
            style={{ boxShadow: '0 0 24px rgba(16,185,129,0.3)' }} />
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color: txt }}>Install Lihiket</h1>
            <p className="text-sm mt-0.5" style={{ color: sub }}>Free · Works offline · No App Store needed</p>
          </div>
        </div>

        {/* ── Primary install button — always visible ── */}
        {canInstall ? (
          /* Native prompt available — one tap */
          <button onClick={handleInstall} disabled={installing}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-base font-bold text-white mb-6 transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#10b981,#0d9488)', boxShadow: '0 0 30px rgba(16,185,129,0.4)' }}>
            <FiDownload className="w-5 h-5" />
            {installing ? 'Installing…' : '⚡ Install App Now — One Tap'}
          </button>
        ) : (
          /* Prompt not available — show manual link + visual button */
          <div className="mb-6 space-y-3">
            {/* Visual install button — opens instructions below */}
            <div className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-base font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#10b981,#0d9488)', boxShadow: '0 0 30px rgba(16,185,129,0.4)' }}>
              <FiDownload className="w-5 h-5" />
              Follow steps below to install ↓
            </div>
            {/* Already installed notice or already-dismissed explanation */}
            <p className="text-xs text-center" style={{ color: sub }}>
              Use your browser menu or follow the step-by-step guide below for your device.
            </p>
          </div>
        )}

        {/* ── Platform tabs ── */}
        <div className="flex gap-2 mb-4">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
              style={tab === t.id
                ? { background: `linear-gradient(135deg,${t.color},${t.color}cc)`, color: '#ffffff' }
                : { background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', color: sub }}>
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {/* ── Step-by-step instructions ── */}
        <div className="rounded-2xl p-5 space-y-4 mb-6"
          style={{ background: cardBg, border: cardBd }}>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: activeStep.color }}>
            {activeStep.label}
          </p>
          <div className="space-y-3">
            {activeStep.steps.map((s, i) => (
              <Step key={i} number={i + 1} text={s} color={activeStep.color} />
            ))}
          </div>
          <div className="p-3 rounded-xl mt-2"
            style={{ background: activeStep.tipBg, border: `1px solid ${activeStep.tipBd}` }}>
            <p className="text-xs font-semibold" style={{ color: activeStep.tipColor }}>💡 Tip</p>
            <p className="text-xs mt-1" style={{ color: stepTxt }}>{activeStep.tip}</p>
          </div>
        </div>

        {/* ── Share section ── */}
        <div className="rounded-2xl p-5 space-y-3"
          style={{ background: cardBg, border: cardBd }}>
          <p className="text-sm font-bold" style={{ color: txt }}>Share with friends &amp; students</p>
          <p className="text-xs" style={{ color: sub }}>Send this link — they open it and follow the steps above</p>

          {/* URL copy row */}
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs px-3 py-2.5 rounded-xl truncate font-mono"
              style={{ background: dark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.08)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
              lihiket-tutoring.vercel.app/install
            </code>
            <button onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-white transition-all flex-shrink-0"
              style={{ background: copied ? '#10b981' : dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)', color: copied ? '#fff' : txt }}>
              {copied ? <><FiCheckCircle className="w-3.5 h-3.5" /> Copied!</> : <><FiCopy className="w-3.5 h-3.5" /> Copy</>}
            </button>
          </div>

          {/* Share buttons */}
          <div className="grid grid-cols-2 gap-2">
            <a href="https://wa.me/?text=Install%20Lihiket%20Tutoring%20App%3A%20https%3A%2F%2Flihiket-tutoring.vercel.app%2Finstall"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white transition-all"
              style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}>
              💬 WhatsApp
            </a>
            <a href="https://t.me/share/url?url=https%3A%2F%2Flihiket-tutoring.vercel.app%2Finstall&text=Install%20Lihiket%20Tutoring%20App"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white transition-all"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' }}>
              ✈️ Telegram
            </a>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs mt-6" style={{ color: sub }}>
          Lihiket is a Progressive Web App — no Play Store or App Store account needed.
        </p>
      </div>
    </div>
  );
}
