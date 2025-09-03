'use client';

import React from 'react';
import { Card, CardBody, CardHeader, Chip, Badge } from '@nextui-org/react';

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

interface SearchResultsProps {
  results: SearchResult[];
  isLoading?: boolean;
  searchTime?: number;
  onResultClick?: (result: SearchResult) => void;
  className?: string;
}

export default function SearchResults({
  results,
  isLoading = false,
  searchTime,
  onResultClick,
  className = '',
}: SearchResultsProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'call':
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
            />
          </svg>
        );
      case 'event':
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
            />
          </svg>
        );
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'call':
        return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'event':
        return 'bg-green-100 text-green-600 border-green-200';
      case 'communication':
        return 'bg-purple-100 text-purple-600 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Loading Skeleton */}
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="max-w-md mx-auto">
          <div className="p-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 text-gray-400 inline-block mb-4">
            <svg
              className="w-12 h-12"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No results found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search terms or filters
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-900">
            Search Results
          </h2>
          <Badge color="primary" variant="flat" size="lg">
            {results.length} results
          </Badge>
        </div>
        {searchTime && (
          <p className="text-sm text-gray-500">Found in {searchTime}ms</p>
        )}
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {results.map((result, index) => (
          <Card
            key={result.id}
            isPressable={!!onResultClick}
            onPress={() => onResultClick?.(result)}
            className={`
              transition-all duration-300 hover:shadow-lg group
              ${onResultClick ? 'cursor-pointer' : ''}
              ${index === 0 ? 'ring-2 ring-primary/20' : ''}
            `}
            style={{
              animationDelay: `${index * 50}ms`,
              animation: 'fadeInUp 0.4s ease-out forwards',
            }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between w-full">
                <div className="flex items-start gap-3 flex-1">
                  {/* Type Icon */}
                  <div
                    className={`
                    p-2 rounded-lg border flex-shrink-0 transition-colors duration-200
                    ${getTypeColor(result.type)}
                    group-hover:scale-105
                  `}
                  >
                    {getTypeIcon(result.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-1 mb-1">
                      {result.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 line-clamp-2 mb-3">
                      {result.description}
                    </p>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                      {result.metadata.customerName && (
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                            />
                          </svg>
                          <span className="font-medium">
                            {result.metadata.customerName}
                          </span>
                        </div>
                      )}

                      {result.metadata.phoneNumber && (
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                            />
                          </svg>
                          <span>{result.metadata.phoneNumber}</span>
                        </div>
                      )}

                      {result.metadata.location && (
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                            />
                          </svg>
                          <span className="truncate max-w-xs">
                            {result.metadata.location}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>{formatDate(result.metadata.date)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status and Score */}
                <div className="flex flex-col items-end gap-2 ml-4">
                  {result.metadata.urgency && (
                    <Chip
                      size="sm"
                      className={`${getUrgencyColor(result.metadata.urgency)} capitalize`}
                    >
                      {result.metadata.urgency}
                    </Chip>
                  )}

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {result.metadata.confidence && (
                      <Badge size="sm" color="success" variant="flat">
                        AI: {result.metadata.confidence}%
                      </Badge>
                    )}

                    <Badge size="sm" color="primary" variant="dot">
                      {Math.round(result.relevanceScore * 100)}% match
                    </Badge>
                  </div>

                  <Chip
                    size="sm"
                    variant="flat"
                    color="primary"
                    className="capitalize"
                  >
                    {result.type}
                  </Chip>
                </div>
              </div>
            </CardHeader>

            {/* Highlights */}
            {result.highlights && result.highlights.length > 0 && (
              <CardBody className="pt-0">
                <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                  <p className="text-xs font-medium text-primary mb-1 uppercase tracking-wide">
                    Relevant excerpt:
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {result.highlights[0].snippet}
                  </p>
                </div>
              </CardBody>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

// CSS-in-JS styles for animations
const styles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
