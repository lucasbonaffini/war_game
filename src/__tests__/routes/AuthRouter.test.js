const request = require('supertest');
const express = require('express');
const authRouter = require('../../routes/AuthRouter');
const UserService = require('../../services/UserService');

jest.mock('../../services/UserService');

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('Auth Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should register a new user', async () => {
    const mockUser = { id: '1', username: 'testuser', password: 'password' };
    UserService.createUser.mockResolvedValue(mockUser);

    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'testuser', password: 'password' });

    expect(UserService.createUser).toHaveBeenCalledWith('testuser', 'password');
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(mockUser);
  });

  test('should login a user', async () => {
    const mockUser = { id: '1', username: 'testuser', password: 'hashedpassword', verifyPassword: jest.fn().mockResolvedValue(true) };
    UserService.getUserByUsername.mockResolvedValue(mockUser);

    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'testuser', password: 'password' });

    expect(UserService.getUserByUsername).toHaveBeenCalledWith('testuser');
    expect(mockUser.verifyPassword).toHaveBeenCalledWith('password');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('should fail login with invalid credentials', async () => {
    UserService.getUserByUsername.mockResolvedValue(null);

    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'wronguser', password: 'wrongpassword' });

    expect(UserService.getUserByUsername).toHaveBeenCalledWith('wronguser');
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Invalid credentials' });
  });
});
