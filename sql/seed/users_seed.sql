-- Admin: email admin@example.com / password Admin@123
-- Buyer: email buyer@example.com / password Buyer@123

INSERT INTO Users (name, email, mobile, password_hash, role) VALUES
('Super Admin', 'admin@example.com', '9876000001',
'$2a$12$yQqN6eFJpFQb0j0rO2UOLeMZKZxF2vS3yM8VQ9y0D2b4zQy8u9Sbe', 'Admin'),
('Test Buyer', 'buyer@example.com', '9876000002',
'$2a$12$T6rb1VnuhqzMZcLg4Vx2TOSCCw.7a8g8wV7xKvZs2PYb7hZm9wPmy', 'Buyer');
