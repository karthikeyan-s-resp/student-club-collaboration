const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const Club = require('../models/Club');

// @route   GET /api/events
// @desc    Get all events (upcoming, past filterable)
// @access  Public
exports.getAllEvents = async (req, res) => {
  try {
    const { timeFilter, clubId, category, search } = req.query;
    let query = {};
    const now = new Date();

    if (timeFilter === 'upcoming') {
      query.date = { $gte: now };
    } else if (timeFilter === 'past') {
      query.date = { $lt: now };
    }

    if (clubId) {
      query.club = clubId;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const events = await Event.find(query)
      .populate('club', 'name category image')
      .populate('createdBy', 'name email')
      .sort({ date: 1 });

    // Fetch participant counts for these events
    const eventIds = events.map(e => e._id);
    const registrations = await EventRegistration.aggregate([
      { $match: { event: { $in: eventIds }, status: 'Registered' } },
      { $group: { _id: '$event', count: { $sum: 1 } } }
    ]);

    const regMap = {};
    registrations.forEach(r => {
      regMap[r._id.toString()] = r.count;
    });

    const enrichedEvents = events.map(e => ({
      ...e.toObject(),
      registeredCount: regMap[e._id.toString()] || 0,
    }));

    res.json({ success: true, count: enrichedEvents.length, data: enrichedEvents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/events/:id
// @desc    Get single event with registration info
// @access  Public
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('club')
      .populate('createdBy', 'name email');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const registeredCount = await EventRegistration.countDocuments({
      event: event._id,
      status: 'Registered',
    });

    res.json({ success: true, data: { ...event.toObject(), registeredCount } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/events
// @desc    Create a new event
// @access  Private (Club Coordinator, Admin)
exports.createEvent = async (req, res) => {
  try {
    const { title, description, club, date, time, venue, category, maxParticipants, image } = req.body;

    // Check if user is coordinator of this club or Admin
    const targetClub = await Club.findById(club);
    if (!targetClub) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    if (req.user.role !== 'Admin' && targetClub.coordinator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to create events for this club' });
    }

    const newEvent = await Event.create({
      title,
      description,
      club,
      date: new Date(date),
      time: time || '10:00 AM - 01:00 PM',
      venue,
      category: category || 'Workshop',
      maxParticipants: maxParticipants || 100,
      image: image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80',
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: newEvent, message: 'Event created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/events/:id
// @desc    Update an event
// @access  Private (Club Coordinator, Admin)
exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const club = await Club.findById(event.club);
    if (
      req.user.role !== 'Admin' &&
      event.createdBy.toString() !== req.user._id.toString() &&
      club.coordinator.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this event' });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: event, message: 'Event updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/events/:id
// @desc    Delete an event
// @access  Private (Club Coordinator, Admin)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const club = await Club.findById(event.club);
    if (
      req.user.role !== 'Admin' &&
      event.createdBy.toString() !== req.user._id.toString() &&
      club.coordinator.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);
    await EventRegistration.deleteMany({ event: req.params.id });

    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/events/:id/register
// @desc    Register for an event
// @access  Private
exports.registerForEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check duplicate
    const existing = await EventRegistration.findOne({ event: eventId, user: req.user._id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event!',
      });
    }

    // Check capacity
    const currentCount = await EventRegistration.countDocuments({ event: eventId, status: 'Registered' });
    if (event.maxParticipants && currentCount >= event.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Sorry, this event has reached maximum capacity!',
      });
    }

    const registration = await EventRegistration.create({
      event: eventId,
      user: req.user._id,
      status: 'Registered',
    });

    res.status(201).json({
      success: true,
      data: registration,
      message: 'Successfully registered for event! Ticket confirmed.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/events/my-registrations
// @desc    Get current user's registered events
// @access  Private
exports.getMyRegistrations = async (req, res) => {
  try {
    const registrations = await EventRegistration.find({ user: req.user._id })
      .populate({
        path: 'event',
        populate: { path: 'club', select: 'name category' },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: registrations.length, data: registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
