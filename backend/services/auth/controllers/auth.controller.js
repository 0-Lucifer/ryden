const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { pgPool } = require('../../../shared/database');
const { redisClient } = require('../../../shared/database');
const {
  generateOTP,
  generateReferenceId,
  formatPhoneNumber,
  isValidBDPhone,
} = require('../../../shared/utils');
const twilioService = require('../services/twilio.service');

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  role: Joi.string().valid('rider', 'driver', 'both').default('rider'),
  studentId: Joi.string().optional(),
  university: Joi.string().default('NorthSouth University'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Register new user
exports.register = async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const {
      email,
      phone,
      password,
      firstName,
      lastName,
      role,
      studentId,
      university,
    } = value;

    // Format phone number
    const formattedPhone = formatPhoneNumber(phone);
    if (!isValidBDPhone(formattedPhone)) {
      return res.status(400).json({ error: 'Invalid Bangladesh phone number' });
    }

    // Check if user already exists
    const existingUser = await pgPool.query(
      'SELECT id FROM users WHERE email = $1 OR phone = $2',
      [email, formattedPhone]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await pgPool.query(
      `INSERT INTO users (email, phone, password_hash, first_name, last_name, role, student_id, university)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, email, phone, first_name, last_name, role, student_id, university, is_verified, created_at`,
      [
        email,
        formattedPhone,
        passwordHash,
        firstName,
        lastName,
        role,
        studentId,
        university,
      ]
    );

    const user = result.rows[0];

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token in database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await pgPool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, expiresAt]
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          studentId: user.student_id,
          university: user.university,
          isVerified: user.is_verified,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;

    // Find user
    const result = await pgPool.query(
      `SELECT id, email, phone, password_hash, first_name, last_name, role, 
              student_id, university, profile_image_url, is_verified, is_active, 
              rating, total_rides
       FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account has been deactivated' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await pgPool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, expiresAt]
    );

    // Get driver profile if user is a driver
    let driverProfile = null;
    if (user.role === 'driver' || user.role === 'both') {
      const driverResult = await pgPool.query(
        'SELECT * FROM driver_profiles WHERE user_id = $1',
        [user.id]
      );
      if (driverResult.rows.length > 0) {
        driverProfile = driverResult.rows[0];
      }
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          studentId: user.student_id,
          university: user.university,
          profileImageUrl: user.profile_image_url,
          isVerified: user.is_verified,
          rating: parseFloat(user.rating),
          totalRides: user.total_rides,
          driverProfile,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Send OTP
exports.sendOTP = async (req, res, next) => {
  try {
    const { phone, purpose } = req.body;

    if (!phone || !purpose) {
      return res.status(400).json({ error: 'Phone and purpose are required' });
    }

    const formattedPhone = formatPhoneNumber(phone);
    if (!isValidBDPhone(formattedPhone)) {
      return res.status(400).json({ error: 'Invalid Bangladesh phone number' });
    }

    // Generate OTP
    const otp = generateOTP(6);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    await pgPool.query(
      `INSERT INTO otp_verifications (phone, otp, purpose, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [formattedPhone, otp, purpose, expiresAt]
    );

    // Send OTP via Twilio
    await twilioService.sendSMS(formattedPhone, `Your Ryden OTP is: ${otp}. Valid for 10 minutes.`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        phone: formattedPhone,
        expiresIn: 600, // seconds
      },
    });
  } catch (error) {
    next(error);
  }
};

