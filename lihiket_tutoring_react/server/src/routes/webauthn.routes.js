const express = require('express');
const router  = express.Router();

const {
  generateRegistrationOptionsHandler,
  verifyRegistrationHandler,
  generateAuthenticationOptionsHandler,
  verifyAuthenticationHandler,
  listCredentials,
  renameCredential,
  removeCredential,
} = require('../controllers/webauthn.controller');

const { protect } = require('../middleware/auth.middleware');

// ── Registration ceremony (must be logged in first) ──────────────────────────
// Step 1: get options (challenge) to pass to navigator.credentials.create()
router.post('/register/begin',  protect, generateRegistrationOptionsHandler);
// Step 2: send the authenticator response for server-side verification + storage
router.post('/register/finish', protect, verifyRegistrationHandler);

// ── Authentication ceremony (public — user is not yet logged in) ──────────────
// Step 1: get options (challenge) to pass to navigator.credentials.get()
router.post('/auth/begin',  generateAuthenticationOptionsHandler);
// Step 2: send the authenticator response; server returns a JWT on success
router.post('/auth/finish', verifyAuthenticationHandler);

// ── Credential management (must be logged in) ─────────────────────────────────
router.get('/',           protect, listCredentials);
router.patch('/:id',      protect, renameCredential);
router.delete('/:id',     protect, removeCredential);

module.exports = router;
