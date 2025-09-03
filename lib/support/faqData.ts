import { Database } from '@/types/database.types';

type SupportArticleInsert = Database['public']['Tables']['support_articles']['Insert'];

// FAQ content generated from CLAUDE.md knowledge base
export const faqArticles: Omit<SupportArticleInsert, 'id' | 'author_id' | 'created_at' | 'updated_at'>[] = [
  // Getting Started
  {
    title: "What is Flynn.ai and how does it work?",
    slug: "what-is-flynn-ai",
    category: "getting-started",
    industry_type: "all",
    content: `
      <h2>Flynn.ai Overview</h2>
      <p>Flynn.ai v2 is a universal AI-powered platform that transforms business phone calls into organized calendar events. Our mission is to "turn every business call into actionable calendar events within 2 minutes."</p>
      
      <h3>How It Works</h3>
      <ol>
        <li><strong>Call Forwarding Setup</strong>: Simple 10-second setup with call forwarding that works with any phone, any carrier</li>
        <li><strong>AI Processing</strong>: Every business call is automatically recorded and transcribed using OpenAI Whisper</li>
        <li><strong>Event Extraction</strong>: Our AI extracts appointments, schedules, and commitments from your calls</li>
        <li><strong>Email Delivery</strong>: Professional email summaries with calendar events delivered within 2 minutes</li>
        <li><strong>Calendar Integration</strong>: Events sync automatically to Google Calendar, Outlook, or as ICS files</li>
      </ol>
      
      <h3>Key Benefits</h3>
      <ul>
        <li>Always-on call intelligence with zero caller awareness</li>
        <li>90%+ accuracy for event extraction across all industries</li>
        <li>Professional grade with enterprise-ready security</li>
        <li>Mobile-first design for professionals on the go</li>
      </ul>
    `,
    tags: ['overview', 'features', 'getting-started'],
    search_keywords: "flynn ai overview what is how works call forwarding AI processing",
    is_published: true,
    view_count: 0,
    helpful_count: 0,
    not_helpful_count: 0,
  },
  
  {
    title: "How to set up call forwarding in 10 seconds",
    slug: "setup-call-forwarding",
    category: "setup",
    industry_type: "all",
    content: `
      <h2>Quick Call Forwarding Setup</h2>
      <p>Flynn.ai uses simple call forwarding to process your business calls. Here's how to set it up:</p>
      
      <h3>Step 1: Get Your Flynn.ai Number</h3>
      <p>After signing up, you'll receive a unique Twilio phone number that Flynn.ai will use to process your calls.</p>
      
      <h3>Step 2: Set Up Call Forwarding</h3>
      <ol>
        <li>On your phone, dial the call forwarding code for your carrier</li>
        <li>Enter your Flynn.ai number when prompted</li>
        <li>Confirm the forwarding is active</li>
      </ol>
      
      <h3>Common Forwarding Codes:</h3>
      <ul>
        <li><strong>Verizon:</strong> *72 + Flynn.ai number</li>
        <li><strong>AT&T:</strong> *72 + Flynn.ai number</li>
        <li><strong>T-Mobile:</strong> **21* + Flynn.ai number + #</li>
        <li><strong>Sprint:</strong> *72 + Flynn.ai number</li>
      </ul>
      
      <h3>How It Works</h3>
      <p>Once set up:</p>
      <ol>
        <li>Calls come to your Flynn.ai number first</li>
        <li>Flynn.ai immediately forwards the call to your phone</li>
        <li>You answer normally - no change in call experience</li>
        <li>Flynn.ai processes the call in the background</li>
        <li>You receive email summaries within 2 minutes</li>
      </ol>
      
      <p><strong>Important:</strong> Callers experience no difference in call quality or connection time.</p>
    `,
    tags: ['setup', 'call-forwarding', 'phone-setup'],
    search_keywords: "call forwarding setup phone number twilio verizon att tmobile sprint",
    is_published: true,
    view_count: 0,
    helpful_count: 0,
    not_helpful_count: 0,
  },

  // Industry-Specific Content
  {
    title: "Flynn.ai for Plumbing Services: Emergency Response & Scheduling",
    slug: "plumbing-services-guide",
    category: "industry-specific",
    industry_type: "plumbing",
    content: `
      <h2>Plumbing Industry Features</h2>
      <p>Flynn.ai is optimized for plumbing and HVAC professionals who need to handle emergency calls and schedule service appointments efficiently.</p>
      
      <h3>Emergency Detection</h3>
      <p>Our AI automatically detects emergency situations:</p>
      <ul>
        <li><strong>EMERGENCY:</strong> flooding, burst pipes, no water/heat, sewage backup</li>
        <li><strong>HIGH:</strong> water damage, worsening leaks, no hot water</li>
        <li><strong>MEDIUM:</strong> routine repairs, slow drains, maintenance</li>
        <li><strong>LOW:</strong> upgrades, inspections, "when convenient"</li>
      </ul>
      
      <h3>Service Call Recognition</h3>
      <p>Flynn.ai understands plumbing terminology:</p>
      <ul>
        <li>"come out" or "come by" = service call</li>
        <li>"take a look" or "estimate" = quote</li>
        <li>"emergency" or "urgent" = emergency service</li>
      </ul>
      
      <h3>Key Information Extracted</h3>
      <ul>
        <li>Service addresses (critical for field work)</li>
        <li>Problem descriptions (for preparation and parts)</li>
        <li>Emergency indicators</li>
        <li>Time preferences (morning/afternoon/evening availability)</li>
        <li>Price estimates or budget discussions</li>
      </ul>
      
      <h3>Default Settings</h3>
      <ul>
        <li><strong>Service Duration:</strong> 90 minutes</li>
        <li><strong>Business Hours:</strong> 08:00-17:00 Mon-Sat</li>
        <li><strong>Travel Time:</strong> 15 minutes between service calls</li>
        <li><strong>Emergency Override:</strong> Emergency calls can override schedule conflicts</li>
      </ul>
    `,
    tags: ['plumbing', 'emergency', 'service-calls', 'hvac'],
    search_keywords: "plumbing emergency burst pipe flooding service call hvac water damage",
    is_published: true,
    view_count: 0,
    helpful_count: 0,
    not_helpful_count: 0,
  },

  {
    title: "Flynn.ai for Real Estate: Property Showings & Client Management",
    slug: "real-estate-guide",
    category: "industry-specific",
    industry_type: "real_estate",
    content: `
      <h2>Real Estate Features</h2>
      <p>Flynn.ai helps real estate professionals manage property showings, client meetings, and property tours efficiently.</p>
      
      <h3>Showing Priority Detection</h3>
      <p>Our AI prioritizes showings based on buyer urgency:</p>
      <ul>
        <li><strong>HIGH:</strong> pre-approved buyers, cash buyers, "closing soon", competitive market</li>
        <li><strong>MEDIUM:</strong> active buyers, timeline mentioned, serious interest</li>
        <li><strong>LOW:</strong> "just looking", early exploration, no timeline</li>
      </ul>
      
      <h3>Real Estate Terminology</h3>
      <ul>
        <li>"showing" or "tour" = property showing</li>
        <li>"walk through" = inspection</li>
        <li>"look at properties" = client meeting</li>
      </ul>
      
      <h3>Key Information Extracted</h3>
      <ul>
        <li>Property addresses (essential for showings)</li>
        <li>Property types and features mentioned</li>
        <li>Buyer/seller status and timeline urgency</li>
        <li>Price ranges and budget discussions</li>
        <li>Decision maker identification</li>
      </ul>
      
      <h3>Default Settings</h3>
      <ul>
        <li><strong>Showing Duration:</strong> 45 minutes</li>
        <li><strong>Business Hours:</strong> 09:00-18:00 Mon-Sun</li>
        <li><strong>Travel Time:</strong> 20 minutes between properties</li>
        <li><strong>Buffer Time:</strong> 15 minutes between showings</li>
      </ul>
      
      <h3>Calendar Integration</h3>
      <p>Property addresses are automatically added to calendar events with proper formatting for GPS navigation.</p>
    `,
    tags: ['real-estate', 'showings', 'property', 'clients'],
    search_keywords: "real estate property showing tour client meeting buyer seller",
    is_published: true,
    view_count: 0,
    helpful_count: 0,
    not_helpful_count: 0,
  },

  // Troubleshooting
  {
    title: "Why am I not receiving email summaries after calls?",
    slug: "no-email-summaries",
    category: "troubleshooting",
    industry_type: "all",
    content: `
      <h2>Email Summary Troubleshooting</h2>
      <p>If you're not receiving email summaries within 2 minutes after calls, here are the most common causes and solutions:</p>
      
      <h3>1. AI Processing Settings</h3>
      <p><strong>Check your dashboard toggle:</strong></p>
      <ul>
        <li>Go to your Dashboard</li>
        <li>Ensure "AI Processing" is enabled</li>
        <li>The toggle should be ON (blue/green)</li>
      </ul>
      
      <h3>2. Business Call Detection</h3>
      <p>Flynn.ai only processes business-related calls:</p>
      <ul>
        <li>Personal calls are filtered out automatically</li>
        <li>Very short calls (under 30 seconds) may not be processed</li>
        <li>Spam calls are automatically ignored</li>
      </ul>
      
      <h3>3. Email Delivery Issues</h3>
      <p><strong>Check these common issues:</strong></p>
      <ul>
        <li>Verify your email address in Account Settings</li>
        <li>Check your spam/junk folder</li>
        <li>Whitelist emails from @flynn.ai</li>
        <li>Ensure your email provider isn't blocking automated emails</li>
      </ul>
      
      <h3>4. Call Quality Requirements</h3>
      <p>For accurate processing, calls need:</p>
      <ul>
        <li>Clear audio quality</li>
        <li>Minimal background noise</li>
        <li>At least 30 seconds of conversation</li>
        <li>Business-relevant content</li>
      </ul>
      
      <h3>5. System Status</h3>
      <p>Check if there are any system issues:</p>
      <ul>
        <li>Visit our status page</li>
        <li>Check if OpenAI or Twilio services are experiencing outages</li>
        <li>Look for any notifications in your dashboard</li>
      </ul>
      
      <h3>Still Having Issues?</h3>
      <p>If none of these solve the problem:</p>
      <ol>
        <li>Make a test call to yourself discussing a fake appointment</li>
        <li>Wait 5 minutes for processing</li>
        <li>If still no email, create a support ticket with the call time and phone numbers involved</li>
      </ol>
    `,
    tags: ['troubleshooting', 'email', 'ai-processing', 'calls'],
    search_keywords: "no email summary not receiving calls AI processing troubleshooting",
    is_published: true,
    view_count: 0,
    helpful_count: 0,
    not_helpful_count: 0,
  },

  {
    title: "AI extraction accuracy is low - how to improve it",
    slug: "improve-ai-accuracy",
    category: "troubleshooting",
    industry_type: "all",
    content: `
      <h2>Improving AI Extraction Accuracy</h2>
      <p>Flynn.ai targets 90%+ accuracy for event extraction. If you're experiencing lower accuracy, here's how to improve it:</p>
      
      <h3>1. Call Quality Factors</h3>
      <p><strong>Optimize these for better accuracy:</strong></p>
      <ul>
        <li><strong>Speak clearly:</strong> Avoid mumbling or talking too quickly</li>
        <li><strong>Reduce background noise:</strong> Find a quiet environment when possible</li>
        <li><strong>Use speakerphone sparingly:</strong> Direct phone conversation works best</li>
        <li><strong>Strong signal:</strong> Ensure good cellular reception</li>
      </ul>
      
      <h3>2. Information Structure</h3>
      <p><strong>Help the AI by being specific:</strong></p>
      <ul>
        <li><strong>Dates and times:</strong> "Tomorrow at 2 PM" vs "sometime soon"</li>
        <li><strong>Full addresses:</strong> "123 Main Street, Springfield" vs "Main Street"</li>
        <li><strong>Contact information:</strong> Clearly state names and phone numbers</li>
        <li><strong>Service details:</strong> Be specific about what needs to be done</li>
      </ul>
      
      <h3>3. Industry Configuration</h3>
      <p>Ensure your industry is set correctly:</p>
      <ul>
        <li>Go to Settings > Industry Configuration</li>
        <li>Select your primary industry (plumbing, real estate, legal, etc.)</li>
        <li>This helps the AI understand your terminology and priorities</li>
      </ul>
      
      <h3>4. Confidence Scoring</h3>
      <p>Flynn.ai provides confidence scores for extractions:</p>
      <ul>
        <li><strong>90%+:</strong> Very reliable, ready to confirm</li>
        <li><strong>70-89%:</strong> Good accuracy, minor verification needed</li>
        <li><strong>50-69%:</strong> Moderate accuracy, review recommended</li>
        <li><strong>Below 50%:</strong> Low confidence, manual review required</li>
      </ul>
      
      <h3>5. Feedback Loop</h3>
      <p>Help improve accuracy by:</p>
      <ul>
        <li>Editing extracted events when they're incorrect</li>
        <li>Adding missing information</li>
        <li>Confirming correct extractions</li>
        <li>Your corrections help train the AI for your specific use case</li>
      </ul>
      
      <h3>6. Common Accuracy Issues</h3>
      <table class="min-w-full">
        <tr>
          <th>Issue</th>
          <th>Solution</th>
        </tr>
        <tr>
          <td>Wrong dates extracted</td>
          <td>Use specific date formats: "March 15th" or "next Tuesday"</td>
        </tr>
        <tr>
          <td>Missing addresses</td>
          <td>State full address clearly with street, city, state</td>
        </tr>
        <tr>
          <td>Incorrect urgency</td>
          <td>Use clear urgency words: "emergency", "urgent", "ASAP"</td>
        </tr>
        <tr>
          <td>Multiple events confused</td>
          <td>Discuss one appointment at a time, then move to the next</td>
        </tr>
      </table>
    `,
    tags: ['troubleshooting', 'ai-accuracy', 'extraction', 'improvement'],
    search_keywords: "AI accuracy low improve extraction confidence troubleshooting",
    is_published: true,
    view_count: 0,
    helpful_count: 0,
    not_helpful_count: 0,
  },

  // Billing
  {
    title: "Flynn.ai Pricing Plans and Features",
    slug: "pricing-plans",
    category: "billing",
    industry_type: "all",
    content: `
      <h2>Flynn.ai Subscription Tiers</h2>
      <p>Choose the plan that fits your business needs:</p>
      
      <h3>Basic Plan - $29/month</h3>
      <p><strong>Perfect for solo professionals and small contractors</strong></p>
      <ul>
        <li>AI call notes and event extraction</li>
        <li>Professional email delivery</li>
        <li>Basic calendar integration (ICS files)</li>
        <li>100 calls per month</li>
        <li>Email support</li>
      </ul>
      
      <h3>Professional Plan - $79/month</h3>
      <p><strong>Ideal for growing businesses and real estate teams</strong></p>
      <ul>
        <li>Everything in Basic</li>
        <li>Advanced calendar sync (Google Calendar, Outlook)</li>
        <li>SMS customer notifications</li>
        <li>Bulk event management</li>
        <li>500 calls per month</li>
        <li>Priority support</li>
      </ul>
      
      <h3>Enterprise Plan - $149/month</h3>
      <p><strong>For large organizations and franchise operations</strong></p>
      <ul>
        <li>Everything in Professional</li>
        <li>Unlimited calls</li>
        <li>Custom industry configurations</li>
        <li>Team collaboration features</li>
        <li>API access</li>
        <li>Dedicated support</li>
        <li>Advanced analytics</li>
      </ul>
      
      <h3>Free Trial</h3>
      <p>All plans include a 14-day free trial:</p>
      <ul>
        <li>No credit card required to start</li>
        <li>Full access to all features during trial</li>
        <li>25 free calls to test the system</li>
        <li>Cancel anytime during trial</li>
      </ul>
      
      <h3>Usage Limits</h3>
      <p>What counts as a "call":</p>
      <ul>
        <li>Any inbound call that gets AI processed</li>
        <li>Calls under 30 seconds don't count</li>
        <li>Personal/spam calls filtered out automatically</li>
        <li>Only business calls count toward your limit</li>
      </ul>
      
      <h3>Payment and Billing</h3>
      <ul>
        <li>Monthly billing via Stripe</li>
        <li>Major credit cards accepted</li>
        <li>Automatic renewal (cancel anytime)</li>
        <li>Prorated upgrades/downgrades</li>
        <li>30-day money-back guarantee</li>
      </ul>
    `,
    tags: ['billing', 'pricing', 'plans', 'subscription'],
    search_keywords: "pricing plans basic professional enterprise billing subscription cost",
    is_published: true,
    view_count: 0,
    helpful_count: 0,
    not_helpful_count: 0,
  },

  // Features
  {
    title: "Calendar Integration: Google Calendar, Outlook, and ICS Files",
    slug: "calendar-integration",
    category: "features",
    industry_type: "all",
    content: `
      <h2>Calendar Integration Options</h2>
      <p>Flynn.ai offers multiple ways to sync your extracted events to your calendar:</p>
      
      <h3>Google Calendar Integration</h3>
      <p><strong>Available in Professional and Enterprise plans</strong></p>
      <ul>
        <li>Real-time event synchronization</li>
        <li>Automatic conflict detection</li>
        <li>Choose which calendar to sync to</li>
        <li>Bi-directional sync (changes in calendar reflect in Flynn.ai)</li>
        <li>Set up: Settings > Calendar > Connect Google Calendar</li>
      </ul>
      
      <h3>Microsoft Outlook Integration</h3>
      <p><strong>Available in Professional and Enterprise plans</strong></p>
      <ul>
        <li>Works with Outlook.com and Office 365</li>
        <li>Real-time synchronization</li>
        <li>Conflict detection and resolution</li>
        <li>Support for multiple calendars</li>
        <li>Set up: Settings > Calendar > Connect Outlook</li>
      </ul>
      
      <h3>ICS File Attachments</h3>
      <p><strong>Available in all plans</strong></p>
      <ul>
        <li>Standard .ics files attached to every email summary</li>
        <li>Compatible with all calendar applications</li>
        <li>Apple Calendar, Thunderbird, and others</li>
        <li>One-click import to any calendar</li>
        <li>No setup required - works automatically</li>
      </ul>
      
      <h3>Calendar Event Details</h3>
      <p>Each synced event includes:</p>
      <ul>
        <li><strong>Title:</strong> AI-generated descriptive title</li>
        <li><strong>Date & Time:</strong> Extracted from call conversation</li>
        <li><strong>Location:</strong> Service address or meeting location</li>
        <li><strong>Description:</strong> Call summary and customer details</li>
        <li><strong>Attendees:</strong> Customer contact information</li>
        <li><strong>Reminders:</strong> Default 15-minute notification</li>
      </ul>
      
      <h3>Conflict Detection</h3>
      <p>Flynn.ai automatically detects scheduling conflicts:</p>
      <ul>
        <li>Time overlaps with existing events</li>
        <li>Insufficient travel time between locations</li>
        <li>Back-to-back meetings without buffer time</li>
        <li>Suggestions for alternative times</li>
      </ul>
      
      <h3>Industry-Specific Settings</h3>
      <ul>
        <li><strong>Plumbing:</strong> 15-minute travel time between service calls</li>
        <li><strong>Real Estate:</strong> 20-minute travel time between properties</li>
        <li><strong>Legal:</strong> 30-minute buffer between consultations</li>
        <li><strong>Medical:</strong> HIPAA-compliant event descriptions</li>
      </ul>
      
      <h3>Troubleshooting Calendar Sync</h3>
      <p>If events aren't syncing:</p>
      <ol>
        <li>Check calendar permissions in Settings</li>
        <li>Ensure you have write access to the selected calendar</li>
        <li>Verify your calendar integration is still connected</li>
        <li>Check for duplicate events (Flynn.ai prevents duplicates)</li>
        <li>Contact support if sync issues persist</li>
      </ol>
    `,
    tags: ['calendar', 'google-calendar', 'outlook', 'ics', 'sync'],
    search_keywords: "calendar integration google outlook ics sync events appointments",
    is_published: true,
    view_count: 0,
    helpful_count: 0,
    not_helpful_count: 0,
  },

  {
    title: "Security and Privacy: How Flynn.ai protects your data",
    slug: "security-privacy",
    category: "features",
    industry_type: "all",
    content: `
      <h2>Flynn.ai Security Framework</h2>
      <p>Your privacy and security are our top priorities. Here's how we protect your data:</p>
      
      <h3>Data Encryption</h3>
      <ul>
        <li><strong>In Transit:</strong> TLS 1.3 encryption for all connections</li>
        <li><strong>At Rest:</strong> AES-256 encryption in Supabase database</li>
        <li><strong>API Keys:</strong> All stored API keys are encrypted</li>
        <li><strong>Call Recordings:</strong> Encrypted storage with automatic deletion</li>
      </ul>
      
      <h3>Authentication & Access</h3>
      <ul>
        <li><strong>JWT-based authentication</strong> via Supabase Auth</li>
        <li><strong>Row Level Security</strong> on all database tables</li>
        <li><strong>Role-based access control</strong> for API permissions</li>
        <li><strong>Session management</strong> with secure HTTP-only cookies</li>
        <li><strong>Multi-factor authentication</strong> available (TOTP and SMS)</li>
      </ul>
      
      <h3>Data Minimization</h3>
      <ul>
        <li>Only business-relevant calls are processed</li>
        <li>Personal calls are automatically filtered out</li>
        <li>Call recordings are deleted after transcription</li>
        <li>We store only essential information for appointments</li>
      </ul>
      
      <h3>Industry Compliance</h3>
      
      <h4>HIPAA (Medical Industry)</h4>
      <ul>
        <li>Minimal medical information storage</li>
        <li>All PHI access is logged and audited</li>
        <li>End-to-end encryption for patient data</li>
        <li>HIPAA awareness documentation provided</li>
      </ul>
      
      <h4>Attorney-Client Privilege (Legal Industry)</h4>
      <ul>
        <li>Privileged communications can be marked</li>
        <li>Conflict checking awareness</li>
        <li>Configurable data retention policies</li>
      </ul>
      
      <h4>GDPR & CCPA Compliance</h4>
      <ul>
        <li><strong>Data Portability:</strong> Export your data anytime</li>
        <li><strong>Right to Deletion:</strong> Complete data removal on request</li>
        <li><strong>Consent Management:</strong> Clear privacy policy acceptance</li>
        <li><strong>Processing Lawfulness:</strong> Legitimate business interest basis</li>
      </ul>
      
      <h3>Third-Party Security</h3>
      
      <h4>OpenAI</h4>
      <ul>
        <li>Zero data retention policy for API calls</li>
        <li>Transcripts not used for training</li>
        <li>SOC 2 Type 2 certified</li>
      </ul>
      
      <h4>Twilio</h4>
      <ul>
        <li>Enterprise-grade call security</li>
        <li>HIPAA-compliant infrastructure</li>
        <li>ISO 27001 certified</li>
      </ul>
      
      <h4>Supabase</h4>
      <ul>
        <li>PostgreSQL with row-level security</li>
        <li>SOC 2 Type 2 certified</li>
        <li>Regular security audits</li>
      </ul>
      
      <h3>Security Monitoring</h3>
      <ul>
        <li>Real-time threat detection</li>
        <li>Automated security scanning</li>
        <li>Regular penetration testing</li>
        <li>24/7 security monitoring</li>
        <li>Incident response procedures</li>
      </ul>
      
      <h3>Your Data Rights</h3>
      <ul>
        <li><strong>Access:</strong> View all data we have about you</li>
        <li><strong>Correction:</strong> Update incorrect information</li>
        <li><strong>Deletion:</strong> Request complete data removal</li>
        <li><strong>Export:</strong> Download your data in standard formats</li>
        <li><strong>Restriction:</strong> Limit how we process your data</li>
      </ul>
      
      <h3>Security Best Practices for Users</h3>
      <ul>
        <li>Use strong, unique passwords</li>
        <li>Enable two-factor authentication</li>
        <li>Keep your contact information updated</li>
        <li>Review account activity regularly</li>
        <li>Report suspicious activity immediately</li>
      </ul>
    `,
    tags: ['security', 'privacy', 'encryption', 'compliance', 'hipaa'],
    search_keywords: "security privacy encryption HIPAA GDPR compliance data protection",
    is_published: true,
    view_count: 0,
    helpful_count: 0,
    not_helpful_count: 0,
  },
];

// Utility function to batch insert FAQ articles
export async function seedFAQArticles(supabase: any, authorId: string) {
  const articlesWithAuthor = faqArticles.map(article => ({
    ...article,
    author_id: authorId,
  }));

  const { data, error } = await supabase
    .from('support_articles')
    .insert(articlesWithAuthor)
    .select();

  if (error) {
    console.error('Error seeding FAQ articles:', error);
    throw error;
  }

  return data;
}