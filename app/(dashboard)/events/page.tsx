'use client';

import { useState, useMemo } from 'react';
import EventsFilters from '@/components/events/EventsFilters';
import EventsList from '@/components/events/EventsList';

// Mock data for demonstration
const mockEvents = [
  {
    id: '1',
    title: 'Emergency Plumbing Repair',
    date: '2024-01-15',
    time: '14:30',
    customer: {
      name: 'John Smith',
      phone: '+61 412 345 678',
      email: 'john.smith@email.com'
    },
    location: '123 Collins Street, Melbourne VIC 3000',
    status: 'pending' as const,
    urgency: 'emergency' as const,
    industry: 'plumbing',
    confidence: 0.95,
    extracted_at: '2024-01-14T09:15:00Z',
    call_id: 'call_001',
    notes: 'Burst pipe in kitchen, water damage spreading'
  },
  {
    id: '2',
    title: 'Property Viewing',
    date: '2024-01-16',
    time: '10:00',
    customer: {
      name: 'Sarah Johnson',
      phone: '+61 423 456 789',
      email: 'sarah.j@email.com'
    },
    location: '456 Chapel Street, South Yarra VIC 3141',
    status: 'confirmed' as const,
    urgency: 'medium' as const,
    industry: 'real_estate',
    confidence: 0.88,
    extracted_at: '2024-01-14T11:30:00Z',
    call_id: 'call_002',
    notes: 'First home buyer, pre-approved for $800K'
  },
  {
    id: '3',
    title: 'Legal Consultation',
    date: '2024-01-17',
    time: '15:00',
    customer: {
      name: 'Michael Brown',
      phone: '+61 434 567 890'
    },
    location: 'Office meeting',
    status: 'pending' as const,
    urgency: 'high' as const,
    industry: 'legal',
    confidence: 0.92,
    extracted_at: '2024-01-14T14:45:00Z',
    call_id: 'call_003',
    notes: 'Contract review and business acquisition'
  },
  {
    id: '4',
    title: 'Medical Check-up',
    date: '2024-01-18',
    time: '09:30',
    customer: {
      name: 'Emily Davis',
      phone: '+61 445 678 901',
      email: 'e.davis@email.com'
    },
    status: 'completed' as const,
    urgency: 'low' as const,
    industry: 'medical',
    confidence: 0.85,
    extracted_at: '2024-01-14T16:20:00Z',
    call_id: 'call_004',
    notes: 'Annual health screening appointment'
  },
  {
    id: '5',
    title: 'Sales Demo',
    date: '2024-01-19',
    time: '11:00',
    customer: {
      name: 'David Wilson',
      phone: '+61 456 789 012',
      email: 'david.wilson@company.com'
    },
    status: 'cancelled' as const,
    urgency: 'medium' as const,
    industry: 'sales',
    confidence: 0.78,
    extracted_at: '2024-01-14T18:10:00Z',
    call_id: 'call_005',
    notes: 'Enterprise software demonstration'
  },
  {
    id: '6',
    title: 'Kitchen Renovation Consultation',
    date: '2024-01-20',
    time: '13:00',
    customer: {
      name: 'Lisa Anderson',
      phone: '+61 467 890 123',
      email: 'lisa.a@email.com'
    },
    location: '789 High Street, Prahran VIC 3181',
    status: 'confirmed' as const,
    urgency: 'low' as const,
    industry: 'consulting',
    confidence: 0.91,
    extracted_at: '2024-01-14T20:30:00Z',
    call_id: 'call_006',
    notes: 'Full kitchen redesign, budget $25K'
  }
];

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

