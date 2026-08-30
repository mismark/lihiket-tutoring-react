/**
 * Live Class Auto-Status Job
 *
 * Runs every 30 seconds. Transitions live class statuses automatically:
 *   scheduled → live   when scheduledAt <= now
 *   live      → ended  when scheduledAt + duration (minutes) <= now
 *
 * Pushes a `liveclass:status` Socket.IO broadcast to all connected clients
 * so the UI updates instantly without a page refresh.
 */

const LiveClass = require('../models/LiveClass');

const INTERVAL_MS = 30 * 1000; // 30 seconds

async function tick() {
  try {
    const now = new Date();

    // ── scheduled → live ──────────────────────────────────────────────────
    // Classes whose scheduled time has arrived but haven't started yet
    const toStart = await LiveClass.find({
      status:      'scheduled',
      scheduledAt: { $lte: now },
    });

    for (const lc of toStart) {
      lc.status = 'live';
      await lc.save();
      push(lc._id.toString(), 'live');
    }

    // ── live → ended ──────────────────────────────────────────────────────
    // Classes that have been live longer than their duration
    const toLive = await LiveClass.find({ status: 'live' });

    for (const lc of toLive) {
      const endTime = new Date(lc.scheduledAt.getTime() + lc.duration * 60 * 1000);
      if (now >= endTime) {
        lc.status = 'ended';
        await lc.save();
        push(lc._id.toString(), 'ended');
      }
    }
  } catch (err) {
    console.error('[LiveClass Job] tick error:', err.message);
  }
}

/**
 * Push a status-change event via Socket.IO (best-effort).
 * Broadcasts to ALL connected users so every open tab updates.
 */
function push(liveClassId, status) {
  try {
    const { getIO } = require('../config/socket');
    const io        = getIO();
    io.emit('liveclass:status', { liveClassId, status });
  } catch {
    // Socket not ready or server shutting down — silent ignore
  }
}

/**
 * Start the job. Returns a reference so callers can clearInterval() if needed.
 */
function startLiveClassJob() {
  console.log('⏱  Live class auto-status job started (30s interval)');
  tick(); // immediate first run
  return setInterval(tick, INTERVAL_MS);
}

module.exports = { startLiveClassJob };
