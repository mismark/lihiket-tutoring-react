/**
 * PWAInstallPrompt
 *
 * Shows a subtle bottom-of-screen banner when the browser fires the
 * `beforeinstallprompt` event (Chrome / Edge / Samsung Internet on Android
 * and desktop).  iOS Safari does not fire this event, so the banner is
 * automatically hidden on Safari — iOS users already have an "Add to Home
 * Screen" option in the Share menu.
 *
 * The banner is dismissed permanently (for 30 days) once the user taps
 * "Dismiss", and automatically hidden once the app is installed.
 *
 * This component does NOT touch any existing content, routes, or APIs.
 */

import { useState, useEffect } from 'react';
import { FiDownload, FiX } from 'react-icons/fi';

const DISMISS_KEY     = 'lihiket_pwa_dismiss_until';
const DISMISS_DAYS    = 30;

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible,        setVisible]        = useState(false);

  useEffect(() => {
    // Don't show if user dismissed recently
    const dismissUntil = localStorage.getItem(DISMISS_KEY);
    if (dismissUntil && Date.now() < Number(dismissUntil)) return;

    // Don't show if already running as a standalone (installed) PWA
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (window.navigator.standalone === true) return; // iOS Safari standalone

    const handler = (e) => {
      e.preventDefault(); // prevent the browser's mini-infobar
      setDeferredPrompt(e);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Hide banner if user installs while it's showing
    const installed = () => setVisible(false);
    window.addEventListener('appinstalled', installed);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installed);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
    if (outcome === 'dismissed') {
      // Respect the choice — don't re-ask for 30 days
      localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DAYS * 86400000));
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DAYS * 86400000));
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Install Lihiket app"
      className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 
                 rounded-2xl shadow-2xl flex items-center gap-3 px-4 py-3
                 animate-slide-up"
      style={{
        background:   'rgba(15,23,42,0.96)',
        border:       '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden">
        <img src="/logo1.png" alt="Lihiket" className="w-full h-full object-cover" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white leading-tight">Install Lihiket</p>
        <p className="text-xs text-slate-400 leading-snug mt-0.5">
          Add to home screen for faster access
        </p>
      </div>

      {/* Install button */}
      <button
        onClick={handleInstall}
        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
        style={{ background: 'linear-gradient(135deg,#10b981,#0d9488)', minHeight: '36px' }}
        aria-label="Install app"
      >
        <FiDownload className="w-3.5 h-3.5" />
        Install
      </button>

      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Dismiss install prompt"
      >
        <FiX className="w-4 h-4" />
      </button>
    </div>
  );
}
