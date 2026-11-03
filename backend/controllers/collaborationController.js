const Collaboration = require('../models/Collaboration');
const Club = require('../models/Club');
const { isValidObjectId, sendControllerError } = require('../utils/apiError');

// @route   POST /api/collaborations
// @desc    Send a collaboration request to another club
// @access  Private (Club Coordinator, Admin)
exports.createCollaboration = async (req, res) => {
  try {
    const { fromClubId, toClubId, proposedEventTitle, description, proposedDate } = req.body;

    if (!isValidObjectId(fromClubId) || !isValidObjectId(toClubId)) {
      return res.status(400).json({ success: false, message: 'Invalid club identifier' });
    }

    if (fromClubId === toClubId) {
      return res.status(400).json({ success: false, message: 'Cannot collaborate with your own club' });
    }

    const fromClub = await Club.findById(fromClubId);
    const toClub = await Club.findById(toClubId);

    if (!fromClub || !toClub) {
      return res.status(404).json({ success: false, message: 'One or both clubs not found' });
    }

    // Verify user is coordinator of fromClub or Admin
    if (req.user.role !== 'Admin' && fromClub.coordinator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not the coordinator of the initiating club' });
    }

    const collab = await Collaboration.create({
      fromClub: fromClubId,
      toClub: toClubId,
      proposedEventTitle,
      description,
      proposedDate: proposedDate ? new Date(proposedDate) : undefined,
      initiatedBy: req.user._id,
      status: 'Pending',
    });

    res.status(201).json({
      success: true,
      data: collab,
      message: 'Collaboration proposal sent successfully!',
    });
  } catch (error) {
    sendControllerError(res, error);
  }
};

// @route   GET /api/collaborations
// @desc    Get collaboration proposals (all for admin, or filtered by user's clubs)
// @access  Private
exports.getCollaborations = async (req, res) => {
  try {
    let query = {};

    // If student or normal coordinator, fetch proposals involving their clubs
    if (req.user.role !== 'Admin') {
      const myClubs = await Club.find({ coordinator: req.user._id }).select('_id');
      const myClubIds = myClubs.map(c => c._id);

      query = {
        $or: [
          { fromClub: { $in: myClubIds } },
          { toClub: { $in: myClubIds } },
        ],
      };
    }

    const collabs = await Collaboration.find(query)
      .populate('fromClub', 'name category image coordinator')
      .populate('toClub', 'name category image coordinator')
      .populate('initiatedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: collabs.length, data: collabs });
  } catch (error) {
    sendControllerError(res, error);
  }
};

// @route   PUT /api/collaborations/:id/respond
// @desc    Accept or reject a collaboration request
// @access  Private (Admin)
exports.respondCollaboration = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid collaboration identifier' });
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Only administrators can respond to collaboration requests' });
    }
    const { status, responseMessage } = req.body;

    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Accepted or Rejected' });
    }

    const collab = await Collaboration.findById(req.params.id)
      .populate('fromClub')
      .populate('toClub');

    if (!collab) {
      return res.status(404).json({ success: false, message: 'Collaboration request not found' });
    }

    collab.status = status;
    collab.responseMessage = responseMessage || '';
    await collab.save();

    res.json({
      success: true,
      data: collab,
      message: `Collaboration request has been ${status.toLowerCase()}!`,
    });
  } catch (error) {
    sendControllerError(res, error);
  }
};
