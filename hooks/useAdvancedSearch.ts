'use client';

import { useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database.types';

// Types
export interface SearchResult {
  id: string;
  type: 'call' | 'event' | 'communication';
  title: string;
  description: string;
  metadata: {
    date: string;
    urgency?: string;
    status?: string;
    customerName?: string;
    phoneNumber?: string;
    location?: string;
    confidence?: number;
    callId?: string;
    eventId?: string;
  };
  highlights?: {
    field: string;
    snippet: string;
  }[];
  relevanceScore: number;
}

export interface SearchFilters {
  query: string;
  categories: ('calls' | 'events' | 'communications')[];
  callStatuses: string[];
  eventStatuses: string[];
  urgencyLevels: string[];
  eventTypes: string[];
  dateRange: {
    from: string;
    to: string;
  };
  industries: string[];
  customerFilters: {
    hasContactInfo: boolean;
    hasEmail: boolean;
    hasPhone: boolean;
  };
  aiFilters: {
    minConfidence: number;
    hasTranscription: boolean;
    hasSummary: boolean;
  };
  locationFilters: {
    hasAddress: boolean;
    locationType: string[];
  };
}

export interface SavedSearch {
  id: string;
  name: string;
  description?: string;
  query: string;
  filters: any;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  lastUsed?: string;
  useCount: number;
}

export interface SearchSuggestion {
  id: string;
  text: string;
  category: 'calls' | 'events' | 'customers' | 'locations' | 'transcripts';
  relevanceScore: number;
  metadata?: {
    callId?: string;
    eventId?: string;
    customerName?: string;
    phoneNumber?: string;
    date?: string;
  };
}

export interface UseAdvancedSearchOptions {
  userId?: string;
  debounceMs?: number;
  maxResults?: number;
  enableFullTextSearch?: boolean;
}

export const useAdvancedSearch = (options: UseAdvancedSearchOptions = {}) => {
  const {
    userId,
    debounceMs = 400,
    maxResults = 100,
    enableFullTextSearch = true,
  } = options;

  // State
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [searchTime, setSearchTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);

  // Refs
  const supabase = createClient();
  const debounceRef = useRef<NodeJS.Timeout>();

  // Build full-text search query
  const buildSearchQuery = useCallback((query: string): string => {
    if (!query.trim()) return '';

    // Clean and prepare search terms
    const terms = query
      .trim()
      .split(/\s+/)
      .filter((term) => term.length > 0)
      .map((term) => {
        // Remove special characters that might break the query
        const cleaned = term.replace(/[^\w\d]/g, '');
        return cleaned.length > 0 ? cleaned : null;
      })
      .filter(Boolean);

    if (terms.length === 0) return '';

    // Build PostgreSQL full-text search query
    // Using 'or' operator for broader results, 'and' for more precise
    return terms.map((term) => `${term}:*`).join(' | ');
  }, []);

  // Enhanced search function with full-text search and filtering
  const performSearch = useCallback(
    async (filters: SearchFilters): Promise<SearchResult[]> => {
      const startTime = Date.now();
      setIsSearching(true);
      setError(null);

      try {
        const results: SearchResult[] = [];

        // Search calls if included in categories
        if (filters.categories.includes('calls')) {
          let callsQuery = supabase
            .from('calls')
            .select(
              `
            id,
            caller_name,
            caller_number,
            main_topic,
            call_summary,
            transcription_text,
            call_status,
            urgency_level,
            transcription_confidence,
            ai_processing_status,
            created_at,
            call_duration
          `
            )
            .order('created_at', { ascending: false })
            .limit(maxResults);

          // Add user filter if provided
          if (userId) {
            callsQuery = callsQuery.eq('user_id', userId);
          }

          // Apply full-text search on calls
          if (filters.query.trim() && enableFullTextSearch) {
            const searchQuery = buildSearchQuery(filters.query);
            if (searchQuery) {
              // Search across multiple fields
              callsQuery = callsQuery.or(`
              caller_name.ilike.%${filters.query}%,
              caller_number.ilike.%${filters.query}%,
              main_topic.ilike.%${filters.query}%,
              call_summary.ilike.%${filters.query}%,
              transcription_text.ilike.%${filters.query}%
            `);
            }
          }

          // Apply status filters
          if (filters.callStatuses.length > 0) {
            callsQuery = callsQuery.in('call_status', filters.callStatuses);
          }

          // Apply urgency filters
          if (filters.urgencyLevels.length > 0) {
            callsQuery = callsQuery.in('urgency_level', filters.urgencyLevels);
          }

          // Apply AI filters
          if (filters.aiFilters.hasTranscription) {
            callsQuery = callsQuery.not('transcription_text', 'is', null);
          }

          if (filters.aiFilters.hasSummary) {
            callsQuery = callsQuery.not('call_summary', 'is', null);
          }

          if (filters.aiFilters.minConfidence > 0) {
            callsQuery = callsQuery.gte(
              'transcription_confidence',
              filters.aiFilters.minConfidence / 100
            );
          }

          // Apply date range
          if (filters.dateRange.from) {
            callsQuery = callsQuery.gte('created_at', filters.dateRange.from);
          }
          if (filters.dateRange.to) {
            callsQuery = callsQuery.lte('created_at', filters.dateRange.to);
          }

          const { data: callsData, error: callsError } = await callsQuery;

          if (callsError) {
            console.error('Calls search error:', callsError);
          } else if (callsData) {
            const callResults: SearchResult[] = callsData.map((call) => ({
              id: call.id,
              type: 'call' as const,
              title:
                call.main_topic ||
                `Call from ${call.caller_name || call.caller_number}`,
              description:
                call.call_summary ||
                call.transcription_text?.substring(0, 200) + '...' ||
                'No summary available',
              metadata: {
                date: call.created_at,
                urgency: call.urgency_level || undefined,
                status: call.call_status || undefined,
                customerName: call.caller_name || undefined,
                phoneNumber: call.caller_number,
                confidence: call.transcription_confidence
                  ? Math.round(call.transcription_confidence * 100)
                  : undefined,
                callId: call.id,
              },
              highlights: generateHighlights(filters.query, call, 'call'),
              relevanceScore: calculateRelevanceScore(
                filters.query,
                call,
                'call'
              ),
            }));

            results.push(...callResults);
          }
        }

        // Search events if included in categories
        if (filters.categories.includes('events')) {
          let eventsQuery = supabase
            .from('events')
            .select(
              `
            id,
            title,
            description,
            status,
            event_type,
            urgency_level,
            customer_name,
            customer_phone,
            customer_email,
            location,
            location_type,
            proposed_datetime,
            confirmed_datetime,
            created_at,
            call_id,
            notes,
            price_estimate
          `
            )
            .order('created_at', { ascending: false })
            .limit(maxResults);

          // Add user filter
          if (userId) {
            eventsQuery = eventsQuery.eq('user_id', userId);
          }

          // Apply full-text search on events
          if (filters.query.trim()) {
            eventsQuery = eventsQuery.or(`
            title.ilike.%${filters.query}%,
            description.ilike.%${filters.query}%,
            customer_name.ilike.%${filters.query}%,
            customer_phone.ilike.%${filters.query}%,
            customer_email.ilike.%${filters.query}%,
            location.ilike.%${filters.query}%,
            notes.ilike.%${filters.query}%
          `);
          }

          // Apply event-specific filters
          if (filters.eventStatuses.length > 0) {
            eventsQuery = eventsQuery.in('status', filters.eventStatuses);
          }

          if (filters.eventTypes.length > 0) {
            eventsQuery = eventsQuery.in('event_type', filters.eventTypes);
          }

          if (filters.urgencyLevels.length > 0) {
            eventsQuery = eventsQuery.in(
              'urgency_level',
              filters.urgencyLevels
            );
          }

          // Apply customer filters
          if (filters.customerFilters.hasContactInfo) {
            eventsQuery = eventsQuery.or(
              'customer_name.not.is.null,customer_phone.not.is.null,customer_email.not.is.null'
            );
          }

          if (filters.customerFilters.hasEmail) {
            eventsQuery = eventsQuery.not('customer_email', 'is', null);
          }

          if (filters.customerFilters.hasPhone) {
            eventsQuery = eventsQuery.not('customer_phone', 'is', null);
          }

          // Apply location filters
          if (filters.locationFilters.hasAddress) {
            eventsQuery = eventsQuery.not('location', 'is', null);
          }

          if (filters.locationFilters.locationType.length > 0) {
            eventsQuery = eventsQuery.in(
              'location_type',
              filters.locationFilters.locationType
            );
          }

          // Apply date range
          if (filters.dateRange.from) {
            eventsQuery = eventsQuery.gte('created_at', filters.dateRange.from);
          }
          if (filters.dateRange.to) {
            eventsQuery = eventsQuery.lte('created_at', filters.dateRange.to);
          }

          const { data: eventsData, error: eventsError } = await eventsQuery;

          if (eventsError) {
            console.error('Events search error:', eventsError);
          } else if (eventsData) {
            const eventResults: SearchResult[] = eventsData.map((event) => ({
              id: event.id,
              type: 'event' as const,
              title: event.title,
              description:
                event.description ||
                `${event.event_type} event${event.customer_name ? ` with ${event.customer_name}` : ''}`,
              metadata: {
                date:
                  event.proposed_datetime ||
                  event.confirmed_datetime ||
                  event.created_at,
                urgency: event.urgency_level || undefined,
                status: event.status || undefined,
                customerName: event.customer_name || undefined,
                phoneNumber: event.customer_phone || undefined,
                location: event.location || undefined,
                eventId: event.id,
                callId: event.call_id || undefined,
              },
              highlights: generateHighlights(filters.query, event, 'event'),
              relevanceScore: calculateRelevanceScore(
                filters.query,
                event,
                'event'
              ),
            }));

            results.push(...eventResults);
          }
        }

        // Sort results by relevance score and date
        const sortedResults = results
          .sort((a, b) => {
            // Primary sort by relevance score
            const scoreDiff = b.relevanceScore - a.relevanceScore;
            if (Math.abs(scoreDiff) > 0.1) return scoreDiff;

            // Secondary sort by date (most recent first)
            return (
              new Date(b.metadata.date).getTime() -
              new Date(a.metadata.date).getTime()
            );
          })
          .slice(0, maxResults);

        setSearchResults(sortedResults);
        setTotalResults(sortedResults.length);
        setSearchTime(Date.now() - startTime);

        return sortedResults;
      } catch (error) {
        console.error('Search error:', error);
        setError(error instanceof Error ? error.message : 'Search failed');
        setSearchResults([]);
        setTotalResults(0);
        return [];
      } finally {
        setIsSearching(false);
      }
    },
    [userId, maxResults, enableFullTextSearch, buildSearchQuery, supabase]
  );

  // Generate search result highlights
  const generateHighlights = useCallback(
    (query: string, data: any, type: 'call' | 'event') => {
      if (!query.trim()) return [];

      const highlights: { field: string; snippet: string }[] = [];
      const searchTerms = query.toLowerCase().split(/\s+/);

      const searchFields =
        type === 'call'
          ? ['caller_name', 'main_topic', 'call_summary', 'transcription_text']
          : ['title', 'description', 'customer_name', 'location', 'notes'];

      searchFields.forEach((field) => {
        const value = data[field];
        if (typeof value === 'string' && value.trim()) {
          const lowerValue = value.toLowerCase();

          // Check if any search term appears in this field
          const matchingTerms = searchTerms.filter((term) =>
            lowerValue.includes(term)
          );

          if (matchingTerms.length > 0) {
            // Create highlighted snippet
            let snippet = value;
            const maxSnippetLength = 150;

            // Find the best position to start the snippet (around the first match)
            const firstMatchIndex = lowerValue.indexOf(matchingTerms[0]);
            let startIndex = Math.max(0, firstMatchIndex - 50);

            // Adjust to word boundaries
            while (startIndex > 0 && snippet[startIndex] !== ' ') {
              startIndex--;
            }

            snippet = snippet.substring(
              startIndex,
              startIndex + maxSnippetLength
            );
            if (startIndex > 0) snippet = '...' + snippet;
            if (startIndex + maxSnippetLength < value.length)
              snippet = snippet + '...';

            highlights.push({
              field: field,
              snippet: snippet,
            });
          }
        }
      });

      return highlights.slice(0, 3); // Limit highlights per result
    },
    []
  );

  // Calculate relevance score for search results
  const calculateRelevanceScore = useCallback(
    (query: string, data: any, type: 'call' | 'event'): number => {
      if (!query.trim()) return 0.5; // Default score for empty query

      let score = 0;
      const searchTerms = query.toLowerCase().split(/\s+/);

      // Define scoring weights for different fields
      const fieldWeights =
        type === 'call'
          ? {
              caller_name: 0.8,
              main_topic: 1.0,
              call_summary: 0.7,
              transcription_text: 0.3,
            }
          : {
              title: 1.0,
              description: 0.7,
              customer_name: 0.8,
              location: 0.6,
              notes: 0.4,
            };

      // Calculate score based on matches in different fields
      Object.entries(fieldWeights).forEach(([field, weight]) => {
        const value = data[field];
        if (typeof value === 'string' && value.trim()) {
          const lowerValue = value.toLowerCase();

          searchTerms.forEach((term) => {
            if (lowerValue.includes(term)) {
              // Exact matches get higher scores
              const exactMatches = (
                lowerValue.match(new RegExp(`\\b${term}\\b`, 'g')) || []
              ).length;
              const partialMatches =
                (lowerValue.match(new RegExp(term, 'g')) || []).length -
                exactMatches;

              score +=
                exactMatches * weight * 1.0 + partialMatches * weight * 0.5;
            }
          });
        }
      });

      // Normalize score to 0-1 range
      const normalizedScore = Math.min(1, score / (searchTerms.length * 2));

      // Apply bonuses for high-quality data
      let bonus = 0;

      if (type === 'call') {
        if (
          data.transcription_confidence &&
          data.transcription_confidence > 0.8
        )
          bonus += 0.1;
        if (data.call_summary && data.call_summary.length > 50) bonus += 0.05;
        if (data.urgency_level === 'emergency' || data.urgency_level === 'high')
          bonus += 0.05;
      } else if (type === 'event') {
        if (data.customer_name && data.customer_phone) bonus += 0.1;
        if (data.location && data.location.length > 10) bonus += 0.05;
        if (data.status === 'confirmed') bonus += 0.05;
      }

      return Math.min(1, normalizedScore + bonus);
    },
    []
  );

  // Get search suggestions based on partial query
  const getSuggestions = useCallback(
    async (query: string): Promise<SearchSuggestion[]> => {
      if (query.length < 2) return [];

      try {
        const suggestions: SearchSuggestion[] = [];

        // Get suggestions from recent calls
        const { data: recentCalls } = await supabase
          .from('calls')
          .select('id, caller_name, main_topic, created_at')
          .eq('user_id', userId)
          .not('caller_name', 'is', null)
          .or(`caller_name.ilike.%${query}%,main_topic.ilike.%${query}%`)
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentCalls) {
          recentCalls.forEach((call) => {
            if (call.caller_name?.toLowerCase().includes(query.toLowerCase())) {
              suggestions.push({
                id: `call-${call.id}`,
                text: call.caller_name,
                category: 'customers',
                relevanceScore: 0.9,
                metadata: {
                  callId: call.id,
                  customerName: call.caller_name,
                  date: call.created_at,
                },
              });
            }

            if (call.main_topic?.toLowerCase().includes(query.toLowerCase())) {
              suggestions.push({
                id: `topic-${call.id}`,
                text: call.main_topic,
                category: 'calls',
                relevanceScore: 0.8,
                metadata: {
                  callId: call.id,
                  date: call.created_at,
                },
              });
            }
          });
        }

        // Get suggestions from recent events
        const { data: recentEvents } = await supabase
          .from('events')
          .select('id, title, customer_name, location, created_at')
          .eq('user_id', userId)
          .or(
            `title.ilike.%${query}%,customer_name.ilike.%${query}%,location.ilike.%${query}%`
          )
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentEvents) {
          recentEvents.forEach((event) => {
            if (
              event.customer_name?.toLowerCase().includes(query.toLowerCase())
            ) {
              suggestions.push({
                id: `event-customer-${event.id}`,
                text: event.customer_name,
                category: 'customers',
                relevanceScore: 0.85,
                metadata: {
                  eventId: event.id,
                  customerName: event.customer_name,
                  date: event.created_at,
                },
              });
            }

            if (event.location?.toLowerCase().includes(query.toLowerCase())) {
              suggestions.push({
                id: `location-${event.id}`,
                text: event.location,
                category: 'locations',
                relevanceScore: 0.75,
                metadata: {
                  eventId: event.id,
                  date: event.created_at,
                },
              });
            }
          });
        }

        // Remove duplicates and sort by relevance
        const uniqueSuggestions = suggestions
          .filter(
            (suggestion, index, self) =>
              index ===
              self.findIndex(
                (s) =>
                  s.text === suggestion.text &&
                  s.category === suggestion.category
              )
          )
          .sort((a, b) => b.relevanceScore - a.relevanceScore)
          .slice(0, 8);

        return uniqueSuggestions;
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        return [];
      }
    },
    [userId, supabase]
  );

  // Save a search query
  const saveSearch = useCallback(
    async (
      search: Omit<SavedSearch, 'id' | 'createdAt' | 'lastUsed' | 'useCount'>
    ) => {
      try {
        const { data, error } = await supabase
          .from('saved_searches')
          .insert({
            user_id: userId,
            name: search.name,
            description: search.description,
            query: search.query,
            filters: search.filters,
            tags: search.tags,
            is_public: search.isPublic,
            use_count: 0,
          })
          .select()
          .single();

        if (error) throw error;

        // Update local state
        setSavedSearches((prev) => [
          ...prev,
          {
            id: data.id,
            name: data.name,
            description: data.description,
            query: data.query,
            filters: data.filters,
            tags: data.tags,
            isPublic: data.is_public,
            createdAt: data.created_at,
            useCount: data.use_count,
          },
        ]);

        return data.id;
      } catch (error) {
        console.error('Error saving search:', error);
        throw error;
      }
    },
    [userId, supabase]
  );

  // Load saved searches
  const loadSavedSearches = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const searches: SavedSearch[] = data.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        query: item.query,
        filters: item.filters,
        tags: item.tags,
        isPublic: item.is_public,
        createdAt: item.created_at,
        lastUsed: item.last_used,
        useCount: item.use_count,
      }));

      setSavedSearches(searches);
      return searches;
    } catch (error) {
      console.error('Error loading saved searches:', error);
      return [];
    }
  }, [userId, supabase]);

  // Export search results
  const exportResults = useCallback(
    async (results: SearchResult[], format: 'csv' | 'excel' | 'json') => {
      try {
        const dataToExport = results.map((result) => ({
          type: result.type,
          title: result.title,
          description: result.description,
          date: result.metadata.date,
          urgency: result.metadata.urgency || '',
          status: result.metadata.status || '',
          customerName: result.metadata.customerName || '',
          phoneNumber: result.metadata.phoneNumber || '',
          location: result.metadata.location || '',
          confidence: result.metadata.confidence || '',
          relevanceScore: result.relevanceScore,
        }));

        let exportData: string | Blob;
        let filename: string;
        let mimeType: string;

        switch (format) {
          case 'csv':
            const headers = Object.keys(dataToExport[0] || {});
            const csvContent = [
              headers.join(','),
              ...dataToExport.map((row) =>
                headers
                  .map(
                    (header) =>
                      `"${String(row[header as keyof typeof row] || '').replace(/"/g, '""')}"`
                  )
                  .join(',')
              ),
            ].join('\n');

            exportData = csvContent;
            filename = `search-results-${new Date().toISOString().split('T')[0]}.csv`;
            mimeType = 'text/csv';
            break;

          case 'json':
            exportData = JSON.stringify(dataToExport, null, 2);
            filename = `search-results-${new Date().toISOString().split('T')[0]}.json`;
            mimeType = 'application/json';
            break;

          case 'excel':
            // For Excel, we'll use CSV format with .xlsx extension
            // In a real implementation, you'd use a library like xlsx
            const excelHeaders = Object.keys(dataToExport[0] || {});
            const excelContent = [
              excelHeaders.join('\t'),
              ...dataToExport.map((row) =>
                excelHeaders
                  .map((header) =>
                    String(row[header as keyof typeof row] || '')
                  )
                  .join('\t')
              ),
            ].join('\n');

            exportData = excelContent;
            filename = `search-results-${new Date().toISOString().split('T')[0]}.xlsx`;
            mimeType =
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            break;

          default:
            throw new Error(`Unsupported export format: ${format}`);
        }

        // Create and trigger download
        const blob = new Blob([exportData], { type: mimeType });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Export error:', error);
        throw error;
      }
    },
    []
  );

  // Debounced search function
  const debouncedSearch = useCallback(
    (filters: SearchFilters) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        performSearch(filters);
      }, debounceMs);
    },
    [performSearch, debounceMs]
  );

  return {
    // State
    isSearching,
    searchResults,
    totalResults,
    searchTime,
    error,
    savedSearches,

    // Actions
    performSearch,
    debouncedSearch,
    getSuggestions,
    saveSearch,
    loadSavedSearches,
    exportResults,

    // Utils
    clearResults: () => {
      setSearchResults([]);
      setTotalResults(0);
      setError(null);
    },
  };
};
