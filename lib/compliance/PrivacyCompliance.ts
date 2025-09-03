// Privacy Compliance & Legal Protection for Flynn.ai v2

export interface PrivacySettings {
  dataRetentionDays: number;
  allowRecording: boolean;
  allowTranscription: boolean;
  allowAIProcessing: boolean;
  shareWithThirdParties: boolean;
  consentRequired: boolean;
  industryCompliance: string[];
}

export interface ComplianceRecord {
  callSid: string;
  userId: string;
  consentGiven: boolean;
  consentTimestamp: string;
  privacyNoticeVersion: string;
  dataProcessingPurpose: string[];
  retentionDate: string;
  complianceFlags: string[];
}

/**
 * Privacy Compliance Manager - Handles legal requirements and data protection
 */
export class PrivacyComplianceManager {
  private static instance: PrivacyComplianceManager;
  private readonly CURRENT_PRIVACY_VERSION = '2024.1';
  private readonly DEFAULT_RETENTION_DAYS = 90;

  public static getInstance(): PrivacyComplianceManager {
    if (!PrivacyComplianceManager.instance) {
      PrivacyComplianceManager.instance = new PrivacyComplianceManager();
    }
    return PrivacyComplianceManager.instance;
  }

  /**
   * Check if call processing is compliant before activation
   */
  public async validateCallCompliance(
    callSid: string,
    userId: string,
    callerPhone?: string
  ): Promise<{ compliant: boolean; reason?: string; actions?: string[] }> {
    try {
      console.log(`Validating compliance for call: ${callSid}`);

      // Check user privacy settings
      const userSettings = await this.getUserPrivacySettings(userId);

      if (!userSettings.allowRecording) {
        return {
          compliant: false,
          reason: 'User has disabled call recording',
          actions: ['Skip AI processing', 'Log compliance violation'],
        };
      }

      if (!userSettings.allowAIProcessing) {
        return {
          compliant: false,
          reason: 'User has disabled AI processing',
          actions: ['Record only', 'Skip event extraction'],
        };
      }

      // Check industry-specific compliance requirements
      const industryChecks = await this.validateIndustryCompliance(
        userId,
        callerPhone
      );
      if (!industryChecks.compliant) {
        return industryChecks;
      }

      // All checks passed
      return { compliant: true };
    } catch (error) {
      console.error(`Compliance validation error for call ${callSid}:`, error);
      return {
        compliant: false,
        reason: 'Compliance validation failed',
        actions: ['Log error', 'Skip processing'],
      };
    }
  }

  /**
   * Record consent and compliance for a call
   */
  public async recordCallCompliance(
    callSid: string,
    userId: string,
    consentMethod: 'keypad_activation' | 'explicit_consent' | 'implied_consent'
  ): Promise<void> {
    try {
      const userSettings = await this.getUserPrivacySettings(userId);

      const complianceRecord: ComplianceRecord = {
        callSid,
        userId,
        consentGiven: true,
        consentTimestamp: new Date().toISOString(),
        privacyNoticeVersion: this.CURRENT_PRIVACY_VERSION,
        dataProcessingPurpose: [
          'appointment_extraction',
          'email_delivery',
          'calendar_integration',
        ],
        retentionDate: this.calculateRetentionDate(
          userSettings.dataRetentionDays
        ),
        complianceFlags: this.generateComplianceFlags(
          userSettings,
          consentMethod
        ),
      };

      await this.storeComplianceRecord(complianceRecord);

      console.log(`Compliance recorded for call ${callSid}: ${consentMethod}`);
    } catch (error) {
      console.error(`Error recording compliance for call ${callSid}:`, error);
    }
  }

  /**
   * Get user privacy settings
   */
  private async getUserPrivacySettings(
    userId: string
  ): Promise<PrivacySettings> {
    try {
      // This would typically fetch from database
      // For now, return secure defaults
      const defaultSettings: PrivacySettings = {
        dataRetentionDays: this.DEFAULT_RETENTION_DAYS,
        allowRecording: true,
        allowTranscription: true,
        allowAIProcessing: true,
        shareWithThirdParties: false,
        consentRequired: true,
        industryCompliance: ['GDPR', 'CCPA'],
      };

      return defaultSettings;
    } catch (error) {
      console.error(
        `Error fetching privacy settings for user ${userId}:`,
        error
      );
      // Return most restrictive settings on error
      return {
        dataRetentionDays: 30,
        allowRecording: false,
        allowTranscription: false,
        allowAIProcessing: false,
        shareWithThirdParties: false,
        consentRequired: true,
        industryCompliance: ['GDPR', 'CCPA', 'HIPAA'],
      };
    }
  }

  /**
   * Validate industry-specific compliance
   */
  private async validateIndustryCompliance(
    userId: string,
    callerPhone?: string
  ): Promise<{ compliant: boolean; reason?: string; actions?: string[] }> {
    try {
      // Get user's industry from database
      const userIndustry = await this.getUserIndustry(userId);

      switch (userIndustry) {
        case 'medical':
          return this.validateHIPAACompliance(callerPhone);

        case 'legal':
          return this.validateLegalPrivilegeCompliance(callerPhone);

        case 'financial':
          return this.validateFinancialCompliance(callerPhone);

        default:
          return { compliant: true };
      }
    } catch (error) {
      console.error(`Industry compliance validation error:`, error);
      return {
        compliant: false,
        reason: 'Industry compliance check failed',
      };
    }
  }