export default function EventsPage() {
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    status: [],
    urgency: [],
    industry: [],
    dateRange: { from: '', to: '' },
    searchQuery: ''
  });

  // Calculate event counts
  const eventCounts = useMemo(() => {
    const counts = {
      all: mockEvents.length,
      pending: mockEvents.filter(e => e.status === 'pending').length,
      confirmed: mockEvents.filter(e => e.status === 'confirmed').length,
      completed: mockEvents.filter(e => e.status === 'completed').length,
      cancelled: mockEvents.filter(e => e.status === 'cancelled').length
    };
    return counts;
  }, []);

  // Filter events based on current filters
  const filteredEvents = useMemo(() => {
    return mockEvents.filter(event => {
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(event.status)) {
        return false;
      }

      // Urgency filter
      if (filters.urgency.length > 0 && !filters.urgency.includes(event.urgency)) {
        return false;
      }

      // Industry filter
      if (filters.industry.length > 0 && !filters.industry.includes(event.industry)) {
        return false;
      }

      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const searchableText = [
          event.title,
          event.customer.name,
          event.customer.phone,
          event.customer.email,
          event.location,
          event.notes
        ].filter(Boolean).join(' ').toLowerCase();

        if (!searchableText.includes(query)) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateRange.from && event.date < filters.dateRange.from) {
        return false;
      }
      if (filters.dateRange.to && event.date > filters.dateRange.to) {
        return false;
      }

      return true;
    });
  }, [filters]);

  const handleEventSelect = (eventId: string) => {
    setSelectedEventIds(prev => 
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const handleEventSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedEventIds(filteredEvents.map(e => e.id));
    } else {
      setSelectedEventIds([]);
    }
  };

  const handleStatusUpdate = (eventId: string, newStatus: any) => {
    console.log(`Updating event ${eventId} to status: ${newStatus}`);
    // In a real app, this would update the backend
    // For demo purposes, we'll just log it
  };

  const handleBulkAction = (action: string, eventIds: string[]) => {
    console.log(`Performing bulk action: ${action} on events:`, eventIds);
    
    if (action === 'clear') {
      setSelectedEventIds([]);
      return;
    }

    // In a real app, this would perform the bulk action on the backend
    // For demo purposes, we'll just clear the selection after the action
    setSelectedEventIds([]);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Events</h1>
          <p className="text-muted-foreground text-lg">
            Review and manage extracted calendar events
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex space-x-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{eventCounts.all}</div>
            <div className="text-sm text-muted-foreground">Total Events</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">{eventCounts.pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{eventCounts.confirmed}</div>
            <div className="text-sm text-muted-foreground">Confirmed</div>
          </div>
        </div>
      </div>

      {/* Events Filters */}
      <EventsFilters
        filters={filters}
        onFiltersChange={setFilters}
        eventCounts={eventCounts}
      />

      {/* Results Summary */}
      {filteredEvents.length !== mockEvents.length && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            Showing {filteredEvents.length} of {mockEvents.length} events
            {filters.searchQuery && (
              <span className="font-medium"> matching "{filters.searchQuery}"</span>
            )}
          </p>
        </div>
      )}

      {/* Events List */}
      {filteredEvents.length > 0 ? (
        <EventsList
          events={filteredEvents}
          selectedEventIds={selectedEventIds}
          onEventSelect={handleEventSelect}
          onEventSelectAll={handleEventSelectAll}
          onStatusUpdate={handleStatusUpdate}
          onBulkAction={handleBulkAction}
        />
      ) : (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5-3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>
          
          <h3 className="text-lg font-semibold text-foreground mb-2">No Events Found</h3>
          <p className="text-muted-foreground mb-4">
            {filters.searchQuery || filters.status.length > 0 || filters.urgency.length > 0 || filters.industry.length > 0
              ? 'Try adjusting your filters to see more events.'
              : 'No events have been extracted yet. Events will appear here once calls are processed.'}
          </p>
          
          {(filters.searchQuery || filters.status.length > 0 || filters.urgency.length > 0 || filters.industry.length > 0) && (
            <button
              onClick={() => setFilters({
                status: [],
                urgency: [],
                industry: [],
                dateRange: { from: '', to: '' },
                searchQuery: ''
              })}
              className="text-primary hover:text-primary/80 font-medium text-sm"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}