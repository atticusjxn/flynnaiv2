import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import CallOverviewEmail, { CallOverviewEmailProps } from '@/components/email-templates/CallOverviewEmail';
import { ExtractedEvent } from '@/components/email-templates/EventCard';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const industry = searchParams.get('industry') || 'plumbing';
  const urgent = searchParams.get('urgent') === 'true';

  // Sample data for different industries
  const sampleData = getSampleEmailData(industry, urgent);

  try {
    // Render the email component to HTML
    const emailHtml = await render(CallOverviewEmail(sampleData));

    return new NextResponse(emailHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Failed to render email preview:', error);
    return NextResponse.json(
      { error: 'Failed to render email preview' },
      { status: 500 }
    );
  }
}

function getSampleEmailData(industry: string, hasUrgent: boolean): CallOverviewEmailProps {
  const baseData = {
    companyName: getCompanyName(industry),
    industry: industry,
    callSummary: {
      callerPhone: '+1 (555) 123-4567',
      callerName: getCallerName(industry),
      duration: 240,
      timestamp: new Date().toISOString(),
      callSid: 'CA1234567890abcdef1234567890abcdef',
    },
    transcriptionSnippet: getTranscriptionSnippet(industry),
    callId: 'call_sample_123',
    userEmail: 'business@example.com',
    dashboardUrl: 'http://localhost:3000',
  };

  return {
    ...baseData,
    extractedEvents: getSampleEvents(industry, hasUrgent),
  };
}

function getCompanyName(industry: string): string {
  const companies = {
    plumbing: 'Smith Plumbing & HVAC',
    real_estate: 'Premium Properties Group',
    legal: 'Johnson & Associates Law',
    medical: 'Downtown Medical Clinic',
    sales: 'TechSolutions Inc.',
    consulting: 'Strategic Business Partners',
  };
  return companies[industry as keyof typeof companies] || 'Professional Services LLC';
}

function getCallerName(industry: string): string {
  const names = {
    plumbing: 'Sarah Martinez',
    real_estate: 'Michael Chen',
    legal: 'Jennifer Williams',
    medical: 'David Thompson',
    sales: 'Lisa Anderson',
    consulting: 'Robert Kim',
  };
  return names[industry as keyof typeof names] || 'John Smith';
}

function getTranscriptionSnippet(industry: string): string {
  const snippets = {
    plumbing: "Hi, I'm calling because I have a major leak in my kitchen sink. Water is everywhere and it's starting to damage my cabinets. I need someone to come out as soon as possible, preferably this afternoon if you have availability.",
    real_estate: "Hello, I saw your listing for the 3-bedroom house on Maple Street and I'm very interested. I'm pre-approved for up to $500,000 and would love to schedule a showing for this weekend if possible.",
    legal: "I'm calling about needing legal representation for a contract dispute with a business partner. The situation has escalated and I believe we may need to pursue legal action. Can we schedule a consultation this week?",
    medical: "Hi, I need to schedule an appointment for my annual physical. I'm also having some concerning symptoms that I'd like to discuss with the doctor. Are there any openings next week?",
    sales: "I received your proposal for the enterprise software solution and I'm interested in moving forward. Our budget has been approved and we'd like to schedule a final demonstration for the decision committee.",
    consulting: "We're looking for strategic consulting help with our digital transformation initiative. The project has a $2M budget and we need to start implementation by next quarter."
  };
  return snippets[industry as keyof typeof snippets] || "I'm calling to discuss scheduling an appointment for your services. Please call me back at your earliest convenience.";
}

function getSampleEvents(industry: string, hasUrgent: boolean): ExtractedEvent[] {
  const baseEvents = getIndustryEvents(industry);
  
  if (hasUrgent) {
    // Make first event urgent
    baseEvents[0].urgency = 'emergency';
    baseEvents[0].title = baseEvents[0].title + ' - URGENT';
  }
  
  return baseEvents;
}

