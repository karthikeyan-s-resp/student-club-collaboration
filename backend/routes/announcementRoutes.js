const express = require('express');
const router = express.Router();
const {
  getAllAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getAllAnnouncements);
router.post('/', protect, authorize('Club Coordinator', 'Admin'), createAnnouncement);
router.delete('/:id', protect, authorize('Club Coordinator', 'Admin'), deleteAnnouncement);

module.exports = router;
