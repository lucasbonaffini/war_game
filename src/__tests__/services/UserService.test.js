const pool = require('../../config/db');
const UserService = require('../../services/UserService');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');

jest.mock('../../config/db');
jest.mock('bcryptjs');

describe('UserService', () => {

    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
      });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createUser', () => {
        test('should create a new user with hashed password', async () => {
            const mockUser = { id: '1', username: 'testUser', password: 'hashedPassword', role: 'user' };
            bcrypt.hash.mockResolvedValue('hashedPassword');
            pool.query.mockResolvedValue([{}]);

            const newUser = await UserService.createUser('testUser', 'password', 'user');

            expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
            expect(pool.query).toHaveBeenCalledWith('INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)', [newUser.id, newUser.username, newUser.password, newUser.role]);
            expect(newUser).toEqual(expect.any(User));
            expect(newUser.username).toBe('testUser');
            expect(newUser.password).toBe('hashedPassword');
            expect(newUser.role).toBe('user');
        });

        test('should handle database errors', async () => {
            bcrypt.hash.mockResolvedValue('hashedPassword');
            pool.query.mockRejectedValue(new Error('Database Error'));

            await expect(UserService.createUser('testUser', 'password', 'user')).rejects.toThrow('Failed to create user');
        });
    });

    describe('getUserById', () => {
        test('should return a user by id', async () => {
            const mockUser = { id: '1', username: 'testUser', password: 'hashedPassword', role: 'user' };
            pool.query.mockResolvedValue([[mockUser]]);

            const user = await UserService.getUserById('1');

            expect(pool.query).toHaveBeenCalledWith('SELECT id, username, password, role FROM users WHERE id = ?', ['1']);
            expect(user).toEqual(expect.any(User));
            expect(user.id).toBe('1');
            expect(user.username).toBe('testUser');
            expect(user.password).toBe('hashedPassword');
            expect(user.role).toBe('user');
        });

        test('should return null if user not found', async () => {
            pool.query.mockResolvedValue([[]]);

            const user = await UserService.getUserById('999');

            expect(pool.query).toHaveBeenCalledWith('SELECT id, username, password, role FROM users WHERE id = ?', ['999']);
            expect(user).toBeNull();
        });

        test('should handle database errors', async () => {
            pool.query.mockRejectedValue(new Error('Database Error'));

            await expect(UserService.getUserById('1')).rejects.toThrow('Failed to fetch user');
        });
    });

    describe('getUserByUsername', () => {
        test('should return a user by username', async () => {
            const mockUser = { id: '1', username: 'testUser', password: 'hashedPassword', role: 'user' };
            pool.query.mockResolvedValue([[mockUser]]);

            const user = await UserService.getUserByUsername('testUser');

            expect(pool.query).toHaveBeenCalledWith('SELECT id, username, password, role FROM users WHERE username = ?', ['testUser']);
            expect(user).toEqual(expect.any(User));
            expect(user.id).toBe('1');
            expect(user.username).toBe('testUser');
            expect(user.password).toBe('hashedPassword');
            expect(user.role).toBe('user');
        });

        test('should return null if user not found', async () => {
            pool.query.mockResolvedValue([[]]);

            const user = await UserService.getUserByUsername('unknownUser');

            expect(pool.query).toHaveBeenCalledWith('SELECT id, username, password, role FROM users WHERE username = ?', ['unknownUser']);
            expect(user).toBeNull();
        });

        test('should handle database errors', async () => {
            pool.query.mockRejectedValue(new Error('Database Error'));

            await expect(UserService.getUserByUsername('testUser')).rejects.toThrow('Failed to fetch user');
        });
    });
});
