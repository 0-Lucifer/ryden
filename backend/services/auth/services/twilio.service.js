const twilio = require('twilio');

let client = null;
const isDevelopment = process.env.NODE_ENV === 'development';

// Only initialize Twilio if credentials are provided
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
  client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

exports.sendSMS = async (to, message) => {
  // Development mode - just log to console
  if (isDevelopment && !client) {
    console.log('\n📱 ===== DEVELOPMENT MODE SMS =====');
    console.log(`To: ${to}`);
    console.log(`Message: ${message}`);
    console.log('==================================\n');
    return { sid: 'dev-mock-sid', status: 'delivered', to, body: message };
  }
  
  if (!client) {
    console.warn('⚠️  SMS service not configured - SMS not sent:', { to, message });
    return { sid: 'mock-sid', status: 'mock' };
  }
  
  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    });
    console.log('✅ SMS sent:', result.sid);
    return result;
  } catch (error) {
    console.error('❌ Error sending SMS:', error);
    throw error;
  }
};

