const express = require('express');
const router  = express.Router();
const path    = require('path');
const fs      = require('fs');
const { protect }         = require('../middleware/auth.middleware');
const { requireVerified } = require('../middleware/verified.middleware');

// Serve a file inline (no download) — strips filename so browser can't infer it
// GET /api/files/view?p=uploads/lessons/12345.pdf
router.get('/view', protect, requireVerified, (req, res) => {
  let { p } = req.query;

  if (!p) return res.status(400).json({ success: false, message: 'No file path provided' });

  // Strip leading slash if present, strip any # fragment
  p = p.replace(/^\//, '').split('#')[0];

  // Security: only allow paths inside uploads/, no traversal
  if (p.includes('..') || !p.startsWith('uploads/')) {
    return res.status(400).json({ success: false, message: 'Invalid file path' });
  }

  const filePath = path.resolve(path.join(__dirname, '../../', p));
  const uploadsDir = path.resolve(path.join(__dirname, '../../uploads'));

  // Extra check: resolved path must still be inside uploads/
  if (!filePath.startsWith(uploadsDir)) {
    return res.status(400).json({ success: false, message: 'Invalid file path' });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'File not found' });
  }

  const ext = path.extname(filePath).toLowerCase();
  const MIME = {
    '.pdf':  'application/pdf',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif':  'image/gif',
    '.mp4':  'video/mp4',
    '.webm': 'video/webm',
    '.mov':  'video/mp4',
    '.doc':  'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.ppt':  'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.xls':  'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };

  const mime = MIME[ext] || 'application/octet-stream';

  // inline = open in browser; no filename = browser can't suggest a save name
  res.setHeader('Content-Type', mime);
  res.setHeader('Content-Disposition', 'inline');
  // Prevent caching so the URL can't be bookmarked and re-used after session ends
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');

  res.sendFile(filePath);
});

module.exports = router;
