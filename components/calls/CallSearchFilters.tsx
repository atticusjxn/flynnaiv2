'use client';

import React, { useState, useCallback, memo } from 'react';
import {
  Input,
  Select,
  SelectItem,
  Button,
  Chip,
  DateRangePicker,
} from '@nextui-org/react';
import { debounce } from 'lodash';
import { Database } from '@/types/database.types';

type CallStatus = Database['public']['Tables']['calls']['Row']['call_status'];
type UrgencyLevel =
  Database['public']['Tables']['calls']['Row']['urgency_level'];
type AIProcessingStatus =
  Database['public']['Tables']['calls']['Row']['ai_processing_status'];

export interface CallFilters {
  search: string;
  status: CallStatus[];
  urgency: UrgencyLevel[];
  aiStatus: AIProcessingStatus[];
  dateRange: { start: Date; end: Date } | null;
}

interface CallSearchFiltersProps {
  filters: CallFilters;
  onFiltersChange: (filters: CallFilters) => void;
  totalCount?: number;
  filteredCount?: number;
}

const statusOptions = [
  { key: 'completed', label: 'Completed' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'failed', label: 'Failed' },
  { key: 'busy', label: 'Busy' },
  { key: 'no_answer', label: 'No Answer' },
  { key: 'cancelled', label: 'Cancelled' },
];

const urgencyOptions = [
  { key: 'emergency', label: 'Emergency' },
  { key: 'high', label: 'High' },
  { key: 'medium', label: 'Medium' },
  { key: 'low', label: 'Low' },
];

const aiStatusOptions = [
  { key: 'completed', label: 'Completed' },
  { key: 'processing', label: 'Processing' },
  { key: 'pending', label: 'Pending' },
  { key: 'failed', label: 'Failed' },
];

