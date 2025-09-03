# Twilio Webhook Setup for Flynn.ai v2

## Overview

This document outlines the Twilio webhook configuration required for Flynn.ai v2 to process incoming calls and recordings.

## Required Environment Variables

Ensure these variables are set in your `.env.local`:

```bash
TWILIO_ACCOUNT_SID=ACyour-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

## Webhook Endpoints

### 1. Voice Webhook

**URL:** `https://your-domain.com/api/webhooks/twilio/voice`
**Method:** POST
**Description:** Handles incoming calls, generates TwiML response with industry-specific greeting

### 2. Recording Webhook

**URL:** `https://your-domain.com/api/webhooks/twilio/recording`
**Method:** POST
**Description:** Processes completed recordings and triggers AI processing pipeline

### 3. Recording Status Webhook

**URL:** `https://your-domain.com/api/webhooks/twilio/recording-status`
**Method:** POST
**Description:** Tracks recording status updates (completed, failed, in-progress)

### 4. Test Webhook

**URL:** `https://your-domain.com/api/webhooks/twilio/test`
**Method:** POST/GET
**Description:** Test endpoint for verifying webhook connectivity

## Twilio Console Configuration

### Step 1: Configure Your Twilio Phone Number

1. Go to Twilio Console → Phone Numbers → Manage → Active Numbers
2. Click on your Flynn.ai phone number
3. Set the following webhook URLs:

#### Voice Configuration

- **Webhook URL:** `https://your-domain.com/api/webhooks/twilio/voice`
- **HTTP Method:** POST
- **Call Status Changes:** `https://your-domain.com/api/webhooks/ `

#### Messaging Configuration (Optional)

- **Webhook URL:** `https://your-domain.com/api/webhooks/twilio/sms` (if implementing SMS features later)

### Step 2: Recording Configuration

Recordings are configured via TwiML in the voice webhook:

```xml
<Record
  action="/api/webhooks/twilio/recording"
  method="POST"
  maxLength="600"
  transcribe="false"
  recordingStatusCallback="/api/webhooks/twilio/recording-status"
  recordingStatusCallbackMethod="POST"
  playBeep="true"
/>
```

## Testing Your Setup

### Local Development with ngrok

1. Install ngrok: `npm install -g ngrok`
2. Start your Next.js app: `npm run dev`
3. In another terminal: `ngrok http 3000`
4. Use the ngrok HTTPS URL for webhook configuration
5. Test with: `curl -X GET https://your-ngrok-url.ngrok.io/api/webhooks/twilio/test`

### Production Testing

1. Deploy your app to Vercel/production
2. Configure webhooks with your production domain
3. Test with a real phone call to your Twilio number

## Expected Call Flow

1. **Incoming Call** → Twilio receives call
2. **Voice Webhook** → Twilio calls `/api/webhooks/twilio/voice`
3. **TwiML Response** → App returns greeting + recording instructions
4. **Call Recording** → Twilio records the call
5. **Recording Complete** → Twilio calls `/api/webhooks/twilio/recording`
6. **Status Updates** → Twilio calls `/api/webhooks/twilio/recording-status`
7. **AI Processing** → App triggers AI processing pipeline (next task)

## Security Considerations

- Always validate Twilio webhook signatures in production
- Use HTTPS URLs for all webhooks
- Store sensitive credentials in environment variables
- Implement rate limiting on webhook endpoints

## Troubleshooting

### Common Issues

1. **Webhook not receiving data**
   - Verify ngrok is running and URL is correct
   - Check Twilio Console webhook logs
   - Ensure webhook URL is publicly accessible

2. **TwiML parsing errors**
   - Verify XML format is correct
   - Check Content-Type header is `text/xml`
   - Review Twilio debugger logs

3. **Recording not working**
   - Verify recording webhook URL is correct
   - Check maxLength and other recording parameters
   - Review recording status webhook logs

### Debugging Tools

- Twilio Console → Develop → Monitor → Logs
- Browser Network tab for webhook responses
- Next.js console logs for debugging information
- `/api/webhooks/twilio/test` endpoint for connectivity testing

## Next Steps

After webhook setup is complete:

1. Implement OpenAI integration for transcription and AI processing
2. Set up email system for sending call summaries
3. Configure calendar integration for event creation
4. Add real-time dashboard updates
