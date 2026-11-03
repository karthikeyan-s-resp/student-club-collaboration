const Announcement = require('../models/Announcement');
const Club = require('../models/Club');

// @route   GET /api/announcements
// @desc    Get all announcements with optional club filter
// @access  Public
exports.getAllAnnouncements = async (req, res) => {
  try {
    const { clubId } = req.query;
    let query = {};
    if (clubId) query.club = clubId;

    const announcements = await Announcement.find(query)
      .populate('club', 'name category image')
      .populate('postedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: announcements.length, data: announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/announcements
// @desc    Publish a new announcement
// @access  Private (Club Coordinator, Admin)
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, club, priority } = req.body;

    const targetClub = await Club.findById(club);
    if (!targetClub) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    if (req.user.role !== 'Admin' && targetClub.coordinator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to post for this club' });
    }

    const announcement = await Announcement.create({
      title,
      content,
      club,
      priority: priority || 'Normal',
      postedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: announcement,
      message: 'Announcement published successfully!',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/announcements/:id
// @desc    Delete an announcement
// @access  Private (Club Coordinator, Admin)
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    if (req.user.role !== 'Admin' && announcement.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this announcement' });
    }

    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
