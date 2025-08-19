const bcrypt = require('bcryptjs');
const { signToken } = require('../utils/jwt');
const {
  findUserByEmailOrMobile,
  isEmailOrMobileTaken,
  createUser
} = require('../services/auth.service');

const normalizeRole = (role) => (role === 'Admin' ? 'Admin' : 'Buyer');

exports.register = async (req, res) => {
  try {
    const { name, email, mobile, password, role } = req.body;
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ error: 'name, email, mobile, password are required' });
    }
    const taken = await isEmailOrMobileTaken(email, mobile);
    if (taken) return res.status(409).json({ error: 'Email or mobile already in use' });

    const password_hash = await bcrypt.hash(password, 12);
    const userRole = normalizeRole(role);

    const user_id = await createUser({ name, email, mobile, password_hash, role: userRole });

    const token = signToken({ user_id, name, role: userRole });
    return res.status(201).json({
      status: 'success',
      token,
      user: { user_id, name, email, mobile, role: userRole }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { emailOrMobile, password } = req.body;
    if (!emailOrMobile || !password) {
      return res.status(400).json({ error: 'emailOrMobile and password are required' });
    }
    const userRow = await findUserByEmailOrMobile(emailOrMobile);
    if (!userRow) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, userRow.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const user = {
      user_id: userRow.user_id,
      name: userRow.name,
      email: userRow.email,
      mobile: userRow.mobile,
      role: userRow.role
    };
    const token = signToken(user);
    return res.json({ status: 'success', token, user });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
};
