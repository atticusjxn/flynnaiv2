import { NextRequest, NextResponse } from 'next/server';
import { Twilio } from 'twilio';

export async function POST(request: NextRequest) {
  try {
    const { accountSid, authToken, phoneNumber } = await request.json();

    if (!accountSid || !authToken || !phoneNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: accountSid, authToken, or phoneNumber' },
        { status: 400 }
      );
    }

    // Initialize Twilio client with provided credentials
    const twilioClient = new Twilio(accountSid, authToken);

    // Test the connection by fetching account info
    try {
      const account = await twilioClient.api.accounts(accountSid).fetch();
      
      // Verify the phone number exists and is active
      const incomingPhoneNumber = await twilioClient.incomingPhoneNumbers.list({
        phoneNumber: phoneNumber
      });

      if (incomingPhoneNumber.length === 0) {
        return NextResponse.json(
          { error: 'Phone number not found in your Twilio account' },
          { status: 400 }
        );
      }

      // Check if the phone number is active
      const phoneNumberDetails = incomingPhoneNumber[0];
      if (phoneNumberDetails.status !== 'in-use') {
        return NextResponse.json(
          { error: 'Phone number is not active' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        account: {
          friendlyName: account.friendlyName,
          status: account.status,
          phoneNumber: phoneNumberDetails.phoneNumber,
          capabilities: phoneNumberDetails.capabilities
        }
      });

    } catch (twilioError: any) {
      console.error('Twilio API Error:', twilioError);
      
      if (twilioError.status === 401) {
        return NextResponse.json(
          { error: 'Invalid Twilio credentials' },
          { status: 401 }
        );
      } else if (twilioError.status === 403) {
        return NextResponse.json(
          { error: 'Access denied. Please check your Twilio account permissions' },
          { status: 403 }
        );
      } else {
        return NextResponse.json(
          { error: `Twilio error: ${twilioError.message}` },
          { status: 400 }
        );
      }
    }

  } catch (error) {
    console.error('Test connection error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}