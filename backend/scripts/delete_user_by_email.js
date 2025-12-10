// Script to delete a user from PostgreSQL users table by email
// Usage: node delete_user_by_email.js <email>

// Set default DATABASE_URL if not provided
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://ryden:ryden123@localhost:5432/ryden_db';

const { pgPool } = require('../shared/database');

async function deleteUserByEmail(email) {
  if (!email) {
    console.error('Usage: node delete_user_by_email.js <email>');
    process.exit(1);
  }
  try {
    const res = await pgPool.query('DELETE FROM users WHERE email = $1 RETURNING *', [email.toLowerCase()]);
    if (res.rowCount === 0) {
      console.log('No user found with email:', email);
    } else {
      console.log('Deleted user:', res.rows[0]);
    }
  } catch (err) {
    console.error('Error deleting user:', err.message);
  } finally {
    await pgPool.end();
  }
}

const email = process.argv[2];
deleteUserByEmail(email);