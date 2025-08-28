'use client';

import { useState } from 'react';

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

interface EventsListProps {
  events: Event[];
  selectedEventIds: string[];
  onEventSelect: (eventId: string) => void;
  onEventSelectAll: (selected: boolean) => void;
  onStatusUpdate: (eventId: string, status: Event['status']) => void;
  onBulkAction: (action: string, eventIds: string[]) => void;
}

export default function EventsList({
  events,
  selectedEventIds,
  onEventSelect,
  onEventSelectAll,
  onStatusUpdate,
  onBulkAction
}: EventsListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 10;

  const totalPages = Math.ceil(events.length / eventsPerPage);
  const startIndex = (currentPage - 1) * eventsPerPage;
  const endIndex = startIndex + eventsPerPage;
  const currentEvents = events.slice(startIndex, endIndex);

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'confirmed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency: Event['urgency']) => {
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

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-800';
    if (confidence >= 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-AU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
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

  const isAllCurrentPageSelected = currentEvents.every(event => 
    selectedEventIds.includes(event.id)
  );

  const handleSelectAllCurrentPage = () => {
    const allSelected = isAllCurrentPageSelected;
    currentEvents.forEach(event => {
      onEventSelect(event.id);
    });
  };

  return (
    <div className="space-y-6">
      {/* Bulk Actions Bar */}
      {selectedEventIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-700">
                {selectedEventIds.length} event{selectedEventIds.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => onBulkAction('confirm', selectedEventIds)}
                  className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Mark Confirmed
                </button>
                <button
                  onClick={() => onBulkAction('complete', selectedEventIds)}
                  className="text-sm bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 transition-colors"
                >
                  Mark Completed
                </button>
                <button
                  onClick={() => onBulkAction('cancel', selectedEventIds)}
                  className="text-sm bg-gray-600 text-white px-3 py-1.5 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cancel Events
                </button>
              </div>
            </div>
            <button
              onClick={() => onBulkAction('clear', [])}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Events Table */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="w-12 p-4">
                  <input
                    type="checkbox"
                    checked={isAllCurrentPageSelected && currentEvents.length > 0}
                    onChange={handleSelectAllCurrentPage}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                </th>
                <th className="text-left p-4 font-medium text-foreground">Event</th>
                <th className="text-left p-4 font-medium text-foreground">Customer</th>
                <th className="text-left p-4 font-medium text-foreground">Date & Time</th>
                <th className="text-left p-4 font-medium text-foreground">Status</th>
                <th className="text-left p-4 font-medium text-foreground">Priority</th>
                <th className="text-left p-4 font-medium text-foreground">Confidence</th>
                <th className="text-right p-4 font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {currentEvents.map((event) => (
                <tr key={event.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedEventIds.includes(event.id)}
                      onChange={() => onEventSelect(event.id)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="font-medium text-foreground">{event.title}</div>
                      {event.location && (
                        <div className="text-sm text-muted-foreground flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                          </svg>
                          {event.location}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground capitalize">{event.industry}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="font-medium text-foreground">{event.customer.name}</div>
                      {event.customer.phone && (
                        <div className="text-sm text-muted-foreground">{event.customer.phone}</div>
                      )}
                      {event.customer.email && (
                        <div className="text-sm text-muted-foreground">{event.customer.email}</div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="font-medium text-foreground">{formatDate(event.date)}</div>
                      <div className="text-sm text-muted-foreground">{formatTime(event.time)}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <select
                      value={event.status}
                      onChange={(e) => onStatusUpdate(event.id, e.target.value as Event['status'])}
                      className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${getStatusColor(event.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center text-xs font-bold px-2 py-1 rounded-full ${getUrgencyColor(event.urgency)}`}>
                      {event.urgency.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${getConfidenceColor(event.confidence)}`}>
                      {Math.round(event.confidence * 100)}%
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Edit
                      </button>
                      <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                        Calendar
                      </button>
                      <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                        View Call
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-muted/30 px-4 py-3 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, events.length)} of {events.length} events
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-border rounded-md hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        page === currentPage
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-border hover:bg-muted/50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-border rounded-md hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}