'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { type IndustryConfiguration, getUrgencyLevelConfig } from '@/lib/industry/configurations';

interface EventType {
  id: string;
  name: string;
  label: string;
  color: string;
  duration: number;
  urgency: string;
  description: string;
  requiresLocation: boolean;
  enabled: boolean;
}

interface EventTypeCardProps {
  eventType: EventType;
  onEdit: (eventType: EventType) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function EventTypeCard({ eventType, onEdit, onToggle, onDelete }: EventTypeCardProps) {
  const urgencyConfig = getUrgencyLevelConfig(eventType.urgency);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        'relative bg-card border rounded-xl p-4 transition-all duration-200',
        eventType.enabled 
          ? 'border-border shadow-sm hover:shadow-md' 
          : 'border-border/50 opacity-60'
      )}
    >
      {/* Status Toggle */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <button
          onClick={() => onToggle(eventType.id)}
          className={cn(
            'relative w-10 h-5 rounded-full transition-colors duration-200',
            eventType.enabled ? 'bg-green-500' : 'bg-muted'
          )}
        >
          <div className={cn(
            'absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm',
            eventType.enabled ? 'transform translate-x-5' : 'translate-x-0.5'
          )} />
        </button>
      </div>

      {/* Color indicator */}
      <div 
        className="w-1 h-16 rounded-full absolute left-0 top-4"
        style={{ backgroundColor: eventType.color }}
      />

      <div className="pl-6 pr-12">
        {/* Header */}
        <div className="mb-3">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="text-lg font-semibold text-foreground">
              {eventType.label}
            </h4>
            <span className={cn(
              'px-2 py-1 rounded-full text-xs font-medium',
              eventType.urgency === 'emergency' ? 'bg-red-100 text-red-800' :
              eventType.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
              eventType.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            )}>
              {urgencyConfig.label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {eventType.description}
          </p>
        </div>

        {/* Details */}
        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
          <div className="space-y-1">
            <span className="text-muted-foreground">Duration</span>
            <p className="font-medium text-foreground">{eventType.duration} min</p>
          </div>
          
          <div className="space-y-1">
            <span className="text-muted-foreground">Location</span>
            <p className="font-medium text-foreground">
              {eventType.requiresLocation ? 'Required' : 'Optional'}
            </p>
          </div>
          
          <div className="space-y-1">
            <span className="text-muted-foreground">Priority</span>
            <div className="flex items-center space-x-1">
              <span 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: urgencyConfig.color }}
              />
              <span className="font-medium text-foreground text-xs">
                {urgencyConfig.responseTime}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => onEdit(eventType)}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            Edit
          </Button>
          
          <Button
            onClick={() => onDelete(eventType.id)}
            variant="outline"
            size="sm"
            className="text-xs text-red-600 border-red-200 hover:bg-red-50"
          >
            Delete
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

interface EventTypeModalProps {
  eventType: EventType | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventType: EventType) => void;
  urgencyLevels: string[];
}

