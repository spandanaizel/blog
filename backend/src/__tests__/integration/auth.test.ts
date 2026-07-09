import request from 'supertest';

// Mock the User model entirely so these tests never touch a real database.
jest.mock('../../models/User', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

// Mock the socket layer so requiring the app doesn't try to use a real Socket.IO instance.
jest.mock('../../sockets', () => ({
  emitToUser: jest.fn(),
  emitToPostRoom: jest.fn(),
}));

// ActivityLog.create is called as a side effect of register(); stub it out.
jest.mock('../../models/ActivityLog', () => ({
  ActivityLog: { create: jest.fn().mockResolvedValue(undefined) },
}));

import app from '../../app';
import { User } from '../../models/User';

const mockedFindOne = User.findOne as jest.Mock;
const mockedCreate = User.create as jest.Mock;

function fakeUserDoc(overrides: Record<string, unknown> = {}) {
  return {
    _id: 'user_123',
    name: 'Ada Lovelace',
    username: 'ada',
    email: 'ada@example.com',
    avatar: 'https://example.com/avatar.png',
    bio: '',
    socialLinks: {},
    role: 'user',
    followersCount: 0,
    followingCount: 0,
    tokenVersion: 0,
    createdAt: new Date(),
    ...overrides,
  };
}

describe('POST /api/auth/register', () => {
  it('creates a new account and returns a user payload + access token', async () => {
    mockedFindOne.mockResolvedValue(null);
    mockedCreate.mockResolvedValue(fakeUserDoc());

    const res = await request(app).post('/api/auth/register').send({
      name: 'Ada Lovelace',
      username: 'ada',
      email: 'ada@example.com',
      password: 'supersecret123',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.username).toBe('ada');
    expect(res.body.data.user).not.toHaveProperty('password');
    expect(typeof res.body.data.accessToken).toBe('string');
  });

  it('rejects registration when the email is already taken', async () => {
    mockedFindOne.mockResolvedValue(fakeUserDoc({ email: 'ada@example.com' }));

    const res = await request(app).post('/api/auth/register').send({
      name: 'Ada Lovelace',
      username: 'ada2',
      email: 'ada@example.com',
      password: 'supersecret123',
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/email/i);
  });

  it('rejects an invalid payload before ever touching the database', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'A',
      username: 'a',
      email: 'not-an-email',
      password: 'short',
    });

    expect(res.status).toBe(400);
    expect(mockedFindOne).not.toHaveBeenCalled();
  });
});
