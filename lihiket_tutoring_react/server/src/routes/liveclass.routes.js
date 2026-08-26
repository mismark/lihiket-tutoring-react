const express = require('express');
const router  = express.Router();
const { getAll, getOne, create, update, remove } = require('../controllers/liveclass.controller');
const { protect }         = require('../middleware/auth.middleware');
const { requireVerified } = require('../middleware/verified.middleware');
const { authorize }       = require('../middleware/role.middleware');

const auth  = [protect, requireVerified];
const all   = [...auth, authorize('admin','teacher','student','parent')];
const staff = [...auth, authorize('admin','teacher')];

router.get('/',    all,   getAll);
router.get('/:id', all,   getOne);
router.post('/',   staff, create);
router.put('/:id', staff, update);
router.delete('/:id', staff, remove);

module.exports = router;