function EventTypeModal({ eventType, isOpen, onClose, onSave, urgencyLevels }: EventTypeModalProps) {
  const [formData, setFormData] = useState<EventType>({
    id: '',
    name: '',
    label: '',
    color: '#6366f1',
    duration: 60,
    urgency: 'medium',
    description: '',
    requiresLocation: false,
    enabled: true
  });

  useEffect(() => {
    if (eventType) {
      setFormData(eventType);
    } else if (isOpen) {
      setFormData({
        id: Date.now().toString(),
        name: '',
        label: '',
        color: '#6366f1',
        duration: 60,
        urgency: 'medium',
        description: '',
        requiresLocation: false,
        enabled: true
      });
    }
  }, [eventType, isOpen]);

  const handleSave = () => {
    if (!formData.name.trim() || !formData.label.trim()) return;
    
    if (!eventType) {
      // Generate ID from name for new event types
      formData.id = formData.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }
    
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card rounded-xl shadow-xl max-w-lg w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold text-foreground mb-6">
          {eventType ? 'Edit Event Type' : 'Create Event Type'}
        </h3>

        <div className="space-y-4">
          {/* Name & Label */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Internal Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="service_call"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Display Label
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                placeholder="Service Call"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of this event type..."
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
            />
          </div>

          {/* Color & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                min="15"
                max="480"
                step="15"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Urgency */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Urgency Level
            </label>
            <select
              value={formData.urgency}
              onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              {urgencyLevels.map(level => {
                const config = getUrgencyLevelConfig(level);
                return (
                  <option key={level} value={level}>
                    {config.label} - {config.responseTime}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Options */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.requiresLocation}
                onChange={(e) => setFormData(prev => ({ ...prev, requiresLocation: e.target.checked }))}
                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
              />
              <span className="text-sm font-medium text-foreground">
                Requires Location
              </span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
              />
              <span className="text-sm font-medium text-foreground">
                Enabled by Default
              </span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 mt-6">
          <Button
            onClick={onClose}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!formData.name.trim() || !formData.label.trim()}
          >
            {eventType ? 'Update' : 'Create'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface EventTypesConfigurationProps {
  industry: IndustryConfiguration;
  onChange: () => void;
}

export default function EventTypesConfiguration({ industry, onChange }: EventTypesConfigurationProps) {
  // Initialize with some default event types based on industry
  const getDefaultEventTypes = (industry: IndustryConfiguration): EventType[] => {
    const baseTypes: EventType[] = [
      {
        id: 'service_call',
        name: 'service_call',
        label: industry.terminology.service_call || 'Service Call',
        color: industry.colors.primary,
        duration: industry.defaultDuration,
        urgency: 'medium',
        description: 'Standard service appointment or consultation',
        requiresLocation: industry.requiresLocation,
        enabled: true
      },
      {
        id: 'consultation',
        name: 'consultation',
        label: industry.terminology.consultation || 'Consultation',
        color: industry.colors.secondary,
        duration: industry.defaultDuration - 15,
        urgency: 'medium',
        description: 'Initial consultation or assessment',
        requiresLocation: false,
        enabled: true
      }
    ];

    // Add industry-specific types
    if (industry.id === 'plumbing') {
      baseTypes.push({
        id: 'emergency',
        name: 'emergency',
        label: 'Emergency Service',
        color: '#dc2626',
        duration: 120,
        urgency: 'emergency',
        description: 'Urgent repair requiring immediate attention',
        requiresLocation: true,
        enabled: true
      });
    } else if (industry.id === 'real_estate') {
      baseTypes.push({
        id: 'showing',
        name: 'showing',
        label: 'Property Showing',
        color: '#059669',
        duration: 30,
        urgency: 'medium',
        description: 'Property viewing appointment',
        requiresLocation: true,
        enabled: true
      });
    }

    return baseTypes;
  };

  const [eventTypes, setEventTypes] = useState<EventType[]>(() => getDefaultEventTypes(industry));
  const [editingEventType, setEditingEventType] = useState<EventType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateNew = () => {
    setEditingEventType(null);
    setIsModalOpen(true);
  };

  const handleEdit = (eventType: EventType) => {
    setEditingEventType(eventType);
    setIsModalOpen(true);
  };

  const handleSave = (eventType: EventType) => {
    setEventTypes(prev => {
      const exists = prev.find(et => et.id === eventType.id);
      if (exists) {
        return prev.map(et => et.id === eventType.id ? eventType : et);
      } else {
        return [...prev, eventType];
      }
    });
    onChange();
  };

  const handleToggle = (id: string) => {
    setEventTypes(prev => 
      prev.map(et => 
        et.id === id ? { ...et, enabled: !et.enabled } : et
      )
    );
    onChange();
  };

  const handleDelete = (id: string) => {
    setEventTypes(prev => prev.filter(et => et.id !== id));
    onChange();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">
            Event Types Configuration
          </h3>
          <p className="text-muted-foreground mt-1">
            Customize the types of appointments and events Flynn.ai can detect and create
          </p>
        </div>
        
        <Button onClick={handleCreateNew} className="flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add Event Type</span>
        </Button>
      </div>

      {/* Event Types Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnimatePresence>
          {eventTypes.map((eventType) => (
            <EventTypeCard
              key={eventType.id}
              eventType={eventType}
              onEdit={handleEdit}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </AnimatePresence>
      </div>

      {eventTypes.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-muted/30 rounded-xl border-2 border-dashed border-border"
        >
          <svg className="w-12 h-12 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <h4 className="text-lg font-medium text-foreground mb-2">
            No Event Types Configured
          </h4>
          <p className="text-muted-foreground mb-4">
            Create your first event type to get started with appointment detection
          </p>
          <Button onClick={handleCreateNew}>
            Create Event Type
          </Button>
        </motion.div>
      )}

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-muted/30 rounded-lg p-4"
      >
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-foreground">
              {eventTypes.length}
            </div>
            <div className="text-sm text-muted-foreground">
              Total Types
            </div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-green-600">
              {eventTypes.filter(et => et.enabled).length}
            </div>
            <div className="text-sm text-muted-foreground">
              Enabled
            </div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {eventTypes.filter(et => et.urgency === 'emergency' || et.urgency === 'high').length}
            </div>
            <div className="text-sm text-muted-foreground">
              High Priority
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        <EventTypeModal
          eventType={editingEventType}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          urgencyLevels={industry.urgencyLevels}
        />
      </AnimatePresence>
    </div>
  );
}