const express = require('express');
const router = express.Router();
const { getAllClubs, getClubById, createClub, updateClub, deleteClub } = require('../controllers/clubController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getAllClubs);
router.get('/:id', getClubById);
router.post('/', protect, authorize('Club Coordinator', 'Admin'), createClub);
router.put('/:id', protect, authorize('Club Coordinator', 'Admin'), updateClub);
router.delete('/:id', protect, authorize('Admin'), deleteClub);

module.exports = router;
