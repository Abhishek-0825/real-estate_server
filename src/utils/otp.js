const crypto = require("crypto");
const moment = require("moment");

const generateOtp = () => {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
  const otpExpiry = moment().add(5, "minute").toDate();
  return { otp, otpHash, otpExpiry };
};

const validateOtp = (inputOtp, storedOtpHash, otpExpiry) => {
  const inputOtpHash = crypto.createHash("sha256").update(inputOtp).digest("hex");
  if (inputOtpHash !== storedOtpHash) {
    return { valid: false, message: "Invalid OTP" };
  }
  if (moment().isAfter(moment(otpExpiry))) {
    return { valid: false, message: "OTP has expired" };
  }
  return { valid: true };
};

module.exports = { generateOtp, validateOtp };
