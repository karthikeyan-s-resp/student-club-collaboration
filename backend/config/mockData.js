const bcrypt = require('bcryptjs');

const initMockData = async (store) => {
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash('password123', salt);

  const uAdmin = {
    _id: 'usr_admin',
    name: 'Campus Dean / Admin',
    email: 'admin@college.edu',
    password,
    role: 'Admin',
    department: 'Academic Affairs',
    year: 'Faculty',
    createdAt: new Date(),
  };

  const uAlex = {
    _id: 'usr_alex',
    name: 'Alex Johnson',
    email: 'alex.coding@college.edu',
    password,
    role: 'Club Coordinator',
    department: 'Computer Science',
    year: '3rd Year',
    createdAt: new Date(),
  };

  const uSarah = {
    _id: 'usr_sarah',
    name: 'Sarah Chen',
    email: 'sarah.robotics@college.edu',
    password,
    role: 'Club Coordinator',
    department: 'Electrical Engineering',
    year: '4th Year',
    createdAt: new Date(),
  };

  const uEmma = {
    _id: 'usr_emma',
    name: 'Emma Watson',
    email: 'emma.student@college.edu',
    password,
    role: 'Student',
    department: 'Information Science',
    year: '2nd Year',
    createdAt: new Date(),
  };

  const uDavid = {
    _id: 'usr_david',
    name: 'David Miller',
    email: 'david.student@college.edu',
    password,
    role: 'Student',
    department: 'Electronics',
    year: '1st Year',
    createdAt: new Date(),
  };

  store.collections.users = [uAdmin, uAlex, uSarah, uEmma, uDavid];

  const cCoding = {
    _id: 'clb_coding',
    name: 'Coding Club',
    description: 'Premier college tech hub dedicated to competitive programming, hackathons, and web & AI development.',
    category: 'Technical',
    coordinator: uAlex,
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=700&q=80',
    establishedYear: 2020,
    contactEmail: 'codingclub@college.edu',
    createdAt: new Date(),
  };

  const cRobotics = {
    _id: 'clb_robotics',
    name: 'Robotics Club',
    description: 'Building autonomous rovers, drones, IoT hardware, and competing in state & national robotics leagues.',
    category: 'Technical',
    coordinator: uSarah,
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=700&q=80',
    establishedYear: 2019,
    contactEmail: 'robotics@college.edu',
    createdAt: new Date(),
  };

  const cCultural = {
    _id: 'clb_cultural',
    name: 'Cultural & Arts Club',
    description: 'Uniting passionate dancers, musicians, dramatists, and artists to organize university cultural fests.',
    category: 'Cultural',
    coordinator: uAlex,
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=700&q=80',
    establishedYear: 2018,
    contactEmail: 'cultural@college.edu',
    createdAt: new Date(),
  };

  const cSports = {
    _id: 'clb_sports',
    name: 'Sports & Athletics Club',
    description: 'Promoting fitness, sportsmanship, and inter-collegiate tournaments in Football, Basketball, Cricket, and Badminton.',
    category: 'Sports',
    coordinator: uSarah,
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=700&q=80',
    establishedYear: 2017,
    contactEmail: 'sports@college.edu',
    createdAt: new Date(),
  };

  store.collections.clubs = [cCoding, cRobotics, cCultural, cSports];

  const evt1 = {
    _id: 'evt_1',
    title: 'HackCampus 2026: 24h Hackathon',
    description: 'Annual college flagship hackathon where student teams build cutting-edge web, mobile, and AI solutions.',
    club: cCoding,
    date: new Date(Date.now() + 7 * 86400000),
    time: '09:00 AM - 09:00 AM Next Day',
    venue: 'Main Auditorium & Innovation Lab',
    category: 'Hackathon',
    maxParticipants: 120,
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=700&q=80',
    createdBy: uAlex,
    createdAt: new Date(),
  };

  const evt2 = {
    _id: 'evt_2',
    title: 'RoboWars & Drone Obstacle League',
    description: 'High-voltage combat robotics face-off along with high-speed autonomous drone tracking arena.',
    club: cRobotics,
    date: new Date(Date.now() + 14 * 86400000),
    time: '11:00 AM - 04:00 PM',
    venue: 'Campus Indoor Stadium',
    category: 'Competition',
    maxParticipants: 80,
    image: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=700&q=80',
    createdBy: uSarah,
    createdAt: new Date(),
  };

  const evt3 = {
    _id: 'evt_3',
    title: 'Spring Acoustic Night & Jam Session',
    description: 'An open-air evening filled with acoustic renditions, band battles, poetry slams, and festive stalls.',
    club: cCultural,
    date: new Date(Date.now() + 20 * 86400000),
    time: '05:30 PM - 09:30 PM',
    venue: 'Open Air Amphitheatre',
    category: 'Cultural',
    maxParticipants: 250,
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=700&q=80',
    createdBy: uAlex,
    createdAt: new Date(),
  };

  store.collections.events = [evt1, evt2, evt3];

  store.collections.memberships = [
    {
      _id: 'mem_1',
      user: uEmma,
      club: cCoding,
      status: 'Approved',
      notes: 'Interested in frontend and fullstack react development.',
      createdAt: new Date(),
    },
    {
      _id: 'mem_2',
      user: uEmma,
      club: cCultural,
      status: 'Pending',
      notes: 'I play guitar and would love to participate in music events.',
      createdAt: new Date(),
    },
    {
      _id: 'mem_3',
      user: uDavid,
      club: cRobotics,
      status: 'Approved',
      notes: 'Experienced with Arduino and Raspberry Pi hardware.',
      createdAt: new Date(),
    },
  ];

  store.collections.registrations = [
    {
      _id: 'reg_1',
      event: evt1,
      user: uEmma,
      ticketNumber: 'TKT-HACK26-891',
      status: 'Registered',
      createdAt: new Date(),
    },
    {
      _id: 'reg_2',
      event: evt2,
      user: uDavid,
      ticketNumber: 'TKT-ROBO-412',
      status: 'Registered',
      createdAt: new Date(),
    },
  ];

  store.collections.collaborations = [
    {
      _id: 'collab_1',
      fromClub: cCoding,
      toClub: cRobotics,
      proposedEventTitle: 'AI Autonomous Drone Symposium',
      description: 'Joint 2-day workshop where Coding Club trains PyTorch models and Robotics implements flight controllers.',
      proposedDate: new Date(Date.now() + 25 * 86400000),
      status: 'Accepted',
      responseMessage: 'Hardware laboratory reserved! Looking forward to collaborating.',
      initiatedBy: uAlex,
      createdAt: new Date(),
    },
  ];

  store.collections.announcements = [
    {
      _id: 'ann_1',
      title: 'HackCampus 2026 Registration Open!',
      content: 'Registration portal is live. Team size is 2-4 members with great prizes and mentor sessions.',
      club: cCoding,
      postedBy: uAlex,
      priority: 'Important',
      createdAt: new Date(),
    },
    {
      _id: 'ann_2',
      title: 'Robotics Lab Equipment Inductions',
      content: '3D printers and soldering stations safety induction will be held this Thursday at 4 PM.',
      club: cRobotics,
      postedBy: uSarah,
      priority: 'Normal',
      createdAt: new Date(),
    },
  ];

  console.log('[Store] Seed collections populated successfully with demo records.');
};

module.exports = { initMockData };
