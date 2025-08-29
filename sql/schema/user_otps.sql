CREATE TABLE IF NOT EXISTS UserOtps (
  otp_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  otp_hash VARCHAR(64) NOT NULL,     -- sha256
  otp_expiry DATETIME NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  INDEX idx_user_created (user_id, created_at)
);
