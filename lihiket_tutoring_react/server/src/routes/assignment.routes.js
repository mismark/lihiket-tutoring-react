const express = require('express');
const router  = express.Router();
const {
  getAll, getOne, create, update, remove,
  submit, getSubmissions, grade,
} = require('../controllers/assignment.controller');
const { protect }         = require('../middleware/auth.middleware');
const { requireVerified } = require('../middleware/verified.middleware');
const { authorize }       = require('../middleware/role.middleware');
const { uploadAssignment } = require('../middleware/upload.middleware');

const auth    = [protect, requireVerified];
const all     = [...auth, authorize('admin','teacher','student')];
const staff   = [...auth, authorize('admin','teacher')];
const student = [...auth, authorize('student')];

router.get('/',                                          all,     getAll);
router.get('/:id',                                       all,     getOne);
router.post('/',                                         staff,   uploadAssignment, create);
router.put('/:id',                                       staff,   uploadAssignment, update);
router.delete('/:id',                                    staff,   remove);
router.post('/:id/submit',                               student, uploadAssignment, submit);
router.get('/:id/submissions',                           staff,   getSubmissions);
router.put('/:id/submissions/:studentId/grade',          staff,   grade);

module.exports = router;
