// Email Templates for Flynn.ai v2 - Professional appointment summary emails

export interface EmailData {
  companyName: string;
  industry: string;
  callSummary: {
    callerPhone: string;
    duration: number;
    timestamp: string;
  };
  extractedEvents: any[];
  transcriptionSnippet: string;
  callId: string;
}

/**
 * Generate professional appointment summary email HTML
 */
export async function generateAppointmentSummaryEmail(
  data: EmailData
): Promise<string> {
  const {
    companyName,
    industry,
    callSummary,
    extractedEvents,
    transcriptionSnippet,
    callId,
  } = data;

  // Industry-specific styling and terminology
  const industryConfig = getIndustryEmailConfig(industry);

  const eventCards = extractedEvents
    .map((event) => generateEventCard(event, industryConfig))
    .join('\n');

  const hasUrgentEvents = extractedEvents.some(
    (e) => e.urgency === 'emergency' || e.urgency === 'high'
  );

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flynn.ai - Appointment Summary</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, ${industryConfig.primaryColor} 0%, ${industryConfig.secondaryColor} 100%);
            color: white;
            padding: 24px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .header p {
            margin: 8px 0 0 0;
            opacity: 0.9;
        }
        .urgent-banner {
            background: #dc2626;
            color: white;
            padding: 12px;
            text-align: center;
            font-weight: 600;
            font-size: 14px;
        }
        .content {
            padding: 24px;
        }
        .call-summary {
            background: #f8fafc;
            border-left: 4px solid ${industryConfig.primaryColor};
            padding: 16px;
            margin-bottom: 24px;
            border-radius: 0 4px 4px 0;
        }
        .call-summary h3 {
            margin: 0 0 12px 0;
            color: #374151;
            font-size: 16px;
        }
        .call-info {
            display: flex;
            gap: 24px;
            margin-bottom: 12px;
        }
        .call-info div {
            flex: 1;
        }
        .call-info label {
            display: block;
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }
        .call-info span {
            font-weight: 600;
            color: #111827;
        }
        .events-section h2 {
            color: #111827;
            margin: 0 0 16px 0;
            padding-bottom: 8px;
            border-bottom: 2px solid ${industryConfig.primaryColor};
        }
        .event-card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 16px;
            position: relative;
            background: white;
        }
        .event-card.urgent {
            border-color: #dc2626;
            background: #fef2f2;
        }
        .event-card.high {
            border-color: #f59e0b;
            background: #fffbeb;
        }
        .urgency-badge {
            position: absolute;
            top: -1px;
            right: -1px;
            padding: 4px 8px;
            border-radius: 0 8px 0 8px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .urgency-emergency { background: #dc2626; color: white; }
        .urgency-high { background: #f59e0b; color: white; }
        .urgency-medium { background: #10b981; color: white; }
        .urgency-low { background: #6b7280; color: white; }
        .event-title {
            font-size: 18px;
            font-weight: 600;
            color: #111827;
            margin: 0 0 8px 0;
        }
        .event-type {
            display: inline-block;
            padding: 2px 8px;
            background: ${industryConfig.primaryColor}22;
            color: ${industryConfig.primaryColor};
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 12px;
        }
        .event-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 12px;
        }
        .detail-item label {
            display: block;
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 4px;
        }
        .detail-item span {
            color: #111827;
            font-weight: 500;
        }
        .event-description {
            background: #f9fafb;
            padding: 12px;
            border-radius: 4px;
            font-size: 14px;
            color: #374151;
        }
        .confidence-bar {
            margin-top: 12px;
            height: 4px;
            background: #e5e7eb;
            border-radius: 2px;
            overflow: hidden;
        }
        .confidence-fill {
            height: 100%;
            border-radius: 2px;
        }
        .actions {
            background: #f8fafc;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            margin: 0 8px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
            transition: all 0.2s;
        }
        .btn-primary {
            background: ${industryConfig.primaryColor};
            color: white;
        }
        .btn-secondary {
            background: white;
            color: ${industryConfig.primaryColor};
            border: 1px solid ${industryConfig.primaryColor};
        }
        .footer {
            background: #374151;
            color: #d1d5db;
            padding: 16px 24px;
            font-size: 12px;
            text-align: center;
        }
        .footer a {
            color: #9ca3af;
            text-decoration: none;
        }
        .no-events {
            text-align: center;
            padding: 40px 20px;
            color: #6b7280;
        }
        .transcription-snippet {
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            padding: 12px;
            font-size: 13px;
            color: #4b5563;
            font-style: italic;
            margin-top: 16px;
        }
        @media (max-width: 600px) {
            body { padding: 10px; }
            .call-info { flex-direction: column; gap: 12px; }
            .event-details { grid-template-columns: 1fr; }
            .btn { display: block; margin: 8px 0; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📅 ${industryConfig.terminology.summary_title}</h1>
            <p>${companyName} • Processed by Flynn.ai</p>
        </div>
        
        ${hasUrgentEvents ? '<div class="urgent-banner">🔴 URGENT APPOINTMENTS REQUIRE IMMEDIATE ATTENTION</div>' : ''}
        
        <div class="content">
            <div class="call-summary">
                <h3>Call Summary</h3>
                <div class="call-info">
                    <div>
                        <label>From</label>
                        <span>${callSummary.callerPhone}</span>
                    </div>
                    <div>
                        <label>Duration</label>
                        <span>${formatDuration(callSummary.duration)}</span>
                    </div>
                    <div>
                        <label>Processed</label>
                        <span>${formatTimestamp(callSummary.timestamp)}</span>
                    </div>
                </div>
                ${
                  transcriptionSnippet
                    ? `
                <div class="transcription-snippet">
                    "${transcriptionSnippet}${transcriptionSnippet.length >= 200 ? '...' : ''}"
                </div>
                `
                    : ''
                }
            </div>
            
            ${
              extractedEvents.length > 0
                ? `
            <div class="events-section">
                <h2>🎯 ${industryConfig.terminology.events_title} (${extractedEvents.length})</h2>
                ${eventCards}
            </div>
            `
                : `
            <div class="no-events">
                <h3>No specific appointments were detected in this call</h3>
                <p>The call has been recorded and transcribed. You can review the full transcript in your dashboard if needed.</p>
            </div>
            `
            }
        </div>
        
        <div class="actions">
            <a href="https://flynnv2-h1g6zn20a-atticus-181af93c.vercel.app/dashboard" class="btn btn-primary">
                📊 View Dashboard
            </a>
            <a href="https://flynnv2-h1g6zn20a-atticus-181af93c.vercel.app/calls/${callId}" class="btn btn-secondary">
                🎧 View Full Transcript
            </a>
        </div>
        
        <div class="footer">
            Powered by <a href="https://flynn.ai">Flynn.ai</a> • 
            <a href="mailto:support@flynn.ai">Support</a> • 
            <a href="https://flynn.ai/privacy">Privacy</a>
        </div>
    </div>
</body>
</html>`;
}

/**
 * Generate individual event card HTML
 */
function generateEventCard(event: any, industryConfig: any): string {
  const urgencyClass = event.urgency || 'low';
  const confidencePercent = Math.round((event.confidence || 0) * 100);
  const confidenceColor = getConfidenceColor(event.confidence || 0);

  return `
    <div class="event-card ${urgencyClass === 'emergency' || urgencyClass === 'high' ? urgencyClass : ''}">
        <div class="urgency-badge urgency-${urgencyClass}">${urgencyClass}</div>
        
        <div class="event-type">${industryConfig.terminology[event.type] || event.type}</div>
        <h3 class="event-title">${event.title}</h3>
        
        <div class="event-details">
            ${
              event.customer_name
                ? `
            <div class="detail-item">
                <label>Customer</label>
                <span>${event.customer_name}</span>
            </div>
            `
                : ''
            }
            
            ${
              event.customer_phone
                ? `
            <div class="detail-item">
                <label>Phone</label>
                <span>${event.customer_phone}</span>
            </div>
            `
                : ''
            }
            
            ${
              event.location
                ? `
            <div class="detail-item">
                <label>Location</label>
                <span>${event.location}</span>
            </div>
            `
                : ''
            }
            
            ${
              event.proposed_datetime
                ? `
            <div class="detail-item">
                <label>Proposed Time</label>
                <span>${formatDateTime(event.proposed_datetime)}</span>
            </div>
            `
                : ''
            }
            
            ${
              event.price_estimate
                ? `
            <div class="detail-item">
                <label>Est. Price</label>
                <span>${event.price_estimate}</span>
            </div>
            `
                : ''
            }
            
            ${
              event.service_type
                ? `
            <div class="detail-item">
                <label>Service</label>
                <span>${event.service_type}</span>
            </div>
            `
                : ''
            }
        </div>
        
        <div class="event-description">
            ${event.description}
        </div>
        
        <div class="confidence-bar">
            <div class="confidence-fill" style="width: ${confidencePercent}%; background: ${confidenceColor};"></div>
        </div>
        <small style="color: #6b7280; font-size: 11px;">Confidence: ${confidencePercent}%</small>
    </div>`;
}

/**
 * Get industry-specific email configuration
 */
function getIndustryEmailConfig(industry: string) {
  const configs = {
    plumbing: {
      primaryColor: '#1e40af',
      secondaryColor: '#3b82f6',
      terminology: {
        summary_title: 'Service Call Summary',
        events_title: 'Service Requests',
        service_call: 'Service Call',
        quote: 'Quote Request',
        emergency: 'Emergency Service',
        appointment: 'Service Appointment',
      },
    },
    real_estate: {
      primaryColor: '#059669',
      secondaryColor: '#10b981',
      terminology: {
        summary_title: 'Property Inquiry Summary',
        events_title: 'Scheduled Showings',
        meeting: 'Property Showing',
        inspection: 'Property Inspection',
        appointment: 'Client Meeting',
      },
    },
    legal: {
      primaryColor: '#7c3aed',
      secondaryColor: '#8b5cf6',
      terminology: {
        summary_title: 'Client Consultation Summary',
        events_title: 'Legal Consultations',
        consultation: 'Legal Consultation',
        meeting: 'Client Meeting',
        appointment: 'Legal Appointment',
      },
    },
    medical: {
      primaryColor: '#dc2626',
      secondaryColor: '#ef4444',
      terminology: {
        summary_title: 'Patient Call Summary',
        events_title: 'Medical Appointments',
        appointment: 'Medical Appointment',
        consultation: 'Consultation',
        urgent: 'Urgent Care',
      },
    },
    general: {
      primaryColor: '#4f46e5',
      secondaryColor: '#6366f1',
      terminology: {
        summary_title: 'Call Summary',
        events_title: 'Appointments',
        appointment: 'Appointment',
        meeting: 'Meeting',
        service_call: 'Service Request',
      },
    },
  };

  return (configs as any)[industry] || configs.general;
}

/**
 * Utility functions
 */
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0
    ? `${minutes}m ${remainingSeconds}s`
    : `${minutes}m`;
}

function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateTime(datetime: string): string {
  return new Date(datetime).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return '#10b981'; // green
  if (confidence >= 0.6) return '#f59e0b'; // yellow
  return '#ef4444'; // red
}
