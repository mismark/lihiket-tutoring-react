const express = require('express');
const router = express.Router();
const {
  getAllTeachers,
  getPendingUsers,
  getAllUsers,
  approveUser,
  rejectUser,
  toggleUserActive,
  getUser,
  updateUser,
  deleteUser,
  getMyChildren,
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireVerified } = require('../middleware/verified.middleware');
const { authorize } = require('../middleware/role.middleware');

// Get pending users (Admin only)
router.get('/pending', protect, requireVerified, authorize('admin'), getPendingUsers);

// Get all users (Admin only)
router.get('/', protect, requireVerified, authorize('admin'), getAllUsers);

// Get all teachers (Admin only)
router.get('/teachers', protect, requireVerified, authorize('admin'), getAllTeachers);

// Parent — get own children with enrollments
router.get('/my-children', protect, requireVerified, authorize('parent'), getMyChildren);

// Approve user (Admin only)
router.post('/:id/approve', protect, requireVerified, authorize('admin'), approveUser);

// Reject user (Admin only)
router.delete('/:id/reject', protect, requireVerified, authorize('admin'), rejectUser);

// Toggle user active status (Admin only)
router.patch('/:id/toggle-active', protect, requireVerified, authorize('admin'), toggleUserActive);

// Get, update, delete single user (Admin only) — pass ?userType=teacher|student|parent|admin
router.get('/:id',    protect, requireVerified, authorize('admin'), getUser);
router.put('/:id',    protect, requireVerified, authorize('admin'), updateUser);
router.delete('/:id', protect, requireVerified, authorize('admin'), deleteUser);

module.exports = router;
