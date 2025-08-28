'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import EventEditForm from '@/components/events/EventEditForm';

// Mock data - same as in events page
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

export default function EventEditPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Find the event by ID
    const foundEvent = mockEvents.find(e => e.id === eventId);
    setEvent(foundEvent || null);
    setLoading(false);
  }, [eventId]);

  const handleSave = async (eventData) => {
    setSaving(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Saving event:', eventData);
      
      // In a real app, you would make an API call here
      // await updateEvent(eventId, eventData);
      
      // Show success message (you could add toast notification here)
      console.log('Event saved successfully!');
      
      // Navigate back to events list
      router.push('/events');
    } catch (error) {
      console.error('Failed to save event:', error);
      // Handle error (show error message)
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/events');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
          <span className="text-muted-foreground font-medium">Loading event...</span>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="text-6xl">📅</div>
        <h2 className="text-2xl font-bold text-foreground">Event Not Found</h2>
        <p className="text-muted-foreground text-center max-w-md">
          The event you're looking for doesn't exist or may have been deleted.
        </p>
        <button
          onClick={() => router.push('/events')}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <div>
      <EventEditForm 
        event={event}
        onSave={handleSave}
        onCancel={handleCancel}
        loading={saving}
      />
    </div>
  );
}