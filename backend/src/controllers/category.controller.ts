import { Request, Response, NextFunction } from 'express';
import { query } from '../config/db';
import { AppError } from '../middleware/errorHandler';

// Get all categories
export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await query('SELECT * FROM complaint_categories ORDER BY category_name ASC');
    res.status(200).json({
      success: true,
      message: 'Categories fetched successfully.',
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

// Create category (Admin only)
export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category_name, department_name, icon, description } = req.body;

    if (!category_name || !department_name) {
      return next(new AppError('Please provide category_name and department_name.', 400));
    }

    // Check duplicate
    const checkDuplicate = await query(
      'SELECT id FROM complaint_categories WHERE category_name = $1',
      [category_name]
    );
    if (checkDuplicate.rows.length > 0) {
      return next(new AppError(`Category '${category_name}' already exists.`, 409));
    }

    const result = await query(
      'INSERT INTO complaint_categories (category_name, department_name, icon, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [category_name, department_name, icon || 'HelpCircle', description || '']
    );

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// Update category (Admin only)
export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { category_name, department_name, icon, description } = req.body;

    if (!category_name || !department_name) {
      return next(new AppError('Please provide category_name and department_name.', 400));
    }

    // Verify exists
    const checkExist = await query('SELECT id FROM complaint_categories WHERE id = $1', [id]);
    if (checkExist.rows.length === 0) {
      return next(new AppError('Category not found.', 404));
    }

    const result = await query(
      'UPDATE complaint_categories SET category_name = $1, department_name = $2, icon = $3, description = $4 WHERE id = $5 RETURNING *',
      [category_name, department_name, icon, description, id]
    );

    res.status(200).json({
      success: true,
      message: 'Category updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// Delete category (Admin only)
export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const checkExist = await query('SELECT id FROM complaint_categories WHERE id = $1', [id]);
    if (checkExist.rows.length === 0) {
      return next(new AppError('Category not found.', 404));
    }

    await query('DELETE FROM complaint_categories WHERE id = $1', [id]);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully.',
      data: { id: parseInt(id) },
    });
  } catch (error) {
    next(error);
  }
};