const CallSearchFilters = memo(function CallSearchFilters({
  filters,
  onFiltersChange,
  totalCount = 0,
  filteredCount = 0,
}: CallSearchFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.search);

  // Debounced search handler
  const debouncedSearchChange = useCallback(
    debounce((value: string) => {
      onFiltersChange({ ...filters, search: value });
    }, 300),
    [filters, onFiltersChange]
  );

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    debouncedSearchChange(value);
  };

  const handleStatusChange = (selectedKeys: Set<string>) => {
    const status = Array.from(selectedKeys) as CallStatus[];
    onFiltersChange({ ...filters, status });
  };

  const handleUrgencyChange = (selectedKeys: Set<string>) => {
    const urgency = Array.from(selectedKeys) as UrgencyLevel[];
    onFiltersChange({ ...filters, urgency });
  };

  const handleAIStatusChange = (selectedKeys: Set<string>) => {
    const aiStatus = Array.from(selectedKeys) as AIProcessingStatus[];
    onFiltersChange({ ...filters, aiStatus });
  };

  const clearAllFilters = () => {
    setLocalSearch('');
    onFiltersChange({
      search: '',
      status: [],
      urgency: [],
      aiStatus: [],
      dateRange: null,
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.status.length > 0 ||
    filters.urgency.length > 0 ||
    filters.aiStatus.length > 0 ||
    filters.dateRange;

  const removeFilter = (type: string, value?: string) => {
    switch (type) {
      case 'search':
        setLocalSearch('');
        onFiltersChange({ ...filters, search: '' });
        break;
      case 'status':
        onFiltersChange({
          ...filters,
          status: filters.status.filter((s) => s !== value),
        });
        break;
      case 'urgency':
        onFiltersChange({
          ...filters,
          urgency: filters.urgency.filter((u) => u !== value),
        });
        break;
      case 'aiStatus':
        onFiltersChange({
          ...filters,
          aiStatus: filters.aiStatus.filter((a) => a !== value),
        });
        break;
      case 'dateRange':
        onFiltersChange({ ...filters, dateRange: null });
        break;
    }
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Search and Filter Controls */}
      <div className="bg-white dark:bg-gray-900 border border-border rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="lg:col-span-2">
            <Input
              placeholder="Search calls, topics, or caller names..."
              value={localSearch}
              onValueChange={handleSearchChange}
              startContent={
                <svg
                  className="w-4 h-4 text-muted-foreground"
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
              }
              isClearable
              className="w-full"
              classNames={{
                input: 'text-sm',
                inputWrapper:
                  'hover:border-primary/30 focus-within:border-primary/50 transition-colors duration-200',
              }}
            />
          </div>

          {/* Status Filter */}
          <Select
            placeholder="Call Status"
            selectionMode="multiple"
            selectedKeys={new Set(filters.status)}
            onSelectionChange={(keys) =>
              handleStatusChange(keys as Set<string>)
            }
            aria-label="Filter by call status"
            style={
              {
                '--nextui-popover-background': '#ffffff',
                '--nextui-content1': '#ffffff',
                '--nextui-content2': '#ffffff',
                '--nextui-content3': '#ffffff',
                '--nextui-content4': '#ffffff',
              } as React.CSSProperties
            }
            classNames={{
              trigger:
                'hover:border-primary/30 focus:border-primary/50 transition-colors duration-200',
              popoverContent:
                '!bg-white dark:!bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-700 [&>*]:!bg-white dark:[&>*]:!bg-gray-900',
              listbox:
                '!bg-white dark:!bg-gray-900 [&>*]:!bg-white dark:[&>*]:!bg-gray-900',
              listboxWrapper: '!bg-white dark:!bg-gray-900',
            }}
          >
            {statusOptions.map((option) => (
              <SelectItem
                key={option.key}
                value={option.key}
                className="!bg-white dark:!bg-gray-900 hover:!bg-gray-50 dark:hover:!bg-gray-800"
              >
                {option.label}
              </SelectItem>
            ))}
          </Select>

          {/* AI Status Filter */}
          <Select
            placeholder="AI Status"
            selectionMode="multiple"
            selectedKeys={new Set(filters.aiStatus)}
            onSelectionChange={(keys) =>
              handleAIStatusChange(keys as Set<string>)
            }
            aria-label="Filter by AI processing status"
            style={
              {
                '--nextui-popover-background': '#ffffff',
                '--nextui-content1': '#ffffff',
                '--nextui-content2': '#ffffff',
                '--nextui-content3': '#ffffff',
                '--nextui-content4': '#ffffff',
              } as React.CSSProperties
            }
            classNames={{
              trigger:
                'hover:border-primary/30 focus:border-primary/50 transition-colors duration-200',
              popoverContent:
                '!bg-white dark:!bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-700 [&>*]:!bg-white dark:[&>*]:!bg-gray-900',
              listbox:
                '!bg-white dark:!bg-gray-900 [&>*]:!bg-white dark:[&>*]:!bg-gray-900',
              listboxWrapper: '!bg-white dark:!bg-gray-900',
            }}
          >
            {aiStatusOptions.map((option) => (
              <SelectItem
                key={option.key}
                value={option.key}
                className="!bg-white dark:!bg-gray-900 hover:!bg-gray-50 dark:hover:!bg-gray-800"
              >
                {option.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        {/* Second Row - Urgency and Date Range */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          <Select
            placeholder="Urgency Level"
            selectionMode="multiple"
            selectedKeys={new Set(filters.urgency)}
            onSelectionChange={(keys) =>
              handleUrgencyChange(keys as Set<string>)
            }
            aria-label="Filter by urgency level"
            style={
              {
                '--nextui-popover-background': '#ffffff',
                '--nextui-content1': '#ffffff',
                '--nextui-content2': '#ffffff',
                '--nextui-content3': '#ffffff',
                '--nextui-content4': '#ffffff',
              } as React.CSSProperties
            }
            classNames={{
              trigger:
                'hover:border-primary/30 focus:border-primary/50 transition-colors duration-200',
              popoverContent:
                '!bg-white dark:!bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-700 [&>*]:!bg-white dark:[&>*]:!bg-gray-900',
              listbox:
                '!bg-white dark:!bg-gray-900 [&>*]:!bg-white dark:[&>*]:!bg-gray-900',
              listboxWrapper: '!bg-white dark:!bg-gray-900',
            }}
          >
            {urgencyOptions.map((option) => (
              <SelectItem
                key={option.key}
                value={option.key}
                className="!bg-white dark:!bg-gray-900 hover:!bg-gray-50 dark:hover:!bg-gray-800"
              >
                {option.label}
              </SelectItem>
            ))}
          </Select>

          {/* Clear Filters Button */}
          <div className="flex items-center gap-2 lg:col-span-2 lg:justify-end">
            {hasActiveFilters && (
              <Button
                variant="flat"
                size="sm"
                onPress={clearAllFilters}
                startContent={
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                }
                className="hover:scale-105 transition-transform"
              >
                Clear All
              </Button>
            )}

            {/* Results Count */}
            <div className="text-sm text-muted-foreground bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
              {hasActiveFilters ? (
                <>
                  <span className="font-medium text-foreground">
                    {filteredCount}
                  </span>
                  {' of '}
                  <span className="font-medium">{totalCount}</span>
                  {' calls'}
                </>
              ) : (
                <>
                  <span className="font-medium text-foreground">
                    {totalCount}
                  </span>
                  {' total calls'}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Active filters:
          </span>

          {filters.search && (
            <Chip
              variant="flat"
              color="primary"
              onClose={() => removeFilter('search')}
              classNames={{
                base: 'hover:scale-105 transition-transform cursor-pointer',
              }}
            >
              Search: "{filters.search}"
            </Chip>
          )}

          {filters.status.map((status) => (
            <Chip
              key={`status-${status}`}
              variant="flat"
              color="secondary"
              onClose={() => removeFilter('status', status)}
              classNames={{
                base: 'hover:scale-105 transition-transform cursor-pointer',
              }}
            >
              Status: {statusOptions.find((opt) => opt.key === status)?.label}
            </Chip>
          ))}

          {filters.urgency.map((urgency) => (
            <Chip
              key={`urgency-${urgency}`}
              variant="flat"
              color="warning"
              onClose={() => removeFilter('urgency', urgency)}
              classNames={{
                base: 'hover:scale-105 transition-transform cursor-pointer',
              }}
            >
              Urgency:{' '}
              {urgencyOptions.find((opt) => opt.key === urgency)?.label}
            </Chip>
          ))}

          {filters.aiStatus.map((aiStatus) => (
            <Chip
              key={`ai-${aiStatus}`}
              variant="flat"
              color="success"
              onClose={() => removeFilter('aiStatus', aiStatus)}
              classNames={{
                base: 'hover:scale-105 transition-transform cursor-pointer',
              }}
            >
              AI: {aiStatusOptions.find((opt) => opt.key === aiStatus)?.label}
            </Chip>
          ))}

          {filters.dateRange && (
            <Chip
              variant="flat"
              color="default"
              onClose={() => removeFilter('dateRange')}
              classNames={{
                base: 'hover:scale-105 transition-transform cursor-pointer',
              }}
            >
              Date Range Applied
            </Chip>
          )}
        </div>
      )}
    </div>
  );
});

export default CallSearchFilters;
