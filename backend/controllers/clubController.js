const Club = require('../models/Club');
const Membership = require('../models/Membership');

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
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/clubs/:id
// @desc    Get single club details
// @access  Public
exports.getClubById = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id).populate('coordinator', 'name email department');
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    const memberCount = await Membership.countDocuments({ club: club._id, status: 'Approved' });

    res.json({ success: true, data: { ...club.toObject(), memberCount } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/clubs
// @desc    Create a new club (Admin or Coordinator)
// @access  Private (Admin, Club Coordinator)
exports.createClub = async (req, res) => {
  try {
    const { name, description, category, coordinator, image, establishedYear, contactEmail } = req.body;

    const existing = await Club.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Club with this name already exists' });
    }

    const club = await Club.create({
      name,
      description,
      category,
      coordinator: coordinator || req.user._id,
      image: image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
      establishedYear: establishedYear || new Date().getFullYear(),
      contactEmail: contactEmail || req.user.email,
    });

    res.status(201).json({ success: true, data: club, message: 'Club created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/clubs/:id
// @desc    Update club details
// @access  Private (Coordinator of club or Admin)
exports.updateClub = async (req, res) => {
  try {
    let club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    if (req.user.role !== 'Admin' && club.coordinator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this club' });
    }

    club = await Club.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: club, message: 'Club updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/clubs/:id
// @desc    Delete a club
// @access  Private (Admin)
exports.deleteClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    await Club.findByIdAndDelete(req.params.id);
    await Membership.deleteMany({ club: req.params.id });

    res.json({ success: true, message: 'Club deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
