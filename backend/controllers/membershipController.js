const Membership = require('../models/Membership');
const Club = require('../models/Club');

// @route   POST /api/memberships/request
// @desc    Student requests to join a club
// @access  Private (Student, Coordinator, Admin)
exports.requestMembership = async (req, res) => {
  try {
    const { clubId, notes } = req.body;

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    const existing = await Membership.findOne({ user: req.user._id, club: clubId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Membership request already exists with status: ${existing.status}`,
      });
    }

    const membership = await Membership.create({
      user: req.user._id,
      club: clubId,
      status: 'Pending',
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      data: membership,
      message: 'Membership request submitted successfully!',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/memberships/my-requests
// @desc    Get current user's membership requests & joined clubs
// @access  Private
exports.getMyMemberships = async (req, res) => {
  try {
    const memberships = await Membership.find({ user: req.user._id })
      .populate('club')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: memberships.length, data: memberships });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/memberships/club/:clubId
// @desc    Get all membership requests for a club (for coordinator/admin)
// @access  Private (Coordinator, Admin)
exports.getClubMemberships = async (req, res) => {
  try {
    const club = await Club.findById(req.params.clubId);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    if (req.user.role !== 'Admin' && club.coordinator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view requests for this club' });
    }

    const memberships = await Membership.find({ club: req.params.clubId })
      .populate('user', 'name email department year')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: memberships.length, data: memberships });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/memberships/:id/status
// @desc    Approve or reject a membership request
// @access  Private (Coordinator, Admin)
exports.updateMembershipStatus = async (req, res) => {
  try {
    const { status, roleInClub } = req.body;

    if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const membership = await Membership.findById(req.params.id).populate('club');
    if (!membership) {
      return res.status(404).json({ success: false, message: 'Membership not found' });
    }

    if (
      req.user.role !== 'Admin' &&
      membership.club.coordinator.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to review this request' });
    }

    membership.status = status;
    if (roleInClub) membership.roleInClub = roleInClub;
    await membership.save();

    res.json({
      success: true,
      data: membership,
      message: `Membership request ${status.toLowerCase()} successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
