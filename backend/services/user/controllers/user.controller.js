const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { pgPool } = require('../../../shared/database');
const { errorHandler } = require('../../../shared/middleware');
const utils = require('../../../shared/utils');
const Joi = require('joi');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../uploads/avatars');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'));
    }
  }
});

exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await pgPool.query('SELECT id, email, first_name, last_name, phone FROM users WHERE id = $1', [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pgPool.query('SELECT id, email, first_name, last_name, phone FROM users WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(1).max(50).optional(),
  lastName: Joi.string().min(1).max(50).optional(),
  university: Joi.string().max(100).optional(),
  studentId: Joi.string().max(50).optional(),
});

exports.updateProfile = async (req, res, next) => {
  try {
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (value.firstName) {
      updates.push(`first_name = $${paramIndex++}`);
      params.push(value.firstName);
    }
    if (value.lastName) {
      updates.push(`last_name = $${paramIndex++}`);
      params.push(value.lastName);
    }
    if (value.university) {
      updates.push(`university = $${paramIndex++}`);
      params.push(value.university);
    }
    if (value.studentId) {
      updates.push(`student_id = $${paramIndex++}`);
      params.push(value.studentId);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    params.push(req.user.id);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const result = await pgPool.query(query, params);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        firstName: result.rows[0].first_name,
        lastName: result.rows[0].last_name,
        university: result.rows[0].university,
        studentId: result.rows[0].student_id,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.uploadAvatar = [upload.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/avatars/${req.file.filename}`;
    
    await pgPool.query(
      'UPDATE users SET profile_image_url = $1 WHERE id = $2',
      [fileUrl, req.user.id]
    );
    
    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { url: fileUrl },
    });
  } catch (error) {
    next(error);
  }
}];

const emergencyContactSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  phone: Joi.string().pattern(/^(\+880|0)[1-9]\d{8,9}$/).required(),
  relationship: Joi.string().max(50).optional(),
});

exports.addEmergencyContact = async (req, res, next) => {
  try {
    const { error, value } = emergencyContactSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, phone, relationship } = value;

    // Check if contact already exists
    const existing = await pgPool.query(
      'SELECT id FROM emergency_contacts WHERE user_id = $1 AND phone = $2',
      [req.user.id, phone]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Contact already exists' });
    }

    const result = await pgPool.query(
      'INSERT INTO emergency_contacts (user_id, name, phone, relationship) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, name, phone, relationship]
    );

    res.status(201).json({
      success: true,
      message: 'Emergency contact added',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

exports.getEmergencyContacts = async (req, res, next) => {
  try {
    const result = await pgPool.query(
      'SELECT id, name, phone, relationship FROM emergency_contacts WHERE user_id = $1',
      [req.user.id]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

exports.deleteEmergencyContact = async (req, res, next) => {
  try {
    const contactId = req.params.id;

    const result = await pgPool.query(
      'DELETE FROM emergency_contacts WHERE id = $1 AND user_id = $2 RETURNING *',
      [contactId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({ success: true, message: 'Emergency contact deleted' });
  } catch (error) {
    next(error);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get ride statistics
    const ridesResult = await pgPool.query(
      `SELECT 
        COUNT(*) as total_rides,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_rides,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_rides,
        SUM(actual_fare) FILTER (WHERE status = 'completed') as total_spent
       FROM rides 
       WHERE rider_id = $1`,
      [userId]
    );

    // Get driver statistics if applicable
    const driverResult = await pgPool.query(
      `SELECT 
        COUNT(*) as rides_given,
        SUM(actual_fare) FILTER (WHERE status = 'completed') as total_earned
       FROM rides 
       WHERE driver_id = $1 AND status = 'completed'`,
      [userId]
    );

    // Get rating breakdown
    const ratingsResult = await pgPool.query(
      `SELECT 
        COUNT(*) as total_ratings,
        AVG(rating) as average_rating
       FROM ratings 
       WHERE (rider_id = $1 OR driver_id = $1)`,
      [userId]
    );

    const rideStats = ridesResult.rows[0];
    const driverStats = driverResult.rows[0];
    const ratingStats = ratingsResult.rows[0];

    res.json({
      success: true,
      data: {
        rides: {
          total: parseInt(rideStats.total_rides),
          completed: parseInt(rideStats.completed_rides),
          cancelled: parseInt(rideStats.cancelled_rides),
          totalSpent: parseFloat(rideStats.total_spent || 0),
        },
        driver: {
          ridesGiven: parseInt(driverStats.rides_given),
          totalEarned: parseFloat(driverStats.total_earned || 0),
        },
        ratings: {
          total: parseInt(ratingStats.total_ratings),
          average: parseFloat(ratingStats.average_rating || 0).toFixed(1),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const driverProfileSchema = Joi.object({
  vehicleType: Joi.string().valid('bike', 'car', 'suv').required(),
  vehicleMake: Joi.string().max(50).required(),
  vehicleModel: Joi.string().max(50).required(),
  vehicleYear: Joi.number().integer().min(1990).max(new Date().getFullYear() + 1).required(),
  vehicleColor: Joi.string().max(30).required(),
  vehiclePlate: Joi.string().max(20).required(),
  licenseNumber: Joi.string().max(50).required(),
  licenseExpiry: Joi.date().iso().required(),
});

exports.createDriverProfile = async (req, res, next) => {
  try {
    const { error, value } = driverProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const userId = req.user.id;

    // Check if driver profile already exists
    const existing = await pgPool.query(
      'SELECT id FROM driver_profiles WHERE user_id = $1',
      [userId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Driver profile already exists' });
    }

    const {
      vehicleType, vehicleMake, vehicleModel, vehicleYear,
      vehicleColor, vehiclePlate, licenseNumber, licenseExpiry
    } = value;

    const result = await pgPool.query(
      `INSERT INTO driver_profiles (
        user_id, vehicle_type, vehicle_make, vehicle_model, vehicle_year,
        vehicle_color, vehicle_plate, license_number, license_expiry, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        userId, vehicleType, vehicleMake, vehicleModel, vehicleYear,
        vehicleColor, vehiclePlate, licenseNumber, licenseExpiry, 'pending'
      ]
    );

    // Update user role to driver
    await pgPool.query(
      "UPDATE users SET role = 'driver' WHERE id = $1",
      [userId]
    );

    res.status(201).json({
      success: true,
      message: 'Driver profile created. Pending admin approval.',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

