CREATE DATABASE my_database;
USE my_database;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    amount DECIMAL(10, 2) NOT NULL,
    status ENUM('completed', 'pending', 'failed') NOT NULL,
    admission_number VARCHAR(50) NOT NULL,
    purpose VARCHAR(100) NOT NULL,
    referral_code VARCHAR(50),
    FOREIGN KEY (username) REFERENCES users(username)
);

INSERT INTO users (username, email, password, role) VALUES
('user2', 'joshithachintham376@gmail.com', 'user123', 'student');

INSERT INTO payments (username, amount, status, admission_number, purpose, referral_code) VALUES
('user2', 3000.00, 'completed', '23001A0533', 'HostelFee', 'REF123');
SELECT * FROM users;
UPDATE users SET email = '23001a0533@jntua.ac.in' WHERE username = 'user2';
DELETE FROM users WHERE username = 'john_doe';
