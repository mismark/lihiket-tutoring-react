const express    = require('express');
const router     = express.Router();
const { protect }   = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const {
  getMyCertificates,
  getCertificate,
  verifyCertificate,
  issueCertificate,
  revokeCertificate,
  downloadCertificate,
} = require('../controllers/certificate.controller');

// ── Public route (no auth) — verify a cert by its short ID ───────────────────
router.get('/verify/:certId', verifyCertificate);

// ── All routes below require a valid JWT ─────────────────────────────────────
router.use(protect);

// List my certificates (student) or all certificates (admin)
router.get('/',    authorize('student', 'admin'), getMyCertificates);

// Get one certificate
router.get('/:id', authorize('student', 'admin'), getCertificate);

// Download certificate as PDF
router.get('/:id/download', authorize('student', 'admin'), downloadCertificate);

// Admin-only: issue and revoke
router.post('/',              authorize('admin'), issueCertificate);
router.patch('/:id/revoke',   authorize('admin'), revokeCertificate);

module.exports = router;
