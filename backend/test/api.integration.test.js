const assert = require('node:assert/strict');
const { before, after, test } = require('node:test');
const http = require('node:http');
const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  throw new Error('MONGODB_URI and JWT_SECRET are required to run API integration tests');
}

const testDatabaseName = `campusclubs_api_test_${Date.now()}_${process.pid}`;
const uri = new URL(process.env.MONGODB_URI);
uri.pathname = `/${testDatabaseName}`;
process.env.MONGODB_URI = uri.toString();

const app = require('../server');
const User = require('../models/User');
const mongoose = require('mongoose');

let server;
let baseUrl;
let student;
let coordinatorOne;
let coordinatorTwo;
let admin;
let clubOne;
let clubTwo;
let membershipId;
let eventId;
let collaborationId;

const request = async (route, { method = 'GET', token, body } = {}) => {
  const response = await fetch(`${baseUrl}${route}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, body: await response.json() };
};

const registerAndLogin = async (label) => {
  const email = `qa.${label}.${Date.now()}.${process.pid}@example.test`;
  const password = 'QaAutomationPass!2026';
  const registration = await request('/api/auth/register', {
    method: 'POST',
    body: { name: `QA ${label}`, email, password, role: 'Admin', department: 'QA', year: '1st Year' },
  });
  assert.equal(registration.status, 201);
  assert.equal(registration.body.data.role, 'Student');
  assert.equal(registration.body.data.password, undefined);

  const login = await request('/api/auth/login', { method: 'POST', body: { email, password } });
  assert.equal(login.status, 200);
  return { id: login.body.data._id, email, token: login.body.data.token };
};

before(async () => {
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;

  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (global.databaseReady) break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.equal(global.databaseReady, true, 'isolated MongoDB connection should be ready');

  student = await registerAndLogin('student');
  coordinatorOne = await registerAndLogin('coordinator-one');
  coordinatorTwo = await registerAndLogin('coordinator-two');
  admin = await registerAndLogin('admin');
  await User.findByIdAndUpdate(coordinatorOne.id, { role: 'Club Coordinator' });
  await User.findByIdAndUpdate(coordinatorTwo.id, { role: 'Club Coordinator' });
  await User.findByIdAndUpdate(admin.id, { role: 'Admin' });

  const coordinatorOneLogin = await request('/api/auth/login', { method: 'POST', body: { email: coordinatorOne.email, password: 'QaAutomationPass!2026' } });
  const coordinatorTwoLogin = await request('/api/auth/login', { method: 'POST', body: { email: coordinatorTwo.email, password: 'QaAutomationPass!2026' } });
  const adminLogin = await request('/api/auth/login', { method: 'POST', body: { email: admin.email, password: 'QaAutomationPass!2026' } });
  coordinatorOne.token = coordinatorOneLogin.body.data.token;
  coordinatorTwo.token = coordinatorTwoLogin.body.data.token;
  admin.token = adminLogin.body.data.token;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
});

test('registration, login, invalid JWT, and role escalation prevention', async () => {
  const duplicate = await request('/api/auth/register', {
    method: 'POST', body: { name: 'Duplicate', email: student.email, password: 'QaAutomationPass!2026' },
  });
  assert.equal(duplicate.status, 400);

  const invalidJwt = await request('/api/auth/me', { token: 'not.a.valid.jwt' });
  assert.equal(invalidJwt.status, 401);
});

test('student restrictions and public club search', async () => {
  const deniedAdmin = await request('/api/dashboard/admin/users', { token: student.token });
  const deniedCoordinator = await request('/api/clubs', { method: 'POST', token: student.token, body: {} });
  const search = await request('/api/clubs?search=no-match');
  assert.equal(deniedAdmin.status, 403);
  assert.equal(deniedCoordinator.status, 403);
  assert.equal(search.status, 200);
  assert.deepEqual(search.body.data, []);
});

test('club creators become leads and coordinator updates cannot transfer leadership', async () => {
  const suffix = `${Date.now()}-${process.pid}`;
  const first = await request('/api/clubs', { method: 'POST', token: coordinatorOne.token, body: { name: `QA Club One ${suffix}`, description: 'Isolated QA club', category: 'Technical' } });
  const second = await request('/api/clubs', { method: 'POST', token: coordinatorTwo.token, body: { name: `QA Club Two ${suffix}`, description: 'Isolated QA club', category: 'Cultural' } });
  assert.equal(first.status, 201);
  assert.equal(second.status, 201);
  clubOne = first.body.data;
  clubTwo = second.body.data;

  const adminClub = await request('/api/clubs', {
    method: 'POST',
    token: admin.token,
    body: { name: `QA Admin Club ${suffix}`, description: 'Isolated QA club', category: 'Academic', coordinator: coordinatorOne.id },
  });
  assert.equal(adminClub.status, 201);
  assert.equal(adminClub.body.data.coordinator.toString(), admin.id);

  const coordinatorUpdate = await request(`/api/clubs/${clubOne._id}`, {
    method: 'PUT',
    token: coordinatorOne.token,
    body: { description: 'Updated by club lead', coordinator: coordinatorTwo.id },
  });
  const adminUpdate = await request(`/api/clubs/${clubOne._id}`, {
    method: 'PUT',
    token: admin.token,
    body: { description: 'Admin must not edit this club' },
  });
  assert.equal(coordinatorUpdate.status, 200);
  assert.equal(coordinatorUpdate.body.data.coordinator.toString(), coordinatorOne.id);
  assert.equal(adminUpdate.status, 403);

  const event = await request('/api/events', { method: 'POST', token: coordinatorOne.token, body: { title: `QA Event ${suffix}`, description: 'Isolated QA event', club: clubOne._id, date: '2030-01-01', venue: 'QA Hall', maxParticipants: 10 } });
  const announcement = await request('/api/announcements', { method: 'POST', token: coordinatorOne.token, body: { title: `QA Notice ${suffix}`, content: 'Isolated QA announcement', club: clubOne._id, priority: 'Normal' } });
  const collaboration = await request('/api/collaborations', { method: 'POST', token: coordinatorOne.token, body: { fromClubId: clubOne._id, toClubId: clubTwo._id, proposedEventTitle: `QA Collaboration ${suffix}`, description: 'Isolated QA collaboration', proposedDate: '2030-02-01' } });
  assert.equal(event.status, 201);
  assert.equal(announcement.status, 201);
  assert.equal(collaboration.status, 201);
  eventId = event.body.data._id;
  collaborationId = collaboration.body.data._id;
});

test('membership approval and event duplicate prevention work', async () => {
  const membership = await request('/api/memberships/request', { method: 'POST', token: student.token, body: { clubId: clubOne._id, notes: 'QA test membership' } });
  const duplicateMembership = await request('/api/memberships/request', { method: 'POST', token: student.token, body: { clubId: clubOne._id } });
  assert.equal(membership.status, 201);
  assert.equal(duplicateMembership.status, 400);
  membershipId = membership.body.data._id;

  const approved = await request(`/api/memberships/${membershipId}/status`, { method: 'PUT', token: coordinatorOne.token, body: { status: 'Approved' } });
  assert.equal(approved.status, 200);

  const eventRegistration = await request(`/api/events/${eventId}/register`, { method: 'POST', token: student.token });
  const duplicateEventRegistration = await request(`/api/events/${eventId}/register`, { method: 'POST', token: student.token });
  assert.equal(eventRegistration.status, 201);
  assert.equal(duplicateEventRegistration.status, 400);
});

test('only an admin can respond to collaboration requests', async () => {
  const coordinatorResponse = await request(`/api/collaborations/${collaborationId}/respond`, { method: 'PUT', token: coordinatorTwo.token, body: { status: 'Accepted', responseMessage: 'QA accepted' } });
  const response = await request(`/api/collaborations/${collaborationId}/respond`, { method: 'PUT', token: admin.token, body: { status: 'Accepted', responseMessage: 'QA accepted' } });
  const coordinatorDeniedAdmin = await request('/api/dashboard/admin/users', { token: coordinatorOne.token });
  const adminUsers = await request('/api/dashboard/admin/users', { token: admin.token });
  assert.equal(coordinatorResponse.status, 403);
  assert.equal(response.status, 200);
  assert.equal(response.body.data.status, 'Accepted');
  assert.equal(coordinatorDeniedAdmin.status, 403);
  assert.equal(adminUsers.status, 200);
});

test('malformed identifiers and schema input return 400', async () => {
  const malformedClub = await request('/api/clubs/not-an-object-id');
  const malformedEvent = await request('/api/events/not-an-object-id');
  const malformedMembership = await request('/api/memberships/request', { method: 'POST', token: student.token, body: { clubId: 'not-an-object-id' } });
  const invalidEvent = await request('/api/events', { method: 'POST', token: coordinatorOne.token, body: { title: '', club: clubOne._id, date: 'not-a-date' } });
  assert.equal(malformedClub.status, 400);
  assert.equal(malformedEvent.status, 400);
  assert.equal(malformedMembership.status, 400);
  assert.equal(invalidEvent.status, 400);
});
