const twilio = require('twilio');

// If TWILIO_ENABLED is not 'true', the service becomes a no-op (useful for local/dev)
const TWILIO_ENABLED = process.env.TWILIO_ENABLED === 'true';

let client = null;
if (TWILIO_ENABLED) {
  client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

exports.sendSMS = async (to, message) => {
  if (!TWILIO_ENABLED) {
    console.log('TWILIO disabled - SMS not sent. Message to', to, ':', message);
    return { sid: 'twilio-disabled' };
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    });
    console.log('SMS sent:', result.sid);
    return result;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};
