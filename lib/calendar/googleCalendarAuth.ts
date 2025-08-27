// Google Calendar OAuth Authentication for Flynn.ai v2
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Google Calendar OAuth configuration
const GOOGLE_CALENDAR_CONFIG = {
  clientId: process.env.GOOGLE_CALENDAR_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_CALENDAR_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/calendar/google/callback`,
  scopes: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ],
};

export interface GoogleCalendarTokens {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  expiry_date?: number;
}

export interface CalendarAuthResult {
  success: boolean;
  tokens?: GoogleCalendarTokens;
  error?: string;
  authUrl?: string;
}

export class GoogleCalendarAuth {
  private oauth2Client: OAuth2Client;

  constructor() {
    if (!GOOGLE_CALENDAR_CONFIG.clientId || !GOOGLE_CALENDAR_CONFIG.clientSecret) {
      throw new Error('Google Calendar OAuth credentials not configured');
    }

    this.oauth2Client = new google.auth.OAuth2(
      GOOGLE_CALENDAR_CONFIG.clientId,
      GOOGLE_CALENDAR_CONFIG.clientSecret,
      GOOGLE_CALENDAR_CONFIG.redirectUri
    );
  }

  /**
   * Generate OAuth URL for user authorization
   */
  generateAuthUrl(userId: string): string {
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline', // Required for refresh token
      prompt: 'consent', // Force consent to get refresh token
      scope: GOOGLE_CALENDAR_CONFIG.scopes,
      state: userId, // Pass user ID in state for security
    });

    console.log('Generated Google Calendar auth URL for user:', userId);
    return authUrl;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string, state: string): Promise<CalendarAuthResult> {
    try {
      console.log('Exchanging authorization code for tokens');
      
      const { tokens } = await this.oauth2Client.getToken(code);
      
      if (!tokens.access_token) {
        throw new Error('No access token received from Google');
      }

      // Set credentials for future API calls
      this.oauth2Client.setCredentials(tokens);

      const result: CalendarAuthResult = {
        success: true,
        tokens: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || undefined,
          scope: tokens.scope || GOOGLE_CALENDAR_CONFIG.scopes.join(' '),
          token_type: tokens.token_type || 'Bearer',
          expiry_date: tokens.expiry_date || undefined,
        },
      };

      console.log('Successfully exchanged code for tokens');
      return result;

    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to exchange authorization code',
      };
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<CalendarAuthResult> {
    try {
      console.log('Refreshing Google Calendar access token');
      
      this.oauth2Client.setCredentials({
        refresh_token: refreshToken,
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();

      if (!credentials.access_token) {
        throw new Error('No access token received during refresh');
      }

      const result: CalendarAuthResult = {
        success: true,
        tokens: {
          access_token: credentials.access_token,
          refresh_token: credentials.refresh_token || refreshToken, // Keep original if no new one
          scope: credentials.scope || GOOGLE_CALENDAR_CONFIG.scopes.join(' '),
          token_type: credentials.token_type || 'Bearer',
          expiry_date: credentials.expiry_date || undefined,
        },
      };

      console.log('Successfully refreshed access token');
      return result;

    } catch (error) {
      console.error('Error refreshing access token:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to refresh access token',
      };
    }
  }

  /**
   * Get authenticated OAuth2 client for API calls
   */
  getAuthenticatedClient(tokens: GoogleCalendarTokens): OAuth2Client {
    const client = new google.auth.OAuth2(
      GOOGLE_CALENDAR_CONFIG.clientId,
      GOOGLE_CALENDAR_CONFIG.clientSecret,
      GOOGLE_CALENDAR_CONFIG.redirectUri
    );

    client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      scope: tokens.scope,
      token_type: tokens.token_type,
      expiry_date: tokens.expiry_date,
    });

    return client;
  }

  /**
   * Validate if tokens are still valid
   */
  async validateTokens(tokens: GoogleCalendarTokens): Promise<boolean> {
    try {
      const client = this.getAuthenticatedClient(tokens);
      const calendar = google.calendar({ version: 'v3', auth: client });
      
      // Test API call to validate tokens
      await calendar.calendarList.list({ maxResults: 1 });
      return true;

    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }

  /**
   * Revoke Google Calendar access
   */
  async revokeAccess(tokens: GoogleCalendarTokens): Promise<boolean> {
    try {
      const client = this.getAuthenticatedClient(tokens);
      await client.revokeCredentials();
      console.log('Successfully revoked Google Calendar access');
      return true;

    } catch (error) {
      console.error('Error revoking access:', error);
      return false;
    }
  }
}

// Export singleton instance
export const googleCalendarAuth = new GoogleCalendarAuth();

// Utility function to check if Google Calendar is configured
export function isGoogleCalendarConfigured(): boolean {
  return !!(GOOGLE_CALENDAR_CONFIG.clientId && GOOGLE_CALENDAR_CONFIG.clientSecret);
}

// Export configuration for debugging
export function getGoogleCalendarConfig() {
  return {
    hasClientId: !!GOOGLE_CALENDAR_CONFIG.clientId,
    hasClientSecret: !!GOOGLE_CALENDAR_CONFIG.clientSecret,
    redirectUri: GOOGLE_CALENDAR_CONFIG.redirectUri,
    scopes: GOOGLE_CALENDAR_CONFIG.scopes,
  };
}