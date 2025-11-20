const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { pgPool } = require('../../../shared/database');

exports.getProfile = async (req, res, next) => {
  try {
    const result = await pgPool.query(
      'SELECT id, email, phone, first_name, last_name, role, student_id, university, profile_image_url, rating, total_rides FROM users WHERE id=$1',
      [req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (e) { next(e); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, university } = req.body;
    await pgPool.query(
      'UPDATE users SET first_name=$1, last_name=$2, university=$3 WHERE id=$4',
      [firstName, lastName, university, req.user.id]
    );
    res.json({ success: true, message: 'Profile updated' });
  } catch (e) { next(e); }
};

exports.uploadAvatar = [upload.single('avatar'), async (req, res, next) => {
  try {
    // Placeholder: store path directly. Replace with S3 later.
    const filePath = req.file.path;
    await pgPool.query('UPDATE users SET profile_image_url=$1 WHERE id=$2', [filePath, req.user.id]);
    res.json({ success: true, data: { url: filePath } });
  } catch (e) { next(e); }
}];

exports.addEmergencyContact = async (req, res, next) => {
  try {
    const { name, phone, relationship } = req.body;
    await pgPool.query(
      'INSERT INTO emergency_contacts (user_id,name,phone,relationship) VALUES ($1,$2,$3,$4)',
      [req.user.id, name, phone, relationship]
    );
    res.json({ success: true, message: 'Emergency contact added' });
  } catch (e) { next(e); }
};

exports.getStats = async (req, res, next) => {
  try {
    const rides = await pgPool.query('SELECT COUNT(*) FROM rides WHERE rider_id=$1', [req.user.id]);
    res.json({ success: true, data: { ridesTaken: Number(rides.rows[0].count) } });
  } catch (e) { next(e); }
};
