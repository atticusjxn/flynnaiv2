'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  ChevronDownIcon, 
  MapPinIcon, 
  CalendarIcon, 
  ClockIcon, 
  PhoneIcon, 
  UserIcon, 
  CheckIcon, 
  XMarkIcon, 
  PencilIcon, 
  EyeIcon 
} from '@heroicons/react/24/outline';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  customer: {
    name: string;
    phone?: string;
    email?: string;
  };
  location?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  industry: string;
  confidence: number;
  extracted_at: string;
  call_id: string;
  notes?: string;
}

interface LoadingStates {
  [key: string]: boolean;
}

interface ViewMode {
  mode: 'table' | 'card';
}

interface EventsListProps {
  events: Event[];
  selectedEventIds: string[];
  onEventSelect: (eventId: string) => void;
  onEventSelectAll: (selected: boolean) => void;
  onStatusUpdate: (eventId: string, status: Event['status']) => void;
  onBulkAction: (action: string, eventIds: string[]) => void;
  loading?: boolean;
  onEdit?: (eventId: string) => void;
  onViewCall?: (callId: string) => void;
  onCalendarSync?: (eventId: string) => void;
}

// Premium Design Tokens
const DESIGN_TOKENS = {
  status: {
    pending: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      dot: 'bg-amber-400',
      ring: 'ring-amber-100'
    },
    confirmed: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      dot: 'bg-blue-400',
      ring: 'ring-blue-100'
    },
    completed: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      dot: 'bg-emerald-400',
      ring: 'ring-emerald-100'
    },
    cancelled: {
      bg: 'bg-gray-50',
      text: 'text-gray-600',
      border: 'border-gray-200',
      dot: 'bg-gray-400',
      ring: 'ring-gray-100'
    }
  },
  urgency: {
    emergency: {
      bg: 'bg-red-500',
      text: 'text-white',
      ring: 'ring-red-200',
      glow: 'shadow-red-500/25'
    },
    high: {
      bg: 'bg-orange-500',
      text: 'text-white',
      ring: 'ring-orange-200',
      glow: 'shadow-orange-500/20'
    },
    medium: {
      bg: 'bg-yellow-500',
      text: 'text-white',
      ring: 'ring-yellow-200',
      glow: 'shadow-yellow-500/20'
    },
    low: {
      bg: 'bg-green-500',
      text: 'text-white',
      ring: 'ring-green-200',
      glow: 'shadow-green-500/20'
    }
  },
  confidence: {
    high: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
    medium: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
    low: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' }
  }
};

