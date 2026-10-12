const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'cim-marrakech-default-secret-key-2026';

function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// Express Middleware to protect admin endpoints
function requireAuth(req, res, next) {
  // Check cookie or Authorization header
  let token = req.cookies?.cim_token;
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, error: "Non autorisé. Veuillez vous connecter." });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ success: false, error: "Session expirée ou invalide." });
  }

  req.user = payload;
  next();
}

module.exports = {
  generateToken,
  verifyToken,
  requireAuth
};
