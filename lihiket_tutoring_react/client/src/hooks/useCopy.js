import { useState } from 'react';

/**
 * Hook to copy text to clipboard with a brief "Copied!" feedback state.
 * Uses the modern Clipboard API with a textarea fallback for older browsers.
 *
 * @returns {{ copied: string|null, copy: (text: string, key: string) => Promise<void> }}
 */
export default function useCopy() {
  const [copied, setCopied] = useState(null);

  const copy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for browsers without Clipboard API
      const el = document.createElement('textarea');
      el.value = text;
      el.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return { copied, copy };
}
