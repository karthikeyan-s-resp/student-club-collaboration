const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  getMyRegistrations,
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getAllEvents);
router.get('/my-registrations', protect, getMyRegistrations);
router.get('/:id', getEventById);
router.post('/', protect, authorize('Club Coordinator', 'Admin'), createEvent);
router.put('/:id', protect, authorize('Club Coordinator', 'Admin'), updateEvent);
router.delete('/:id', protect, authorize('Club Coordinator', 'Admin'), deleteEvent);
router.post('/:id/register', protect, registerForEvent);

module.exports = router;
