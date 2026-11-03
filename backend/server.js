const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB, memoryStore } = require('./config/db');
const { initMockData } = require('./config/mockData');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// These are the existing Mongoose-backed route modules.  The server uses
// them whenever MongoDB is connected and falls back to the handlers below
// only when a database service is not available.
const mongoApi = express.Router();
mongoApi.use('/auth', require('./routes/authRoutes'));
mongoApi.use('/clubs', require('./routes/clubRoutes'));
mongoApi.use('/events', require('./routes/eventRoutes'));
mongoApi.use('/memberships', require('./routes/membershipRoutes'));
mongoApi.use('/collaborations', require('./routes/collaborationRoutes'));
mongoApi.use('/announcements', require('./routes/announcementRoutes'));
mongoApi.use('/dashboard', require('./routes/dashboardRoutes'));

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Until the connection attempt finishes, use the safe local fallback. This
// prevents Mongoose query buffering from delaying the first HTTP request.
global.usingMemoryDb = true;
app.use('/api', (req, res, next) => {
  if (!global.usingMemoryDb) return mongoApi(req, res, next);
  next();
});

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_college_student_clubs_2026';

// Initialize DB & Seed
(async () => {
  await connectDB();
  if (global.usingMemoryDb) {
    await initMockData(memoryStore);
  }
})();

// Helper to authenticate token
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized, no token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = memoryStore.collections.users.find((u) => u._id === decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

// Keep the in-memory fallback subject to the same role rules as the
// Mongoose route controllers.  This is important because fallback mode is
// intended for local demos only, not as a way to bypass authorization.
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'You do not have permission to perform this action' });
  }
  next();
};

// -------------------------------------------------------------
// AUTH ROUTES
// -------------------------------------------------------------
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, department, year } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const exists = memoryStore.collections.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      _id: 'usr_' + Date.now(),
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'Student',
      department: department || 'Engineering',
      year: year || '1st Year',
      createdAt: new Date(),
    };

    memoryStore.collections.users.push(newUser);
    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      success: true,
      data: { ...newUser, token },
      message: 'Registration successful!',
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = memoryStore.collections.users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        year: user.year,
        token,
      },
      message: 'Login successful!',
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.get('/api/auth/me', auth, (req, res) => {
  const { password, ...safeUser } = req.user;
  res.json({ success: true, data: safeUser });
});

// -------------------------------------------------------------
// CLUBS ROUTES
// -------------------------------------------------------------
app.get('/api/clubs', (req, res) => {
  const { search, category } = req.query;
  let list = [...memoryStore.collections.clubs];

  if (search) {
    const s = search.toLowerCase();
    list = list.filter((c) => c.name.toLowerCase().includes(s) || c.description.toLowerCase().includes(s));
  }
  if (category && category !== 'All') {
    list = list.filter((c) => c.category === category);
  }

  res.json({ success: true, count: list.length, data: list });
});

app.post('/api/clubs', auth, authorize('Club Coordinator', 'Admin'), (req, res) => {
  const { name, description, category, contactEmail, image } = req.body;
  const newClub = {
    _id: 'clb_' + Date.now(),
    name,
    description,
    category: category || 'Technical',
    coordinator: req.user,
    contactEmail: contactEmail || req.user.email,
    image: image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
    establishedYear: new Date().getFullYear(),
    createdAt: new Date(),
  };

  memoryStore.collections.clubs.push(newClub);
  res.status(201).json({ success: true, data: newClub, message: 'Club created successfully' });
});

app.delete('/api/clubs/:id', auth, authorize('Admin'), (req, res) => {
  memoryStore.collections.clubs = memoryStore.collections.clubs.filter((c) => c._id !== req.params.id);
  res.json({ success: true, message: 'Club deleted successfully' });
});

// -------------------------------------------------------------
// MEMBERSHIP ROUTES
// -------------------------------------------------------------
app.post('/api/memberships/request', auth, (req, res) => {
  const { clubId, notes } = req.body;
  const targetClub = memoryStore.collections.clubs.find((c) => c._id === clubId);
  if (!targetClub) return res.status(404).json({ success: false, message: 'Club not found' });

  const existing = memoryStore.collections.memberships.find(
    (m) => m.user._id === req.user._id && (m.club._id === clubId || m.club === clubId)
  );

  if (existing) {
    return res.status(400).json({ success: false, message: `Request already exists with status: ${existing.status}` });
  }

  const newMembership = {
    _id: 'mem_' + Date.now(),
    user: req.user,
    club: targetClub,
    notes: notes || '',
    status: 'Pending',
    createdAt: new Date(),
  };

  memoryStore.collections.memberships.push(newMembership);
  res.status(201).json({ success: true, data: newMembership, message: 'Membership request submitted!' });
});

