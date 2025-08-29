'use client';

import React, { useState, useMemo, memo } from 'react';
import { Pagination, Spinner, Modal, ModalContent, ModalBody } from '@nextui-org/react';
import CallCard from './CallCard';
import CallSearchFilters, { CallFilters } from './CallSearchFilters';
import TranscriptViewer from './TranscriptViewer';
import AudioPlayer from './AudioPlayer';
import { Database } from '@/types/database.types';

type CallRecord = Database['public']['Tables']['calls']['Row'];

interface CallHistoryListProps {
  calls: CallRecord[];
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

const CALLS_PER_PAGE = 10;

const CallHistoryList = memo(function CallHistoryList({ 
  calls, 
  isLoading = false, 
  error = null, 
  onRefresh 
}: CallHistoryListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [modalType, setModalType] = useState<'transcript' | 'audio' | 'events' | null>(null);
  const [filters, setFilters] = useState<CallFilters>({
    search: '',
    status: [],
    urgency: [],
    aiStatus: [],
    dateRange: null,
  });

  // Filter calls based on search and filters with error handling
  const filteredCalls = useMemo(() => {
    try {
      if (!Array.isArray(calls)) {
        console.warn('Calls data is not an array:', calls);
        return [];
      }

      let filtered = [...calls];

      // Text search with null safety
      if (filters.search?.trim()) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(call => {
          try {
            return (
              call.caller_name?.toLowerCase().includes(searchLower) ||
              call.caller_number?.includes(filters.search) ||
              call.main_topic?.toLowerCase().includes(searchLower) ||
              call.call_summary?.toLowerCase().includes(searchLower) ||
              call.transcription_text?.toLowerCase().includes(searchLower)
            );
          } catch (err) {
            console.warn('Error filtering call:', call.id, err);
            return false;
          }
        });
      }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(call => 
        filters.status.includes(call.call_status)
      );
    }

    // Urgency filter
    if (filters.urgency.length > 0) {
      filtered = filtered.filter(call => 
        call.urgency_level && filters.urgency.includes(call.urgency_level)
      );
    }

    // AI Status filter
    if (filters.aiStatus.length > 0) {
      filtered = filtered.filter(call => 
        call.ai_processing_status && filters.aiStatus.includes(call.ai_processing_status)
      );
    }

      // Sort by most recent first with error handling
      return filtered.sort((a, b) => {
        try {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return dateB - dateA;
        } catch (err) {
          console.warn('Error sorting calls by date:', err);
          return 0;
        }
      });
    } catch (err) {
      console.error('Error filtering calls:', err);
      return [];
    }
  }, [calls, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredCalls.length / CALLS_PER_PAGE);
  const paginatedCalls = useMemo(() => {
    const startIndex = (currentPage - 1) * CALLS_PER_PAGE;
    return filteredCalls.slice(startIndex, startIndex + CALLS_PER_PAGE);
  }, [filteredCalls, currentPage]);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleViewTranscript = (callId: string) => {
    const call = calls.find(c => c.id === callId);
    if (call) {
      setSelectedCall(call);
      setModalType('transcript');
    }
  };

  const handlePlayAudio = (callId: string) => {
    const call = calls.find(c => c.id === callId);
    if (call) {
      setSelectedCall(call);
      setModalType('audio');
    }
  };

  const handleViewEvents = (callId: string) => {
    // TODO: Navigate to events page with call filter
    console.log('View events for call:', callId);
  };

  const closeModal = () => {
    setSelectedCall(null);
    setModalType(null);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 mx-auto bg-danger/10 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-danger" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Calls</h3>
        <p className="text-muted-foreground text-center mb-4">{error}</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <CallSearchFilters
        filters={filters}
        onFiltersChange={setFilters}
        totalCount={calls.length}
        filteredCount={filteredCalls.length}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" color="primary" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredCalls.length === 0 && calls.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-4">No Calls Yet</h2>
          <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
            Your call history will appear here once you start receiving and processing calls with Flynn.ai. 
            All calls with AI extraction will be displayed chronologically.
          </p>
        </div>
      )}

      {/* No Results State */}
      {!isLoading && filteredCalls.length === 0 && calls.length > 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-muted/50 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Results Found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or search terms to find the calls you're looking for.
          </p>
        </div>
      )}

      {/* Call List */}
      {!isLoading && paginatedCalls.length > 0 && (
        <>
          <div className="space-y-4">
            {paginatedCalls.map((call) => (
              <CallCard
                key={call.id}
                call={call}
                onViewTranscript={handleViewTranscript}
                onPlayAudio={handlePlayAudio}
                onViewEvents={handleViewEvents}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                page={currentPage}
                total={totalPages}
                onChange={setCurrentPage}
                size="lg"
                showControls
                classNames={{
                  wrapper: "gap-0 overflow-visible h-fit rounded border border-divider",
                  item: "w-unit-12 h-unit-12 text-small rounded-none bg-transparent",
                  cursor: "bg-gradient-to-b shadow-lg from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 text-white font-medium",
                }}
              />
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <Modal
        isOpen={modalType === 'transcript' && selectedCall !== null}
        onClose={closeModal}
        size="5xl"
        scrollBehavior="inside"
        classNames={{
          base: "bg-background border-border",
          backdrop: "bg-black/50 backdrop-blur-sm",
        }}
      >
        <ModalContent>
          <ModalBody className="p-0">
            {selectedCall && (
              <TranscriptViewer
                call={selectedCall}
                onClose={closeModal}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={modalType === 'audio' && selectedCall !== null}
        onClose={closeModal}
        size="3xl"
        classNames={{
          base: "bg-background border-border",
          backdrop: "bg-black/50 backdrop-blur-sm",
        }}
      >
        <ModalContent>
          <ModalBody className="p-6">
            {selectedCall && (
              <AudioPlayer call={selectedCall} />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
});

export default CallHistoryList;