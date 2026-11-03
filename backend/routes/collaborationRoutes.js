const express = require('express');
const router = express.Router();
const {
  createCollaboration,
  getCollaborations,
  respondCollaboration,
} = require('../controllers/collaborationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('Club Coordinator', 'Admin'), createCollaboration);
router.get('/', protect, getCollaborations);
router.put('/:id/respond', protect, authorize('Club Coordinator', 'Admin'), respondCollaboration);

module.exports = router;
