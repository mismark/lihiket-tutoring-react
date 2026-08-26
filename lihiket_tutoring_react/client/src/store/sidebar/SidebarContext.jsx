import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const SidebarContext = createContext(null);

const STORAGE_KEY = 'lihiket_sidebar_open';

export function SidebarProvider({ children }) {
  // Default open on desktop, closed on mobile
  const [open, setOpen] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === 'true';
    return window.innerWidth >= 1024; // lg breakpoint
  });

  // Mobile overlay: always closed by default
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggle = useCallback(() => {
    // On mobile use mobileOpen, on desktop persist to localStorage
    if (window.innerWidth < 1024) {
      setMobileOpen(v => !v);
    } else {
      setOpen(v => {
        const next = !v;
        localStorage.setItem(STORAGE_KEY, String(next));
        return next;
      });
    }
  }, []);

  const close = useCallback(() => {
    if (window.innerWidth < 1024) setMobileOpen(false);
    // Desktop sidebar stays open
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <SidebarContext.Provider value={{ open, mobileOpen, toggle, close, closeMobile }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used inside SidebarProvider');
  return ctx;
}
