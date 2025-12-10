// Auth controller - Clean Firebase-first implementation
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { pgPool } = require('../../../shared/database');
const utils = require('../../../shared/utils');
const twilioService = require('../services/twilio.service');
const { sendVerificationEmail } = require('../utils/mailer');
const firebaseAdmin = require('../utils/firebase-admin');

const registerSchema = Joi.object({
  firebaseToken: Joi.string().required(),
  phone: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  role: Joi.string().valid('rider', 'driver', 'both').default('rider'),
  studentId: Joi.string().required(),
  university: Joi.string().default('NorthSouth University'),
  referralCode: Joi.string().optional().allow(''),
});

const loginSchema = Joi.object({ firebaseToken: Joi.string().required() });

function generateAccessToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
}

function generateRefreshToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' });
}

async function storeRefreshToken(userId, token) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await pgPool.query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)', [userId, token, expiresAt]);
}

// Check availability
exports.checkAvailability = async (req, res, next) => {
  try {
    const { email, phone } = req.body;
    const errors = {};
    if (email) {
      const existingEmail = await pgPool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
      if (existingEmail.rows.length > 0) errors.email = 'Email already registered';
    }
    if (phone) {
      const formattedPhone = utils.formatPhoneNumber(phone);
      const existingPhone = await pgPool.query('SELECT id FROM users WHERE phone = $1', [formattedPhone]);
      if (existingPhone.rows.length > 0) errors.phone = 'Phone number already registered';
    }
    if (Object.keys(errors).length) return res.status(409).json({ success: false, available: false, errors });
    return res.json({ success: true, available: true });
  } catch (err) { next(err); }
};

// Wrappers
exports.login = async (req, res, next) => { try { const { error } = loginSchema.validate(req.body); if (error) return res.status(400).json({ error: error.details[0].message }); return exports.firebaseLogin(req, res, next); } catch (err) { next(err); } };
exports.register = async (req, res, next) => { return res.status(400).json({ error: 'Direct registration unsupported. Please register via Firebase and call /auth/firebase/register' }); };

// Firebase register
exports.firebaseRegister = async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body); if (error) return res.status(400).json({ error: error.details[0].message });
    const { firebaseToken, phone, firstName, lastName, studentId, university, referralCode, role } = value;
    let firebaseUser; try { firebaseUser = await firebaseAdmin.verifyIdToken(firebaseToken); } catch (err) { return res.status(401).json({ error: 'Invalid Firebase token' }); }
    const email = firebaseUser.email; const firebaseUid = firebaseUser.uid; const emailVerified = firebaseUser.email_verified;
    if (!email || !email.toLowerCase().endsWith('@northsouth.edu')) return res.status(400).json({ error: 'Email must be a northsouth.edu address' });
    const formattedPhone = utils.formatPhoneNumber(phone); if (!utils.isValidBDPhone(formattedPhone)) return res.status(400).json({ error: 'Invalid Bangladesh phone number' });
    const existing = await pgPool.query('SELECT id, is_verified FROM users WHERE email = $1 OR firebase_uid = $2', [email, firebaseUid]);
    let user;
    if (existing.rows.length > 0) { user = existing.rows[0]; await pgPool.query('UPDATE users SET firebase_uid = $1, is_verified = $2 WHERE id = $3', [firebaseUid, emailVerified, user.id]); }
    else { const insert = await pgPool.query('INSERT INTO users (email, phone, firebase_uid, first_name, last_name, role, student_id, university, is_verified) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id, email, phone, first_name, last_name, role, student_id, university, is_verified', [email, formattedPhone, firebaseUid, firstName, lastName, role || 'rider', studentId, university || 'NorthSouth University', emailVerified]); user = insert.rows[0]; }
    if (referralCode && referralCode.trim()) {
      try { const referrerIdSuffix = referralCode.replace('RYDEN', '').toLowerCase(); const refRes = await pgPool.query('SELECT id FROM users WHERE LOWER(RIGHT(id::text,6)) = $1', [referrerIdSuffix]); if (refRes.rows.length > 0) await pgPool.query('INSERT INTO referrals (referrer_id, referred_id, referral_code) VALUES ($1, $2, $3)', [refRes.rows[0].id, user.id, referralCode.toUpperCase()]); } catch (err) { console.error('[Auth] Referral handling error', err); }
    }
    const accessToken = generateAccessToken(user); const refreshToken = generateRefreshToken(user); await storeRefreshToken(user.id, refreshToken);
    return res.status(201).json({ success: true, message: emailVerified ? 'Registration successful' : 'Registration successful. Please verify email.', data: { user: { id: user.id, email: user.email, phone: user.phone, firstName: user.first_name, lastName: user.last_name, role: user.role, studentId: user.student_id, university: user.university, isVerified: user.is_verified }, accessToken, refreshToken } });
  } catch (err) { next(err); }
};

