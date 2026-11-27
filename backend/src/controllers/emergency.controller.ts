import { Request, Response, NextFunction } from 'express';
import { query } from '../config/db';
import { AppError } from '../middleware/errorHandler';

// Get all emergency numbers (optional filters: city, state)
export const getEmergencyContacts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { city, state } = req.query;

    let queryText = 'SELECT * FROM emergency_contacts WHERE 1=1';
    const params: any[] = [];

    if (city) {
      params.push(city);
      // Include city-specific contacts and general/national ones ('All')
      queryText += ` AND (city ILIKE $${params.length} OR city = 'All')`;
    }

    if (state) {
      params.push(state);
      queryText += ` AND (state ILIKE $${params.length} OR state = 'All')`;
    }

    queryText += ' ORDER BY id ASC';

    const result = await query(queryText, params);

    res.status(200).json({
      success: true,
      message: 'Emergency contacts fetched successfully.',
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

// Create emergency contact (Admin only)
export const createEmergencyContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { department, phone, city = 'All', state = 'All' } = req.body;

    if (!department || !phone) {
      return next(new AppError('Please provide department name and phone number.', 400));
    }

    const result = await query(
      'INSERT INTO emergency_contacts (department, phone, city, state) VALUES ($1, $2, $3, $4) RETURNING *',
      [department, phone, city, state]
    );

    res.status(201).json({
      success: true,
      message: 'Emergency contact created successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// Update emergency contact (Admin only)
export const updateEmergencyContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { department, phone, city, state } = req.body;

    if (!department || !phone) {
      return next(new AppError('Please provide department name and phone number.', 400));
    }

    const checkExist = await query('SELECT id FROM emergency_contacts WHERE id = $1', [id]);
    if (checkExist.rows.length === 0) {
      return next(new AppError('Emergency contact not found.', 404));
    }

    const result = await query(
      'UPDATE emergency_contacts SET department = $1, phone = $2, city = $3, state = $4 WHERE id = $5 RETURNING *',
      [department, phone, city || 'All', state || 'All', id]
    );

    res.status(200).json({
      success: true,
      message: 'Emergency contact updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// Delete emergency contact (Admin only)
export const deleteEmergencyContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const checkExist = await query('SELECT id FROM emergency_contacts WHERE id = $1', [id]);
    if (checkExist.rows.length === 0) {
      return next(new AppError('Emergency contact not found.', 404));
    }

    await query('DELETE FROM emergency_contacts WHERE id = $1', [id]);

    res.status(200).json({
      success: true,
      message: 'Emergency contact deleted successfully.',
      data: { id: parseInt(id) },
    });
  } catch (error) {
    next(error);
  }
};
