/**
 * PWAInstallPrompt
 * Subtle bottom banner — auto-appears when browser fires beforeinstallprompt.
 * Uses the shared usePWAInstall hook so the Header button works too.
 */
import { useState, useEffect } from 'react';
import { FiDownload, FiX } from 'react-icons/fi';
import { usePWAInstall } from '../../hooks/usePWAInstall';

const DISMISS_KEY  = 'lihiket_pwa_dismiss_until';
const DISMISS_DAYS = 30;

export default function PWAInstallPrompt() {
  const { canInstall, install } = usePWAInstall();
  const [visible, setVisible]   = useState(false);

  useEffect(() => {
    if (!canInstall) return setVisible(false);
    const until = localStorage.getItem(DISMISS_KEY);
    if (until && Date.now() < Number(until)) return;
    setVisible(true);
  }, [canInstall]);

  const handleInstall = async () => {
    const accepted = await install();
    setVisible(false);
    if (!accepted) {
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
                 rounded-2xl shadow-2xl flex items-center gap-3 px-4 py-3 animate-slide-up"
      style={{
        background: 'rgba(15,23,42,0.96)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden">
        <img src="/icon-192.png" alt="Lihiket" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white leading-tight">Install Lihiket</p>
        <p className="text-xs text-slate-400 leading-snug mt-0.5">Add to home screen for faster access</p>
      </div>
      <button onClick={handleInstall}
        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
        style={{ background: 'linear-gradient(135deg,#10b981,#0d9488)', minHeight: '36px' }}>
        <FiDownload className="w-3.5 h-3.5" /> Install
      </button>
      <button onClick={handleDismiss}
        className="flex-shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Dismiss">
        <FiX className="w-4 h-4" />
      </button>
    </div>
  );
}
