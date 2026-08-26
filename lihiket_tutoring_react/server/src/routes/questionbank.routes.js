const express = require('express');
const router  = express.Router();
const { getAll, getOne, create, update, remove } = require('../controllers/questionbank.controller');
const { protect }         = require('../middleware/auth.middleware');
const { requireVerified } = require('../middleware/verified.middleware');
const { authorize }       = require('../middleware/role.middleware');

// Only verified teachers (and admin for read) can access the question bank
const teacherOnly = [protect, requireVerified, authorize('teacher')];
const readAccess  = [protect, requireVerified, authorize('teacher', 'admin')];

router.get('/',       readAccess,   getAll);
router.get('/:id',    readAccess,   getOne);
router.post('/',      teacherOnly,  create);
router.put('/:id',    teacherOnly,  update);
router.delete('/:id', teacherOnly,  remove);

module.exports = router;
