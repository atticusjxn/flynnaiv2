'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@nextui-org/card';
import { Button } from '@nextui-org/button';
import { Link } from '@nextui-org/link';
import { Chip } from '@nextui-org/chip';
import { Select, SelectItem } from '@nextui-org/select';
import { 
  PlusIcon, 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Database } from '@/types/database.types';

type SupportTicket = Database['public']['Tables']['support_tickets']['Row'];

const statusColors = {
  open: 'primary',
  in_progress: 'warning',
  waiting_for_user: 'secondary',
  resolved: 'success',
  closed: 'default',
} as const;

const statusIcons = {
  open: ClockIcon,
  in_progress: ExclamationTriangleIcon,
  waiting_for_user: ClockIcon,
  resolved: CheckCircleIcon,
  closed: XCircleIcon,
};

const priorityColors = {
  low: 'default',
  medium: 'primary',
  high: 'warning',
  urgent: 'danger',
} as const;

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await fetch(`/api/support/tickets?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setTickets(data.tickets);
        setError('');
      } else {
        setError(data.error || 'Failed to fetch tickets');
      }
    } catch (err) {
      setError('Failed to fetch tickets');
      console.error('Error fetching tickets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getCategoryLabel = (category: string) => {
    return category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card>
          <CardBody className="text-center py-12">
            <XCircleIcon className="h-12 w-12 text-danger mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-danger mb-2">Error Loading Tickets</h3>
            <p className="text-default-600 mb-4">{error}</p>
            <Button color="primary" onClick={fetchTickets}>
              Try Again
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Support Tickets</h1>
          <p className="text-default-600">Track your support requests and get help</p>
        </div>
        <Button
          as={Link}
          href="/support/tickets/new"
          color="primary"
          startContent={<PlusIcon className="h-4 w-4" />}
        >
          New Ticket
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-64">
              <Select
                label="Filter by Status"
                placeholder="All tickets"
                selectedKeys={statusFilter ? [statusFilter] : []}
                onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0] as string || '')}
              >
                <SelectItem key="open" value="open">Open</SelectItem>
                <SelectItem key="in_progress" value="in_progress">In Progress</SelectItem>
                <SelectItem key="waiting_for_user" value="waiting_for_user">Waiting for You</SelectItem>
                <SelectItem key="resolved" value="resolved">Resolved</SelectItem>
                <SelectItem key="closed" value="closed">Closed</SelectItem>
              </Select>
            </div>
            {statusFilter && (
              <Button
                variant="flat"
                onClick={() => setStatusFilter('')}
              >
                Clear Filter
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Tickets List */}
      {isLoading ? (
        <Card>
          <CardBody className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-default-600">Loading tickets...</p>
          </CardBody>
        </Card>
      ) : tickets.length > 0 ? (
        <div className="space-y-4">
          {tickets.map((ticket) => {
            const StatusIcon = statusIcons[ticket.status as keyof typeof statusIcons];
            
            return (
              <Card 
                key={ticket.id} 
                isPressable
                as={Link}
                href={`/support/tickets/${ticket.id}`}
                className="hover:shadow-lg transition-shadow"
              >
                <CardBody className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <StatusIcon className="h-6 w-6 text-default-400" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-foreground truncate">
                          {ticket.subject}
                        </h3>
                        <div className="flex gap-2">
                          <Chip
                            color={statusColors[ticket.status as keyof typeof statusColors]}
                            size="sm"
                            variant="flat"
                          >
                            {getStatusLabel(ticket.status)}
                          </Chip>
                          <Chip
                            color={priorityColors[ticket.priority as keyof typeof priorityColors]}
                            size="sm"
                            variant="bordered"
                          >
                            {ticket.priority.toUpperCase()}
                          </Chip>
                        </div>
                      </div>
                      
                      <p className="text-default-600 text-sm line-clamp-2 mb-3">
                        {ticket.description}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-default-500">
                        <div className="flex items-center gap-4">
                          <span>
                            <strong>Category:</strong> {getCategoryLabel(ticket.category)}
                          </span>
                          <span>
                            <strong>Created:</strong> {formatDate(ticket.created_at)}
                          </span>
                        </div>
                        
                        {ticket.updated_at !== ticket.created_at && (
                          <span>
                            <strong>Updated:</strong> {formatDate(ticket.updated_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardBody className="text-center py-12">
            <ClockIcon className="h-12 w-12 text-default-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-default-600 mb-2">
              No support tickets found
            </h3>
            <p className="text-default-500 mb-6">
              {statusFilter 
                ? `No tickets with status "${getStatusLabel(statusFilter)}" found.`
                : "You haven't submitted any support tickets yet."
              }
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                as={Link}
                href="/support/tickets/new"
                color="primary"
                startContent={<PlusIcon className="h-4 w-4" />}
              >
                Submit New Ticket
              </Button>
              <Button
                as={Link}
                href="/support"
                variant="bordered"
              >
                Browse Help Articles
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}