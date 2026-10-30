/**
 * In-memory, single-use challenge store for WebAuthn ceremonies.
 *
 * WebAuthn challenges must be ephemeral, unpredictable, and used exactly once.
 * They live only for the few seconds between the "begin" and "finish" calls of
 * a registration/authentication ceremony, so an in-process Map is sufficient.
 *
 * NOTE: This is process-local. If you ever scale to multiple server instances
 * behind a load balancer without sticky sessions, move this to a shared store
 * (e.g. Redis) so the "finish" call can always find the challenge issued by the
 * "begin" call — even if it lands on a different instance.
 */

const CHALLENGE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const CLEANUP_INTERVAL_MS = 60 * 1000; // sweep every minute

// requestId -> { challenge, userId, userModel, type, expiresAt }
const store = new Map();

/**
 * Persist a challenge keyed by a caller-generated requestId.
 * @param {string} requestId  - opaque token the client echoes back
 * @param {Object} data       - { challenge, userId?, userModel?, type }
 */
function setChallenge(requestId, data) {
  if (!requestId) throw new Error('requestId is required to store a WebAuthn challenge');
  store.set(requestId, {
    challenge: data.challenge,
    userId: data.userId || null,
    userModel: data.userModel || null,
    type: data.type || 'unknown',
    expiresAt: Date.now() + CHALLENGE_TTL_MS,
  });
}

/**
 * Read a stored challenge without removing it.
 * @param {string} requestId
 * @returns {{challenge:string,userId:*,userModel:*,type:string}|null}
 */
function getChallenge(requestId) {
  const entry = store.get(requestId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(requestId);
    return null;
  }
  return { challenge: entry.challenge, userId: entry.userId, userModel: entry.userModel, type: entry.type };
}

/**
 * Read AND delete a stored challenge (single-use). Returns null if missing/expired.
 * @param {string} requestId
 */
function consumeChallenge(requestId) {
  const entry = getChallenge(requestId);
  if (entry) store.delete(requestId);
  return entry;
}

// ── Periodic cleanup of expired entries ──────────────────────────────────────
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.expiresAt) store.delete(key);
  }
}, CLEANUP_INTERVAL_MS).unref();

module.exports = { setChallenge, getChallenge, consumeChallenge };
