CREATE DATABASE IF NOT EXISTS grievo_db;
USE grievo_db;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin', 'resolver') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL
);

CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    department_id INT,
    expected_resolution_days INT,
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

CREATE TABLE grievances (
    grievance_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    category_id INT,
    description TEXT NOT NULL,
    status ENUM('New', 'Assigned', 'In Progress', 'Resolved', 'Closed') DEFAULT 'New',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (student_id) REFERENCES users(user_id),
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

CREATE TABLE assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    grievance_id INT,
    resolver_id INT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (grievance_id) REFERENCES grievances(grievance_id),
    FOREIGN KEY (resolver_id) REFERENCES users(user_id)
);

CREATE TABLE responses (
    response_id INT AUTO_INCREMENT PRIMARY KEY,
    grievance_id INT,
    responder_id INT,
    response_text TEXT,
    responded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (grievance_id) REFERENCES grievances(grievance_id),
    FOREIGN KEY (responder_id) REFERENCES users(user_id)
);

CREATE TABLE feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    grievance_id INT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comments TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (grievance_id) REFERENCES grievances(grievance_id)
);
