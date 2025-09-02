'use client';

import { useState } from 'react';

interface FilterOptions {
  status: string[];
  urgency: string[];
  industry: string[];
  dateRange: {
    from: string;
    to: string;
  };
  searchQuery: string;
}

interface EventsFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  eventCounts: {
    all: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
}

export default function EventsFilters({
  filters,
  onFiltersChange,
  eventCounts
}: EventsFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      status: [],
      urgency: [],
      industry: [],
      dateRange: { from: '', to: '' },
      searchQuery: ''
    });
  };

  const hasActiveFilters = 
    filters.status.length > 0 ||
    filters.urgency.length > 0 ||
    filters.industry.length > 0 ||
    filters.dateRange.from ||
    filters.dateRange.to ||
    filters.searchQuery;

  const toggleStatusFilter = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    updateFilter('status', newStatus);
  };

  const toggleUrgencyFilter = (urgency: string) => {
    const newUrgency = filters.urgency.includes(urgency)
      ? filters.urgency.filter(u => u !== urgency)
      : [...filters.urgency, urgency];
    updateFilter('urgency', newUrgency);
  };

  const toggleIndustryFilter = (industry: string) => {
    const newIndustry = filters.industry.includes(industry)
      ? filters.industry.filter(i => i !== industry)
      : [...filters.industry, industry];
    updateFilter('industry', newIndustry);
  };

  return (
    <div className="space-y-6">
      {/* Search and Quick Status Filters */}
      <div className="bg-white dark:bg-gray-900 border border-border rounded-lg p-6 shadow-sm">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search events, customers, or locations..."
              value={filters.searchQuery}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            />
          </div>

          {/* Quick Status Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => updateFilter('status', [])}
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.status.length === 0
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All Events
              <span className="ml-2 bg-background/20 text-xs px-2 py-0.5 rounded-full">
                {eventCounts.all}
              </span>
            </button>
            
            <button
              onClick={() => toggleStatusFilter('pending')}
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.status.includes('pending')
                  ? 'bg-amber-500 text-white'
                  : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              Pending
              <span className="ml-2 bg-background/20 text-xs px-2 py-0.5 rounded-full">
                {eventCounts.pending}
              </span>
            </button>

            <button
              onClick={() => toggleStatusFilter('confirmed')}
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.status.includes('confirmed')
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
              }`}
            >
              Confirmed
              <span className="ml-2 bg-background/20 text-xs px-2 py-0.5 rounded-full">
                {eventCounts.confirmed}
              </span>
            </button>

            <button
              onClick={() => toggleStatusFilter('completed')}
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.status.includes('completed')
                  ? 'bg-green-500 text-white'
                  : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
              }`}
            >
              Completed
              <span className="ml-2 bg-background/20 text-xs px-2 py-0.5 rounded-full">
                {eventCounts.completed}
              </span>
            </button>

            <button
              onClick={() => toggleStatusFilter('cancelled')}
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.status.includes('cancelled')
                  ? 'bg-gray-500 text-white'
                  : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              Cancelled
              <span className="ml-2 bg-background/20 text-xs px-2 py-0.5 rounded-full">
                {eventCounts.cancelled}
              </span>
            </button>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="inline-flex items-center text-sm text-primary hover:text-primary/80 font-medium"
            >
              <svg 
                className={`w-4 h-4 mr-2 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={1.5} 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
              Advanced Filters
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="bg-white dark:bg-gray-900 border border-border rounded-lg p-6 space-y-6 shadow-sm">
          <h3 className="font-semibold text-foreground">Advanced Filters</h3>

          {/* Priority/Urgency Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Priority Level</label>
            <div className="flex flex-wrap gap-2">
              {['emergency', 'high', 'medium', 'low'].map(urgency => (
                <button
                  key={urgency}
                  onClick={() => toggleUrgencyFilter(urgency)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                    filters.urgency.includes(urgency)
                      ? urgency === 'emergency' ? 'bg-red-500 text-white'
                        : urgency === 'high' ? 'bg-orange-500 text-white'
                        : urgency === 'medium' ? 'bg-yellow-500 text-white'
                        : 'bg-green-500 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {urgency}
                </button>
              ))}
            </div>
          </div>

          {/* Industry Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Industry</label>
            <div className="flex flex-wrap gap-2">
              {['plumbing', 'real_estate', 'legal', 'medical', 'sales', 'consulting'].map(industry => (
                <button
                  key={industry}
                  onClick={() => toggleIndustryFilter(industry)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                    filters.industry.includes(industry)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {industry.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Date Range</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">From Date</label>
                <input
                  type="date"
                  value={filters.dateRange.from}
                  onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, from: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">To Date</label>
                <input
                  type="date"
                  value={filters.dateRange.to}
                  onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, to: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-blue-700">Active Filters:</span>
              <div className="flex flex-wrap gap-1">
                {filters.status.map(status => (
                  <span key={status} className="inline-flex items-center bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    {status}
                    <button
                      onClick={() => toggleStatusFilter(status)}
                      className="ml-1 hover:bg-blue-700 rounded-full p-0.5"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
                {filters.urgency.map(urgency => (
                  <span key={urgency} className="inline-flex items-center bg-orange-600 text-white text-xs px-2 py-1 rounded-full">
                    {urgency}
                    <button
                      onClick={() => toggleUrgencyFilter(urgency)}
                      className="ml-1 hover:bg-orange-700 rounded-full p-0.5"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
                {filters.industry.map(industry => (
                  <span key={industry} className="inline-flex items-center bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                    {industry}
                    <button
                      onClick={() => toggleIndustryFilter(industry)}
                      className="ml-1 hover:bg-green-700 rounded-full p-0.5"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}