// Firebase login
exports.firebaseLogin = async (req, res, next) => {
  try { const { firebaseToken } = req.body; if (!firebaseToken) return res.status(400).json({ error: 'Firebase token required' }); let firebaseUser; try { firebaseUser = await firebaseAdmin.verifyIdToken(firebaseToken); } catch (err) { return res.status(401).json({ error: 'Invalid Firebase token' }); } const email = firebaseUser.email; const firebaseUid = firebaseUser.uid; const emailVerified = firebaseUser.email_verified; const result = await pgPool.query('SELECT id, email, phone, first_name, last_name, role, student_id, university, profile_image_url, is_verified, is_active, rating, total_rides FROM users WHERE email = $1 OR firebase_uid = $2', [email, firebaseUid]); if (result.rows.length === 0) return res.status(404).json({ error: 'User not found. Please register first.', needsRegistration: true }); const user = result.rows[0]; await pgPool.query('UPDATE users SET firebase_uid = $1, is_verified = $2 WHERE id = $3', [firebaseUid, emailVerified, user.id]); if (!user.is_active) return res.status(403).json({ error: 'Account deactivated' }); if (!emailVerified) return res.status(403).json({ error: 'Email not verified', emailVerified: false }); const accessToken = generateAccessToken(user); const refreshToken = generateRefreshToken(user); await storeRefreshToken(user.id, refreshToken); let driverProfile = null; if (user.role === 'driver' || user.role === 'both') { const dr = await pgPool.query('SELECT * FROM driver_profiles WHERE user_id = $1', [user.id]); if (dr.rows.length > 0) driverProfile = dr.rows[0]; } return res.json({ success: true, message: 'Login successful', data: { user: { id: user.id, email: user.email, phone: user.phone, firstName: user.first_name, lastName: user.last_name, role: user.role, studentId: user.student_id, university: user.university, profileImageUrl: user.profile_image_url, isVerified: true, rating: parseFloat(user.rating || 0), totalRides: user.total_rides || 0, driverProfile }, accessToken, refreshToken } }); } catch (err) { next(err); } };

// sendOTP
exports.sendOTP = async (req, res, next) => {
  try { const { phone, purpose = 'phone_verification' } = req.body; if (!phone) return res.status(400).json({ error: 'Phone required' }); const formattedPhone = utils.formatPhoneNumber(phone); if (!utils.isValidBDPhone(formattedPhone)) return res.status(400).json({ error: 'Invalid phone number' }); const otp = utils.generateOTP(); const expiresAt = new Date(Date.now() + 10 * 60 * 1000); await pgPool.query('INSERT INTO otp_verifications (phone, otp, purpose, expires_at) VALUES ($1, $2, $3, $4)', [formattedPhone, otp, purpose, expiresAt]); try { await twilioService.sendSMS(formattedPhone, `Your Ryden code is ${otp}. Valid for 10 minutes.`); } catch (err) { console.error('[Auth] Twilio error', err); } return res.json({ success: true, message: 'OTP sent' }); } catch (err) { next(err); } };

