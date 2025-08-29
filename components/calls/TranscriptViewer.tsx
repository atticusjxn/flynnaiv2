'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardBody, CardHeader, Input, Button, Badge, Divider, Accordion, AccordionItem } from '@nextui-org/react';
import { Database } from '@/types/database.types';

type CallRecord = Database['public']['Tables']['calls']['Row'];

interface TranscriptViewerProps {
  call: CallRecord;
  isOpen?: boolean;
  onClose?: () => void;
}

interface TranscriptSegment {
  speaker: 'user' | 'caller' | 'system';
  text: string;
  timestamp?: string;
  confidence?: number;
  isHighlighted?: boolean;
}

// Mock function to parse transcript into segments
const parseTranscript = (transcriptionText: string): TranscriptSegment[] => {
  if (!transcriptionText) return [];
  
  // Split by paragraphs and create mock segments
  const paragraphs = transcriptionText.split('\n').filter(p => p.trim());
  
  return paragraphs.map((text, index) => ({
    speaker: index % 2 === 0 ? 'user' : 'caller',
    text: text.trim(),
    timestamp: `00:${Math.floor(index * 30 / 60).toString().padStart(2, '0')}:${(index * 30 % 60).toString().padStart(2, '0')}`,
    confidence: 0.85 + Math.random() * 0.15,
    isHighlighted: false,
  }));
};

// Mock function to highlight key information
const highlightKeyInfo = (text: string): string => {
  const patterns = [
    { regex: /(\d{1,2}:\d{2}(?:\s*(am|pm))?)/gi, class: 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100' },
    { regex: /(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/g, class: 'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100' },
    { regex: /(\$\d+(?:\.\d{2})?)/g, class: 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100' },
    { regex: /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})/g, class: 'bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-100' },
  ];

  let highlightedText = text;
  patterns.forEach(({ regex, class: className }) => {
    highlightedText = highlightedText.replace(regex, `<span class="px-1 py-0.5 rounded text-xs font-medium ${className}">$1</span>`);
  });
  
  return highlightedText;
};

export default function TranscriptViewer({ call, isOpen = true, onClose }: TranscriptViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightMode, setHighlightMode] = useState<'none' | 'keywords' | 'confidence'>('keywords');

  const segments = useMemo(() => parseTranscript(call.transcription_text || ''), [call.transcription_text]);
  
  const filteredSegments = useMemo(() => {
    if (!searchQuery.trim()) return segments;
    
    return segments.map(segment => ({
      ...segment,
      isHighlighted: segment.text.toLowerCase().includes(searchQuery.toLowerCase())
    })).filter(segment => segment.text.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [segments, searchQuery]);

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'default';
    if (confidence > 0.9) return 'success';
    if (confidence > 0.75) return 'warning';
    return 'danger';
  };

  const getSpeakerInfo = (speaker: TranscriptSegment['speaker']) => {
    switch (speaker) {
      case 'user':
        return { name: 'You', color: 'primary', icon: 'user' };
      case 'caller':
        return { name: call.caller_name || 'Caller', color: 'secondary', icon: 'phone' };
      case 'system':
        return { name: 'System', color: 'default', icon: 'cog' };
      default:
        return { name: 'Unknown', color: 'default', icon: 'question' };
    }
  };

  if (!call.transcription_text) {
    return (
      <Card className="w-full">
        <CardBody className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-muted/50 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5-3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Transcript Available</h3>
          <p className="text-muted-foreground">
            This call doesn't have a transcript yet. It may still be processing or the call might not have been recorded.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between w-full">
          <div>
            <h2 className="text-xl font-bold text-foreground">Call Transcript</h2>
            <p className="text-sm text-muted-foreground">
              Call with {call.caller_name || call.caller_number} • {call.call_duration ? `${Math.floor(call.call_duration / 60)}:${(call.call_duration % 60).toString().padStart(2, '0')}` : 'Duration unknown'}
            </p>
          </div>
          
          {onClose && (
            <Button
              isIconOnly
              variant="light"
              onPress={onClose}
              aria-label="Close transcript viewer"
              className="hover:scale-110 transition-transform"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          )}
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Input
            placeholder="Search in transcript..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            startContent={
              <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            }
            isClearable
            className="flex-1"
            classNames={{
              inputWrapper: "hover:border-primary/30 focus-within:border-primary/50",
            }}
          />
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={highlightMode === 'keywords' ? 'solid' : 'flat'}
              color="primary"
              onPress={() => setHighlightMode(highlightMode === 'keywords' ? 'none' : 'keywords')}
              aria-label={highlightMode === 'keywords' ? 'Disable keyword highlighting' : 'Enable keyword highlighting'}
            >
              Highlight Keywords
            </Button>
            
            <Button
              size="sm"
              variant={highlightMode === 'confidence' ? 'solid' : 'flat'}
              color="secondary"
              onPress={() => setHighlightMode(highlightMode === 'confidence' ? 'none' : 'confidence')}
              aria-label={highlightMode === 'confidence' ? 'Hide confidence scores' : 'Show confidence scores'}
            >
              Show Confidence
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Badge color="primary" variant="flat" size="sm">
              {filteredSegments.length} segments
            </Badge>
          </div>
          
          {call.transcription_confidence && (
            <div className="flex items-center gap-1">
              <Badge 
                color={getConfidenceColor(call.transcription_confidence)} 
                variant="flat" 
                size="sm"
              >
                {Math.round(call.transcription_confidence * 100)}% confidence
              </Badge>
            </div>
          )}
          
          {searchQuery && (
            <div className="flex items-center gap-1">
              <Badge color="success" variant="flat" size="sm">
                {filteredSegments.length} matches
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <Divider />

      <CardBody className="max-h-96 overflow-y-auto">
        <div className="space-y-4">
          {filteredSegments.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto bg-muted/50 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </div>
              <p className="text-muted-foreground">No matches found for "{searchQuery}"</p>
            </div>
          ) : (
            filteredSegments.map((segment, index) => {
              const speakerInfo = getSpeakerInfo(segment.speaker);
              
              return (
                <div
                  key={index}
                  className={`flex gap-4 p-4 rounded-xl transition-all duration-200 ${
                    segment.isHighlighted ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30'
                  }`}
                >
                  {/* Speaker Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-${speakerInfo.color}/10 border-2 border-${speakerInfo.color}/20`}>
                    <div className={`w-5 h-5 text-${speakerInfo.color}`}>
                      {speakerInfo.icon === 'user' && (
                        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                      )}
                      {speakerInfo.icon === 'phone' && (
                        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                      )}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Speaker and Timestamp */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground text-sm">
                          {speakerInfo.name}
                        </span>
                        {highlightMode === 'confidence' && segment.confidence && (
                          <Badge
                            color={getConfidenceColor(segment.confidence)}
                            variant="flat"
                            size="sm"
                          >
                            {Math.round(segment.confidence * 100)}%
                          </Badge>
                        )}
                      </div>
                      
                      {segment.timestamp && (
                        <span className="text-xs text-muted-foreground font-mono">
                          {segment.timestamp}
                        </span>
                      )}
                    </div>
                    
                    {/* Text Content */}
                    <div 
                      className="text-sm text-foreground leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: highlightMode === 'keywords' ? highlightKeyInfo(segment.text) : segment.text
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardBody>
    </Card>
  );
}