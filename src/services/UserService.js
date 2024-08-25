const pool = require('../config/db');
const User = require('../models/User');
const bcrypt = require('bcrypt');

class UserService {
  static async createUser(username, password, role) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User(null, username, hashedPassword, role);
    const query = 'INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)';
    await pool.query(query, [newUser.id, newUser.username, newUser.password, newUser.role]);
    return newUser;
  }

  static async getUserById(id) {
    const query = 'SELECT * FROM users WHERE id = ?';
    const [rows] = await pool.query(query, [id]);
    if (rows.length === 0) return null;
    const { username, password, role } = rows[0];
    return new User(id, username, password, role);
  }

  static async getUserByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = ?';
    const [rows] = await pool.query(query, [username]);
    if (rows.length === 0) return null;
    const { id, password, role } = rows[0];
    return new User(id, username, password, role);
  }
}

module.exports = UserService;
