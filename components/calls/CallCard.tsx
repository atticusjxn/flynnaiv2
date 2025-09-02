'use client';

import React, { memo } from 'react';
import { Card, CardBody, Badge, Button } from '@nextui-org/react';
import { format, formatDistanceToNow } from 'date-fns';
import { Database } from '@/types/database.types';

type CallRecord = Database['public']['Tables']['calls']['Row'];

interface CallCardProps {
  call: CallRecord;
  onViewTranscript?: (callId: string) => void;
  onPlayAudio?: (callId: string) => void;
  onViewEvents?: (callId: string) => void;
}

const getStatusColor = (status: CallRecord['call_status']) => {
  switch (status) {
    case 'completed': return 'success';
    case 'in_progress': return 'primary';
    case 'failed': return 'danger';
    case 'busy': return 'warning';
    case 'no_answer': return 'secondary';
    default: return 'default';
  }
};

const getUrgencyColor = (urgency: CallRecord['urgency_level']) => {
  switch (urgency) {
    case 'emergency': return 'danger';
    case 'high': return 'warning';
    case 'medium': return 'primary';
    case 'low': return 'secondary';
    default: return 'default';
  }
};

const getProcessingColor = (status: CallRecord['ai_processing_status']) => {
  switch (status) {
    case 'completed': return 'success';
    case 'processing': return 'primary';
    case 'failed': return 'danger';
    case 'pending': return 'warning';
    default: return 'default';
  }
};

const CallCard = memo(function CallCard({ 
  call, 
  onViewTranscript, 
  onPlayAudio, 
  onViewEvents 
}: CallCardProps) {
  // Error boundary for invalid date
  let createdAt: Date;
  let formattedDate: string;
  let relativeDate: string;

  try {
    createdAt = new Date(call.created_at);
    if (isNaN(createdAt.getTime())) {
      throw new Error('Invalid date');
    }
    formattedDate = format(createdAt, 'MMM dd, yyyy • HH:mm');
    relativeDate = formatDistanceToNow(createdAt, { addSuffix: true });
  } catch (error) {
    console.warn('Error formatting date for call:', call.id, error);
    createdAt = new Date();
    formattedDate = 'Unknown date';
    relativeDate = 'Unknown time';
  }
  
  const duration = call.call_duration && call.call_duration > 0 
    ? `${Math.floor(call.call_duration / 60)}:${(call.call_duration % 60).toString().padStart(2, '0')}` 
    : 'Unknown';

  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-300 ease-out hover:scale-[1.01] hover:border-primary/20 bg-card border border-border shadow-sm"
    >
      <CardBody className="p-6">
        {/* Header with caller info and timestamp */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* Caller Avatar */}
            <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/30 rounded-full flex items-center justify-center border-2 border-primary/20">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
            </div>
            
            {/* Caller Details */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground text-lg">
                  {call.caller_name || 'Unknown Caller'}
                </h3>
                {call.urgency_level && (
                  <Badge 
                    color={getUrgencyColor(call.urgency_level)}
                    variant="flat"
                    size="sm"
                    className="uppercase tracking-wider font-medium"
                  >
                    {call.urgency_level}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground font-mono text-sm">
                {call.caller_number}
              </p>
            </div>
          </div>
          
          {/* Timestamp */}
          <div className="text-right text-sm text-muted-foreground">
            <p className="font-medium">{relativeDate}</p>
            <p className="text-xs">{formattedDate}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="mb-4">
          {call.main_topic && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Call Topic
              </h4>
              <p className="text-foreground font-medium">{call.main_topic}</p>
            </div>
          )}
          
          {call.call_summary && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Summary
              </h4>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {call.call_summary}
              </p>
            </div>
          )}
        </div>

        {/* Status and Metadata */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Badge 
              color={getStatusColor(call.call_status)}
              variant="flat"
              className="capitalize"
            >
              {call.call_status?.replace('_', ' ') || 'Unknown'}
            </Badge>
            
            <Badge 
              color={getProcessingColor(call.ai_processing_status)}
              variant="flat"
              className="capitalize"
            >
              AI: {call.ai_processing_status?.replace('_', ' ') || 'Pending'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <span className="font-mono">{duration}</span>
            </div>
            
            {call.call_direction && (
              <div className="flex items-center gap-1">
                {call.call_direction === 'inbound' ? (
                  <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
                  </svg>
                )}
                <span className="capitalize">{call.call_direction}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {call.transcription_text && (
            <Button
              size="sm"
              variant="flat"
              color="primary"
              startContent={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5-3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              }
              onPress={() => onViewTranscript?.(call.id)}
              aria-label={`View transcript for call from ${call.caller_name || call.caller_number}`}
              className="hover:scale-105 transition-transform"
            >
              Transcript
            </Button>
          )}
          
          {call.recording_url && (
            <Button
              size="sm"
              variant="flat"
              color="secondary"
              startContent={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                </svg>
              }
              onPress={() => onPlayAudio?.(call.id)}
              aria-label={`Play audio recording for call from ${call.caller_name || call.caller_number}`}
              className="hover:scale-105 transition-transform"
            >
              Play Audio
            </Button>
          )}
          
          <Button
            size="sm"
            variant="flat"
            color="success"
            startContent={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            }
            onPress={() => onViewEvents?.(call.id)}
            aria-label={`View extracted events for call from ${call.caller_name || call.caller_number}`}
            className="hover:scale-105 transition-transform"
          >
            Events
          </Button>
        </div>
      </CardBody>
    </Card>
  );
});

export default CallCard;