// src/security/auth.js
const jwtUtils = require('./jwtUtils');

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401); // Unauthorized

  try {
    const user = jwtUtils.verifyToken(token);
    req.user = user;
    next();
  } catch (err) {
    res.sendStatus(403); // Forbidden
  }
}

module.exports = { authenticateToken };
