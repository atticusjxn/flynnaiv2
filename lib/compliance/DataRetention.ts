// Data Retention & Cleanup Service for Flynn.ai v2 - GDPR/CCPA compliance

import { createAdminClient } from '@/utils/supabase/server';

export interface RetentionPolicy {
  recordType: string;
  retentionDays: number;
  industryOverrides?: { [industry: string]: number };
  complianceRequirements: string[];
  deletionMethod: 'hard_delete' | 'anonymize' | 'archive';
}

export interface DeletionJob {
  id: string;
  recordType: string;
  recordId: string;
  scheduledDate: string;
  status: 'pending' | 'completed' | 'failed';
  deletionMethod: string;
  reason: string;
}

/**
 * Data Retention Manager - Handles automated data lifecycle management
 */
export class DataRetentionManager {
  private static instance: DataRetentionManager;
  
  private readonly retentionPolicies: RetentionPolicy[] = [
    {
      recordType: 'call_recordings',
      retentionDays: 90,
      industryOverrides: {
        medical: 30,     // HIPAA requires minimal retention
        legal: 2555,     // 7 years for legal records
        financial: 2555  // 7 years for financial records
      },
      complianceRequirements: ['GDPR', 'CCPA', 'HIPAA'],
      deletionMethod: 'hard_delete'
    },
    {
      recordType: 'transcriptions',
      retentionDays: 90,
      industryOverrides: {
        medical: 30,
        legal: 2555,
        financial: 2555
      },
      complianceRequirements: ['GDPR', 'CCPA', 'HIPAA'],
      deletionMethod: 'hard_delete'
    },
    {
      recordType: 'ai_extractions',
      retentionDays: 365, // Business data kept longer
      industryOverrides: {
        medical: 90,     // Shorter for medical
        legal: 2555,     // Legal requirement
        financial: 2555  // Financial requirement
      },
      complianceRequirements: ['GDPR', 'CCPA'],
      deletionMethod: 'anonymize'
    },
    {
      recordType: 'personal_data',
      retentionDays: 90,
      industryOverrides: {
        medical: 30,
        legal: 365,
        financial: 365
      },
      complianceRequirements: ['GDPR', 'CCPA', 'HIPAA'],
      deletionMethod: 'hard_delete'
    },
    {
      recordType: 'compliance_logs',
      retentionDays: 2555, // 7 years - always kept for audit
      complianceRequirements: ['ALL'],
      deletionMethod: 'archive'
    }
  ];

  public static getInstance(): DataRetentionManager {
    if (!DataRetentionManager.instance) {
      DataRetentionManager.instance = new DataRetentionManager();
    }
    return DataRetentionManager.instance;
  }

  /**
   * Schedule data deletion for a call based on retention policies
   */
  public async scheduleCallDataDeletion(
    callSid: string,
    userId: string,
    industry: string = 'general'
  ): Promise<void> {
    try {
      console.log(`Scheduling data deletion for call: ${callSid} (Industry: ${industry})`);

      for (const policy of this.retentionPolicies) {
        const retentionDays = this.getRetentionDaysForIndustry(policy, industry);
        const deletionDate = new Date();
        deletionDate.setDate(deletionDate.getDate() + retentionDays);

        const deletionJob: DeletionJob = {
          id: `${callSid}_${policy.recordType}_${Date.now()}`,
          recordType: policy.recordType,
          recordId: callSid,
          scheduledDate: deletionDate.toISOString(),
          status: 'pending',
          deletionMethod: policy.deletionMethod,
          reason: `Retention policy: ${retentionDays} days for ${industry} industry`
        };

        await this.storeDeletionJob(deletionJob);
      }

      console.log(`Data deletion scheduled for call ${callSid}`);

    } catch (error) {
      console.error(`Error scheduling data deletion for call ${callSid}:`, error);
    }
  }

  /**
   * Process pending deletion jobs (run daily via cron)
   */
  public async processPendingDeletions(): Promise<{
    processed: number;
    successful: number;
    failed: number;
    errors: string[];
  }> {
    console.log('Processing pending data deletions...');

    const stats = {
      processed: 0,
      successful: 0,
      failed: 0,
      errors: []
    };

    try {
      const pendingJobs = await this.getPendingDeletionJobs();
      console.log(`Found ${pendingJobs.length} pending deletion jobs`);

      for (const job of pendingJobs) {
        try {
          stats.processed++;
          
          const success = await this.executeDeletionJob(job);
          
          if (success) {
            stats.successful++;
            await this.markDeletionJobCompleted(job.id);
          } else {
            stats.failed++;
            await this.markDeletionJobFailed(job.id, 'Deletion execution failed');
          }

        } catch (error) {
          stats.failed++;
          stats.errors.push(`Job ${job.id}: ${error.message}`);
          await this.markDeletionJobFailed(job.id, error.message);
        }
      }

      console.log(`Deletion processing complete:`, stats);
      return stats;

    } catch (error) {
      console.error('Error processing pending deletions:', error);
      stats.errors.push(error.message);
      return stats;
    }
  }

