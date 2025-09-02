// Flynn.ai v2 - Recording Complete Webhook (Always-On AI Processing)
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { AIExtractionPipeline } from '@/lib/ai/AIExtractionPipeline';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const recordingSid = formData.get('RecordingSid') as string;
    const recordingUrl = formData.get('RecordingUrl') as string;
    const callSid = formData.get('CallSid') as string;
    const recordingDuration = formData.get('RecordingDuration') as string;

    if (!recordingSid || !recordingUrl || !callSid) {
      console.error('Missing required recording data');
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    const supabase = createClient();

    // Get the call record and user information
    const { data: callData, error: callError } = await supabase
      .from('calls')
      .select(`
        *,
        users:user_id (
          id, email, full_name, company_name, industry_type, 
          ai_processing_enabled, phone_number
        )
      `)
      .eq('call_sid', callSid)
      .single();

    if (callError || !callData) {
      console.error('Call not found:', callSid, callError);
      return NextResponse.json({ error: 'Call not found' }, { status: 404 });
    }

    // Check if AI processing is enabled for this user
    if (!callData.ai_processing_enabled) {
      console.log('AI processing disabled for user, skipping:', callData.user_id);
      return NextResponse.json({ success: true, message: 'AI processing disabled' });
    }

    // Update call record with recording information
    await supabase
      .from('calls')
      .update({
        recording_sid: recordingSid,
        recording_url: recordingUrl,
        recording_duration: recordingDuration ? parseInt(recordingDuration) : null,
        processing_status: 'queued',
        updated_at: new Date().toISOString()
      })
      .eq('call_sid', callSid);

    // Queue the AI processing job (run in background)
    processCallWithAI(callData, recordingUrl)
      .then(result => {
        console.log('AI processing completed for call:', callSid, result);
      })
      .catch(error => {
        console.error('AI processing failed for call:', callSid, error);
      });

    return NextResponse.json({ 
      success: true, 
      message: 'Recording processed, AI analysis queued' 
    });

  } catch (error) {
    console.error('Recording completion webhook error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

async function processCallWithAI(callData: any, recordingUrl: string) {
  const supabase = createClient();
  
  try {
    // Update status to processing
    await supabase
      .from('calls')
      .update({ 
        processing_status: 'processing',
        processing_started_at: new Date().toISOString()
      })
      .eq('call_sid', callData.call_sid);

    // Initialize AI extraction pipeline
    const aiPipeline = new AIExtractionPipeline();

    // Step 1: Transcribe the recording
    console.log('Starting transcription for call:', callData.call_sid);
    const transcription = await aiPipeline.transcribeRecording(recordingUrl);

    if (!transcription || transcription.length < 50) {
      // Recording too short or transcription failed
      await supabase
        .from('calls')
        .update({ 
          processing_status: 'completed',
          transcription: transcription || 'Transcription failed or call too short',
          business_call: false,
          events_extracted: 0,
          processing_completed_at: new Date().toISOString()
        })
        .eq('call_sid', callData.call_sid);
      
      return { success: true, message: 'Call too short or transcription failed' };
    }

    // Step 2: Determine if this is a business call
    console.log('Checking if business call:', callData.call_sid);
    const isBusinessCall = await aiPipeline.detectBusinessCall(
      transcription, 
      callData.users.industry_type
    );

    if (!isBusinessCall) {
      // Personal call - store transcription but don't process further
      await supabase
        .from('calls')
        .update({ 
          processing_status: 'completed',
          transcription: transcription,
          business_call: false,
          events_extracted: 0,
          processing_completed_at: new Date().toISOString()
        })
        .eq('call_sid', callData.call_sid);
      
      console.log('Personal call detected, skipping event extraction:', callData.call_sid);
      return { success: true, message: 'Personal call - no events extracted' };
    }

    // Step 3: Extract events from business call
    console.log('Extracting events from business call:', callData.call_sid);
    const extractedEvents = await aiPipeline.extractEvents(
      transcription,
      callData.users.industry_type,
      callData.users.company_name
    );

    // Step 4: Store extracted events
    const eventPromises = extractedEvents.map(async (event: any) => {
      return supabase
        .from('events')
        .insert({
          user_id: callData.user_id,
          call_id: callData.id,
          event_type: event.type,
          title: event.title,
          description: event.description,
          proposed_date_time: event.proposedDateTime,
          location: event.location,
          customer_name: event.customerName,
          customer_phone: event.customerPhone || callData.caller_number,
          customer_email: event.customerEmail,
          estimated_duration: event.estimatedDuration,
          estimated_price: event.estimatedPrice,
          urgency: event.urgency,
          confidence_score: event.confidenceScore,
          status: 'pending',
          created_at: new Date().toISOString()
        });
    });

    await Promise.all(eventPromises);

    // Step 5: Update call with processing results
    await supabase
      .from('calls')
      .update({ 
        processing_status: 'completed',
        transcription: transcription,
        business_call: true,
        events_extracted: extractedEvents.length,
        processing_completed_at: new Date().toISOString()
      })
      .eq('call_sid', callData.call_sid);

    // Step 6: Send SMS summary and email (in parallel)
    await Promise.all([
      sendSMSSummary(callData, extractedEvents),
      sendEmailSummary(callData, extractedEvents, transcription)
    ]);

    console.log(`AI processing completed successfully for call ${callData.call_sid}: ${extractedEvents.length} events extracted`);
    
    return { 
      success: true, 
      eventsExtracted: extractedEvents.length,
      businessCall: true
    };

  } catch (error) {
    console.error('AI processing error for call:', callData.call_sid, error);
    
    // Update call with error status
    await supabase
      .from('calls')
      .update({ 
        processing_status: 'failed',
        processing_error: error instanceof Error ? error.message : 'Unknown error',
        processing_completed_at: new Date().toISOString()
      })
      .eq('call_sid', callData.call_sid);

    throw error;
  }
}

async function sendSMSSummary(callData: any, extractedEvents: any[]) {
  try {
    if (extractedEvents.length === 0) {
      return; // No events to summarize
    }

    const twilio = require('twilio')(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    let message = `📞 Flynn.ai Call Summary\n\n`;
    
    if (extractedEvents.length === 1) {
      const event = extractedEvents[0];
      message += `📅 ${event.title}\n`;
      if (event.proposedDateTime) {
        message += `🕐 ${new Date(event.proposedDateTime).toLocaleString('en-AU')}\n`;
      }
      if (event.location) {
        message += `📍 ${event.location}\n`;
      }
      if (event.customerName) {
        message += `👤 ${event.customerName}\n`;
      }
    } else {
      message += `${extractedEvents.length} appointments scheduled:\n\n`;
      extractedEvents.forEach((event, index) => {
        message += `${index + 1}. ${event.title}\n`;
        if (event.proposedDateTime) {
          message += `   ${new Date(event.proposedDateTime).toLocaleString('en-AU')}\n`;
        }
      });
    }

    message += `\n🔗 Manage: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;

    await twilio.messages.create({
      body: message,
      from: callData.users.phone_number, // Send from their Flynn.ai number
      to: callData.users.phone_number // Send to their actual phone
    });

    console.log('SMS summary sent for call:', callData.call_sid);

  } catch (error) {
    console.error('Failed to send SMS summary:', error);
    // Don't throw - SMS failure shouldn't stop the process
  }
}

async function sendEmailSummary(callData: any, extractedEvents: any[], transcription: string) {
  try {
    // Use existing email system to send call overview
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/emails/send-call-overview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: callData.user_id,
        callId: callData.id,
        events: extractedEvents,
        transcription: transcription
      })
    });

    if (!response.ok) {
      throw new Error('Email sending failed');
    }

    console.log('Email summary sent for call:', callData.call_sid);

  } catch (error) {
    console.error('Failed to send email summary:', error);
    // Don't throw - email failure shouldn't stop the process
  }
}