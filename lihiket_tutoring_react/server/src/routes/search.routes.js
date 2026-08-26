const express = require('express');
const router  = express.Router();
const { search } = require('../controllers/search.controller');
const { protect }         = require('../middleware/auth.middleware');
const { requireVerified } = require('../middleware/verified.middleware');

router.get('/', protect, requireVerified, search);

module.exports = router;
