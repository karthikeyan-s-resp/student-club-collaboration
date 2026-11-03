const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAdminUsers,
  updateUserRole,
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/stats', protect, getDashboardStats);
router.get('/admin/users', protect, authorize('Admin'), getAdminUsers);
router.put('/admin/users/:id/role', protect, authorize('Admin'), updateUserRole);

module.exports = router;
