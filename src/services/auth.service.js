const { pool } = require('../db');

// ---------- USERS / PROFILE ----------
async function findUserByEmailOrMobile(emailOrMobile) {
  const [rows] = await pool.query(
    `SELECT u.user_id, u.email, u.mobile, u.password_hash, u.role, u.is_verified,
            p.name
     FROM Users u
     LEFT JOIN UserProfiles p ON p.user_id = u.user_id
     WHERE u.email = ? OR u.mobile = ?
     LIMIT 1`,
    [emailOrMobile, emailOrMobile]
  );
  return rows[0] || null;
}

async function findUserById(user_id) {
  const [rows] = await pool.query(
    `SELECT u.user_id, u.email, u.mobile, u.role, u.is_verified,
            p.name
     FROM Users u
     LEFT JOIN UserProfiles p ON p.user_id = u.user_id
     WHERE u.user_id = ?
     LIMIT 1`,
    [user_id]
  );
  return rows[0] || null;
}

async function isEmailOrMobileTaken(email, mobile) {
  const [rows] = await pool.query(
    `SELECT user_id FROM Users WHERE email = ? OR mobile = ? LIMIT 1`,
    [email, mobile]
  );
  return rows.length > 0;
}

async function createUser({ email, mobile, password_hash, role, name }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO Users (email, mobile, password_hash, role)
       VALUES (?, ?, ?, ?)`,
      [email, mobile, password_hash, role]
    );
    const user_id = result.insertId;

    await conn.query(
      `INSERT INTO UserProfiles (user_id, name) VALUES (?, ?)`,
      [user_id, name]
    );

    await conn.commit();
    return user_id;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function markUserVerified(user_id) {
  await pool.query(`UPDATE Users SET is_verified = 1 WHERE user_id = ?`, [user_id]);
}

// ---------- OTP ----------
async function saveOtp(user_id, otpHash, otpExpiry) {
  await pool.query(
    `INSERT INTO UserOtps (user_id, otp_hash, otp_expiry) VALUES (?, ?, ?)`,
    [user_id, otpHash, otpExpiry]
  );
}

async function findLatestOtp(user_id) {
  const [rows] = await pool.query(
    `SELECT otp_id, otp_hash, otp_expiry, verified, created_at
     FROM UserOtps
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 1`,
    [user_id]
  );
  return rows[0] || null;
}

async function markOtpVerified(otp_id) {
  await pool.query(`UPDATE UserOtps SET verified = TRUE WHERE otp_id = ?`, [otp_id]);
}

module.exports = {
  // users
  findUserByEmailOrMobile,
  findUserById,
  isEmailOrMobileTaken,
  createUser,
  markUserVerified,
  // otp
  saveOtp,
  findLatestOtp,
  markOtpVerified
};
