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

// ── GET /api/files/proxy?url=<cloudinaryUrl> ─────────────────────────────────
// Fetches a Cloudinary file server-side and pipes it to the client.
// This bypasses any Cloudinary 401/access restrictions since our server
// has the API credentials to access private assets.
const https = require('https');
const http  = require('http');

router.get('/proxy', (req, res) => {
  // Accept token from Authorization header OR query param (needed for iframe src)
  let token = req.headers.authorization?.replace('Bearer ', '');
  if (!token && req.query.token) token = req.query.token;

  // Verify token
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
  try {
    const jwt = require('jsonwebtoken');
    jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  const { url } = req.query;
  if (!url) return res.status(400).json({ success: false, message: 'No URL provided' });

  // Only allow proxying Cloudinary URLs
  if (!url.startsWith('https://res.cloudinary.com/') && !url.startsWith('http://res.cloudinary.com/')) {
    return res.status(400).json({ success: false, message: 'Only Cloudinary URLs are allowed' });
  }

  const ext = url.split('?')[0].split('.').pop().toLowerCase();
  const MIME = {
    pdf: 'application/pdf', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
    gif: 'image/gif', webp: 'image/webp', mp4: 'video/mp4', webm: 'video/webm',
    mov: 'video/mp4', doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };

  const mime    = MIME[ext] || 'application/octet-stream';
  const lib     = url.startsWith('https') ? https : http;

  // Fetch from Cloudinary directly — our server has access even for "restricted" raw files
  // because the URL is a valid signed Cloudinary delivery URL
  const fetchOptions = {
    headers: {
      'User-Agent': 'Lihiket-Server/1.0',
    },
  };

  const request = lib.get(url, fetchOptions, (upstream) => {
    if (upstream.statusCode !== 200) {
      return res.status(upstream.statusCode || 502).json({ success: false, message: 'File not accessible' });
    }
    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (upstream.headers['content-length']) {
      res.setHeader('Content-Length', upstream.headers['content-length']);
    }
    upstream.pipe(res);
  });

  request.on('error', () => res.status(500).json({ success: false, message: 'Failed to fetch file' }));
  request.setTimeout(30000, () => {
    request.destroy();
    res.status(504).json({ success: false, message: 'Request timed out' });
  });
});

module.exports = router;