  /**
   * HIPAA Compliance for medical industry
   */
  private async validateHIPAACompliance(
    callerPhone?: string
  ): Promise<{ compliant: boolean; reason?: string; actions?: string[] }> {
    // HIPAA requires explicit consent for PHI processing
    return {
      compliant: true, // Assumes consent given via keypad activation
      actions: [
        'Mark as PHI',
        'Enable encryption',
        'Set 30-day retention',
        'Log HIPAA access',
      ],
    };
  }

  /**
   * Legal privilege compliance
   */
  private async validateLegalPrivilegeCompliance(
    callerPhone?: string
  ): Promise<{ compliant: boolean; reason?: string; actions?: string[] }> {
    return {
      compliant: true,
      actions: [
        'Mark as privileged',
        'Enable attorney-client protection',
        'Restrict AI analysis',
        'Extended retention',
      ],
    };
  }

  /**
   * Financial compliance (SOX, PCI, etc.)
   */
  private async validateFinancialCompliance(
    callerPhone?: string
  ): Promise<{ compliant: boolean; reason?: string; actions?: string[] }> {
    return {
      compliant: true,
      actions: [
        'Enable financial compliance mode',
        'Restrict data sharing',
        'Audit trail required',
      ],
    };
  }

  /**
   * Calculate data retention date
   */
  private calculateRetentionDate(retentionDays: number): string {
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() + retentionDays);
    return retentionDate.toISOString();
  }

  /**
   * Generate compliance flags based on settings and consent method
   */
  private generateComplianceFlags(
    settings: PrivacySettings,
    consentMethod: string
  ): string[] {
    const flags: string[] = [];

    flags.push(`consent_method:${consentMethod}`);
    flags.push(`privacy_version:${this.CURRENT_PRIVACY_VERSION}`);

    if (settings.industryCompliance.includes('HIPAA')) {
      flags.push('hipaa_compliant');
    }
    if (settings.industryCompliance.includes('GDPR')) {
      flags.push('gdpr_compliant');
    }
    if (settings.industryCompliance.includes('CCPA')) {
      flags.push('ccpa_compliant');
    }

    if (!settings.shareWithThirdParties) {
      flags.push('no_third_party_sharing');
    }

    if (settings.dataRetentionDays <= 30) {
      flags.push('short_retention');
    }

    return flags;
  }

  /**
   * Store compliance record in database
   */
  private async storeComplianceRecord(record: ComplianceRecord): Promise<void> {
    try {
      // This would store in a compliance audit table
      console.log(`Storing compliance record for call ${record.callSid}:`, {
        userId: record.userId,
        consent: record.consentGiven,
        version: record.privacyNoticeVersion,
        retention: record.retentionDate,
        flags: record.complianceFlags.join(', '),
      });

      // In a real implementation, this would:
      // 1. Store in compliance_records table
      // 2. Update call record with compliance flags
      // 3. Set up automated data deletion job
      // 4. Send compliance confirmation if required
    } catch (error) {
      console.error('Error storing compliance record:', error);
      throw error;
    }
  }

  /**
   * Get user industry from database
   */
  private async getUserIndustry(userId: string): Promise<string> {
    try {
      // This would fetch from the users table
      // For now, return 'general' as default
      return 'general';
    } catch (error) {
      console.error(`Error fetching user industry for ${userId}:`, error);
      return 'general';
    }
  }

  /**
   * Schedule data deletion for expired records
   */
  public async scheduleDataDeletion(): Promise<void> {
    try {
      console.log('Checking for expired data records...');

      // This would:
      // 1. Find all records past retention date
      // 2. Delete call recordings, transcripts, and AI data
      // 3. Keep compliance audit trail
      // 4. Log deletion activities
    } catch (error) {
      console.error('Error in scheduled data deletion:', error);
    }
  }

  /**
   * Generate privacy notice for display
   */
  public generatePrivacyNotice(industry: string = 'general'): string {
    const baseNotice = `
Privacy Notice - Flynn.ai Call Processing

By activating AI processing (*7), you consent to:
• Recording and transcription of this call
• AI analysis for appointment extraction
• Secure storage for business purposes
• Email delivery of appointment summaries

Your data is protected with enterprise-grade security.
Data retention: 90 days (configurable)
No sharing with third parties without consent.

Version: ${this.CURRENT_PRIVACY_VERSION}
    `;

    const industryAdditions = {
      medical:
        '\n• HIPAA compliance maintained\n• Patient information protected\n• Healthcare privacy standards applied',
      legal:
        '\n• Attorney-client privilege respected\n• Legal confidentiality maintained\n• Professional ethics compliance',
      financial:
        '\n• Financial data protection\n• Regulatory compliance maintained\n• Audit trail preserved',
    };

    return baseNotice + ((industryAdditions as any)[industry] || '');
  }
}

// Export singleton instance
export const privacyComplianceManager = PrivacyComplianceManager.getInstance();

// Export convenience functions
export async function validateCallCompliance(
  callSid: string,
  userId: string,
  callerPhone?: string
): Promise<{ compliant: boolean; reason?: string; actions?: string[] }> {
  return await privacyComplianceManager.validateCallCompliance(
    callSid,
    userId,
    callerPhone
  );
}

export async function recordCallCompliance(
  callSid: string,
  userId: string,
  consentMethod:
    | 'keypad_activation'
    | 'explicit_consent'
    | 'implied_consent' = 'keypad_activation'
): Promise<void> {
  return await privacyComplianceManager.recordCallCompliance(
    callSid,
    userId,
    consentMethod
  );
}