// Enhanced Status Dropdown with Premium Animations
function StatusDropdown({ 
  currentStatus, 
  onStatusChange, 
  disabled = false,
  eventId
}: {
  currentStatus: Event['status'];
  onStatusChange: (status: Event['status']) => void;
  disabled?: boolean;
  eventId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const statusOptions = [
    { value: 'pending' as const, label: 'Pending', icon: ClockIcon },
    { value: 'confirmed' as const, label: 'Confirmed', icon: CheckIcon },
    { value: 'completed' as const, label: 'Completed', icon: CheckIcon },
    { value: 'cancelled' as const, label: 'Cancelled', icon: XMarkIcon }
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStatusChange = async (newStatus: Event['status']) => {
    setIsUpdating(true);
    try {
      await onStatusChange(newStatus);
    } finally {
      setIsUpdating(false);
      setIsOpen(false);
    }
  };

  const currentOption = statusOptions.find(option => option.value === currentStatus);
  const statusToken = DESIGN_TOKENS.status[currentStatus];
  const IconComponent = currentOption?.icon || ClockIcon;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled || isUpdating}
        className={`
          group relative inline-flex items-center gap-2 px-3 py-2 text-xs font-medium
          border rounded-lg transition-all duration-200 min-w-[100px]
          ${statusToken.bg} ${statusToken.text} ${statusToken.border}
          ${disabled || isUpdating 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:shadow-md hover:scale-105 cursor-pointer'
          }
          ${isOpen ? 'ring-2 ' + statusToken.ring : ''}
        `}
      >
        <div className={`w-2 h-2 rounded-full ${statusToken.dot} animate-pulse`} />
        <IconComponent className="w-3 h-3" />
        <span>{currentOption?.label}</span>
        {!disabled && (
          <ChevronDownIcon className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        )}
        {isUpdating && (
          <div className="absolute inset-0 bg-white/50 rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </button>

      {isOpen && !disabled && (
        <div className="
          absolute right-0 top-full mt-2 bg-card border border-border rounded-lg shadow-xl z-50 
          min-w-[140px] animate-in fade-in slide-in-from-bottom-4 duration-200
        ">
          <div className="p-1">
            {statusOptions.map((option) => {
              const optionToken = DESIGN_TOKENS.status[option.value];
              const OptionIcon = option.icon;
              const isSelected = option.value === currentStatus;
              
              return (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-md
                    transition-all duration-150 text-left
                    ${isSelected 
                      ? optionToken.bg + ' ' + optionToken.text + ' font-medium' 
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    }
                  `}
                >
                  <div className={`w-2 h-2 rounded-full ${optionToken.dot} ${isSelected ? 'animate-pulse' : ''}`} />
                  <OptionIcon className="w-4 h-4" />
                  <span className="flex-1">{option.label}</span>
                  {isSelected && <CheckIcon className="w-4 h-4 text-current" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EventsList({
  events,
  selectedEventIds,
  onEventSelect,
  onEventSelectAll,
  onStatusUpdate,
  onBulkAction,
  loading = false,
  onEdit,
  onViewCall,
  onCalendarSync
}: EventsListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({});
  const [isCheckingAll, setIsCheckingAll] = useState(false);
  const eventsPerPage = 10;

  const totalPages = Math.ceil(events.length / eventsPerPage);
  const startIndex = (currentPage - 1) * eventsPerPage;
  const endIndex = startIndex + eventsPerPage;
  const currentEvents = events.slice(startIndex, endIndex);

  // Auto-switch to card view on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode('card');
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Enhanced utility functions with loading states
  const handleStatusUpdate = async (eventId: string, status: Event['status']) => {
    setLoadingStates(prev => ({ ...prev, [`status-${eventId}`]: true }));
    try {
      await onStatusUpdate(eventId, status);
    } finally {
      setLoadingStates(prev => ({ ...prev, [`status-${eventId}`]: false }));
    }
  };

  const handleAction = async (action: string, eventId: string, callId?: string) => {
    const loadingKey = `${action}-${eventId}`;
    setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
    
    try {
      switch (action) {
        case 'edit':
          onEdit?.(eventId);
          break;
        case 'calendar':
          onCalendarSync?.(eventId);
          break;
        case 'view-call':
          onViewCall?.(callId!);
          break;
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const getConfidenceLevel = (confidence: number): 'high' | 'medium' | 'low' => {
    if (confidence >= 0.9) return 'high';
    if (confidence >= 0.7) return 'medium';
    return 'low';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    
    return date.toLocaleDateString('en-AU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatTime = (timeStr: string) => {
    const time = new Date(`2000-01-01 ${timeStr}`);
    return time.toLocaleTimeString('en-AU', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const isUpcoming = (dateStr: string, timeStr: string) => {
    const eventDate = new Date(`${dateStr} ${timeStr}`);
    return eventDate > new Date();
  };

  const isAllCurrentPageSelected = currentEvents.every(event => 
    selectedEventIds.includes(event.id)
  ) && currentEvents.length > 0;

  const handleSelectAllCurrentPage = async () => {
    setIsCheckingAll(true);
    try {
      // Simulate slight delay for premium feel
      await new Promise(resolve => setTimeout(resolve, 100));
      currentEvents.forEach(event => {
        onEventSelect(event.id);
      });
    } finally {
      setIsCheckingAll(false);
    }
  };

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-16 px-6 animate-in fade-in duration-500">
      <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <CalendarIcon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">No events found</h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        Events extracted from your calls will appear here. Make your first call to get started.
      </p>
    </div>
  );

  // Loading skeleton for table rows
  const TableSkeleton = () => (
    <div className="animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-border">
          <td className="p-6"><div className="h-4 w-4 bg-muted rounded" /></td>
          <td className="p-6"><div className="h-4 bg-muted rounded w-full" /></td>
          <td className="p-6"><div className="h-4 bg-muted rounded w-3/4" /></td>
          <td className="p-6"><div className="h-4 bg-muted rounded w-1/2" /></td>
          <td className="p-6"><div className="h-6 bg-muted rounded-full w-20" /></td>
          <td className="p-6"><div className="h-6 bg-muted rounded-full w-16" /></td>
          <td className="p-6"><div className="h-6 bg-muted rounded-full w-12" /></td>
          <td className="p-6"><div className="h-4 bg-muted rounded w-20" /></td>
        </tr>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="text-left p-6 font-semibold text-sm text-foreground tracking-wide">Event</th>
                <th className="text-left p-6 font-semibold text-sm text-foreground tracking-wide">Customer</th>
                <th className="text-left p-6 font-semibold text-sm text-foreground tracking-wide">Date & Time</th>
                <th className="text-left p-6 font-semibold text-sm text-foreground tracking-wide">Status</th>
                <th className="text-left p-6 font-semibold text-sm text-foreground tracking-wide">Priority</th>
                <th className="text-left p-6 font-semibold text-sm text-foreground tracking-wide">Confidence</th>
                <th className="text-right p-6 font-semibold text-sm text-foreground tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              <TableSkeleton />
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* Enhanced View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-foreground">Events ({events.length})</h2>
          {selectedEventIds.length > 0 && (
            <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md">
              {selectedEventIds.length} selected
            </span>
          )}
        </div>
        
        {/* View Mode Toggle - Hidden on mobile */}
        <div className="hidden md:flex items-center bg-muted p-1 rounded-lg">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
              viewMode === 'table'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Table
          </button>
          <button
            onClick={() => setViewMode('card')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
              viewMode === 'card'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Cards
          </button>
        </div>
      </div>

      {/* Premium Bulk Actions Bar */}
      {selectedEventIds.length > 0 && (
        <div className="
          bg-primary/5 border border-primary/20 rounded-xl p-4 
          animate-in slide-in-from-bottom-4 duration-300
          backdrop-blur-sm
        ">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  {selectedEventIds.length} event{selectedEventIds.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onBulkAction('confirm', selectedEventIds)}
                  className="
                    text-sm bg-blue-600 text-white px-3 py-2 rounded-lg font-medium
                    hover:bg-blue-700 hover:shadow-md hover:scale-105
                    transition-all duration-200 min-h-[44px] touch-manipulation
                  "
                >
                  Mark Confirmed
                </button>
                <button
                  onClick={() => onBulkAction('complete', selectedEventIds)}
                  className="
                    text-sm bg-emerald-600 text-white px-3 py-2 rounded-lg font-medium
                    hover:bg-emerald-700 hover:shadow-md hover:scale-105
                    transition-all duration-200 min-h-[44px] touch-manipulation
                  "
                >
                  Mark Completed
                </button>
                <button
                  onClick={() => onBulkAction('cancel', selectedEventIds)}
                  className="
                    text-sm bg-gray-600 text-white px-3 py-2 rounded-lg font-medium
                    hover:bg-gray-700 hover:shadow-md hover:scale-105
                    transition-all duration-200 min-h-[44px] touch-manipulation
                  "
                >
                  Cancel Events
                </button>
              </div>
            </div>
            <button
              onClick={() => onBulkAction('clear', [])}
              className="
                text-sm text-muted-foreground hover:text-foreground 
                font-medium transition-colors duration-200
              "
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Content Based on View Mode */}
      {viewMode === 'table' ? (
        // Premium Table View
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="w-16 p-6">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={isAllCurrentPageSelected}
                        onChange={handleSelectAllCurrentPage}
                        disabled={isCheckingAll}
                        className="
                          w-4 h-4 rounded border-2 border-border text-primary 
                          focus:ring-2 focus:ring-primary/30 transition-all duration-200
                          disabled:opacity-50
                        "
                      />
                      {isCheckingAll && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                  </th>
                  <th className="text-left p-6 font-semibold text-sm text-foreground tracking-wide">Event</th>
                  <th className="text-left p-6 font-semibold text-sm text-foreground tracking-wide">Customer</th>
                  <th className="text-left p-6 font-semibold text-sm text-foreground tracking-wide">Date & Time</th>
                  <th className="text-left p-6 font-semibold text-sm text-foreground tracking-wide">Status</th>
                  <th className="text-left p-6 font-semibold text-sm text-foreground tracking-wide">Priority</th>
                  <th className="text-left p-6 font-semibold text-sm text-foreground tracking-wide">Confidence</th>
                  <th className="text-right p-6 font-semibold text-sm text-foreground tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {currentEvents.map((event, index) => {
                  const confidenceLevel = getConfidenceLevel(event.confidence);
                  const isEventUpcoming = isUpcoming(event.date, event.time);
                  
                  return (
                    <tr 
                      key={event.id} 
                      className={`
                        group transition-all duration-200 hover:bg-muted/50
                        ${selectedEventIds.includes(event.id) ? 'bg-primary/5' : ''}
                        animate-in slide-in-from-left-2 duration-${300 + index * 50}
                      `}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="p-6">
                        <input
                          type="checkbox"
                          checked={selectedEventIds.includes(event.id)}
                          onChange={() => onEventSelect(event.id)}
                          className="
                            w-4 h-4 rounded border-2 border-border text-primary 
                            focus:ring-2 focus:ring-primary/30 transition-all duration-200
                          "
                        />
                      </td>
                      <td className="p-6">
                        <div className="space-y-3">
                          <div className="font-semibold text-foreground leading-tight line-clamp-2">
                            {event.title}
                            {isEventUpcoming && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                Upcoming
                              </span>
                            )}
                          </div>
                          {event.location && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPinIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                              <span className="line-clamp-1">{event.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md capitalize">
                              {event.industry}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="space-y-2">
                          <div className="flex items-center font-medium text-foreground">
                            <UserIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                            {event.customer.name}
                          </div>
                          {event.customer.phone && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <PhoneIcon className="w-3 h-3 mr-2" />
                              {event.customer.phone}
                            </div>
                          )}
                          {event.customer.email && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {event.customer.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="space-y-2">
                          <div className="flex items-center font-medium text-foreground">
                            <CalendarIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                            {formatDate(event.date)}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <ClockIcon className="w-3 h-3 mr-2" />
                            {formatTime(event.time)}
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <StatusDropdown
                          currentStatus={event.status}
                          onStatusChange={(status) => handleStatusUpdate(event.id, status)}
                          disabled={loadingStates[`status-${event.id}`]}
                          eventId={event.id}
                        />
                      </td>
                      <td className="p-6">
                        <div className={`
                          inline-flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg
                          shadow-sm ${DESIGN_TOKENS.urgency[event.urgency].bg} 
                          ${DESIGN_TOKENS.urgency[event.urgency].text}
                          ${event.urgency === 'emergency' ? 'animate-pulse shadow-lg ' + DESIGN_TOKENS.urgency[event.urgency].glow : ''}
                        `}>
                          {event.urgency === 'emergency' && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                          {event.urgency.toUpperCase()}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className={`
                          inline-flex items-center text-xs font-semibold px-3 py-2 rounded-lg border
                          ${DESIGN_TOKENS.confidence[confidenceLevel].bg}
                          ${DESIGN_TOKENS.confidence[confidenceLevel].text}
                          ${DESIGN_TOKENS.confidence[confidenceLevel].border}
                        `}>
                          {Math.round(event.confidence * 100)}%
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleAction('edit', event.id)}
                            disabled={loadingStates[`edit-${event.id}`]}
                            className="
                              group relative p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 
                              rounded-lg transition-all duration-200 min-w-[44px] min-h-[44px] 
                              disabled:opacity-50 touch-manipulation
                            "
                            title="Edit event"
                          >
                            <PencilIcon className="w-4 h-4" />
                            {loadingStates[`edit-${event.id}`] && (
                              <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-lg">
                                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              </div>
                            )}
                          </button>
                          <button 
                            onClick={() => handleAction('calendar', event.id)}
                            disabled={loadingStates[`calendar-${event.id}`]}
                            className="
                              group relative p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 
                              rounded-lg transition-all duration-200 min-w-[44px] min-h-[44px] 
                              disabled:opacity-50 touch-manipulation
                            "
                            title="Sync to calendar"
                          >
                            <CalendarIcon className="w-4 h-4" />
                            {loadingStates[`calendar-${event.id}`] && (
                              <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-lg">
                                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              </div>
                            )}
                          </button>
                          <button 
                            onClick={() => handleAction('view-call', event.id, event.call_id)}
                            disabled={loadingStates[`view-call-${event.id}`]}
                            className="
                              group relative p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 
                              rounded-lg transition-all duration-200 min-w-[44px] min-h-[44px] 
                              disabled:opacity-50 touch-manipulation
                            "
                            title="View call details"
                          >
                            <EyeIcon className="w-4 h-4" />
                            {loadingStates[`view-call-${event.id}`] && (
                              <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-lg">
                                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              </div>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Premium Card View for Mobile
        <div className="grid gap-4 animate-in fade-in duration-300">
          {currentEvents.map((event, index) => {
            const confidenceLevel = getConfidenceLevel(event.confidence);
            const isEventUpcoming = isUpcoming(event.date, event.time);
            const statusToken = DESIGN_TOKENS.status[event.status];
            
            return (
              <div 
                key={event.id} 
                className={`
                  bg-card border border-border rounded-xl p-6 shadow-sm
                  transition-all duration-200 hover:shadow-md hover:scale-[1.02]
                  ${selectedEventIds.includes(event.id) ? 'ring-2 ring-primary/30 bg-primary/5' : ''}
                  animate-in slide-in-from-bottom-4 duration-${300 + index * 50}
                `}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedEventIds.includes(event.id)}
                      onChange={() => onEventSelect(event.id)}
                      className="w-5 h-5 rounded border-2 border-border text-primary focus:ring-2 focus:ring-primary/30"
                    />
                    <div>
                      <h3 className="font-semibold text-foreground leading-tight line-clamp-2">
                        {event.title}
                      </h3>
                      {isEventUpcoming && (
                        <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          Upcoming
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`
                    inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg
                    ${DESIGN_TOKENS.urgency[event.urgency].bg} ${DESIGN_TOKENS.urgency[event.urgency].text}
                    ${event.urgency === 'emergency' ? 'animate-pulse' : ''}
                  `}>
                    {event.urgency.toUpperCase()}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Customer Info */}
                  <div className="flex items-center gap-3">
                    <UserIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">{event.customer.name}</p>
                      {event.customer.phone && (
                        <p className="text-sm text-muted-foreground">{event.customer.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">{formatDate(event.date)}</p>
                      <p className="text-sm text-muted-foreground">{formatTime(event.time)}</p>
                    </div>
                  </div>

                  {/* Location */}
                  {event.location && (
                    <div className="flex items-start gap-3">
                      <MapPinIcon className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground line-clamp-2">{event.location}</p>
                    </div>
                  )}

                  {/* Status and Confidence */}
                  <div className="flex items-center justify-between">
                    <StatusDropdown
                      currentStatus={event.status}
                      onStatusChange={(status) => handleStatusUpdate(event.id, status)}
                      disabled={loadingStates[`status-${event.id}`]}
                      eventId={event.id}
                    />
                    <div className={`
                      inline-flex items-center text-xs font-semibold px-2 py-1 rounded-md border
                      ${DESIGN_TOKENS.confidence[confidenceLevel].bg}
                      ${DESIGN_TOKENS.confidence[confidenceLevel].text}
                      ${DESIGN_TOKENS.confidence[confidenceLevel].border}
                    `}>
                      {Math.round(event.confidence * 100)}% confidence
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <button 
                      onClick={() => handleAction('edit', event.id)}
                      disabled={loadingStates[`edit-${event.id}`]}
                      className="
                        flex-1 relative flex items-center justify-center gap-2 p-3 
                        text-blue-600 hover:text-blue-700 hover:bg-blue-50 
                        rounded-lg transition-all duration-200 font-medium text-sm
                        min-h-[48px] disabled:opacity-50 touch-manipulation
                      "
                    >
                      <PencilIcon className="w-4 h-4" />
                      Edit
                      {loadingStates[`edit-${event.id}`] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-lg">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </button>
                    <button 
                      onClick={() => handleAction('calendar', event.id)}
                      disabled={loadingStates[`calendar-${event.id}`]}
                      className="
                        flex-1 relative flex items-center justify-center gap-2 p-3 
                        text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 
                        rounded-lg transition-all duration-200 font-medium text-sm
                        min-h-[48px] disabled:opacity-50 touch-manipulation
                      "
                    >
                      <CalendarIcon className="w-4 h-4" />
                      Calendar
                      {loadingStates[`calendar-${event.id}`] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-lg">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </button>
                    <button 
                      onClick={() => handleAction('view-call', event.id, event.call_id)}
                      disabled={loadingStates[`view-call-${event.id}`]}
                      className="
                        flex-1 relative flex items-center justify-center gap-2 p-3 
                        text-gray-600 hover:text-gray-700 hover:bg-gray-50 
                        rounded-lg transition-all duration-200 font-medium text-sm
                        min-h-[48px] disabled:opacity-50 touch-manipulation
                      "
                    >
                      <EyeIcon className="w-4 h-4" />
                      View Call
                      {loadingStates[`view-call-${event.id}`] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-lg">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Premium Pagination */}
      {totalPages > 1 && (
        <div className="
          bg-card border border-border rounded-xl p-6 shadow-sm
          animate-in fade-in duration-300
        ">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground font-medium">
              Showing <span className="font-semibold text-foreground">{startIndex + 1}</span> to{' '}
              <span className="font-semibold text-foreground">{Math.min(endIndex, events.length)}</span> of{' '}
              <span className="font-semibold text-foreground">{events.length}</span> events
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="
                  px-4 py-2 text-sm font-medium border border-border rounded-lg 
                  hover:bg-muted/50 hover:scale-105 transition-all duration-200 
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                  min-h-[44px] touch-manipulation
                "
              >
                Previous
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`
                        px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                        min-h-[44px] min-w-[44px] touch-manipulation
                        ${
                          page === currentPage
                            ? 'bg-primary text-primary-foreground shadow-md scale-105'
                            : 'border border-border hover:bg-muted/50 hover:scale-105'
                        }
                      `}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="
                  px-4 py-2 text-sm font-medium border border-border rounded-lg 
                  hover:bg-muted/50 hover:scale-105 transition-all duration-200 
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                  min-h-[44px] touch-manipulation
                "
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}