app.get('/api/memberships/my-requests', auth, (req, res) => {
  const list = memoryStore.collections.memberships.filter((m) => m.user._id === req.user._id);
  res.json({ success: true, count: list.length, data: list });
});

app.get('/api/memberships/club/:clubId', auth, authorize('Club Coordinator', 'Admin'), (req, res) => {
  const list = memoryStore.collections.memberships.filter(
    (m) => m.club._id === req.params.clubId || m.club === req.params.clubId
  );
  res.json({ success: true, count: list.length, data: list });
});

app.put('/api/memberships/:id/status', auth, authorize('Club Coordinator', 'Admin'), (req, res) => {
  const mem = memoryStore.collections.memberships.find((m) => m._id === req.params.id);
  if (!mem) return res.status(404).json({ success: false, message: 'Membership not found' });

  mem.status = req.body.status;
  res.json({ success: true, data: mem, message: `Status updated to ${req.body.status}` });
});

// -------------------------------------------------------------
// EVENT ROUTES
// -------------------------------------------------------------
app.get('/api/events', (req, res) => {
  const { timeFilter, search } = req.query;
  let list = [...memoryStore.collections.events];
  const now = new Date();

  if (timeFilter === 'upcoming') {
    list = list.filter((e) => new Date(e.date) >= now);
  } else if (timeFilter === 'past') {
    list = list.filter((e) => new Date(e.date) < now);
  }

  if (search) {
    const s = search.toLowerCase();
    list = list.filter((e) => e.title.toLowerCase().includes(s) || e.description.toLowerCase().includes(s));
  }

  const enriched = list.map((e) => {
    const regCount = memoryStore.collections.registrations.filter(
      (r) => (r.event._id === e._id || r.event === e._id) && r.status === 'Registered'
    ).length;
    return { ...e, registeredCount: regCount };
  });

  res.json({ success: true, count: enriched.length, data: enriched });
});

app.post('/api/events', auth, authorize('Club Coordinator', 'Admin'), (req, res) => {
  const { title, description, club, date, time, venue, category, maxParticipants, image } = req.body;
  const targetClub = memoryStore.collections.clubs.find((c) => c._id === club);

  const newEvent = {
    _id: 'evt_' + Date.now(),
    title,
    description,
    club: targetClub || { name: 'Campus Event' },
    date: new Date(date),
    time: time || '10:00 AM - 01:00 PM',
    venue: venue || 'Main Campus Hall',
    category: category || 'Workshop',
    maxParticipants: Number(maxParticipants) || 100,
    image: image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80',
    createdBy: req.user,
    createdAt: new Date(),
  };

  memoryStore.collections.events.push(newEvent);
  res.status(201).json({ success: true, data: newEvent, message: 'Event published successfully' });
});

