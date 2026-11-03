const User = require('../models/User');
const Club = require('../models/Club');
const Event = require('../models/Event');
const Membership = require('../models/Membership');
const Collaboration = require('../models/Collaboration');
const EventRegistration = require('../models/EventRegistration');

// @route   GET /api/dashboard/stats
// @desc    Get dashboard metrics based on role
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const totalClubs = await Club.countDocuments();
    const totalEvents = await Event.countDocuments();
    const upcomingEvents = await Event.countDocuments({ date: { $gte: new Date() } });
    const totalUsers = await User.countDocuments();

    // User specific counts
    const myMembershipsCount = await Membership.countDocuments({
      user: req.user._id,
      status: 'Approved',
    });
    const pendingMembershipRequestsCount = await Membership.countDocuments({
      user: req.user._id,
      status: 'Pending',
    });
    const myRegisteredEventsCount = await EventRegistration.countDocuments({
      user: req.user._id,
      status: 'Registered',
    });

    // Coordinator/Admin stats
    let coordinatedClubs = [];
    let pendingClubRequestsCount = 0;
    let pendingCollabsCount = 0;

    if (req.user.role === 'Club Coordinator' || req.user.role === 'Admin') {
      let clubQuery = req.user.role === 'Admin' ? {} : { coordinator: req.user._id };
      coordinatedClubs = await Club.find(clubQuery);
      const coordinatedClubIds = coordinatedClubs.map(c => c._id);

      pendingClubRequestsCount = await Membership.countDocuments({
        club: { $in: coordinatedClubIds },
        status: 'Pending',
      });

      pendingCollabsCount = await Collaboration.countDocuments({
        toClub: { $in: coordinatedClubIds },
        status: 'Pending',
      });
    }

    res.json({
      success: true,
      data: {
        totalClubs,
        totalEvents,
        upcomingEvents,
        totalUsers,
        myMembershipsCount,
        pendingMembershipRequestsCount,
        myRegisteredEventsCount,
        coordinatedClubsCount: coordinatedClubs.length,
        pendingClubRequestsCount,
        pendingCollabsCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/dashboard/admin/users
// @desc    Admin: get all users
// @access  Private (Admin)
exports.getAdminUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/dashboard/admin/users/:id/role
// @desc    Admin: update user role
// @access  Private (Admin)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['Student', 'Club Coordinator', 'Admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    res.json({ success: true, data: user, message: 'User role updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