// Verify OTP
exports.verifyOTP = async (req, res, next) => {
  try {
    const { phone, otp, purpose } = req.body;

    if (!phone || !otp || !purpose) {
      return res.status(400).json({ error: 'Phone, OTP, and purpose are required' });
    }

    const formattedPhone = formatPhoneNumber(phone);

    // Find OTP
    const result = await pgPool.query(
      `SELECT id, otp, expires_at, is_used
       FROM otp_verifications
       WHERE phone = $1 AND purpose = $2 AND is_used = FALSE
       ORDER BY created_at DESC
       LIMIT 1`,
      [formattedPhone, purpose]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const otpRecord = result.rows[0];

    // Check if OTP is expired
    if (new Date() > new Date(otpRecord.expires_at)) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Mark OTP as used
    await pgPool.query(
      'UPDATE otp_verifications SET is_used = TRUE WHERE id = $1',
      [otpRecord.id]
    );

    // Update user phone verification if purpose is verification
    if (purpose === 'phone_verification') {
      await pgPool.query(
        'UPDATE users SET phone_verified = TRUE WHERE phone = $1',
        [formattedPhone]
      );
    }

    res.json({
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Refresh token
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    // Check if token exists in database
    const result = await pgPool.query(
      'SELECT user_id FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
      [refreshToken]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Refresh token not found or expired' });
    }

    // Get user
    const userResult = await pgPool.query(
      'SELECT * FROM users WHERE id = $1 AND is_active = TRUE',
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(403).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Generate new access token
    const newAccessToken = generateAccessToken(user);

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Social login (Google/Facebook)
exports.socialLogin = async (req, res, next) => {
  try {
    const { provider, token, email, firstName, lastName, profileImage } = req.body;

    if (!provider || !email) {
      return res.status(400).json({ error: 'Provider and email are required' });
    }

    // Check if user exists
    let result = await pgPool.query('SELECT * FROM users WHERE email = $1', [email]);
    let user;

    if (result.rows.length === 0) {
      // Create new user
      const insertResult = await pgPool.query(
        `INSERT INTO users (email, phone, password_hash, first_name, last_name, role, profile_image_url, email_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
         RETURNING *`,
        [
          email,
          '', // Phone will be added later
          await bcrypt.hash(Math.random().toString(36), 10), // Random password
          firstName,
          lastName,
          'rider',
          profileImage,
        ]
      );
      user = insertResult.rows[0];
    } else {
      user = result.rows[0];
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await pgPool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, expiresAt]
    );

    res.json({
      success: true,
      message: 'Social login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          profileImageUrl: user.profile_image_url,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Logout
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Delete refresh token
      await pgPool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
    }

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
exports.getCurrentUser = async (req, res, next) => {
  try {
    const result = await pgPool.query(
      `SELECT id, email, phone, first_name, last_name, role, student_id, 
              university, profile_image_url, is_verified, rating, total_rides
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        studentId: user.student_id,
        university: user.university,
        profileImageUrl: user.profile_image_url,
        isVerified: user.is_verified,
        rating: parseFloat(user.rating),
        totalRides: user.total_rides,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }

    // Get user
    const result = await pgPool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );

    const user = result.rows[0];

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await pgPool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newPasswordHash, req.user.id]
    );

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const result = await pgPool.query(
      'SELECT id, phone FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      // Don't reveal if user exists
      return res.json({
        success: true,
        message: 'If the email exists, a reset code has been sent',
      });
    }

    const user = result.rows[0];

    // Generate OTP
    const otp = generateOTP(6);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Store OTP
    await pgPool.query(
      `INSERT INTO otp_verifications (phone, otp, purpose, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [user.phone, otp, 'password_reset', expiresAt]
    );

    // Send OTP via SMS
    await twilioService.sendSMS(
      user.phone,
      `Your Ryden password reset code is: ${otp}. Valid for 10 minutes.`
    );

    res.json({
      success: true,
      message: 'If the email exists, a reset code has been sent',
      data: {
        phone: user.phone.slice(-4), // Show last 4 digits
      },
    });
  } catch (error) {
    next(error);
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { phone, otp, newPassword } = req.body;

    if (!phone || !otp || !newPassword) {
      return res.status(400).json({ error: 'Phone, OTP, and new password required' });
    }

    const formattedPhone = formatPhoneNumber(phone);

    // Verify OTP
    const result = await pgPool.query(
      `SELECT id FROM otp_verifications
       WHERE phone = $1 AND otp = $2 AND purpose = 'password_reset'
       AND is_used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [formattedPhone, otp]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const otpId = result.rows[0].id;

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await pgPool.query(
      'UPDATE users SET password_hash = $1 WHERE phone = $2',
      [passwordHash, formattedPhone]
    );

    // Mark OTP as used
    await pgPool.query(
      'UPDATE otp_verifications SET is_used = TRUE WHERE id = $1',
      [otpId]
    );

    res.json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    next(error);
  }
};

// Helper functions
function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
  );
}
