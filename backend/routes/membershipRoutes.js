const express = require('express');
const router = express.Router();
const {
  requestMembership,
  getMyMemberships,
  getClubMemberships,
  updateMembershipStatus,
} = require('../controllers/membershipController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/request', protect, requestMembership);
router.get('/my-requests', protect, getMyMemberships);
router.get('/club/:clubId', protect, authorize('Club Coordinator', 'Admin'), getClubMemberships);
router.put('/:id/status', protect, authorize('Club Coordinator', 'Admin'), updateMembershipStatus);

module.exports = router;
