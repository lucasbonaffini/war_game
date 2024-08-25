const request = require('supertest');
const express = require('express');
const router = require('../../routes/AuthRouter');
const UserService = require('../../services/UserService');
const { createToken } = require('../../security/jwtUtils');
const authMiddleware = require('../../security/authMiddleware');

jest.mock('../../services/UserService');
jest.mock('../../security/jwtUtils');
jest.mock('../../security/authMiddleware');

const app = express();
app.use(express.json());
app.use('/auth', router);

describe('Auth Router', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /auth/register', () => {
        test('should create a new user', async () => {
            const mockUser = { id: '1', username: 'testuser' };
            UserService.createUser.mockResolvedValue(mockUser);

            const response = await request(app)
                .post('/auth/register')
                .send({ username: 'testuser', password: 'password123' });

            expect(response.status).toBe(201);
            expect(response.body).toEqual(mockUser);
            expect(UserService.createUser).toHaveBeenCalledWith('testuser', 'password123');
        });

        test('should return 500 if there is an error creating the user', async () => {
            UserService.createUser.mockRejectedValue(new Error('Error creating user'));

            const response = await request(app)
                .post('/auth/register')
                .send({ username: 'testuser', password: 'password123' });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Error creating user' });
        });
    });

    describe('POST /auth/login', () => {
        test('should return a token for valid credentials', async () => {
            const mockUser = { id: '1', username: 'testuser', verifyPassword: jest.fn().mockResolvedValue(true) };
            const mockToken = 'mockToken';
            UserService.getUserByUsername.mockResolvedValue(mockUser);
            createToken.mockReturnValue(mockToken);

            const response = await request(app)
                .post('/auth/login')
                .send({ username: 'testuser', password: 'password123' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ token: mockToken });
            expect(UserService.getUserByUsername).toHaveBeenCalledWith('testuser');
            expect(mockUser.verifyPassword).toHaveBeenCalledWith('password123');
            expect(createToken).toHaveBeenCalledWith({ id: '1', username: 'testuser' });
        });

        test('should return 401 for invalid credentials', async () => {
            const mockUser = { id: '1', username: 'testuser', verifyPassword: jest.fn().mockResolvedValue(false) };
            UserService.getUserByUsername.mockResolvedValue(mockUser);

            const response = await request(app)
                .post('/auth/login')
                .send({ username: 'testuser', password: 'wrongpassword' });

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ error: 'Invalid credentials' });
            expect(UserService.getUserByUsername).toHaveBeenCalledWith('testuser');
            expect(mockUser.verifyPassword).toHaveBeenCalledWith('wrongpassword');
        });

        test('should return 500 if there is an error during login', async () => {
            UserService.getUserByUsername.mockRejectedValue(new Error('Error logging in'));

            const response = await request(app)
                .post('/auth/login')
                .send({ username: 'testuser', password: 'password123' });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Error logging in' });
        });
    });

    describe('GET /auth/protected', () => {
        test('should return the protected route for a valid token', async () => {
            const mockUser = { id: '1', username: 'testuser' };
            authMiddleware.mockImplementation((req, res, next) => {
                req.user = mockUser;
                next();
            });

            const response = await request(app).get('/auth/protected');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'This is a protected route', user: mockUser });
        });

        test('should return 401 for an invalid token', async () => {
            authMiddleware.mockImplementation((req, res, next) => {
                res.status(401).json({ error: 'Unauthorized' });
            });

            const response = await request(app).get('/auth/protected');

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ error: 'Unauthorized' });
        });
    });
});
