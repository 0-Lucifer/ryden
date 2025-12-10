const request = require('supertest');
const app = require('../../../gateway/index');

describe('Auth Endpoints', () => {
  it('should check availability for a new email/phone', async () => {
    const res = await request(app)
      .post('/auth/check-availability')
      .send({ email: 'testuser@northsouth.edu', phone: '01700000000' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.available).toBe(true);
  });

  it('should reject registration without Firebase', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'testuser@northsouth.edu', password: 'Test1234' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Direct registration unsupported/);
  });

  // Add more tests for /auth/firebase/register, /auth/firebase/login, /auth/send-otp, etc.
});
