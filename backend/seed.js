const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Club = require('./models/Club');
const Event = require('./models/Event');
const Membership = require('./models/Membership');
const EventRegistration = require('./models/EventRegistration');
const Collaboration = require('./models/Collaboration');
const Announcement = require('./models/Announcement');

const seedData = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student_club_platform';
    
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
      console.log(`[Seed] Connected to ${mongoUri}`);
    } catch (e) {
      console.log('[Seed] Local mongo not active, using MongoMemoryServer to verify seed logic');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      await mongoose.connect(mongod.getUri());
      console.log('[Seed] Connected to In-Memory Mongo successfully');
    }

    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await Club.deleteMany({});
    await Event.deleteMany({});
    await Membership.deleteMany({});
    await EventRegistration.deleteMany({});
    await Collaboration.deleteMany({});
    await Announcement.deleteMany({});

    console.log('[Seed] Creating demo users...');
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('password123', salt);

    const admin = await User.create({
      name: 'Campus Dean / Admin',
      email: 'admin@college.edu',
      password: defaultPassword,
      role: 'Admin',
      department: 'Academic Affairs',
      year: 'Faculty',
    });

    const coordinator1 = await User.create({
      name: 'Alex Johnson',
      email: 'alex.coding@college.edu',
      password: defaultPassword,
      role: 'Club Coordinator',
      department: 'Computer Science',
      year: '3rd Year',
    });

    const coordinator2 = await User.create({
      name: 'Sarah Chen',
      email: 'sarah.robotics@college.edu',
      password: defaultPassword,
      role: 'Club Coordinator',
      department: 'Electrical Engineering',
      year: '4th Year',
    });

    const coordinator3 = await User.create({
      name: 'Rohan Sharma',
      email: 'rohan.cultural@college.edu',
      password: defaultPassword,
      role: 'Club Coordinator',
      department: 'Mechanical Engineering',
      year: '3rd Year',
    });

    const student1 = await User.create({
      name: 'Emma Watson',
      email: 'emma.student@college.edu',
      password: defaultPassword,
      role: 'Student',
      department: 'Information Science',
      year: '2nd Year',
    });

    const student2 = await User.create({
      name: 'David Miller',
      email: 'david.student@college.edu',
      password: defaultPassword,
      role: 'Student',
      department: 'Electronics',
      year: '1st Year',
    });

    console.log('[Seed] Creating clubs...');
    const codingClub = await Club.create({
      name: 'Coding Club',
      description: 'The premier technical hub dedicated to competitive programming, hackathons, open-source development, and modern web & AI tech stacks.',
      category: 'Technical',
      coordinator: coordinator1._id,
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=700&q=80',
      establishedYear: 2020,
      contactEmail: 'codingclub@college.edu',
    });

    const roboticsClub = await Club.create({
      name: 'Robotics Club',
      description: 'Where hardware meets software! Building autonomous rovers, drones, IoT hardware, and competing in national robotics challenges.',
      category: 'Technical',
      coordinator: coordinator2._id,
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=700&q=80',
      establishedYear: 2019,
      contactEmail: 'robotics@college.edu',
    });

    const culturalClub = await Club.create({
      name: 'Cultural & Arts Club',
      description: 'Uniting passionate dancers, musicians, dramatists, and artists to organize the university annual festival and festive celebrations.',
      category: 'Cultural',
      coordinator: coordinator3._id,
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=700&q=80',
      establishedYear: 2018,
      contactEmail: 'cultural@college.edu',
    });

    const photoClub = await Club.create({
      name: 'Photography & Media Club',
      description: 'Capturing campus life through lenses. Conducting photowalks, portrait sessions, video editing workshops, and exhibitions.',
      category: 'Arts & Media',
      coordinator: coordinator1._id,
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=700&q=80',
      establishedYear: 2021,
      contactEmail: 'photoclub@college.edu',
    });

    const sportsClub = await Club.create({
      name: 'Sports & Athletics Club',
      description: 'Promoting fitness, sportsmanship, and inter-collegiate tournaments in Football, Basketball, Cricket, Badminton, and Table Tennis.',
      category: 'Sports',
      coordinator: coordinator2._id,
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=700&q=80',
      establishedYear: 2017,
      contactEmail: 'sports@college.edu',
    });

    console.log('[Seed] Creating memberships...');
    await Membership.create([
      { user: student1._id, club: codingClub._id, status: 'Approved', roleInClub: 'Core Member' },
      { user: student1._id, club: culturalClub._id, status: 'Pending', roleInClub: 'Member' },
      { user: student2._id, club: roboticsClub._id, status: 'Approved', roleInClub: 'Member' },
      { user: student2._id, club: sportsClub._id, status: 'Pending', roleInClub: 'Member' },
    ]);

    console.log('[Seed] Creating events...');
    const event1 = await Event.create({
      title: 'HackCampus 2026: 24h Hackathon',
      description: 'Annual flagship hackathon where students build cutting-edge web, mobile, and AI solutions with cash prizes and mentor guidance.',
      club: codingClub._id,
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // in 7 days
      time: '09:00 AM - 09:00 AM Next Day',
      venue: 'Main Auditorium & Innovation Lab',
      category: 'Hackathon',
      maxParticipants: 120,
      image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=700&q=80',
      createdBy: coordinator1._id,
    });

    const event2 = await Event.create({
      title: 'RoboWars & Drone Obstacle League',
      description: 'High-voltage combat robotics face-off along with high-speed autonomous drone tracking arena.',
      club: roboticsClub._id,
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // in 14 days
      time: '11:00 AM - 04:00 PM',
      venue: 'Campus Indoor Stadium',
      category: 'Competition',
      maxParticipants: 80,
      image: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=700&q=80',
      createdBy: coordinator2._id,
    });

    const event3 = await Event.create({
      title: 'Spring Acoustic Night & Jam Session',
      description: 'An open-air evening filled with acoustic renditions, band battles, poetry slams, and food stalls under the stars.',
      club: culturalClub._id,
      date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), // in 18 days
      time: '05:30 PM - 09:30 PM',
      venue: 'Open Air Amphitheatre',
      category: 'Cultural',
      maxParticipants: 250,
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=700&q=80',
      createdBy: coordinator3._id,
    });

    const event4 = await Event.create({
      title: 'Intro to Full Stack MERN Development',
      description: 'Past hands-on seminar covering React, Node.js, Express, and MongoDB for second year students.',
      club: codingClub._id,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      time: '02:00 PM - 05:00 PM',
      venue: 'CS Seminar Hall 2',
      category: 'Workshop',
      maxParticipants: 60,
      image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=700&q=80',
      createdBy: coordinator1._id,
    });

    console.log('[Seed] Creating event registrations...');
    await EventRegistration.create([
      { event: event1._id, user: student1._id, status: 'Registered' },
      { event: event2._id, user: student2._id, status: 'Registered' },
      { event: event3._id, user: student1._id, status: 'Registered' },
      { event: event4._id, user: student2._id, status: 'Attended' },
    ]);

    console.log('[Seed] Creating club collaboration proposal...');
    await Collaboration.create([
      {
        fromClub: codingClub._id,
        toClub: roboticsClub._id,
        proposedEventTitle: 'AI-Powered Autonomous Robotics Workshop',
        description: 'A 2-day joint symposium where Coding Club handles Computer Vision / PyTorch training and Robotics Club integrates firmware onto ESP32 rovers.',
        proposedDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        status: 'Accepted',
        responseMessage: 'Thrilled to collaborate! We have already reserved the hardware laboratory.',
        initiatedBy: coordinator1._id,
      },
      {
        fromClub: photoClub._id,
        toClub: culturalClub._id,
        proposedEventTitle: 'Campus Fest Official Media & Live Coverage',
        description: 'Joint partnership to handle the complete photography, cinematography, and social media reels for the annual cultural extravaganza.',
        proposedDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'Pending',
        responseMessage: '',
        initiatedBy: coordinator1._id,
      },
    ]);

    console.log('[Seed] Creating announcements...');
    await Announcement.create([
      {
        title: 'HackCampus 2026 Registration Portals Open!',
        content: 'Teams of up to 4 members can register starting today. Selected teams get free cloud credits and swag boxes.',
        club: codingClub._id,
        postedBy: coordinator1._id,
        priority: 'Important',
      },
      {
        title: 'Call for Robocon 2026 Hardware Designers',
        content: 'Robotics Club invites students with CAD or electronics soldering experience to join the design sprint this Friday at 4 PM.',
        club: roboticsClub._id,
        postedBy: coordinator2._id,
        priority: 'Normal',
      },
      {
        title: 'Auditions for Annual University Play',
        content: 'Theatre wing auditions will take place on Tuesday at the amphitheatre. Bring a 2-minute monologue.',
        club: culturalClub._id,
        postedBy: coordinator3._id,
        priority: 'Urgent',
      },
    ]);

    console.log('----------------------------------------------------');
    console.log(' DATABASE SEEDED SUCCESSFULLY!');
    console.log(' Demo Login Accounts (Password for all: password123)');
    console.log(' 1. Admin:        admin@college.edu');
    console.log(' 2. Coordinator:  alex.coding@college.edu');
    console.log(' 3. Coordinator:  sarah.robotics@college.edu');
    console.log(' 4. Student:      emma.student@college.edu');
    console.log(' 5. Student:      david.student@college.edu');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedData();
