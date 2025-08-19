const jwt = require('jsonwebtoken');

function signToken(user) {
  return jwt.sign(
    {
      user_id: user.user_id,
      name: user.name,
      role: user.role    // "Admin" or "Buyer"
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { signToken, verifyToken };