function getIndustryEvents(industry: string): ExtractedEvent[] {
  const events = {
    plumbing: [
      {
        id: 'evt_plumbing_1',
        title: 'Kitchen Sink Leak Repair',
        description: 'Major leak under kitchen sink causing water damage to cabinets. Customer needs immediate service to prevent further damage.',
        type: 'service_call',
        proposed_datetime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
        duration_minutes: 90,
        urgency: 'high' as const,
        customer_name: 'Sarah Martinez',
        customer_phone: '+1 (555) 123-4567',
        customer_email: 'sarah.martinez@email.com',
        service_address: '1234 Oak Street, Springfield, IL 62701',
        location: '1234 Oak Street, Springfield, IL 62701',
        service_type: 'Plumbing Repair',
        price_estimate: '$150-200',
        confidence_score: 0.92,
        status: 'pending',
      },
      {
        id: 'evt_plumbing_2',
        title: 'Follow-up Maintenance Check',
        description: 'Schedule follow-up appointment to check water pressure and ensure no additional leaks after repair.',
        type: 'follow_up',
        urgency: 'low' as const,
        customer_name: 'Sarah Martinez',
        customer_phone: '+1 (555) 123-4567',
        location: 'Same address',
        price_estimate: '$75',
        confidence_score: 0.78,
        status: 'pending',
      }
    ],
    real_estate: [
      {
        id: 'evt_realestate_1',
        title: 'Property Showing - 456 Maple Street',
        description: 'Show 3-bedroom house to pre-approved buyer. Customer has budget up to $500K and is serious about purchasing.',
        type: 'showing',
        proposed_datetime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
        duration_minutes: 45,
        urgency: 'high' as const,
        customer_name: 'Michael Chen',
        customer_phone: '+1 (555) 234-5678',
        customer_email: 'michael.chen@email.com',
        location: '456 Maple Street, Springfield, IL 62702',
        service_type: 'Property Showing',
        price_estimate: 'Listing: $485,000',
        confidence_score: 0.95,
        status: 'pending',
      }
    ],
    legal: [
      {
        id: 'evt_legal_1',
        title: 'Contract Dispute Consultation',
        description: 'Initial consultation regarding business partner contract dispute. Client needs legal advice on potential litigation options.',
        type: 'consultation',
        proposed_datetime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        duration_minutes: 60,
        urgency: 'medium' as const,
        customer_name: 'Jennifer Williams',
        customer_phone: '+1 (555) 345-6789',
        customer_email: 'jennifer.williams@email.com',
        location: 'Law Office',
        service_type: 'Legal Consultation',
        price_estimate: '$300/hour',
        confidence_score: 0.88,
        status: 'pending',
      }
    ],
    medical: [
      {
        id: 'evt_medical_1',
        title: 'Annual Physical Examination',
        description: 'Routine annual physical with discussion of concerning symptoms mentioned by patient.',
        type: 'appointment',
        proposed_datetime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
        duration_minutes: 30,
        urgency: 'medium' as const,
        customer_name: 'David Thompson',
        customer_phone: '+1 (555) 456-7890',
        location: 'Medical Clinic',
        service_type: 'Physical Examination',
        confidence_score: 0.91,
        status: 'pending',
      }
    ],
    sales: [
      {
        id: 'evt_sales_1',
        title: 'Enterprise Demo for Decision Committee',
        description: 'Final product demonstration for enterprise software solution. Budget approved, ready to close deal.',
        type: 'demo',
        proposed_datetime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
        duration_minutes: 90,
        urgency: 'high' as const,
        customer_name: 'Lisa Anderson',
        customer_phone: '+1 (555) 567-8901',
        customer_email: 'lisa.anderson@company.com',
        location: 'Client Office',
        service_type: 'Product Demo',
        price_estimate: 'Deal Value: $150K',
        confidence_score: 0.94,
        status: 'pending',
      }
    ],
    consulting: [
      {
        id: 'evt_consulting_1',
        title: 'Digital Transformation Strategy Session',
        description: 'Strategic consulting for $2M digital transformation initiative. Client needs implementation plan for next quarter.',
        type: 'consultation',
        proposed_datetime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days from now
        duration_minutes: 120,
        urgency: 'high' as const,
        customer_name: 'Robert Kim',
        customer_phone: '+1 (555) 678-9012',
        customer_email: 'robert.kim@company.com',
        location: 'Client Headquarters',
        service_type: 'Strategy Consulting',
        price_estimate: 'Project Value: $2M',
        confidence_score: 0.89,
        status: 'pending',
      }
    ],
  };

  return events[industry as keyof typeof events] || events.plumbing;
}