app.put('/api/events/:id', auth, authorize('Club Coordinator', 'Admin'), (req, res) => {
  const index = memoryStore.collections.events.findIndex((e) => e._id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Event not found' });

  memoryStore.collections.events[index] = {
    ...memoryStore.collections.events[index],
    ...req.body,
    date: new Date(req.body.date || memoryStore.collections.events[index].date),
  };
  res.json({ success: true, data: memoryStore.collections.events[index], message: 'Event updated successfully' });
});

app.delete('/api/events/:id', auth, authorize('Club Coordinator', 'Admin'), (req, res) => {
  memoryStore.collections.events = memoryStore.collections.events.filter((e) => e._id !== req.params.id);
  res.json({ success: true, message: 'Event deleted successfully' });
});

app.post('/api/events/:id/register', auth, (req, res) => {
  const eventId = req.params.id;
  const targetEvent = memoryStore.collections.events.find((e) => e._id === eventId);
  if (!targetEvent) return res.status(404).json({ success: false, message: 'Event not found' });

  const existing = memoryStore.collections.registrations.find(
    (r) => r.user._id === req.user._id && (r.event._id === eventId || r.event === eventId)
  );

  if (existing) {
    return res.status(400).json({ success: false, message: 'You are already registered for this event!' });
  }

  const reg = {
    _id: 'reg_' + Date.now(),
    event: targetEvent,
    user: req.user,
    status: 'Registered',
    ticketNumber: 'TKT-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    createdAt: new Date(),
  };

  memoryStore.collections.registrations.push(reg);
  res.status(201).json({ success: true, data: reg, message: 'Registered successfully!' });
});

app.get('/api/events/my-registrations', auth, (req, res) => {
  const list = memoryStore.collections.registrations.filter((r) => r.user._id === req.user._id);
  res.json({ success: true, count: list.length, data: list });
});

// -------------------------------------------------------------
// COLLABORATIONS ROUTES
// -------------------------------------------------------------
app.get('/api/collaborations', auth, (req, res) => {
  res.json({ success: true, count: memoryStore.collections.collaborations.length, data: memoryStore.collections.collaborations });
});

app.post('/api/collaborations', auth, authorize('Club Coordinator', 'Admin'), (req, res) => {
  const { fromClubId, toClubId, proposedEventTitle, description, proposedDate } = req.body;
  const fromClub = memoryStore.collections.clubs.find((c) => c._id === fromClubId);
  const toClub = memoryStore.collections.clubs.find((c) => c._id === toClubId);

  const collab = {
    _id: 'collab_' + Date.now(),
    fromClub,
    toClub,
    proposedEventTitle,
    description,
    proposedDate: proposedDate ? new Date(proposedDate) : undefined,
    status: 'Pending',
    initiatedBy: req.user,
    responseMessage: '',
    createdAt: new Date(),
  };

  memoryStore.collections.collaborations.unshift(collab);
  res.status(201).json({ success: true, data: collab, message: 'Collaboration proposal sent!' });
});

app.put('/api/collaborations/:id/respond', auth, authorize('Club Coordinator', 'Admin'), (req, res) => {
  const collab = memoryStore.collections.collaborations.find((c) => c._id === req.params.id);
  if (!collab) return res.status(404).json({ success: false, message: 'Collaboration proposal not found' });

  collab.status = req.body.status;
  collab.responseMessage = req.body.responseMessage || '';
  res.json({ success: true, data: collab, message: `Collaboration marked as ${req.body.status}` });
});

// -------------------------------------------------------------
// ANNOUNCEMENTS ROUTES
// -------------------------------------------------------------
app.get('/api/announcements', (req, res) => {
  res.json({ success: true, count: memoryStore.collections.announcements.length, data: memoryStore.collections.announcements });
});

app.post('/api/announcements', auth, authorize('Club Coordinator', 'Admin'), (req, res) => {
  const { title, content, club, priority } = req.body;
  const targetClub = memoryStore.collections.clubs.find((c) => c._id === club);

  const ann = {
    _id: 'ann_' + Date.now(),
    title,
    content,
    club: targetClub || { name: 'Campus Club' },
    priority: priority || 'Normal',
    postedBy: req.user,
    createdAt: new Date(),
  };

  memoryStore.collections.announcements.unshift(ann);
  res.status(201).json({ success: true, data: ann, message: 'Announcement posted!' });
});

app.delete('/api/announcements/:id', auth, authorize('Club Coordinator', 'Admin'), (req, res) => {
  memoryStore.collections.announcements = memoryStore.collections.announcements.filter((a) => a._id !== req.params.id);
  res.json({ success: true, message: 'Announcement deleted successfully' });
});

// -------------------------------------------------------------
// DASHBOARD & ADMIN ROUTES
// -------------------------------------------------------------
app.get('/api/dashboard/stats', auth, (req, res) => {
  const totalClubs = memoryStore.collections.clubs.length;
  const totalEvents = memoryStore.collections.events.length;
  const upcomingEvents = memoryStore.collections.events.filter((e) => new Date(e.date) >= new Date()).length;
  const totalUsers = memoryStore.collections.users.length;

  const myMembershipsCount = memoryStore.collections.memberships.filter(
    (m) => m.user._id === req.user._id && m.status === 'Approved'
  ).length;

  const myRegisteredEventsCount = memoryStore.collections.registrations.filter(
    (r) => r.user._id === req.user._id && r.status === 'Registered'
  ).length;

  const pendingClubRequestsCount = memoryStore.collections.memberships.filter((m) => m.status === 'Pending').length;
  const pendingCollabsCount = memoryStore.collections.collaborations.filter((c) => c.status === 'Pending').length;

  res.json({
    success: true,
    data: {
      totalClubs,
      totalEvents,
      upcomingEvents,
      totalUsers,
      myMembershipsCount,
      myRegisteredEventsCount,
      pendingClubRequestsCount,
      pendingCollabsCount,
    },
  });
});

app.get('/api/dashboard/admin/users', auth, authorize('Admin'), (req, res) => {
  const safeList = memoryStore.collections.users.map(({ password, ...u }) => u);
  res.json({ success: true, count: safeList.length, data: safeList });
});

app.put('/api/dashboard/admin/users/:id/role', auth, authorize('Admin'), (req, res) => {
  const user = memoryStore.collections.users.find((u) => u._id === req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  user.role = req.body.role;
  res.json({ success: true, data: user, message: 'User role updated successfully' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    message: 'Student Club Collaboration Platform API active',
    mode: global.usingMemoryDb ? 'in-memory-adapter' : 'mongodb',
    timestamp: new Date(),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});
