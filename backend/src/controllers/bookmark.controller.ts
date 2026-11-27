import { Response, NextFunction } from 'express';
import { query } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

// Get bookmarks for the authenticated user
export const getBookmarks = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('Unauthorized access.', 401));
    }

    // Retrieve full department details for bookmarked offices
    const result = await query(
      `SELECT d.* 
       FROM bookmarks b
       JOIN departments d ON b.department_id = d.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      message: 'Bookmarks fetched successfully.',
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

// Add bookmark
export const addBookmark = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { department_id } = req.body;

    if (!userId) {
      return next(new AppError('Unauthorized access.', 401));
    }

    if (!department_id) {
      return next(new AppError('Please provide department_id.', 400));
    }

    // Check if department exists
    const deptCheck = await query('SELECT id FROM departments WHERE id = $1', [department_id]);
    if (deptCheck.rows.length === 0) {
      return next(new AppError('Department not found.', 404));
    }

    // Check duplicate bookmark
    const bookmarkCheck = await query(
      'SELECT id FROM bookmarks WHERE user_id = $1 AND department_id = $2',
      [userId, department_id]
    );

    if (bookmarkCheck.rows.length > 0) {
      return next(new AppError('Department is already bookmarked.', 409));
    }

    // Insert
    await query(
      'INSERT INTO bookmarks (user_id, department_id) VALUES ($1, $2)',
      [userId, department_id]
    );

    res.status(201).json({
      success: true,
      message: 'Department bookmarked successfully.',
      data: { department_id: parseInt(department_id) },
    });
  } catch (error) {
    next(error);
  }
};

// Remove bookmark
export const removeBookmark = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { departmentId } = req.params;

    if (!userId) {
      return next(new AppError('Unauthorized access.', 401));
    }

    const checkExist = await query(
      'SELECT id FROM bookmarks WHERE user_id = $1 AND department_id = $2',
      [userId, departmentId]
    );

    if (checkExist.rows.length === 0) {
      return next(new AppError('Bookmark not found.', 404));
    }

    await query(
      'DELETE FROM bookmarks WHERE user_id = $1 AND department_id = $2',
      [userId, departmentId]
    );

    res.status(200).json({
      success: true,
      message: 'Bookmark removed successfully.',
      data: { department_id: parseInt(departmentId) },
    });
  } catch (error) {
    next(error);
  }
};
