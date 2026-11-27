-- Enable PostGIS extension for spatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Drop tables in reverse dependency order if they exist
DROP TABLE IF EXISTS complaints;
DROP TABLE IF EXISTS bookmarks;
DROP TABLE IF EXISTS emergency_contacts;
DROP TABLE IF EXISTS complaint_categories;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS users;

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Departments Table
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL,
    office_name VARCHAR(150) NOT NULL,
    officer_name VARCHAR(100),
    designation VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    emergency_phone VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(255),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    -- PostGIS geography geometry point (SRID 4326 for WGS 84 GPS coords)
    location GEOGRAPHY(Point, 4326) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    working_hours VARCHAR(100) NOT NULL DEFAULT '9:00 AM - 5:00 PM',
    status VARCHAR(20) DEFAULT 'Open' -- Open, Closed, Emergency Only
);

-- Spatial index for high performance nearest-neighbor queries
CREATE INDEX idx_departments_location ON departments USING gist(location);
CREATE INDEX idx_departments_city_district ON departments(city, district);

-- Complaint Categories Table
CREATE TABLE complaint_categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    department_name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    description VARCHAR(255)
);

-- Emergency Contacts Table
CREATE TABLE emergency_contacts (
    id SERIAL PRIMARY KEY,
    department VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100)
);

-- Bookmarks / Saved Departments Table
CREATE TABLE bookmarks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, department_id)
);

-- Complaints Table
CREATE TABLE complaints (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES complaint_categories(id) ON DELETE SET NULL,
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    category_name VARCHAR(100),
    department_name VARCHAR(100),
    office_name VARCHAR(150),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(100),
    user_phone VARCHAR(20),
    status VARCHAR(50) DEFAULT 'Open',
    priority VARCHAR(50) DEFAULT 'Medium',
    location TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_complaints_user ON complaints(user_id);
