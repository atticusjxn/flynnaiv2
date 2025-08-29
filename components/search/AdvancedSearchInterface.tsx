'use client';

import React, { useState, useCallback, useMemo, memo, useRef, useEffect } from 'react';
import { 
  Input, 
  Button, 
  Card, 
  CardBody, 
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  Checkbox,
  Textarea,
  Divider,
  Badge,
  Tooltip,
  CircularProgress,
  Skeleton
} from '@nextui-org/react';
import { debounce } from 'lodash';
import { Database } from '@/types/database.types';

// Types from database
type CallStatus = Database['public']['Tables']['calls']['Row']['call_status'];
type EventStatus = Database['public']['Tables']['events']['Row']['status'];
type UrgencyLevel = Database['public']['Tables']['calls']['Row']['urgency_level'];
type EventType = Database['public']['Tables']['events']['Row']['event_type'];

// Enhanced search interfaces
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

export interface FilterCondition {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'between' | 'in' | 'not_in';
  value: any;
  label: string;
}

export interface FilterGroup {
  id: string;
  logic: 'AND' | 'OR';
  conditions: FilterCondition[];
  groups?: FilterGroup[];
}

export interface SavedSearch {
  id: string;
  name: string;
  description?: string;
  query: string;
  filters: FilterGroup;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  lastUsed?: string;
  useCount: number;
}

export interface AdvancedSearchFilters {
  query: string;
  categories: ('calls' | 'events' | 'communications')[];
  callStatuses: CallStatus[];
  eventStatuses: EventStatus[];
  urgencyLevels: UrgencyLevel[];
  eventTypes: EventType[];
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
    locationType: ('address' | 'virtual' | 'phone' | 'tbd')[];
  };
}

interface AdvancedSearchInterfaceProps {
  onSearch: (filters: AdvancedSearchFilters) => Promise<any[]>;
  onSaveSearch: (search: Omit<SavedSearch, 'id' | 'createdAt' | 'lastUsed' | 'useCount'>) => Promise<void>;
  onLoadSavedSearch: (searchId: string) => Promise<SavedSearch>;
  onExport: (data: any[], format: 'csv' | 'excel' | 'json') => Promise<void>;
  savedSearches?: SavedSearch[];
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

const AdvancedSearchInterface = memo(function AdvancedSearchInterface({
  onSearch,
  onSaveSearch,
  onLoadSavedSearch,
  onExport,
  savedSearches = [],
  isLoading = false,
  placeholder = "Search across calls, events, customers, and transcripts...",
  className = ""
}: AdvancedSearchInterfaceProps) {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [localQuery, setLocalQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  // Advanced filtering state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState<AdvancedSearchFilters>({
    query: '',
    categories: ['calls', 'events', 'communications'],
    callStatuses: [],
    eventStatuses: [],
    urgencyLevels: [],
    eventTypes: [],
    dateRange: { from: '', to: '' },
    industries: [],
    customerFilters: {
      hasContactInfo: false,
      hasEmail: false,
      hasPhone: false,
    },
    aiFilters: {
      minConfidence: 0,
      hasTranscription: false,
      hasSummary: false,
    },
    locationFilters: {
      hasAddress: false,
      locationType: [],
    },
  });

  // Saved searches modal
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveSearchForm, setSaveSearchForm] = useState({
    name: '',
    description: '',
    tags: [] as string[],
    isPublic: false,
  });

