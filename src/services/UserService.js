const pool = require('../config/db');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

class UserService {
  static async createUser(username, password, role) {
    try {
      
      if (!username || !password) {
        throw new Error('Username and password are required');
      }

      
      const hashedPassword = await bcrypt.hash(password, 10);

      
      const newUser = new User(undefined, username, hashedPassword, role);

      
      const query = 'INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)';
      await pool.query(query, [newUser.id, newUser.username, newUser.password, newUser.role]);

      return newUser;
    } catch (error) {
      console.error('Error creating user:', error.message);
      throw new Error('Failed to create user');
    }
  }

  static async getUserById(id) {
    try {
      const query = 'SELECT id, username, password, role FROM users WHERE id = ?';
      const [rows] = await pool.query(query, [id]);

      if (rows.length === 0) return null;

      const { username, password, role } = rows[0];
      return new User(id, username, password, role);
    } catch (error) {
      console.error('Error fetching user by ID:', error.message);
      throw new Error('Failed to fetch user');
    }
  }

  static async getUserByUsername(username) {
    try {
      const query = 'SELECT id, username, password, role FROM users WHERE username = ?';
      const [rows] = await pool.query(query, [username]);

      if (rows.length === 0) return null;

      const { id, password, role } = rows[0];
      return new User(id, username, password, role);
    } catch (error) {
      console.error('Error fetching user by username:', error.message);
      throw new Error('Failed to fetch user');
    }
  }
}

module.exports = UserService;

