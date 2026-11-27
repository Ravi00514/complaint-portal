import { Request, Response, NextFunction } from 'express';
import { query } from '../config/db';
import { AppError } from '../middleware/errorHandler';

// Get departments with filter (search query, city, district)
export const getDepartments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { department_name, city, district, search } = req.query;

    let queryText = `
      SELECT id, department_name, office_name, officer_name, designation, phone, 
             emergency_phone, email, website, latitude, longitude, address, 
             city, district, state, country, working_hours, status 
      FROM departments
      WHERE 1=1
    `;
    const params: any[] = [];

    if (department_name) {
      params.push(department_name);
      queryText += ` AND department_name = $${params.length}`;
    }

    if (city) {
      params.push(city);
      queryText += ` AND city ILIKE $${params.length}`;
    }

    if (district) {
      params.push(district);
      queryText += ` AND district ILIKE $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      queryText += ` AND (office_name ILIKE $${params.length} OR department_name ILIKE $${params.length} OR address ILIKE $${params.length} OR officer_name ILIKE $${params.length})`;
    }

    queryText += ' ORDER BY office_name ASC';

    const result = await query(queryText, params);

    res.status(200).json({
      success: true,
      message: 'Departments fetched successfully.',
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

// GET nearest departments using PostGIS spatial search
export const getNearestDepartments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { latitude, longitude, category, limit = 5 } = req.query;

    if (!latitude || !longitude) {
      return next(new AppError('Please provide latitude and longitude coordinates.', 400));
    }

    const lat = parseFloat(latitude as string);
    const lng = parseFloat(longitude as string);
    const limitVal = parseInt(limit as string);

    if (isNaN(lat) || isNaN(lng)) {
      return next(new AppError('Invalid coordinates format.', 400));
    }

    let mappedDepartmentName = '';

    // If category is provided, look up the corresponding department_name
    if (category) {
      const categoryResult = await query(
        'SELECT department_name FROM complaint_categories WHERE category_name ILIKE $1',
        [category as string]
      );
      
      if (categoryResult.rows.length > 0) {
        mappedDepartmentName = categoryResult.rows[0].department_name;
      } else {
        mappedDepartmentName = category as string;
      }
    }

    let queryText = '';
    let params: any[] = [];

    if (mappedDepartmentName) {
      queryText = `
        SELECT id, department_name, office_name, officer_name, designation, phone, 
               emergency_phone, email, website, latitude, longitude, address, 
               city, district, state, country, working_hours, status,
               ST_Distance(location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) AS distance_meters
        FROM departments
        WHERE department_name ILIKE $3
        ORDER BY location <-> ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
        LIMIT $4
      `;
      params = [lng, lat, `%${mappedDepartmentName}%`, limitVal];
    } else {
      queryText = `
        SELECT id, department_name, office_name, officer_name, designation, phone, 
               emergency_phone, email, website, latitude, longitude, address, 
               city, district, state, country, working_hours, status,
               ST_Distance(location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) AS distance_meters
        FROM departments
        ORDER BY location <-> ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
        LIMIT $3
      `;
      params = [lng, lat, limitVal];
    }

    let result = await query(queryText, params);

    // Fallback: If mapped category yielded 0 rows, fallback to overall nearest departments
    if (result.rows.length === 0 && mappedDepartmentName) {
      const fallbackQuery = `
        SELECT id, department_name, office_name, officer_name, designation, phone, 
               emergency_phone, email, website, latitude, longitude, address, 
               city, district, state, country, working_hours, status,
               ST_Distance(location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) AS distance_meters
        FROM departments
        ORDER BY location <-> ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
        LIMIT $3
      `;
      result = await query(fallbackQuery, [lng, lat, limitVal]);
    }

    // Format distance: round meters or convert to km for readability
    const departments = result.rows.map(row => {
      const distM = parseFloat(row.distance_meters);
      let distanceText = '';
      if (distM < 1000) {
        distanceText = `${Math.round(distM)} m`;
      } else {
        distanceText = `${(distM / 1000).toFixed(1)} km`;
      }
      return {
        ...row,
        distance_meters: distM,
        distance_text: distanceText
      };
    });

    res.status(200).json({
      success: true,
      message: 'Nearest departments found.',
      data: departments,
    });
  } catch (error) {
    next(error);
  }
};

// Create department (Admin only)
export const createDepartment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      department_name,
      office_name,
      officer_name,
      designation,
      phone,
      emergency_phone,
      email,
      website,
      latitude,
      longitude,
      address,
      city,
      district,
      state,
      country = 'India',
      working_hours = '9:00 AM - 5:00 PM',
      status = 'Open',
    } = req.body;

    if (!department_name || !office_name || !phone || !latitude || !longitude || !address || !city || !district || !state) {
      return next(new AppError('Please provide all required fields.', 400));
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return next(new AppError('Latitude and longitude must be valid numbers.', 400));
    }

    // Insert department inserting point location into geography column
    const result = await query(
      `INSERT INTO departments (
        department_name, office_name, officer_name, designation, phone, 
        emergency_phone, email, website, latitude, longitude, location, 
        address, city, district, state, country, working_hours, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
        ST_SetSRID(ST_MakePoint($10, $9), 4326)::geography, 
        $11, $12, $13, $14, $15, $16, $17
      ) RETURNING *`,
      [
        department_name,
        office_name,
        officer_name,
        designation,
        phone,
        emergency_phone,
        email,
        website,
        lat,
        lng,
        address,
        city,
        district,
        state,
        country,
        working_hours,
        status,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Department created successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// Update department (Admin only)
export const updateDepartment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const {
      department_name,
      office_name,
      officer_name,
      designation,
      phone,
      emergency_phone,
      email,
      website,
      latitude,
      longitude,
      address,
      city,
      district,
      state,
      country,
      working_hours,
      status,
    } = req.body;

    if (!department_name || !office_name || !phone || !latitude || !longitude || !address || !city || !district || !state) {
      return next(new AppError('Please provide all required fields.', 400));
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return next(new AppError('Latitude and longitude must be valid numbers.', 400));
    }

    // Check if department exists
    const checkExist = await query('SELECT id FROM departments WHERE id = $1', [id]);
    if (checkExist.rows.length === 0) {
      return next(new AppError('Department not found.', 404));
    }

    const result = await query(
      `UPDATE departments 
       SET department_name = $1, office_name = $2, officer_name = $3, designation = $4, 
           phone = $5, emergency_phone = $6, email = $7, website = $8, latitude = $9, 
           longitude = $10, location = ST_SetSRID(ST_MakePoint($10, $9), 4326)::geography, 
           address = $11, city = $12, district = $13, state = $14, country = $15, 
           working_hours = $16, status = $17
       WHERE id = $18
       RETURNING *`,
      [
        department_name,
        office_name,
        officer_name,
        designation,
        phone,
        emergency_phone,
        email,
        website,
        lat,
        lng,
        address,
        city,
        district,
        state,
        country,
        working_hours,
        status,
        id,
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Department updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// Delete department (Admin only)
export const deleteDepartment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const checkExist = await query('SELECT id FROM departments WHERE id = $1', [id]);
    if (checkExist.rows.length === 0) {
      return next(new AppError('Department not found.', 404));
    }

    await query('DELETE FROM departments WHERE id = $1', [id]);

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully.',
      data: { id: parseInt(id) },
    });
  } catch (error) {
    next(error);
  }
};