// verifyOTP
exports.verifyOTP = async (req, res, next) => {
  try { const { phone, otp, purpose = 'phone_verification' } = req.body; if (!phone || !otp) return res.status(400).json({ error: 'phone and otp required' }); const formattedPhone = utils.formatPhoneNumber(phone); const result = await pgPool.query('SELECT id, otp, expires_at, is_used FROM otp_verifications WHERE phone = $1 AND purpose = $2 ORDER BY id DESC LIMIT 1', [formattedPhone, purpose]); if (result.rows.length === 0) return res.status(400).json({ error: 'No OTP found' }); const otpRecord = result.rows[0]; if (otpRecord.is_used) return res.status(400).json({ error: 'OTP already used' }); if (new Date() > new Date(otpRecord.expires_at)) return res.status(400).json({ error: 'OTP expired' }); if (otpRecord.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' }); await pgPool.query('UPDATE otp_verifications SET is_used = TRUE WHERE id = $1', [otpRecord.id]); if (purpose === 'phone_verification') await pgPool.query('UPDATE users SET phone_verified = TRUE WHERE phone = $1', [formattedPhone]); return res.json({ success: true, message: 'OTP verified' }); } catch (err) { next(err); } };

// verify email link
exports.verifyEmail = async (req, res, next) => {
  try { const token = req.query.token || req.body.token; if (!token) return res.status(400).send('Missing token'); const verificationSecret = process.env.EMAIL_VERIFICATION_SECRET || process.env.JWT_SECRET; let payload; try { payload = jwt.verify(token, verificationSecret); } catch (err) { return res.status(400).send('Invalid or expired token'); } const row = await pgPool.query('SELECT user_id, expires_at FROM email_verifications WHERE token = $1', [token]); if (row.rows.length === 0) return res.status(400).send('Invalid or already used token'); const rec = row.rows[0]; if (new Date(rec.expires_at) < new Date()) return res.status(400).send('Token expired'); await pgPool.query('UPDATE users SET is_verified = TRUE WHERE id = $1', [rec.user_id]); await pgPool.query('DELETE FROM email_verifications WHERE token = $1', [token]); const redirectUrl = process.env.APP_URL || 'http://localhost:8081'; return res.redirect(`${redirectUrl}/auth/verified?success=true`); } catch (err) { next(err); } };

// verify email OTP
exports.verifyEmailOTP = async (req, res, next) => {
  try { const { email, otp } = req.body; if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' }); const userResult = await pgPool.query('SELECT id FROM users WHERE email = $1', [email]); if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' }); const userId = userResult.rows[0].id; const result = await pgPool.query('SELECT * FROM email_verifications WHERE user_id = $1 AND token = $2', [userId, otp]); if (result.rows.length === 0) return res.status(400).json({ error: 'Invalid OTP' }); const record = result.rows[0]; if (new Date(record.expires_at) < new Date()) return res.status(400).json({ error: 'OTP expired' }); await pgPool.query('UPDATE users SET is_verified = TRUE WHERE id = $1', [userId]); await pgPool.query('DELETE FROM email_verifications WHERE id = $1', [record.id]); const user = (await pgPool.query('SELECT * FROM users WHERE id = $1', [userId])).rows[0]; const accessToken = generateAccessToken(user); const refreshToken = generateRefreshToken(user); await storeRefreshToken(user.id, refreshToken); let driverProfile = null; if (user.role === 'driver' || user.role === 'both') { const driverResult = await pgPool.query('SELECT * FROM driver_profiles WHERE user_id = $1', [user.id]); if (driverResult.rows.length > 0) driverProfile = driverResult.rows[0]; } return res.json({ success: true, message: 'Email verified', data: { user: { id: user.id, email: user.email, phone: user.phone, firstName: user.first_name, lastName: user.last_name, role: user.role, studentId: user.student_id, university: user.university, profileImageUrl: user.profile_image_url, isVerified: true, rating: parseFloat(user.rating || 0), totalRides: user.total_rides || 0, driverProfile }, accessToken, refreshToken } }); } catch (err) { next(err); } };

// refresh token

