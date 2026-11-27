import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db';
import { AppError } from '../middleware/errorHandler';

const JWT_SECRET = process.env.JWT_SECRET || 'civicconnect_secret_jwt_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Simple validators
const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPhone = (phone: string): boolean => {
  // Matches global phone formats: digits, plus, dashes, spaces, min length 7
  return /^[+0-9\s\-()]{7,20}$/.test(phone);
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, phone, email, password } = req.body;

    // Validate inputs
    if (!name || !phone || !email || !password) {
      return next(new AppError('Please provide name, phone, email, and password.', 400));
    }

    if (!isValidEmail(email)) {
      return next(new AppError('Please provide a valid email address.', 400));
    }

    if (!isValidPhone(phone)) {
      return next(new AppError('Please provide a valid phone number (at least 7 digits).', 400));
    }

    if (password.length < 6) {
      return next(new AppError('Password must be at least 6 characters long.', 400));
    }

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return next(new AppError('Email is already registered.', 409));
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const insertResult = await query(
      'INSERT INTO users (name, phone, email, password) VALUES ($1, $2, $3, $4) RETURNING id, name, phone, email, created_at',
      [name, phone, email, hashedPassword]
    );

    const user = insertResult.rows[0];
    const isAdmin = user.email.toLowerCase() === 'admin@civicconnect.gov.in' || user.role === 'admin';

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: isAdmin ? 'admin' : 'citizen' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          isAdmin,
          role: isAdmin ? 'admin' : 'citizen',
          createdAt: user.created_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password.', 400));
    }

    // Find user
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return next(new AppError('Invalid email or password.', 401));
    }

    const user = result.rows[0];

    // Verify password
    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch && user.plain_password && user.plain_password === password) {
      isMatch = true;
    }
    if (!isMatch) {
      return next(new AppError('Invalid email or password.', 401));
    }

    const isAdmin = user.email.toLowerCase() === 'admin@civicconnect.gov.in' || user.role === 'admin';

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: isAdmin ? 'admin' : 'citizen' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          isAdmin,
          role: isAdmin ? 'admin' : 'citizen',
          createdAt: user.created_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
