// ICS File Generator for Flynn.ai v2 - Calendar event attachments

export interface ICSEventData {
  title: string;
  description: string;
  location?: string;
  startTime: string; // ISO datetime
  duration?: number; // minutes, default 60
  organizer: string; // email
  attendee?: string; // email or phone
  url?: string;
  uid?: string;
  urgency?: 'low' | 'medium' | 'high' | 'emergency';
}

/**
 * Generate ICS file content for calendar attachment
 */
export async function generateICSFile(
  eventData: ICSEventData
): Promise<string> {
  const {
    title,
    description,
    location,
    startTime,
    duration = 60,
    organizer,
    attendee,
    url,
    uid,
  } = eventData;

  // Generate unique UID if not provided
  const eventUid = uid || generateUID(title, startTime);

  // Calculate start and end times
  const startDate = new Date(startTime);
  const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

  // Format dates for ICS (YYYYMMDDTHHMMSSZ)
  const formatICSDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const dtStart = formatICSDate(startDate);
  const dtEnd = formatICSDate(endDate);
  const dtStamp = formatICSDate(new Date());

  // Escape special characters for ICS
  const escapeICSText = (text: string): string => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '');
  };

  // Build ICS content
  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Flynn.ai//Appointment Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${eventUid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeICSText(title)}`,
    `DESCRIPTION:${escapeICSText(description)}`,
  ];

  // Add optional fields
  if (location) {
    icsLines.push(`LOCATION:${escapeICSText(location)}`);
  }

  if (organizer) {
    icsLines.push(`ORGANIZER:mailto:${organizer}`);
  }

  if (attendee) {
    // Check if attendee is email or phone
    const isEmail = attendee.includes('@');
    if (isEmail) {
      icsLines.push(`ATTENDEE:mailto:${attendee}`);
    } else {
      icsLines.push(`ATTENDEE:tel:${attendee}`);
      icsLines.push(`X-ATTENDEE-PHONE:${attendee}`);
    }
  }

  if (url) {
    icsLines.push(`URL:${url}`);
  }

  // Add Flynn.ai specific properties
  icsLines.push('STATUS:TENTATIVE');
  icsLines.push('CLASS:PUBLIC');
  icsLines.push('SEQUENCE:0');

  // Set priority based on urgency
  const getPriority = (urgency?: string): number => {
    switch (urgency) {
      case 'emergency':
        return 1;
      case 'high':
        return 2;
      case 'medium':
        return 5;
      case 'low':
        return 9;
      default:
        return 5;
    }
  };

  icsLines.push(`PRIORITY:${getPriority(eventData.urgency)}`);
  icsLines.push('X-MICROSOFT-CDO-BUSYSTATUS:TENTATIVE');
  icsLines.push('X-FLYNN-AI:true');

  if (eventData.urgency) {
    icsLines.push(`X-FLYNN-URGENCY:${eventData.urgency.toUpperCase()}`);
  }

  // Add reminders
  icsLines.push('BEGIN:VALARM');
  icsLines.push('TRIGGER:-PT15M'); // 15 minutes before
  icsLines.push('ACTION:DISPLAY');
  icsLines.push(`DESCRIPTION:Reminder: ${escapeICSText(title)}`);
  icsLines.push('END:VALARM');

  // Add second reminder for urgent events
  if (
    description.toLowerCase().includes('urgent') ||
    description.toLowerCase().includes('emergency')
  ) {
    icsLines.push('BEGIN:VALARM');
    icsLines.push('TRIGGER:-PT60M'); // 1 hour before for urgent
    icsLines.push('ACTION:DISPLAY');
    icsLines.push(`DESCRIPTION:URGENT: ${escapeICSText(title)}`);
    icsLines.push('END:VALARM');
  }

  icsLines.push('END:VEVENT');
  icsLines.push('END:VCALENDAR');

  // Join with CRLF as per RFC 5545
  return icsLines.join('\r\n');
}

/**
 * Generate multiple ICS events in a single file
 */
