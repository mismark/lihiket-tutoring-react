import { useEffect } from 'react';

/**
 * Listens for `socket:liveclass:status` DOM events (emitted by SocketContext)
 * and calls `onStatusChange(liveClassId, newStatus)` so the caller can update
 * their local state without a full reload.
 */
export default function useLiveClassStatus(onStatusChange) {
  useEffect(() => {
    const handler = (e) => {
      const { liveClassId, status } = e.detail || {};
      if (liveClassId && status) onStatusChange(liveClassId, status);
    };
    window.addEventListener('socket:liveclass:status', handler);
    return () => window.removeEventListener('socket:liveclass:status', handler);
  }, [onStatusChange]);
}
