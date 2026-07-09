import jwt from 'jsonwebtoken';

jest.mock('../../models/User', () => ({
  User: {
    findById: jest.fn(),
  },
}));

jest.mock('../../models/ActivityLog', () => ({
  ActivityLog: { create: jest.fn().mockResolvedValue(undefined) },
}));

jest.mock('../../services/notificationService', () => ({
  createNotification: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../sockets', () => ({
  emitToUser: jest.fn(),
  emitToPostRoom: jest.fn(),
}));

import request from 'supertest';
import app from '../../app';
import { User } from '../../models/User';
import { createNotification } from '../../services/notificationService';
import { ActivityLog } from '../../models/ActivityLog';

const ADMIN_ID = '507f1f77bcf86cd799439011';
const TARGET_ID = '507f1f77bcf86cd799439012';

function tokenFor(userId: string, role: 'user' | 'admin') {
  return jwt.sign({ userId, role }, process.env.JWT_ACCESS_SECRET || 'dev_access_secret');
}

function fakeUser(overrides: Record<string, unknown> = {}) {
  const doc: Record<string, unknown> = {
    _id: TARGET_ID,
    role: 'user',
    isActive: true,
    name: 'Target User',
    username: 'targetuser',
    email: 'target@example.com',
    avatar: '',
    bio: '',
    socialLinks: {},
    followersCount: 0,
    followingCount: 0,
    createdAt: new Date(),
    ...overrides,
  };
  doc.save = jest.fn().mockResolvedValue(doc);
  return doc;
}

/** Mimics `User.findById(id).select(...)` as used by the `protect` middleware. */
function asSelectChain(user: unknown) {
  return { select: jest.fn().mockResolvedValue(user) };
}

describe('PATCH /api/admin/users/:id/role', () => {
  const mockedFindById = User.findById as jest.Mock;

  it('rejects the request without an admin token (401 with no token at all)', async () => {
    const res = await request(app).patch(`/api/admin/users/${TARGET_ID}/role`).send({ role: 'admin' });
    expect(res.status).toBe(401);
  });

  it('rejects a non-admin user with 403', async () => {
    mockedFindById.mockImplementationOnce(() =>
      asSelectChain(fakeUser({ _id: ADMIN_ID, role: 'user' }))
    );

    const res = await request(app)
      .patch(`/api/admin/users/${TARGET_ID}/role`)
      .set('Authorization', `Bearer ${tokenFor(ADMIN_ID, 'user')}`)
      .send({ role: 'admin' });

    expect(res.status).toBe(403);
  });

  it('rejects an invalid role value with 400', async () => {
    mockedFindById.mockImplementationOnce(() => asSelectChain(fakeUser({ _id: ADMIN_ID, role: 'admin' })));

    const res = await request(app)
      .patch(`/api/admin/users/${TARGET_ID}/role`)
      .set('Authorization', `Bearer ${tokenFor(ADMIN_ID, 'admin')}`)
      .send({ role: 'superadmin' });

    expect(res.status).toBe(400);
  });

  it('prevents an admin from changing their own role', async () => {
    mockedFindById.mockImplementationOnce(() => asSelectChain(fakeUser({ _id: ADMIN_ID, role: 'admin' })));

    const res = await request(app)
      .patch(`/api/admin/users/${ADMIN_ID}/role`)
      .set('Authorization', `Bearer ${tokenFor(ADMIN_ID, 'admin')}`)
      .send({ role: 'user' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/cannot change your own role/i);
  });

  it('promotes a user to admin, logs activity, and sends a notification', async () => {
    mockedFindById
      .mockImplementationOnce(() => asSelectChain(fakeUser({ _id: ADMIN_ID, role: 'admin' }))) // protect() middleware
      .mockImplementationOnce(() => Promise.resolve(fakeUser({ _id: TARGET_ID, role: 'user' }))); // controller lookup

    const res = await request(app)
      .patch(`/api/admin/users/${TARGET_ID}/role`)
      .set('Authorization', `Bearer ${tokenFor(ADMIN_ID, 'admin')}`)
      .send({ role: 'admin' });

    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe('admin');
    expect(ActivityLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'admin_change_role', user: ADMIN_ID })
    );
    expect(createNotification).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'role_change', recipient: TARGET_ID })
    );
  });

  it('returns 404 when the target user does not exist', async () => {
    mockedFindById
      .mockImplementationOnce(() => asSelectChain(fakeUser({ _id: ADMIN_ID, role: 'admin' })))
      .mockImplementationOnce(() => Promise.resolve(null));

    const res = await request(app)
      .patch(`/api/admin/users/${TARGET_ID}/role`)
      .set('Authorization', `Bearer ${tokenFor(ADMIN_ID, 'admin')}`)
      .send({ role: 'admin' });

    expect(res.status).toBe(404);
  });

  it('is a no-op (still 200) when the user already has the requested role', async () => {
    mockedFindById
      .mockImplementationOnce(() => asSelectChain(fakeUser({ _id: ADMIN_ID, role: 'admin' })))
      .mockImplementationOnce(() => Promise.resolve(fakeUser({ _id: TARGET_ID, role: 'admin' })));

    const res = await request(app)
      .patch(`/api/admin/users/${TARGET_ID}/role`)
      .set('Authorization', `Bearer ${tokenFor(ADMIN_ID, 'admin')}`)
      .send({ role: 'admin' });

    expect(res.status).toBe(200);
    expect(ActivityLog.create).not.toHaveBeenCalled();
  });
});
