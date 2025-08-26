import { Twilio } from 'twilio';

// Initialize Twilio client
const twilioClient = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export { twilioClient };

// Helper function to validate Twilio webhook signature
export function validateTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, string>
): boolean {
  if (!process.env.TWILIO_AUTH_TOKEN) {
    console.error('TWILIO_AUTH_TOKEN not configured');
    return false;
  }

  try {
    const twilio = require('twilio');
    return twilio.validateRequest(
      process.env.TWILIO_AUTH_TOKEN,
      signature,
      url,
      params
    );
  } catch (error) {
    console.error('Error validating Twilio signature:', error);
    return false;
  }
}