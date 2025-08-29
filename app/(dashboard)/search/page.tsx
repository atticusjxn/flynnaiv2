'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@nextui-org/react';
import AdvancedSearchInterface from '@/components/search/AdvancedSearchInterface';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';

// Mock data for demonstration
const mockSearchData = [
  {
    id: '1',
    type: 'call' as const,
    title: 'Emergency Plumbing Call - Kitchen Sink Leak',
    description: 'Customer reported a major leak under kitchen sink. Water is flooding the floor and needs immediate attention.',
    metadata: {
      date: '2024-01-15T10:30:00Z',
      urgency: 'emergency',
      status: 'completed',
      customerName: 'Sarah Johnson',
      phoneNumber: '+1 (555) 123-4567',
      confidence: 95,
      callId: 'call-001',
    },
    highlights: [
      { field: 'description', snippet: 'Customer reported a major leak under kitchen sink...' }
    ],
    relevanceScore: 0.95
  },
  {
    id: '2',
    type: 'event' as const,
    title: 'Bathroom Renovation Consultation',
    description: 'Initial consultation for full bathroom renovation project including tile work, plumbing updates, and fixture installation.',
    metadata: {
      date: '2024-01-16T14:00:00Z',
      urgency: 'medium',
      status: 'confirmed',
      customerName: 'Mike Thompson',
      phoneNumber: '+1 (555) 234-5678',
      location: '123 Oak Street, Downtown',
      eventId: 'event-001',
    },
    highlights: [],
    relevanceScore: 0.88
  },
  {
    id: '3',
    type: 'call' as const,
    title: 'Property Showing Request - Luxury Condo',
    description: 'Client interested in viewing the 2-bedroom luxury condo downtown. Pre-approved for up to $850K.',
    metadata: {
      date: '2024-01-14T16:45:00Z',
      urgency: 'high',
      status: 'completed',
      customerName: 'Amanda Rodriguez',
      phoneNumber: '+1 (555) 345-6789',
      confidence: 92,
      callId: 'call-002',
    },
    highlights: [],
    relevanceScore: 0.82
  },
];

const mockSavedSearches = [
  {
    id: '1',
    name: 'Emergency Plumbing Calls',
    description: 'High-urgency plumbing calls requiring immediate attention',
    query: 'emergency plumbing leak flood',
    filters: {},
    tags: ['emergency', 'plumbing'],
    isPublic: false,
    createdAt: '2024-01-10T09:00:00Z',
    useCount: 15,
  },
  {
    id: '2',
    name: 'High-Value Real Estate Prospects',
    description: 'Pre-approved clients looking at properties over $500K',
    query: 'pre-approved luxury property',
    filters: {},
    tags: ['real-estate', 'high-value'],
    isPublic: true,
    createdAt: '2024-01-08T14:30:00Z',
    lastUsed: '2024-01-15T11:20:00Z',
    useCount: 8,
  },
];