export async function generateMultiEventICSFile(
  events: ICSEventData[]
): Promise<string> {
  const dtStamp =
    new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Flynn.ai//Appointment Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
  ].join('\r\n');

  for (const eventData of events) {
    const eventICS = await generateSingleEventICS(eventData, dtStamp);
    icsContent += '\r\n' + eventICS;
  }

  icsContent += '\r\nEND:VCALENDAR';

  return icsContent;
}

/**
 * Generate single event ICS content (without calendar wrapper)
 */
async function generateSingleEventICS(
  eventData: ICSEventData,
  dtStamp: string
): Promise<string> {
  const {
    title,
    description,
    location,
    startTime,
    duration = 60,
    organizer,
    attendee,
    url,
    uid,
  } = eventData;

  const eventUid = uid || generateUID(title, startTime);
  const startDate = new Date(startTime);
  const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

  const formatICSDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const escapeICSText = (text: string): string => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '');
  };

  const dtStart = formatICSDate(startDate);
  const dtEnd = formatICSDate(endDate);

  const eventLines = [
    'BEGIN:VEVENT',
    `UID:${eventUid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeICSText(title)}`,
    `DESCRIPTION:${escapeICSText(description)}`,
  ];

  if (location) {
    eventLines.push(`LOCATION:${escapeICSText(location)}`);
  }

  if (organizer) {
    eventLines.push(`ORGANIZER:mailto:${organizer}`);
  }

  if (attendee) {
    const isEmail = attendee.includes('@');
    if (isEmail) {
      eventLines.push(`ATTENDEE:mailto:${attendee}`);
    } else {
      eventLines.push(`ATTENDEE:tel:${attendee}`);
    }
  }

  if (url) {
    eventLines.push(`URL:${url}`);
  }

  eventLines.push('STATUS:TENTATIVE');
  eventLines.push('SEQUENCE:0');
  eventLines.push('END:VEVENT');

  return eventLines.join('\r\n');
}

/**
 * Generate unique UID for ICS event
 */
function generateUID(title: string, startTime: string): string {
  const timestamp = new Date(startTime).getTime();
  const titleHash = title.replace(/\s+/g, '-').toLowerCase();
  const randomSuffix = Math.random().toString(36).substring(2, 8);

  return `${timestamp}-${titleHash}-${randomSuffix}@flynn.ai`;
}

/**
 * Generate ICS for specific industry appointment types
 */
export async function generateIndustryICSFile(
  eventData: ICSEventData,
  industry: string
): Promise<string> {
  // Industry-specific enhancements
  const industryConfig = {
    plumbing: {
      defaultDuration: 90,
      category: 'Service Call',
      priority: 5,
    },
    real_estate: {
      defaultDuration: 45,
      category: 'Property Showing',
      priority: 3,
    },
    legal: {
      defaultDuration: 60,
      category: 'Legal Consultation',
      priority: 4,
    },
    medical: {
      defaultDuration: 30,
      category: 'Medical Appointment',
      priority: 2,
    },
  };

  const config = (industryConfig as any)[industry] || {
    defaultDuration: 60,
    category: 'Appointment',
    priority: 5,
  };

  // Apply industry-specific settings
  const enhancedEventData = {
    ...eventData,
    duration: eventData.duration || config.defaultDuration,
    description: `${config.category}: ${eventData.description}`,
  };

  return await generateICSFile(enhancedEventData);
}

/**
 * Validate ICS event data
 */
export function validateICSEventData(eventData: ICSEventData): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!eventData.title?.trim()) {
    errors.push('Title is required');
  }

  if (!eventData.description?.trim()) {
    errors.push('Description is required');
  }

  if (!eventData.startTime) {
    errors.push('Start time is required');
  } else {
    const startDate = new Date(eventData.startTime);
    if (isNaN(startDate.getTime())) {
      errors.push('Invalid start time format');
    }
  }

  if (!eventData.organizer?.includes('@')) {
    errors.push('Valid organizer email is required');
  }

  if (
    eventData.duration &&
    (eventData.duration < 1 || eventData.duration > 480)
  ) {
    errors.push('Duration must be between 1 and 480 minutes');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
