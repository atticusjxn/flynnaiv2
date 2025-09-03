import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EventsList from '@/components/events/EventsList';
import { TestDataFactory } from '@/lib/testing/factories';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/events',
}));

// Mock Supabase hooks
jest.mock('@/hooks/useRealtime', () => ({
  useRealtime: () => ({
    isConnected: true,
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
  }),
}));

describe('EventsList Component', () => {
  const mockEvents = [
    TestDataFactory.createEvent({
      id: 'event-1',
      title: 'Kitchen Sink Repair',
      event_type: 'service_call',
      status: 'pending',
      urgency_level: 'medium',
      proposed_datetime: '2025-01-16T14:00:00Z',
      location: '123 Main Street',
      customer_name: 'John Doe',
    }),
    TestDataFactory.createEvent({
      id: 'event-2',
      title: 'Emergency Plumbing',
      event_type: 'emergency',
      status: 'confirmed',
      urgency_level: 'emergency',
      proposed_datetime: '2025-01-15T11:00:00Z',
      location: '456 Emergency Ave',
      customer_name: 'Jane Smith',
    }),
  ];

  const defaultProps = {
    events: mockEvents,
    loading: false,
    onStatusChange: jest.fn(),
    onBulkAction: jest.fn(),
    selectedEvents: [],
    onSelectEvent: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render events list correctly', () => {
    render(<EventsList {...defaultProps} />);

    expect(screen.getByText('Kitchen Sink Repair')).toBeInTheDocument();
    expect(screen.getByText('Emergency Plumbing')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('should display urgency badges correctly', () => {
    render(<EventsList {...defaultProps} />);

    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Emergency')).toBeInTheDocument();
  });

  it('should handle event status changes', async () => {
    const onStatusChange = jest.fn();

    render(<EventsList {...defaultProps} onStatusChange={onStatusChange} />);

    const statusButton = screen.getAllByRole('button')[0]; // First status button
    fireEvent.click(statusButton);

    await waitFor(() => {
      expect(onStatusChange).toHaveBeenCalledWith(
        'event-1',
        expect.any(String)
      );
    });
  });

  it('should handle event selection for bulk actions', () => {
    const onSelectEvent = jest.fn();

    render(<EventsList {...defaultProps} onSelectEvent={onSelectEvent} />);

    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);

    expect(onSelectEvent).toHaveBeenCalledWith('event-1');
  });

  it('should show loading state', () => {
    render(<EventsList {...defaultProps} loading={true} events={[]} />);

    expect(screen.getByText('Loading events...')).toBeInTheDocument();
  });

  it('should show empty state when no events', () => {
    render(<EventsList {...defaultProps} events={[]} />);

    expect(screen.getByText('No events found')).toBeInTheDocument();
  });

  it('should filter events by status', () => {
    const pendingEvents = mockEvents.filter(
      (event) => event.status === 'pending'
    );

    render(<EventsList {...defaultProps} events={pendingEvents} />);

    expect(screen.getByText('Kitchen Sink Repair')).toBeInTheDocument();
    expect(screen.queryByText('Emergency Plumbing')).not.toBeInTheDocument();
  });

  it('should sort events by urgency level', () => {
    render(<EventsList {...defaultProps} />);

    const eventElements = screen.getAllByTestId('event-card');

    // Emergency events should appear first
    expect(eventElements[0]).toHaveTextContent('Emergency Plumbing');
    expect(eventElements[1]).toHaveTextContent('Kitchen Sink Repair');
  });

  it('should handle bulk actions', async () => {
    const onBulkAction = jest.fn();
    const selectedEvents = ['event-1', 'event-2'];

    render(
      <EventsList
        {...defaultProps}
        selectedEvents={selectedEvents}
        onBulkAction={onBulkAction}
      />
    );

    const bulkActionButton = screen.getByText('Confirm Selected');
    fireEvent.click(bulkActionButton);

    await waitFor(() => {
      expect(onBulkAction).toHaveBeenCalledWith('confirm', selectedEvents);
    });
  });

  it('should display event details on click', async () => {
    render(<EventsList {...defaultProps} />);

    const eventCard = screen.getByTestId('event-card-event-1');
    fireEvent.click(eventCard);

    // Should show expanded details
    await waitFor(() => {
      expect(screen.getByText('123 Main Street')).toBeInTheDocument();
      expect(screen.getByText('service_call')).toBeInTheDocument();
    });
  });

  it('should handle real-time updates', () => {
    const { rerender } = render(<EventsList {...defaultProps} />);

    // Simulate real-time event update
    const updatedEvents = [
      {
        ...mockEvents[0],
        status: 'confirmed',
      },
      mockEvents[1],
    ];

    rerender(<EventsList {...defaultProps} events={updatedEvents} />);

    expect(screen.getByText('Confirmed')).toBeInTheDocument();
  });
});