export default function SearchPage() {
  const {
    isSearching,
    searchResults,
    totalResults,
    searchTime,
    error,
    savedSearches,
    performSearch,
    saveSearch,
    exportResults,
    clearResults,
  } = useAdvancedSearch({
    userId: 'demo-user',
    enableFullTextSearch: true,
  });

  const [localResults, setLocalResults] = useState(mockSearchData);
  const [localSavedSearches, setLocalSavedSearches] = useState(mockSavedSearches);

  // Mock search function that filters our demo data
  const handleSearch = async (filters: any) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let results = [...mockSearchData];
    
    // Filter by query
    if (filters.query) {
      results = results.filter(item => 
        item.title.toLowerCase().includes(filters.query.toLowerCase()) ||
        item.description.toLowerCase().includes(filters.query.toLowerCase()) ||
        item.metadata.customerName?.toLowerCase().includes(filters.query.toLowerCase())
      );
    }
    
    // Filter by categories
    if (filters.categories.length < 3) {
      results = results.filter(item => filters.categories.includes(item.type));
    }
    
    // Filter by urgency
    if (filters.urgencyLevels.length > 0) {
      results = results.filter(item => 
        filters.urgencyLevels.includes(item.metadata.urgency)
      );
    }
    
    setLocalResults(results);
    return results;
  };

  // Mock save search function
  const handleSaveSearch = async (search: any) => {
    const newSearch = {
      ...search,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      useCount: 0,
    };
    
    setLocalSavedSearches(prev => [...prev, newSearch]);
  };

  // Mock load saved search function
  const handleLoadSavedSearch = async (searchId: string) => {
    const search = localSavedSearches.find(s => s.id === searchId);
    if (search) {
      return search;
    }
    throw new Error('Search not found');
  };

  // Mock export function
  const handleExport = async (data: any[], format: string) => {
    // Simulate export delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`Exporting ${data.length} results as ${format}`);
    alert(`Exported ${data.length} results as ${format.toUpperCase()} file`);
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Advanced Search</h1>
            <p className="text-muted-foreground text-lg">
              Search across calls, events, and communications with powerful filters
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Search Interface */}
      <AdvancedSearchInterface
        onSearch={handleSearch}
        onSaveSearch={handleSaveSearch}
        onLoadSavedSearch={handleLoadSavedSearch}
        onExport={handleExport}
        savedSearches={localSavedSearches}
        placeholder="Search calls, events, customers, transcripts, and more..."
        className="mb-8"
      />

      {/* Search Results */}
      {localResults.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              Search Results ({localResults.length})
            </h2>
            {searchTime && (
              <p className="text-sm text-muted-foreground">
                Search completed in {Math.round(searchTime)}ms
              </p>
            )}
          </div>

          <div className="grid gap-4">
            {localResults.map((result) => (
              <Card
                key={result.id}
                className="bg-gradient-to-r from-background/95 to-background/90 backdrop-blur-sm border border-border/20 hover:border-primary/30 transition-all duration-300 hover:shadow-lg group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${
                        result.type === 'call' 
                          ? 'bg-blue-100 text-blue-600' 
                          : result.type === 'event'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-purple-100 text-purple-600'
                      }`}>
                        {result.type === 'call' ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                          </svg>
                        ) : result.type === 'event' ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                          </svg>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {result.title}
                        </h3>
                        <p className="text-muted-foreground mt-1 line-clamp-2">
                          {result.description}
                        </p>
                        
                        {/* Metadata */}
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          {result.metadata.customerName && (
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                              </svg>
                              <span>{result.metadata.customerName}</span>
                            </div>
                          )}
                          
                          {result.metadata.phoneNumber && (
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                              </svg>
                              <span>{result.metadata.phoneNumber}</span>
                            </div>
                          )}
                          
                          {result.metadata.location && (
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                              </svg>
                              <span className="truncate max-w-xs">{result.metadata.location}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>
                              {new Date(result.metadata.date).toLocaleDateString()} at{' '}
                              {new Date(result.metadata.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status and Score */}
                    <div className="flex flex-col items-end gap-2">
                      {result.metadata.urgency && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          result.metadata.urgency === 'emergency' 
                            ? 'bg-red-100 text-red-700'
                            : result.metadata.urgency === 'high'
                            ? 'bg-orange-100 text-orange-700'
                            : result.metadata.urgency === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {result.metadata.urgency}
                        </span>
                      )}
                      
                      {result.metadata.confidence && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span>AI: {result.metadata.confidence}%</span>
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        Match: {Math.round(result.relevanceScore * 100)}%
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {/* Highlights */}
                {result.highlights && result.highlights.length > 0 && (
                  <CardBody className="pt-0">
                    <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                      <p className="text-xs font-medium text-primary mb-1">Relevant excerpt:</p>
                      <p className="text-sm text-foreground">
                        {result.highlights[0].snippet}
                      </p>
                    </div>
                  </CardBody>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {localResults.length === 0 && (
        <Card className="bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-sm border border-border/20">
          <CardBody className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="p-4 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 text-primary inline-block mb-4">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Start Your Search
              </h3>
              <p className="text-muted-foreground mb-6">
                Use the search bar above to find calls, events, customers, and more. 
                Try searching for "emergency", "plumbing", or customer names.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {['emergency plumbing', 'real estate showing', 'Sarah Johnson'].map(suggestion => (
                  <button
                    key={suggestion}
                    className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                    onClick={() => handleSearch({ query: suggestion, categories: ['calls', 'events', 'communications'] })}
                  >
                    "{suggestion}"
                  </button>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="bg-danger/5 border border-danger/20">
          <CardBody>
            <div className="flex items-center gap-3 text-danger">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <div>
                <h3 className="font-medium">Search Error</h3>
                <p className="text-sm opacity-90">{error}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}