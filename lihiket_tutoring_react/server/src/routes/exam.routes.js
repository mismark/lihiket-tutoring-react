const express = require('express');
const router  = express.Router();
const { getAll, getOne, create, update, remove, submit, getResults, getMyResults }
  = require('../controllers/exam.controller');
const { protect }         = require('../middleware/auth.middleware');
const { requireVerified } = require('../middleware/verified.middleware');
const { authorize }       = require('../middleware/role.middleware');

const auth    = [protect, requireVerified];
const all     = [...auth, authorize('admin','teacher','student')];
const staff   = [...auth, authorize('admin','teacher')];
const student = [...auth, authorize('student')];
const admin   = [...auth, authorize('admin','teacher')];

router.get('/',                all,     getAll);
router.get('/:id',             all,     getOne);
router.post('/',               staff,   create);
router.put('/:id',             staff,   update);
router.delete('/:id',          staff,   remove);
router.post('/:id/submit',     student, submit);
router.get('/:id/results',     admin,   getResults);
router.get('/:id/my-results',  all,     getMyResults);

module.exports = router;
