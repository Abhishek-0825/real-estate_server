const { pool } = require('../db');

async function findUserByEmailOrMobile(emailOrMobile) {
  const [rows] = await pool.query(
    `SELECT user_id, name, email, mobile, password_hash, role
     FROM Users
     WHERE email = ? OR mobile = ?
     LIMIT 1`,
    [emailOrMobile, emailOrMobile]
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

async function createUser({ name, email, mobile, password_hash, role }) {
  const [result] = await pool.query(
    `INSERT INTO Users (name, email, mobile, password_hash, role)
     VALUES (?, ?, ?, ?, ?)`,
    [name, email, mobile, password_hash, role]
  );
  return result.insertId;
}

module.exports = {
  findUserByEmailOrMobile,
  isEmailOrMobileTaken,
  createUser
};