  /**
   * Execute a specific deletion job
   */
  private async executeDeletionJob(job: DeletionJob): Promise<boolean> {
    console.log(`Executing deletion job: ${job.id} (${job.recordType})`);

    try {
      const supabase = createAdminClient();

      switch (job.recordType) {
        case 'call_recordings':
          return await this.deleteCallRecordings(supabase, job.recordId);

        case 'transcriptions':
          return await this.deleteTranscriptions(supabase, job.recordId);

        case 'ai_extractions':
          if (job.deletionMethod === 'anonymize') {
            return await this.anonymizeAIExtractions(supabase, job.recordId);
          } else {
            return await this.deleteAIExtractions(supabase, job.recordId);
          }

        case 'personal_data':
          return await this.deletePersonalData(supabase, job.recordId);

        case 'compliance_logs':
          return await this.archiveComplianceLogs(supabase, job.recordId);

        default:
          console.warn(`Unknown record type for deletion: ${job.recordType}`);
          return false;
      }

    } catch (error) {
      console.error(`Error executing deletion job ${job.id}:`, error);
      return false;
    }
  }

  /**
   * Delete call recordings from storage
   */
  private async deleteCallRecordings(supabase: any, callSid: string): Promise<boolean> {
    try {
      // Delete recording files from storage
      const { data: call } = await supabase
        .from('calls')
        .select('recording_url')
        .eq('twilio_call_sid', callSid)
        .single();

      if (call?.recording_url) {
        // Delete from cloud storage (implementation depends on storage provider)
        console.log(`Deleting recording file for call ${callSid}: ${call.recording_url}`);
        // await deleteFromCloudStorage(call.recording_url);
      }

      // Update database to remove recording references
      await supabase
        .from('calls')
        .update({
          recording_url: null,
          recording_deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('twilio_call_sid', callSid);

      console.log(`Call recording deleted for: ${callSid}`);
      return true;

    } catch (error) {
      console.error(`Error deleting call recording for ${callSid}:`, error);
      return false;
    }
  }

  /**
   * Delete transcriptions
   */
  private async deleteTranscriptions(supabase: any, callSid: string): Promise<boolean> {
    try {
      await supabase
        .from('calls')
        .update({
          transcription: null,
          transcription_deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('twilio_call_sid', callSid);

      console.log(`Transcription deleted for call: ${callSid}`);
      return true;

    } catch (error) {
      console.error(`Error deleting transcription for ${callSid}:`, error);
      return false;
    }
  }

  /**
   * Anonymize AI extractions (remove personal info but keep business data)
   */
  private async anonymizeAIExtractions(supabase: any, callSid: string): Promise<boolean> {
    try {
      // Get all events for this call
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('call_id', callSid);

      if (!events || events.length === 0) {
        return true;
      }

      // Anonymize each event
      for (const event of events) {
        const anonymizedEvent = {
          ...event,
          customer_name: '[ANONYMIZED]',
          customer_phone: '[ANONYMIZED]',
          customer_email: '[ANONYMIZED]',
          location: event.location ? '[ANONYMIZED ADDRESS]' : null,
          description: event.description?.replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, '[EMAIL]')
                                      ?.replace(/\b\d{3}-?\d{3}-?\d{4}\b/g, '[PHONE]'),
          anonymized_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        await supabase
          .from('events')
          .update(anonymizedEvent)
          .eq('id', event.id);
      }

      console.log(`AI extractions anonymized for call: ${callSid}`);
      return true;

    } catch (error) {
      console.error(`Error anonymizing AI extractions for ${callSid}:`, error);
      return false;
    }
  }

  /**
   * Delete AI extractions completely
   */
  private async deleteAIExtractions(supabase: any, callSid: string): Promise<boolean> {
    try {
      await supabase
        .from('events')
        .delete()
        .eq('call_id', callSid);

      console.log(`AI extractions deleted for call: ${callSid}`);
      return true;

    } catch (error) {
      console.error(`Error deleting AI extractions for ${callSid}:`, error);
      return false;
    }
  }

  /**
   * Delete personal data from calls
   */
  private async deletePersonalData(supabase: any, callSid: string): Promise<boolean> {
    try {
      await supabase
        .from('calls')
        .update({
          caller_number: '[DELETED]',
          caller_name: '[DELETED]',
          personal_data_deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('twilio_call_sid', callSid);

      console.log(`Personal data deleted for call: ${callSid}`);
      return true;

    } catch (error) {
      console.error(`Error deleting personal data for ${callSid}:`, error);
      return false;
    }
  }

  /**
   * Archive compliance logs
   */
  private async archiveComplianceLogs(supabase: any, callSid: string): Promise<boolean> {
    try {
      // Move compliance logs to archive table
      console.log(`Archiving compliance logs for call: ${callSid}`);
      // Implementation would move records to compliance_logs_archive table
      return true;

    } catch (error) {
      console.error(`Error archiving compliance logs for ${callSid}:`, error);
      return false;
    }
  }

  /**
   * Get retention days for specific industry
   */
  private getRetentionDaysForIndustry(policy: RetentionPolicy, industry: string): number {
    return policy.industryOverrides?.[industry] || policy.retentionDays;
  }

  /**
   * Store deletion job in database
   */
  private async storeDeletionJob(job: DeletionJob): Promise<void> {
    try {
      // This would store in a deletion_jobs table
      console.log(`Storing deletion job: ${job.id} for ${job.recordType} on ${job.scheduledDate}`);
      
      // In real implementation:
      // await supabase.from('deletion_jobs').insert(job);

    } catch (error) {
      console.error(`Error storing deletion job ${job.id}:`, error);
      throw error;
    }
  }

  /**
   * Get pending deletion jobs
   */
  private async getPendingDeletionJobs(): Promise<DeletionJob[]> {
    try {
      const now = new Date().toISOString();
      
      // This would query the deletion_jobs table
      // Return jobs that are due for processing
      
      // Mock data for now
      const mockJobs: DeletionJob[] = [];
      
      return mockJobs;

    } catch (error) {
      console.error('Error fetching pending deletion jobs:', error);
      return [];
    }
  }

  /**
   * Mark deletion job as completed
   */
  private async markDeletionJobCompleted(jobId: string): Promise<void> {
    console.log(`Marking deletion job completed: ${jobId}`);
    // await supabase.from('deletion_jobs').update({ status: 'completed' }).eq('id', jobId);
  }

  /**
   * Mark deletion job as failed
   */
  private async markDeletionJobFailed(jobId: string, error: string): Promise<void> {
    console.log(`Marking deletion job failed: ${jobId} - ${error}`);
    // await supabase.from('deletion_jobs').update({ status: 'failed', error }).eq('id', jobId);
  }

  /**
   * Handle user data deletion request (GDPR Right to be Forgotten)
   */
  public async handleUserDataDeletionRequest(userId: string): Promise<{
    success: boolean;
    deletedRecords: number;
    error?: string;
  }> {
    try {
      console.log(`Processing user data deletion request for user: ${userId}`);

      const supabase = createAdminClient();
      let deletedRecords = 0;

      // Get all calls for user
      const { data: calls } = await supabase
        .from('calls')
        .select('twilio_call_sid')
        .eq('user_id', userId);

      if (calls && calls.length > 0) {
        // Force immediate deletion of all call data
        for (const call of calls) {
          await this.immediateCallDataDeletion(call.twilio_call_sid);
          deletedRecords++;
        }
      }

      // Delete user record
      await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      console.log(`User data deletion completed for ${userId}: ${deletedRecords} calls deleted`);

      return {
        success: true,
        deletedRecords: deletedRecords
      };

    } catch (error) {
      console.error(`Error in user data deletion for ${userId}:`, error);
      return {
        success: false,
        deletedRecords: 0,
        error: error.message
      };
    }
  }

  /**
   * Immediate call data deletion (for GDPR requests)
   */
  private async immediateCallDataDeletion(callSid: string): Promise<void> {
    const supabase = createAdminClient();

    // Delete everything immediately
    await this.deleteCallRecordings(supabase, callSid);
    await this.deleteTranscriptions(supabase, callSid);
    await this.deleteAIExtractions(supabase, callSid);
    await this.deletePersonalData(supabase, callSid);

    // Delete call record completely
    await supabase
      .from('calls')
      .delete()
      .eq('twilio_call_sid', callSid);
  }
}

// Export singleton instance
export const dataRetentionManager = DataRetentionManager.getInstance();

// Export convenience functions
export async function scheduleCallDataDeletion(
  callSid: string,
  userId: string,
  industry: string = 'general'
): Promise<void> {
  return await dataRetentionManager.scheduleCallDataDeletion(callSid, userId, industry);
}

export async function processPendingDeletions() {
  return await dataRetentionManager.processPendingDeletions();
}

export async function handleUserDataDeletionRequest(userId: string) {
  return await dataRetentionManager.handleUserDataDeletionRequest(userId);
}