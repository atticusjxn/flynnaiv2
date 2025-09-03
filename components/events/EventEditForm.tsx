'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';

// Event validation schema
const eventSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  customer: z.object({
    name: z
      .string()
      .min(1, 'Customer name is required')
      .max(100, 'Name must be less than 100 characters'),
    phone: z.string().optional(),
    email: z
      .string()
      .email('Invalid email format')
      .optional()
      .or(z.literal('')),
  }),
  location: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
  urgency: z.enum(['emergency', 'high', 'medium', 'low']),
  industry: z.string().min(1, 'Industry is required'),
  notes: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

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
  urgency: 'emergency' | 'high' | 'medium' | 'low';
  industry: string;
  confidence: number;
  extracted_at: string;
  call_id: string;
  notes?: string;
}

interface EventEditFormProps {
  event: Event;
  onSave: (eventData: EventFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

// Status options with colors and icons
const statusOptions = [
  {
    value: 'pending',
    label: 'Pending',
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    icon: '⏳',
  },
  {
    value: 'confirmed',
    label: 'Confirmed',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    icon: '✅',
  },
  {
    value: 'completed',
    label: 'Completed',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    icon: '✅',
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
    color: 'text-gray-600 bg-gray-50 border-gray-200',
    icon: '❌',
  },
] as const;

// Urgency options with colors
const urgencyOptions = [
  {
    value: 'emergency',
    label: 'Emergency',
    color: 'text-red-600 bg-red-50 border-red-200',
    icon: '🚨',
  },
  {
    value: 'high',
    label: 'High',
    color: 'text-orange-600 bg-orange-50 border-orange-200',
    icon: '🔥',
  },
  {
    value: 'medium',
    label: 'Medium',
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    icon: '⚠️',
  },
  {
    value: 'low',
    label: 'Low',
    color: 'text-green-600 bg-green-50 border-green-200',
    icon: '🟢',
  },
] as const;

// Industry options
const industryOptions = [
  { value: 'plumbing', label: 'Plumbing & HVAC' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'legal', label: 'Legal Services' },
  { value: 'medical', label: 'Medical Practice' },
  { value: 'sales', label: 'Sales & Business Dev' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'general_services', label: 'General Services' },
  { value: 'other', label: 'Other' },
];

export default function EventEditForm({
  event,
  onSave,
  onCancel,
  loading = false,
}: EventEditFormProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: event.title,
    date: event.date,
    time: event.time,
    customer: {
      name: event.customer.name,
      phone: event.customer.phone || '',
      email: event.customer.email || '',
    },
    location: event.location || '',
    status: event.status,
    urgency: event.urgency,
    industry: event.industry,
    notes: event.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate form data
  const validateForm = () => {
    try {
      eventSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Failed to save event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Format date for input
  const formatDateForInput = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return dateString;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] as any }}
      >
        {/* Enhanced backdrop with blur effect */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onCancel}
        />

        {/* Premium modal container */}
        <motion.div
          className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-border shadow-lg"
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] as any }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Glass morphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl" />

          {/* Premium Header with animations */}
          <motion.div
            className="relative px-8 py-6 border-b border-border/30"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <div className="flex items-center justify-between">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <h2 className="text-3xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  Edit Event
                </h2>
                <p className="text-muted-foreground mt-2 text-base font-medium">
                  Update event details and information
                </p>
              </motion.div>
              <motion.button
                onClick={onCancel}
                className="group p-3 hover:bg-destructive/10 rounded-xl transition-all duration-200 hover:scale-110 focus-ring"
                disabled={isSubmitting}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  className="w-6 h-6 text-muted-foreground group-hover:text-destructive transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </motion.button>
            </div>
          </motion.div>

          {/* Scrollable form container */}
          <div className="overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar">
            <motion.form
              id="event-edit-form"
              onSubmit={handleSubmit}
              className="p-8 space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {/* Premium Event Title Field */}
              <motion.div
                className="relative group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <div className="relative">
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-4 pt-6 pb-2 text-lg rounded-xl border-2 border-border bg-white dark:bg-gray-800 focus:border-primary focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 peer placeholder-transparent focus-ring"
                    placeholder="Enter event title..."
                    disabled={isSubmitting}
                    id="event-title"
                  />
                  <label
                    htmlFor="event-title"
                    className="absolute left-4 top-2 text-xs font-semibold text-muted-foreground transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-primary"
                  >
                    Event Title *
                  </label>
                  {/* Premium focus ring effect */}
                  <div className="absolute inset-0 rounded-xl border-2 border-primary/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
                {errors.title && (
                  <motion.p
                    className="text-destructive text-sm mt-2 flex items-center space-x-1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{errors.title}</span>
                  </motion.p>
                )}
              </motion.div>

              {/* Premium Date and Time Fields */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <div className="relative group">
                  <input
                    type="date"
                    value={formatDateForInput(formData.date)}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-4 pt-6 pb-2 text-lg rounded-xl border-2 border-border bg-white dark:bg-gray-800 focus:border-primary focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 focus-ring"
                    disabled={isSubmitting}
                    id="event-date"
                  />
                  <label
                    htmlFor="event-date"
                    className="absolute left-4 top-2 text-xs font-semibold text-muted-foreground transition-all duration-200"
                  >
                    Date *
                  </label>
                  <div className="absolute inset-0 rounded-xl border-2 border-primary/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  {errors.date && (
                    <motion.p
                      className="text-destructive text-sm mt-2 flex items-center space-x-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{errors.date}</span>
                    </motion.p>
                  )}
                </div>
                <div className="relative group">
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    className="w-full px-4 pt-6 pb-2 text-lg rounded-xl border-2 border-border bg-white dark:bg-gray-800 focus:border-primary focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 focus-ring"
                    disabled={isSubmitting}
                    id="event-time"
                  />
                  <label
                    htmlFor="event-time"
                    className="absolute left-4 top-2 text-xs font-semibold text-muted-foreground transition-all duration-200"
                  >
                    Time *
                  </label>
                  <div className="absolute inset-0 rounded-xl border-2 border-primary/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  {errors.time && (
                    <motion.p
                      className="text-destructive text-sm mt-2 flex items-center space-x-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{errors.time}</span>
                    </motion.p>
                  )}
                </div>
              </motion.div>

              {/* Premium Customer Information Section */}
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.3 }}
                >
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center space-x-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <svg
                        className="w-5 h-5 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                        />
                      </svg>
                    </div>
                    <span>Customer Information</span>
                  </h3>
                </motion.div>

                <div className="relative group">
                  <input
                    type="text"
                    value={formData.customer.name}
                    onChange={(e) =>
                      handleInputChange('customer.name', e.target.value)
                    }
                    className="w-full px-4 pt-6 pb-2 text-lg rounded-xl border-2 border-border bg-white dark:bg-gray-800 focus:border-primary focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 peer placeholder-transparent focus-ring"
                    placeholder="Enter customer name..."
                    disabled={isSubmitting}
                    id="customer-name"
                  />
                  <label
                    htmlFor="customer-name"
                    className="absolute left-4 top-2 text-xs font-semibold text-muted-foreground transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-primary"
                  >
                    Customer Name *
                  </label>
                  <div className="absolute inset-0 rounded-xl border-2 border-primary/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  {errors['customer.name'] && (
                    <motion.p
                      className="text-destructive text-sm mt-2 flex items-center space-x-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{errors['customer.name']}</span>
                    </motion.p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative group">
                    <input
                      type="tel"
                      value={formData.customer.phone}
                      onChange={(e) =>
                        handleInputChange('customer.phone', e.target.value)
                      }
                      className="w-full px-4 pt-6 pb-2 text-lg rounded-xl border-2 border-border bg-white dark:bg-gray-800 focus:border-primary focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 peer placeholder-transparent focus-ring"
                      placeholder="+1 (555) 123-4567"
                      disabled={isSubmitting}
                      id="customer-phone"
                    />
                    <label
                      htmlFor="customer-phone"
                      className="absolute left-4 top-2 text-xs font-semibold text-muted-foreground transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-primary"
                    >
                      Phone Number
                    </label>
                    <div className="absolute inset-0 rounded-xl border-2 border-primary/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    {errors['customer.phone'] && (
                      <motion.p
                        className="text-destructive text-sm mt-2 flex items-center space-x-1"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <svg
                          className="w-4 h-4 flex-shrink-0"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{errors['customer.phone']}</span>
                      </motion.p>
                    )}
                  </div>
                  <div className="relative group">
                    <input
                      type="email"
                      value={formData.customer.email}
                      onChange={(e) =>
                        handleInputChange('customer.email', e.target.value)
                      }
                      className="w-full px-4 pt-6 pb-2 text-lg rounded-xl border-2 border-border bg-white dark:bg-gray-800 focus:border-primary focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 peer placeholder-transparent focus-ring"
                      placeholder="customer@example.com"
                      disabled={isSubmitting}
                      id="customer-email"
                    />
                    <label
                      htmlFor="customer-email"
                      className="absolute left-4 top-2 text-xs font-semibold text-muted-foreground transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-primary"
                    >
                      Email Address
                    </label>
                    <div className="absolute inset-0 rounded-xl border-2 border-primary/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    {errors['customer.email'] && (
                      <motion.p
                        className="text-destructive text-sm mt-2 flex items-center space-x-1"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <svg
                          className="w-4 h-4 flex-shrink-0"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{errors['customer.email']}</span>
                      </motion.p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Premium Location Field */}
              <motion.div
                className="relative group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    handleInputChange('location', e.target.value)
                  }
                  className="w-full px-4 pt-6 pb-2 text-lg rounded-xl border-2 border-border bg-white dark:bg-gray-800 focus:border-primary focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 peer placeholder-transparent focus-ring"
                  placeholder="Enter location or address..."
                  disabled={isSubmitting}
                  id="event-location"
                />
                <label
                  htmlFor="event-location"
                  className="absolute left-4 top-2 text-xs font-semibold text-muted-foreground transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-primary"
                >
                  Location
                </label>
                <div className="absolute right-3 top-4 text-muted-foreground">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
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
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z"
                    />
                  </svg>
                </div>
                <div className="absolute inset-0 rounded-xl border-2 border-primary/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                {errors.location && (
                  <motion.p
                    className="text-destructive text-sm mt-2 flex items-center space-x-1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{errors.location}</span>
                  </motion.p>
                )}
              </motion.div>

              {/* Premium Status, Urgency, and Industry Fields */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.4 }}
              >
                <div className="relative group">
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      handleInputChange('status', e.target.value)
                    }
                    className="w-full px-4 pt-6 pb-2 text-lg rounded-xl border-2 border-border bg-white dark:bg-gray-800 focus:border-primary focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 focus-ring appearance-none cursor-pointer"
                    disabled={isSubmitting}
                    id="event-status"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <label
                    htmlFor="event-status"
                    className="absolute left-4 top-2 text-xs font-semibold text-muted-foreground transition-all duration-200"
                  >
                    Status *
                  </label>
                  <div className="absolute right-3 top-4 text-muted-foreground pointer-events-none">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </div>
                  <div className="absolute inset-0 rounded-xl border-2 border-primary/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  {errors.status && (
                    <motion.p
                      className="text-destructive text-sm mt-2 flex items-center space-x-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{errors.status}</span>
                    </motion.p>
                  )}
                </div>

                <div className="relative group">
                  <select
                    value={formData.urgency}
                    onChange={(e) =>
                      handleInputChange('urgency', e.target.value)
                    }
                    className="w-full px-4 pt-6 pb-2 text-lg rounded-xl border-2 border-border bg-white dark:bg-gray-800 focus:border-primary focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 focus-ring appearance-none cursor-pointer"
                    disabled={isSubmitting}
                    id="event-urgency"
                  >
                    {urgencyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <label
                    htmlFor="event-urgency"
                    className="absolute left-4 top-2 text-xs font-semibold text-muted-foreground transition-all duration-200"
                  >
                    Urgency *
                  </label>
                  <div className="absolute right-3 top-4 text-muted-foreground pointer-events-none">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </div>
                  <div className="absolute inset-0 rounded-xl border-2 border-primary/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  {errors.urgency && (
                    <motion.p
                      className="text-destructive text-sm mt-2 flex items-center space-x-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{errors.urgency}</span>
                    </motion.p>
                  )}
                </div>

                <div className="relative group">
                  <select
                    value={formData.industry}
                    onChange={(e) =>
                      handleInputChange('industry', e.target.value)
                    }
                    className="w-full px-4 pt-6 pb-2 text-lg rounded-xl border-2 border-border bg-white dark:bg-gray-800 focus:border-primary focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 focus-ring appearance-none cursor-pointer"
                    disabled={isSubmitting}
                    id="event-industry"
                  >
                    {industryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <label
                    htmlFor="event-industry"
                    className="absolute left-4 top-2 text-xs font-semibold text-muted-foreground transition-all duration-200"
                  >
                    Industry *
                  </label>
                  <div className="absolute right-3 top-4 text-muted-foreground pointer-events-none">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </div>
                  <div className="absolute inset-0 rounded-xl border-2 border-primary/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  {errors.industry && (
                    <motion.p
                      className="text-destructive text-sm mt-2 flex items-center space-x-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{errors.industry}</span>
                    </motion.p>
                  )}
                </div>
              </motion.div>

              {/* Premium Notes Section */}
              <motion.div
                className="relative group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.4 }}
              >
                <div className="relative">
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={5}
                    className="w-full px-4 pt-6 pb-2 text-lg rounded-xl border-2 border-border bg-white dark:bg-gray-800 focus:border-primary focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 resize-none peer placeholder-transparent focus-ring"
                    placeholder="Add any additional notes or details about this event..."
                    disabled={isSubmitting}
                    id="event-notes"
                  />
                  <label
                    htmlFor="event-notes"
                    className="absolute left-4 top-2 text-xs font-semibold text-muted-foreground transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-primary"
                  >
                    Notes
                  </label>
                  <div className="absolute right-3 top-3 text-muted-foreground">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                      />
                    </svg>
                  </div>
                  <div className="absolute inset-0 rounded-xl border-2 border-primary/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
                {errors.notes && (
                  <motion.p
                    className="text-destructive text-sm mt-2 flex items-center space-x-1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{errors.notes}</span>
                  </motion.p>
                )}
                <motion.p
                  className="text-xs text-muted-foreground mt-2 flex items-center space-x-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.3 }}
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                    />
                  </svg>
                  <span>
                    Add details, special instructions, or any relevant
                    information
                  </span>
                </motion.p>
              </motion.div>
            </motion.form>
          </div>

          {/* Premium Form Actions */}
          <motion.div
            className="relative px-8 py-6 border-t border-border/30 bg-gray-50 dark:bg-gray-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.4 }}
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                type="submit"
                form="event-edit-form"
                disabled={isSubmitting || loading}
                className="group relative flex-1 overflow-hidden bg-gradient-to-r from-primary to-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl focus:ring-4 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] touch-target"
                onClick={handleSubmit}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.3 }}
              >
                {/* Button glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {isSubmitting || loading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <motion.div
                      className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                    <span>Saving Changes...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                    <span>Save Changes</span>
                  </div>
                )}
              </motion.button>

              <motion.button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="group relative flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-8 py-4 rounded-xl font-bold text-lg border-2 border-border hover:border-border/50 focus:ring-4 focus:ring-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] touch-target"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.3 }}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <span>Cancel</span>
                </div>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
