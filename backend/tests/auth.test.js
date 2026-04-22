const request = require('supertest');

jest.mock('../config/db', () => ({
  execute: jest.fn()
}));

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const app = require('../app');

describe('Auth routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test_secret';
  });

  test('register returns user payload without password', async () => {
    bcrypt.hash.mockResolvedValue('hashed_password');

    pool.execute
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[{ id: 1 }]])
      .mockResolvedValueOnce([{ insertId: 10 }]);

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        first_name: 'Ava',
        last_name: 'Singh',
        email: 'ava@example.com',
        phone: '+15551234567',
        password: 'StrongPass123'
      })
      .expect(201);

    expect(response.body).toMatchObject({
      id: 10,
      first_name: 'Ava',
      last_name: 'Singh',
      email: 'ava@example.com',
      phone: '+15551234567',
      role: 'Customer'
    });

    expect(response.body.password_hash).toBeUndefined();
  });

  test('admin can create employee', async () => {
    bcrypt.hash.mockResolvedValue('hashed_password');
    jwt.verify.mockReturnValue({ sub: 1, role: 'Admin', branch_id: null });

    pool.execute
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[{ id: 2 }]])
      .mockResolvedValueOnce([{ insertId: 22 }]);

    const response = await request(app)
      .post('/api/auth/register')
      .set('Authorization', 'Bearer admin_token')
      .send({
        first_name: 'Riya',
        last_name: 'Patel',
        email: 'riya.employee@example.com',
        phone: '+15551239999',
        password: 'StrongPass123',
        role: 'Employee'
      })
      .expect(201);

    expect(response.body).toMatchObject({
      id: 22,
      first_name: 'Riya',
      last_name: 'Patel',
      email: 'riya.employee@example.com',
      phone: '+15551239999',
      role: 'Employee'
    });
  });

  test('non-admin cannot create employee', async () => {
    jwt.verify.mockReturnValue({ sub: 3, role: 'Customer', branch_id: null });

    const response = await request(app)
      .post('/api/auth/register')
      .set('Authorization', 'Bearer customer_token')
      .send({
        first_name: 'Leo',
        last_name: 'Chen',
        email: 'leo.employee@example.com',
        phone: '+15550001111',
        password: 'StrongPass123',
        role: 'Employee'
      })
      .expect(403);

    expect(response.body.error).toMatchObject({ message: 'Only Admin can create Employee' });
    expect(pool.execute).not.toHaveBeenCalled();
  });

  test('login returns jwt token and user payload', async () => {
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('test_token');

    pool.execute
      .mockResolvedValueOnce([
        [{
          id: 2,
          email: 'admin@example.com',
          password_hash: 'stored_hash',
          branch_id: null,
          role: 'Admin'
        }]
      ])
      .mockResolvedValueOnce([{}]);

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'StrongPass123'
      })
      .expect(200);

    expect(response.body).toEqual({
      token: 'test_token',
      user: {
        id: 2,
        email: 'admin@example.com',
        role: 'Admin',
        branch_id: null
      }
    });

    expect(pool.execute).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO audit_logs'),
      [2, 'LOGIN', 'users', 2, expect.any(String)]
    );
  });
});
