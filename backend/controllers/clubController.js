const Club = require('../models/Club');
const Membership = require('../models/Membership');
const { isValidObjectId, sendControllerError } = require('../utils/apiError');

// @route   GET /api/clubs
// @desc    Get all clubs with optional search and category filter
// @access  Public
exports.getAllClubs = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (category && category !== 'All') {
      query.category = category;
    }

    const clubs = await Club.find(query).populate('coordinator', 'name email department');
    res.json({ success: true, count: clubs.length, data: clubs });
  } catch (error) {
    sendControllerError(res, error);
  }
};

// @route   GET /api/clubs/:id
// @desc    Get single club details
// @access  Public
exports.getClubById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid club identifier' });
    const club = await Club.findById(req.params.id).populate('coordinator', 'name email department');
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    const memberCount = await Membership.countDocuments({ club: club._id, status: 'Approved' });

    res.json({ success: true, data: { ...club.toObject(), memberCount } });
  } catch (error) {
    sendControllerError(res, error);
  }
};

// @route   POST /api/clubs
// @desc    Create a new club (Admin or Coordinator)
// @access  Private (Admin, Club Coordinator)
exports.createClub = async (req, res) => {
  try {
    const { name, description, category, image, establishedYear, contactEmail } = req.body;

    const existing = await Club.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Club with this name already exists' });
    }

    const club = await Club.create({
      name,
      description,
      category,
      coordinator: req.user._id,
      image: image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
      establishedYear: establishedYear || new Date().getFullYear(),
      contactEmail: contactEmail || req.user.email,
    });

    res.status(201).json({ success: true, data: club, message: 'Club created successfully' });
  } catch (error) {
    sendControllerError(res, error);
  }
};

// @route   PUT /api/clubs/:id
// @desc    Update club details
// @access  Private (Coordinator of club)
exports.updateClub = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid club identifier' });
    if (req.user.role !== 'Club Coordinator') {
      return res.status(403).json({ success: false, message: 'Only club coordinators can modify club details' });
    }
    let club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    if (club.coordinator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this club' });
    }

    const { name, description, category, image, establishedYear, contactEmail } = req.body;
    const updates = { name, description, category, image, establishedYear, contactEmail };
    Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

    club = await Club.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    res.json({ success: true, data: club, message: 'Club updated successfully' });
  } catch (error) {
    sendControllerError(res, error);
  }
};

// @route   DELETE /api/clubs/:id
// @desc    Delete a club
// @access  Private (Admin)
exports.deleteClub = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid club identifier' });
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    await Club.findByIdAndDelete(req.params.id);
    await Membership.deleteMany({ club: req.params.id });

    res.json({ success: true, message: 'Club deleted successfully' });
  } catch (error) {
    sendControllerError(res, error);
  }
};
