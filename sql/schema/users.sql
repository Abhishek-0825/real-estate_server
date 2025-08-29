-- Core auth table (split from profile)
CREATE TABLE IF NOT EXISTS Users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(100) NOT NULL UNIQUE,
  mobile VARCHAR(15) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('Buyer','Seller','Admin') NOT NULL DEFAULT 'Buyer',
  is_verified TINYINT(1) NOT NULL DEFAULT 0, -- email OTP verification status
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
