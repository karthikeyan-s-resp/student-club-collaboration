# 🎓 Student Club Collaboration Platform (CampusClubs)

A complete, working Full Stack college web platform where university students can discover clubs, request memberships, register for events with unique ticket passes, broadcast notices, and initiate inter-club collaborations.

---

## 🌟 Key Highlights & Features

### 1. 🔐 Authentication & Role-Based Access Control (RBAC)
- **Roles**:
  - **Student**: Discover clubs, submit membership applications, view notices, and register for events with instant ticket generation.
  - **Club Coordinator**: Lead clubs, review and approve/reject membership requests, host events, propose inter-club collaborations, and publish notices.
  - **Admin**: System governance, view institution-wide metrics, manage student/coordinator roles, and govern clubs.
- Secure password hashing using **bcryptjs**.
- **JWT (JSON Web Token)** authorization attached to HTTP requests.

### 2. 📊 Modern Interactive Dashboard
- Live institutional metrics: Total clubs, upcoming events, personal club memberships, and registered event tickets.
- Action reminders for club coordinators regarding pending membership reviews and joint collaboration invitations.
- Quick preview widgets for upcoming events and urgent notices.

### 3. 👥 Club Management
- Discover technical, cultural, sports, and arts clubs.
- Search by keyword and filter by category (Technical, Cultural, Sports, Arts & Media, etc.).
- Students can apply for membership with a statement of interest.
- Coordinators can review applicant credentials, department, year, and approve/reject requests with live status badges.

### 4. 📅 Event Management & Ticket Pass
- Filter events by **Upcoming** or **Past**.
- Complete CRUD: Create, edit, and delete events (restricted to authorized coordinators and admins).
- Real-time attendee counter tracking against venue capacity.
- Instant ticket generation (e.g. `TKT-4GWT7A`) and duplicate registration prevention.

### 5. 🤝 Inter-Club Collaborations
- Coordinators can propose joint initiatives and symposiums to other clubs.
- Recipient coordinators can review proposals and accept or decline with notes.

### 6. 📢 Campus Announcements & Notices
- Club coordinators broadcast urgent or normal notices directly to students.
- Students stay updated on auditions, venue shifts, and deadlines.

### 7. 🛡️ Admin Governance
- View and filter all registered campus accounts.
- Elevate student accounts to **Club Coordinator** or **Admin**.
- Institutional oversight on clubs and platform operations.

---

## 💻 Tech Stack
- **Frontend**: React.js 18, Bootstrap 5.3, Bootstrap Icons, Axios, Plus Jakarta Sans typography.
- **Backend**: Node.js, Express.js REST API, JWT, bcryptjs, CORS, dotenv.
- **Database**: MongoDB + Mongoose with auto-fallback in-memory store for instant zero-config testing.

---

## 🚀 Exact Setup & Execution Commands

### Prerequisites
- Node.js (v18 or higher)
- Optional: Local MongoDB (`mongodb://127.0.0.1:27017/student_club_platform`) or MongoDB Atlas.
  *(Note: If MongoDB service is not started on your machine, the backend automatically activates its built-in store so all APIs and CRUD operations work out-of-the-box!)*

### 1. Start the Backend API Server
```bash
# Navigate to the backend directory, install once, then start it.
cd backend
npm install
npm start
```
You will see:
```
Backend server listening on http://localhost:5000
[Database] Full CRUD operations (Auth, Clubs, Events, Memberships, Collabs, Notices) are completely operational.
```

### 2. Start the Frontend Application
In a new terminal window:
```bash
# Navigate to the frontend directory, install once, then start Vite.
cd frontend
npm install
npm run dev
```
Open your web browser and navigate to:
👉 **`http://localhost:3000`**

---

## ⚡ Demo Credentials (Click to quick-fill on Login screen)

All demo accounts use password: **`password123`**

| Role | Email | Name | Capabilities |
| :--- | :--- | :--- | :--- |
| **🎓 Student** | `emma.student@college.edu` | Emma Watson | Browse clubs, request membership, register for events |
| **🚀 Club Coordinator** | `alex.coding@college.edu` | Alex Johnson | Leads Coding Club, review requests, create events, propose collabs |
| **🚀 Club Coordinator** | `sarah.robotics@college.edu`| Sarah Chen | Leads Robotics Club, manage events & joint partnerships |
| **🛡️ Admin** | `admin@college.edu` | Campus Dean / Admin | Governance, user role updates, institutional statistics |

---

## 📡 REST API Documentation

### Auth Endpoints
- `POST /api/auth/register` - Create student or coordinator account.
- `POST /api/auth/login` - Authenticate and receive JWT token.
- `GET /api/auth/me` - Fetch profile of current logged-in user.

### Clubs
- `GET /api/clubs?search=&category=` - List clubs with keyword and category filters.
- `POST /api/clubs` - Create new club (Coordinator/Admin).
- `DELETE /api/clubs/:id` - Delete club (Admin).

### Memberships
- `POST /api/memberships/request` - Submit student membership application.
- `GET /api/memberships/my-requests` - Get current user's membership requests.
- `GET /api/memberships/club/:clubId` - Get applicants for a specific club (Coordinator/Admin).
- `PUT /api/memberships/:id/status` - Approve or reject membership request.

### Events
- `GET /api/events?timeFilter=upcoming|past` - Get events with registration counts.
- `POST /api/events` - Host a new event (Coordinator/Admin).
- `PUT /api/events/:id` - Edit event details (Coordinator/Admin).
- `DELETE /api/events/:id` - Remove event (Coordinator/Admin).
- `POST /api/events/:id/register` - Register student for event ticket pass.
- `GET /api/events/my-registrations` - View tickets of logged-in user.

### Collaborations
- `GET /api/collaborations` - View inter-club proposals.
- `POST /api/collaborations` - Propose collaboration to another club.
- `PUT /api/collaborations/:id/respond` - Accept or reject collaboration request.

### Announcements
- `GET /api/announcements` - List all campus notices.
- `POST /api/announcements` - Broadcast notice (Coordinator/Admin).
- `DELETE /api/announcements/:id` - Remove notice.

### Dashboard & Admin
- `GET /api/dashboard/stats` - Institutional metrics based on user role.
- `GET /api/dashboard/admin/users` - Directory of all users (Admin).
- `PUT /api/dashboard/admin/users/:id/role` - Elevate or update user roles (Admin).
