const crypto = require('crypto');

const SECRET_KEY = process.env.JWT_SECRET || 'your-very-secure-secret-key'; 

function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str) {
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}

function createToken(payload, expiresIn = '1h') {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const exp = Math.floor(Date.now() / 1000) + (expiresIn === '1h' ? 3600 : 0); // Only 1h expiry for simplicity
  const payloadWithExp = { ...payload, exp };
  const payloadEncoded = base64UrlEncode(JSON.stringify(payloadWithExp));
  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(`${header}.${payloadEncoded}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `${header}.${payloadEncoded}.${signature}`;
}

function verifyToken(token) {
  const [header, payload, signature] = token.split('.');
  const expectedSignature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(`${header}.${payload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  if (expectedSignature !== signature) {
    throw new Error('Invalid token signature');
  }
  const decodedPayload = JSON.parse(base64UrlDecode(payload));
  if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired');
  }
  return decodedPayload;
}

module.exports = {
  createToken,
  verifyToken
};

