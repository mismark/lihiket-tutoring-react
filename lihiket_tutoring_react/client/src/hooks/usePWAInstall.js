/**
 * usePWAInstall
 *
 * Global hook that captures the `beforeinstallprompt` event once and
 * lets any component trigger the native install dialog on demand.
 *
 * Usage:
 *   const { canInstall, isInstalled, install } = usePWAInstall();
 */
import { useState, useEffect, useCallback } from 'react';

let _deferredPrompt = null;          // module-level so it survives re-renders
const _listeners    = new Set();     // notify all hook instances when state changes

function notify() {
  _listeners.forEach(fn => fn());
}

// Capture the prompt once, globally
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    _deferredPrompt = e;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    _deferredPrompt = null;
    notify();
  });
}

export function usePWAInstall() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const updater = () => forceUpdate(n => n + 1);
    _listeners.add(updater);
    return () => _listeners.delete(updater);
  }, []);

  const isInstalled =
    (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) ||
    (typeof navigator !== 'undefined' && navigator.standalone === true);

  const canInstall = !isInstalled && _deferredPrompt !== null;

  const install = useCallback(async () => {
    if (!_deferredPrompt) return false;
    _deferredPrompt.prompt();
    const { outcome } = await _deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      _deferredPrompt = null;
      notify();
    }
    return outcome === 'accepted';
  }, []);

  return { canInstall, isInstalled, install };
}
