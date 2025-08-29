const { verifyToken } = require('../utils/jwt');

function auth(req, res, next) {
  try {
    const hdr = req.headers.authorization || '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing token' });

    const decoded = verifyToken(token);
    req.user = decoded; // { user_id, name, role }
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// allow either a single role or any of an array of roles
function requireRole(roles) {
  const required = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.user || !required.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

module.exports = { auth, requireRole };
