const express = require('express');
const router  = express.Router();
const {
  getAll, markRead, markAllRead, remove, clearAll, unreadCount,
} = require('../controllers/notification.controller');
const { protect }         = require('../middleware/auth.middleware');
const { requireVerified } = require('../middleware/verified.middleware');

const auth = [protect, requireVerified];

router.get('/',                   auth, getAll);
router.get('/unread-count',       auth, unreadCount);
router.patch('/read-all',         auth, markAllRead);
router.delete('/clear-all',       auth, clearAll);
router.patch('/:id/read',         auth, markRead);
router.delete('/:id',             auth, remove);

module.exports = router;