  // Export modal
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportConfig, setExportConfig] = useState({
    format: 'csv' as 'csv' | 'excel' | 'json',
    includeColumns: [] as string[],
    dateFormat: 'iso',
    includeMetadata: false,
  });

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Mock data for suggestions (in real app, this would come from API)
  const mockSuggestions: SearchSuggestion[] = useMemo(() => [
    {
      id: '1',
      text: 'Emergency plumbing calls',
      category: 'calls',
      relevanceScore: 0.95,
      metadata: { customerName: 'Various' }
    },
    {
      id: '2', 
      text: 'John Smith appointments',
      category: 'customers',
      relevanceScore: 0.88,
      metadata: { customerName: 'John Smith', phoneNumber: '+1234567890' }
    },
    {
      id: '3',
      text: 'Real estate showings this week',
      category: 'events',
      relevanceScore: 0.82,
    },
    {
      id: '4',
      text: 'High urgency calls with transcripts',
      category: 'transcripts',
      relevanceScore: 0.79,
    },
    {
      id: '5',
      text: 'Downtown service appointments',
      category: 'locations',
      relevanceScore: 0.75,
    },
  ], []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string, currentFilters: AdvancedSearchFilters) => {
      if (!query.trim() && !hasActiveFilters(currentFilters)) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const results = await onSearch({ ...currentFilters, query });
        setSearchResults(results);
        
        // Add to search history
        if (query.trim() && !searchHistory.includes(query)) {
          setSearchHistory(prev => [query, ...prev.slice(0, 9)]);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400),
    [onSearch, searchHistory]
  );

  // Debounced suggestions
  const debouncedSuggestions = useCallback(
    debounce((query: string) => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      // Filter mock suggestions based on query
      const filtered = mockSuggestions
        .filter(s => s.text.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 8);

      setSuggestions(filtered);
    }, 200),
    [mockSuggestions]
  );

  // Handle search input changes
  const handleSearchChange = useCallback((value: string) => {
    setLocalQuery(value);
    setSearchQuery(value);
    debouncedSuggestions(value);
    setShowSuggestions(value.length >= 2);
    
    // Update filters and trigger search
    const updatedFilters = { ...filters, query: value };
    setFilters(updatedFilters);
    debouncedSearch(value, updatedFilters);
  }, [filters, debouncedSuggestions, debouncedSearch]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: SearchSuggestion) => {
    setLocalQuery(suggestion.text);
    setSearchQuery(suggestion.text);
    setShowSuggestions(false);
    
    const updatedFilters = { ...filters, query: suggestion.text };
    setFilters(updatedFilters);
    debouncedSearch(suggestion.text, updatedFilters);
  }, [filters, debouncedSearch]);

  // Filter management
  const updateFilters = useCallback((newFilters: Partial<AdvancedSearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    debouncedSearch(searchQuery, updatedFilters);
  }, [filters, searchQuery, debouncedSearch]);

  const hasActiveFilters = useCallback((currentFilters: AdvancedSearchFilters) => {
    return currentFilters.callStatuses.length > 0 ||
           currentFilters.eventStatuses.length > 0 ||
           currentFilters.urgencyLevels.length > 0 ||
           currentFilters.eventTypes.length > 0 ||
           currentFilters.dateRange.from ||
           currentFilters.dateRange.to ||
           currentFilters.industries.length > 0 ||
           currentFilters.categories.length < 3 ||
           currentFilters.customerFilters.hasContactInfo ||
           currentFilters.customerFilters.hasEmail ||
           currentFilters.customerFilters.hasPhone ||
           currentFilters.aiFilters.minConfidence > 0 ||
           currentFilters.aiFilters.hasTranscription ||
           currentFilters.aiFilters.hasSummary ||
           currentFilters.locationFilters.hasAddress ||
           currentFilters.locationFilters.locationType.length > 0;
  }, []);

  const clearAllFilters = useCallback(() => {
    const clearedFilters: AdvancedSearchFilters = {
      query: '',
      categories: ['calls', 'events', 'communications'],
      callStatuses: [],
      eventStatuses: [],
      urgencyLevels: [],
      eventTypes: [],
      dateRange: { from: '', to: '' },
      industries: [],
      customerFilters: {
        hasContactInfo: false,
        hasEmail: false,
        hasPhone: false,
      },
      aiFilters: {
        minConfidence: 0,
        hasTranscription: false,
        hasSummary: false,
      },
      locationFilters: {
        hasAddress: false,
        locationType: [],
      },
    };
    
    setFilters(clearedFilters);
    setLocalQuery('');
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  // Save search functionality
  const handleSaveSearch = useCallback(async () => {
    if (!saveSearchForm.name.trim()) return;

    try {
      await onSaveSearch({
        name: saveSearchForm.name,
        description: saveSearchForm.description,
        query: searchQuery,
        filters: {
          id: 'root',
          logic: 'AND',
          conditions: [], // Convert current filters to conditions
          groups: [],
        },
        tags: saveSearchForm.tags,
        isPublic: saveSearchForm.isPublic,
      });

      setShowSaveModal(false);
      setSaveSearchForm({
        name: '',
        description: '',
        tags: [],
        isPublic: false,
      });
    } catch (error) {
      console.error('Error saving search:', error);
    }
  }, [saveSearchForm, searchQuery, onSaveSearch]);

  // Export functionality
  const handleExport = useCallback(async () => {
    if (searchResults.length === 0) return;

    try {
      await onExport(searchResults, exportConfig.format);
      setShowExportModal(false);
    } catch (error) {
      console.error('Export error:', error);
    }
  }, [searchResults, exportConfig.format, onExport]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !searchInputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'calls':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
          </svg>
        );
      case 'events':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5" />
          </svg>
        );
      case 'customers':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        );
      case 'locations':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
        );
      case 'transcripts':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        );
    }
  };

  return (
    <div className={`w-full max-w-7xl mx-auto space-y-6 ${className}`}>
      {/* Main Search Interface */}
      <Card className="bg-gradient-to-r from-background/95 to-background/80 backdrop-blur-xl border border-border/20 shadow-2xl">
        <CardBody className="p-6 space-y-6">
          {/* Premium Search Bar */}
          <div className="relative">
            <div className="relative group">
              <Input
                ref={searchInputRef}
                placeholder={placeholder}
                value={localQuery}
                onValueChange={handleSearchChange}
                onFocus={() => setShowSuggestions(localQuery.length >= 2)}
                startContent={
                  <div className="flex items-center gap-3">
                    {isSearching ? (
                      <CircularProgress size="sm" strokeWidth={3} className="w-4 h-4" />
                    ) : (
                      <svg className="w-5 h-5 text-primary/70 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                      </svg>
                    )}
                  </div>
                }
                endContent={
                  <div className="flex items-center gap-2">
                    {localQuery && (
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="min-w-unit-6 w-6 h-6 hover:scale-110 transition-transform"
                        onPress={() => {
                          setLocalQuery('');
                          setSearchQuery('');
                          clearAllFilters();
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </Button>
                    )}
                    <Divider orientation="vertical" className="h-6" />
                    <Tooltip content="Advanced Filters">
                      <Button
                        isIconOnly
                        size="sm"
                        variant={showAdvancedFilters ? "solid" : "light"}
                        color={showAdvancedFilters ? "primary" : "default"}
                        className="min-w-unit-6 w-6 h-6 hover:scale-110 transition-transform"
                        onPress={() => setShowAdvancedFilters(!showAdvancedFilters)}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m0 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-1.5-1.5m1.5 1.5a1.5 1.5 0 00-1.5-1.5m-1.5-1.5H21m-3.75 0H9.75" />
                        </svg>
                      </Button>
                    </Tooltip>
                  </div>
                }
                isClearable={false}
                size="lg"
                classNames={{
                  base: "max-w-full",
                  input: "text-base font-medium placeholder:text-muted-foreground/60",
                  inputWrapper: [
                    "bg-background/60 backdrop-blur-sm",
                    "border border-border/30",
                    "hover:border-primary/40 hover:bg-background/80",
                    "focus-within:border-primary/60 focus-within:bg-background/90",
                    "shadow-lg hover:shadow-xl",
                    "transition-all duration-300 ease-out",
                    "group-hover:shadow-primary/5",
                    "h-14 px-4"
                  ],
                }}
              />

              {/* Search Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 mt-2 z-50"
                >
                  <Card className="border border-border/20 shadow-2xl backdrop-blur-xl bg-background/95">
                    <CardBody className="p-2 max-h-80 overflow-y-auto">
                      <div className="space-y-1">
                        {suggestions.map((suggestion, index) => (
                          <div
                            key={suggestion.id}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 cursor-pointer transition-all duration-200 group"
                            onClick={() => handleSuggestionSelect(suggestion)}
                          >
                            <div className="flex-shrink-0 p-1.5 rounded-md bg-gradient-to-br from-primary/10 to-primary/5 text-primary group-hover:from-primary/15 group-hover:to-primary/10 transition-colors">
                              {getCategoryIcon(suggestion.category)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                  {suggestion.text}
                                </p>
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  color="primary"
                                  className="capitalize text-xs"
                                >
                                  {suggestion.category}
                                </Chip>
                              </div>
                              
                              {suggestion.metadata && (
                                <p className="text-sm text-muted-foreground mt-1 truncate">
                                  {suggestion.metadata.customerName && `Customer: ${suggestion.metadata.customerName}`}
                                  {suggestion.metadata.phoneNumber && ` • ${suggestion.metadata.phoneNumber}`}
                                  {suggestion.metadata.date && ` • ${suggestion.metadata.date}`}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex-shrink-0 text-right">
                              <Badge
                                size="sm"
                                color={suggestion.relevanceScore > 0.9 ? "success" : suggestion.relevanceScore > 0.7 ? "warning" : "default"}
                                variant="dot"
                              >
                                {Math.round(suggestion.relevanceScore * 100)}%
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {searchHistory.length > 0 && (
                        <div className="border-t border-border/10 mt-3 pt-3">
                          <p className="text-xs font-medium text-muted-foreground mb-2 px-3">Recent Searches</p>
                          <div className="space-y-1">
                            {searchHistory.slice(0, 3).map((query, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 p-2 px-3 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                                onClick={() => handleSearchChange(query)}
                              >
                                <svg className="w-3 h-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm text-muted-foreground">{query}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </div>
              )}
            </div>
          </div>

          {/* Quick Action Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Tooltip content="Saved Searches">
                  <Button
                    size="sm"
                    variant="flat"
                    startContent={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                      </svg>
                    }
                    onPress={() => setShowSavedSearches(true)}
                    className="hover:scale-105 transition-transform"
                  >
                    Saved ({savedSearches.length})
                  </Button>
                </Tooltip>

                {(searchQuery || hasActiveFilters(filters)) && (
                  <Tooltip content="Save Current Search">
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      startContent={
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      }
                      onPress={() => setShowSaveModal(true)}
                      className="hover:scale-105 transition-transform"
                    >
                      Save Search
                    </Button>
                  </Tooltip>
                )}
              </div>

              {searchResults.length > 0 && (
                <div className="flex items-center gap-2">
                  <Divider orientation="vertical" className="h-6" />
                  <Badge color="primary" variant="flat" size="lg">
                    {searchResults.length} results
                  </Badge>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {hasActiveFilters(filters) && (
                <Button
                  size="sm"
                  variant="flat"
                  color="warning"
                  startContent={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  }
                  onPress={clearAllFilters}
                  className="hover:scale-105 transition-transform"
                >
                  Clear All
                </Button>
              )}

              {searchResults.length > 0 && (
                <Tooltip content="Export Results">
                  <Button
                    size="sm"
                    variant="flat"
                    color="success"
                    startContent={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                    }
                    onPress={() => setShowExportModal(true)}
                    className="hover:scale-105 transition-transform"
                  >
                    Export
                  </Button>
                </Tooltip>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <Card className="bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-xl border border-border/20 shadow-xl">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 text-primary">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m0 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-1.5-1.5m1.5 1.5a1.5 1.5 0 00-1.5-1.5m-1.5-1.5H21m-3.75 0H9.75" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground">Advanced Filters</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Categories */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Search Categories</label>
                <div className="space-y-2">
                  {(['calls', 'events', 'communications'] as const).map((category) => (
                    <Checkbox
                      key={category}
                      isSelected={filters.categories.includes(category)}
                      onValueChange={(checked) => {
                        const newCategories = checked
                          ? [...filters.categories, category]
                          : filters.categories.filter(c => c !== category);
                        updateFilters({ categories: newCategories });
                      }}
                      className="capitalize"
                    >
                      {category}
                    </Checkbox>
                  ))}
                </div>
              </div>

              {/* Status Filters */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Call Status</label>
                <Select
                  selectionMode="multiple"
                  placeholder="Select statuses..."
                  selectedKeys={new Set(filters.callStatuses.filter(Boolean))}
                  onSelectionChange={(keys) => {
                    updateFilters({ callStatuses: Array.from(keys) as CallStatus[] });
                  }}
                  size="sm"
                >
                  <SelectItem key="completed" value="completed">Completed</SelectItem>
                  <SelectItem key="in_progress" value="in_progress">In Progress</SelectItem>
                  <SelectItem key="failed" value="failed">Failed</SelectItem>
                  <SelectItem key="busy" value="busy">Busy</SelectItem>
                  <SelectItem key="no_answer" value="no_answer">No Answer</SelectItem>
                  <SelectItem key="cancelled" value="cancelled">Cancelled</SelectItem>
                </Select>
              </div>

              {/* Urgency Levels */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Urgency Level</label>
                <Select
                  selectionMode="multiple"
                  placeholder="Select urgency..."
                  selectedKeys={new Set(filters.urgencyLevels.filter(Boolean))}
                  onSelectionChange={(keys) => {
                    updateFilters({ urgencyLevels: Array.from(keys) as UrgencyLevel[] });
                  }}
                  size="sm"
                >
                  <SelectItem key="emergency" value="emergency">Emergency</SelectItem>
                  <SelectItem key="high" value="high">High</SelectItem>
                  <SelectItem key="medium" value="medium">Medium</SelectItem>
                  <SelectItem key="low" value="low">Low</SelectItem>
                </Select>
              </div>

              {/* Date Range */}
              <div className="space-y-3 lg:col-span-2">
                <label className="text-sm font-medium text-foreground">Date Range</label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="date"
                    label="From"
                    labelPlacement="inside"
                    value={filters.dateRange.from}
                    onValueChange={(value) => 
                      updateFilters({ 
                        dateRange: { ...filters.dateRange, from: value } 
                      })
                    }
                    size="sm"
                  />
                  <Input
                    type="date"
                    label="To"
                    labelPlacement="inside"
                    value={filters.dateRange.to}
                    onValueChange={(value) => 
                      updateFilters({ 
                        dateRange: { ...filters.dateRange, to: value } 
                      })
                    }
                    size="sm"
                  />
                </div>
              </div>

              {/* AI Confidence */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  AI Confidence: {filters.aiFilters.minConfidence}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.aiFilters.minConfidence}
                  onChange={(e) => 
                    updateFilters({
                      aiFilters: {
                        ...filters.aiFilters,
                        minConfidence: parseInt(e.target.value)
                      }
                    })
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>

            {/* Additional Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-border/10">
              {/* Customer Filters */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Customer Data</label>
                <div className="space-y-2">
                  <Checkbox
                    isSelected={filters.customerFilters.hasContactInfo}
                    onValueChange={(checked) =>
                      updateFilters({
                        customerFilters: {
                          ...filters.customerFilters,
                          hasContactInfo: checked
                        }
                      })
                    }
                  >
                    Has Contact Info
                  </Checkbox>
                  <Checkbox
                    isSelected={filters.customerFilters.hasEmail}
                    onValueChange={(checked) =>
                      updateFilters({
                        customerFilters: {
                          ...filters.customerFilters,
                          hasEmail: checked
                        }
                      })
                    }
                  >
                    Has Email
                  </Checkbox>
                  <Checkbox
                    isSelected={filters.customerFilters.hasPhone}
                    onValueChange={(checked) =>
                      updateFilters({
                        customerFilters: {
                          ...filters.customerFilters,
                          hasPhone: checked
                        }
                      })
                    }
                  >
                    Has Phone
                  </Checkbox>
                </div>
              </div>

              {/* AI Processing Filters */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">AI Processing</label>
                <div className="space-y-2">
                  <Checkbox
                    isSelected={filters.aiFilters.hasTranscription}
                    onValueChange={(checked) =>
                      updateFilters({
                        aiFilters: {
                          ...filters.aiFilters,
                          hasTranscription: checked
                        }
                      })
                    }
                  >
                    Has Transcription
                  </Checkbox>
                  <Checkbox
                    isSelected={filters.aiFilters.hasSummary}
                    onValueChange={(checked) =>
                      updateFilters({
                        aiFilters: {
                          ...filters.aiFilters,
                          hasSummary: checked
                        }
                      })
                    }
                  >
                    Has Summary
                  </Checkbox>
                </div>
              </div>

              {/* Location Filters */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Location</label>
                <div className="space-y-2">
                  <Checkbox
                    isSelected={filters.locationFilters.hasAddress}
                    onValueChange={(checked) =>
                      updateFilters({
                        locationFilters: {
                          ...filters.locationFilters,
                          hasAddress: checked
                        }
                      })
                    }
                  >
                    Has Address
                  </Checkbox>
                  <Select
                    selectionMode="multiple"
                    placeholder="Location Type..."
                    selectedKeys={new Set(filters.locationFilters.locationType)}
                    onSelectionChange={(keys) => {
                      updateFilters({ 
                        locationFilters: {
                          ...filters.locationFilters,
                          locationType: Array.from(keys) as ('address' | 'virtual' | 'phone' | 'tbd')[]
                        }
                      });
                    }}
                    size="sm"
                  >
                    <SelectItem key="address" value="address">Address</SelectItem>
                    <SelectItem key="virtual" value="virtual">Virtual</SelectItem>
                    <SelectItem key="phone" value="phone">Phone</SelectItem>
                    <SelectItem key="tbd" value="tbd">TBD</SelectItem>
                  </Select>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Search Results Status */}
      {isSearching && (
        <Card className="bg-background/50 backdrop-blur-sm border border-border/20">
          <CardBody className="p-6">
            <div className="flex items-center justify-center gap-3">
              <CircularProgress size="md" color="primary" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-3 w-24 rounded" />
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Saved Searches Modal */}
      <Modal isOpen={showSavedSearches} onClose={() => setShowSavedSearches(false)} size="2xl">
        <ModalContent>
          <ModalHeader>Saved Searches</ModalHeader>
          <ModalBody>
            {savedSearches.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 mx-auto text-muted-foreground mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                </svg>
                <h3 className="text-lg font-medium mb-2">No Saved Searches</h3>
                <p className="text-muted-foreground">Save your frequent searches for quick access</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {savedSearches.map((search) => (
                  <Card key={search.id} className="border border-border/20 hover:border-primary/30 transition-colors cursor-pointer">
                    <CardBody className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground mb-1">{search.name}</h4>
                          {search.description && (
                            <p className="text-sm text-muted-foreground mb-2">{search.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded">
                            "{search.query}"
                          </p>
                          <div className="flex items-center gap-2 mt-3">
                            {search.tags.map((tag) => (
                              <Chip key={tag} size="sm" variant="flat" color="primary">{tag}</Chip>
                            ))}
                            <Badge size="sm" variant="flat">
                              Used {search.useCount} times
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="flat"
                          color="primary"
                          onPress={async () => {
                            const savedSearch = await onLoadSavedSearch(search.id);
                            setLocalQuery(savedSearch.query);
                            setSearchQuery(savedSearch.query);
                            setShowSavedSearches(false);
                          }}
                        >
                          Load
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setShowSavedSearches(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Save Search Modal */}
      <Modal isOpen={showSaveModal} onClose={() => setShowSaveModal(false)}>
        <ModalContent>
          <ModalHeader>Save Search</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Search Name"
                placeholder="e.g., Emergency Plumbing Calls"
                value={saveSearchForm.name}
                onValueChange={(value) => setSaveSearchForm(prev => ({ ...prev, name: value }))}
                isRequired
              />
              
              <Textarea
                label="Description (Optional)"
                placeholder="Brief description of this search..."
                value={saveSearchForm.description}
                onValueChange={(value) => setSaveSearchForm(prev => ({ ...prev, description: value }))}
              />
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Query</label>
                <div className="p-3 bg-muted/30 rounded-lg font-mono text-sm">
                  "{searchQuery || 'No search query'}"
                </div>
              </div>
              
              <Checkbox
                isSelected={saveSearchForm.isPublic}
                onValueChange={(checked) => setSaveSearchForm(prev => ({ ...prev, isPublic: checked }))}
              >
                Make this search public (visible to team members)
              </Checkbox>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setShowSaveModal(false)}>
              Cancel
            </Button>
            <Button 
              color="primary" 
              onPress={handleSaveSearch}
              isDisabled={!saveSearchForm.name.trim()}
            >
              Save Search
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Export Modal */}
      <Modal isOpen={showExportModal} onClose={() => setShowExportModal(false)}>
        <ModalContent>
          <ModalHeader>Export Results</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Exporting {searchResults.length} results
              </div>
              
              <Select
                label="Export Format"
                selectedKeys={new Set([exportConfig.format])}
                onSelectionChange={(keys) => {
                  const format = Array.from(keys)[0] as 'csv' | 'excel' | 'json';
                  setExportConfig(prev => ({ ...prev, format }));
                }}
              >
                <SelectItem key="csv" value="csv">CSV (Comma Separated)</SelectItem>
                <SelectItem key="excel" value="excel">Excel Spreadsheet</SelectItem>
                <SelectItem key="json" value="json">JSON Data</SelectItem>
              </Select>
              
              <Checkbox
                isSelected={exportConfig.includeMetadata}
                onValueChange={(checked) => setExportConfig(prev => ({ ...prev, includeMetadata: checked }))}
              >
                Include metadata (timestamps, confidence scores, etc.)
              </Checkbox>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setShowExportModal(false)}>
              Cancel
            </Button>
            <Button 
              color="success" 
              onPress={handleExport}
              startContent={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              }
            >
              Export Data
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
});

export default AdvancedSearchInterface;