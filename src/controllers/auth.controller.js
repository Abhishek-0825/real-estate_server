const bcrypt = require('bcryptjs');
const { signToken } = require('../utils/jwt');
const sendEmail = require('../utils/email');
const { generateOtp, validateOtp } = require('../utils/otp');
const {
  findUserByEmailOrMobile,
  findUserById,
  isEmailOrMobileTaken,
  createUser,
  markUserVerified,
  saveOtp,
  findLatestOtp,
  markOtpVerified
} = require('../services/auth.service');

const normalizeRole = (role) => (['Admin','Buyer','Seller'].includes(role) ? role : 'Buyer');

// ---------- REGISTER ----------
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

    const user_id = await createUser({ email, mobile, password_hash, role: userRole, name });

    // Generate & store OTP
    const { otp, otpHash, otpExpiry } = generateOtp();
    await saveOtp(user_id, otpHash, otpExpiry);

    // Send OTP email
    await sendEmail(
      email,
      'Verify your RealEstate account',
      `<p>Hi ${name},</p><p>Your verification code is <b>${otp}</b>. It expires in 5 minutes.</p>`
    );

    return res.status(201).json({
      status: 'pending',
      message: 'OTP sent to your email. Please verify to activate your account.',
      user_id
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
};

// ---------- VERIFY OTP ----------
exports.verifyOtp = async (req, res) => {
  try {
    const { user_id, otp } = req.body;
    if (!user_id || !otp) return res.status(400).json({ error: 'user_id and otp are required' });

    const latestOtp = await findLatestOtp(user_id);
    if (!latestOtp) return res.status(400).json({ error: 'No OTP found. Please request a new one.' });
    if (latestOtp.verified) return res.status(400).json({ error: 'OTP already used' });

    const { valid, message } = validateOtp(otp, latestOtp.otp_hash, latestOtp.otp_expiry);
    if (!valid) return res.status(400).json({ error: message });

    await markOtpVerified(latestOtp.otp_id);
    await markUserVerified(user_id);

    const user = await findUserById(user_id);
    const token = signToken(user);

    return res.json({
      status: 'success',
      message: 'OTP verified successfully',
      token,
      user
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
};

// ---------- RESEND OTP ----------
exports.resendOtp = async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: 'user_id is required' });

    const user = await findUserById(user_id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.is_verified) return res.status(400).json({ error: 'User already verified' });

    const { otp, otpHash, otpExpiry } = generateOtp();
    await saveOtp(user_id, otpHash, otpExpiry);

    await sendEmail(
      user.email,
      'Your new verification code',
      `<p>Hi ${user.name || 'there'},</p><p>Your new code is <b>${otp}</b>. It expires in 5 minutes.</p>`
    );

    return res.json({ status: 'success', message: 'OTP resent to email' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
};

// ---------- LOGIN ----------
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

    if (!userRow.is_verified) {
      // Hard block until email OTP verified
      return res.status(403).json({
        error: 'Email not verified. Please verify OTP sent to your email.',
        user_id: userRow.user_id
      });
    }

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
