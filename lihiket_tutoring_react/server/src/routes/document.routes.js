const express = require('express');
const router  = express.Router();
const { getAll, getOne, create, update, remove } = require('../controllers/document.controller');
const { protect }         = require('../middleware/auth.middleware');
const { requireVerified } = require('../middleware/verified.middleware');
const { authorize }       = require('../middleware/role.middleware');
const { uploadDocumentCloud }  = require('../middleware/upload.middleware');

const auth      = [protect, requireVerified];
const readAll   = [...auth, authorize('admin', 'teacher', 'student', 'parent')];
const staffOnly = [...auth, authorize('admin', 'teacher')];

router.get('/',       readAll,   getAll);
router.get('/:id',    readAll,   getOne);
router.post('/',      staffOnly, ...uploadDocumentCloud, create);
router.put('/:id',    staffOnly, ...uploadDocumentCloud, update);
router.delete('/:id', staffOnly, remove);

module.exports = router;
