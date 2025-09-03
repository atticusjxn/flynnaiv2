'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader } from '@nextui-org/card';
import { Input, Textarea } from '@nextui-org/input';
import { Button } from '@nextui-org/button';
import { Select, SelectItem } from '@nextui-org/select';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@nextui-org/modal';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { z } from 'zod';

const CreateTicketSchema = z.object({
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(255, 'Subject too long'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description too long'),
  category: z.enum([
    'technical',
    'billing',
    'feature-request',
    'bug-report',
    'account',
    'general',
  ]),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
});

const categories = [
  {
    key: 'technical',
    label: 'Technical Support',
    description:
      'Issues with call processing, AI accuracy, or system functionality',
  },
  {
    key: 'billing',
    label: 'Billing & Subscriptions',
    description: 'Questions about pricing, invoices, or subscription changes',
  },
  {
    key: 'feature-request',
    label: 'Feature Request',
    description: 'Suggest new features or improvements',
  },
  {
    key: 'bug-report',
    label: 'Bug Report',
    description: 'Report errors, crashes, or unexpected behavior',
  },
  {
    key: 'account',
    label: 'Account Management',
    description: 'Account settings, security, or access issues',
  },
  {
    key: 'general',
    label: 'General Inquiry',
    description: 'General questions or feedback',
  },
];

const priorities = [
  {
    key: 'low',
    label: 'Low',
    description: 'General questions or minor issues',
  },
  { key: 'medium', label: 'Medium', description: 'Standard support requests' },
  {
    key: 'high',
    label: 'High',
    description: 'Urgent issues affecting your business',
  },
  {
    key: 'urgent',
    label: 'Urgent',
    description: 'Critical system failures or emergencies',
  },
];

interface SupportTicketFormProps {
  onSuccess?: (ticketId: string) => void;
}

export default function SupportTicketForm({
  onSuccess,
}: SupportTicketFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: '',
    priority: 'medium',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate form data
      const validatedData = CreateTicketSchema.parse(formData);
      setErrors({});
      setIsSubmitting(true);

      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details) {
          // Handle Zod validation errors
          const fieldErrors: Record<string, string> = {};
          data.details.forEach((error: any) => {
            if (error.path && error.path.length > 0) {
              fieldErrors[error.path[0]] = error.message;
            }
          });
          setErrors(fieldErrors);
        } else {
          setErrors({ submit: data.error || 'Failed to create ticket' });
        }
        return;
      }

      // Success
      setCreatedTicketId(data.ticket.id);
      setShowSuccess(true);
      setFormData({
        subject: '',
        description: '',
        category: '',
        priority: 'medium',
      });

      if (onSuccess) {
        onSuccess(data.ticket.id);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path && err.path.length > 0) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ submit: 'An unexpected error occurred' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const selectedCategory = categories.find((c) => c.key === formData.category);
  const selectedPriority = priorities.find((p) => p.key === formData.priority);

  return (
    <>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold">Submit a Support Request</h2>
            <p className="text-small text-default-600">
              We'll get back to you within 24 hours
            </p>
          </div>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                label="Subject"
                placeholder="Brief description of your issue"
                value={formData.subject}
                onValueChange={(value) => handleInputChange('subject', value)}
                isInvalid={!!errors.subject}
                errorMessage={errors.subject}
                isRequired
              />
            </div>

            <div>
              <Select
                label="Category"
                placeholder="Select a category"
                selectedKeys={formData.category ? [formData.category] : []}
                onSelectionChange={(keys) =>
                  handleInputChange(
                    'category',
                    (Array.from(keys)[0] as string) || ''
                  )
                }
                isInvalid={!!errors.category}
                errorMessage={errors.category}
                isRequired
              >
                {categories.map((category) => (
                  <SelectItem
                    key={category.key}
                    value={category.key}
                    description={category.description}
                  >
                    {category.label}
                  </SelectItem>
                ))}
              </Select>
              {selectedCategory && (
                <p className="text-xs text-default-600 mt-1">
                  {selectedCategory.description}
                </p>
              )}
            </div>

            <div>
              <Select
                label="Priority"
                placeholder="Select priority level"
                selectedKeys={[formData.priority]}
                onSelectionChange={(keys) =>
                  handleInputChange(
                    'priority',
                    (Array.from(keys)[0] as string) || 'medium'
                  )
                }
                isInvalid={!!errors.priority}
                errorMessage={errors.priority}
              >
                {priorities.map((priority) => (
                  <SelectItem
                    key={priority.key}
                    value={priority.key}
                    description={priority.description}
                  >
                    {priority.label}
                  </SelectItem>
                ))}
              </Select>
              {selectedPriority && (
                <p className="text-xs text-default-600 mt-1">
                  {selectedPriority.description}
                </p>
              )}
            </div>

            <div>
              <Textarea
                label="Description"
                placeholder="Please provide detailed information about your issue..."
                minRows={6}
                maxRows={10}
                value={formData.description}
                onValueChange={(value) =>
                  handleInputChange('description', value)
                }
                isInvalid={!!errors.description}
                errorMessage={errors.description}
                isRequired
              />
              <div className="flex justify-between text-xs text-default-500 mt-1">
                <span>Minimum 10 characters</span>
                <span>{formData.description.length}/5000</span>
              </div>
            </div>

            {errors.submit && (
              <div className="text-danger text-sm">{errors.submit}</div>
            )}

            <div className="flex gap-3">
              <Button
                color="primary"
                type="submit"
                isLoading={isSubmitting}
                isDisabled={
                  !formData.subject ||
                  !formData.description ||
                  !formData.category
                }
                className="flex-1"
              >
                Submit Ticket
              </Button>
              <Button
                variant="bordered"
                type="button"
                onClick={() =>
                  setFormData({
                    subject: '',
                    description: '',
                    category: '',
                    priority: 'medium',
                  })
                }
              >
                Reset
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-6 w-6 text-success" />
              Ticket Created Successfully
            </div>
          </ModalHeader>
          <ModalBody className="pb-6">
            <div className="text-center space-y-4">
              <p className="text-default-600">
                Your support ticket has been submitted successfully. We'll get
                back to you soon!
              </p>
              <div className="bg-default-100 p-3 rounded-lg">
                <p className="text-sm">
                  <strong>Ticket ID:</strong> {createdTicketId}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  color="primary"
                  onPress={() => {
                    setShowSuccess(false);
                    router.push(`/support/tickets/${createdTicketId}`);
                  }}
                  className="flex-1"
                >
                  View Ticket
                </Button>
                <Button
                  variant="bordered"
                  onPress={() => setShowSuccess(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
