'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { type IndustryConfiguration } from '@/lib/industry/configurations';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  isDefault: boolean;
  category: 'call_summary' | 'event_confirmation' | 'follow_up' | 'emergency';
}

interface TemplateVariable {
  key: string;
  label: string;
  description: string;
  example: string;
  required: boolean;
}

const TEMPLATE_VARIABLES: TemplateVariable[] = [
  {
    key: '{{customer_name}}',
    label: 'Customer Name',
    description: 'Name of the person who called',
    example: 'John Smith',
    required: true,
  },
  {
    key: '{{customer_phone}}',
    label: 'Customer Phone',
    description: 'Phone number of the caller',
    example: '+61 4XX XXX XXX',
    required: false,
  },
  {
    key: '{{call_duration}}',
    label: 'Call Duration',
    description: 'Length of the phone call',
    example: '5 minutes 32 seconds',
    required: false,
  },
  {
    key: '{{appointment_type}}',
    label: 'Appointment Type',
    description: 'Type of appointment scheduled',
    example: 'Service Call',
    required: true,
  },
  {
    key: '{{appointment_date}}',
    label: 'Appointment Date',
    description: 'Scheduled date for the appointment',
    example: 'Tomorrow, March 15th',
    required: true,
  },
  {
    key: '{{appointment_time}}',
    label: 'Appointment Time',
    description: 'Scheduled time for the appointment',
    example: '2:00 PM',
    required: true,
  },
  {
    key: '{{location}}',
    label: 'Location',
    description: 'Address or location for the appointment',
    example: '123 Main Street, Sydney NSW',
    required: false,
  },
  {
    key: '{{urgency_level}}',
    label: 'Urgency Level',
    description: 'Priority level of the appointment',
    example: 'HIGH PRIORITY',
    required: false,
  },
  {
    key: '{{call_summary}}',
    label: 'Call Summary',
    description: 'AI-generated summary of the conversation',
    example: 'Customer reported a leaking faucet...',
    required: true,
  },
  {
    key: '{{company_name}}',
    label: 'Company Name',
    description: 'Your business name',
    example: 'Smith Plumbing Services',
    required: true,
  },
];

interface TemplateEditorProps {
  template: EmailTemplate;
  variables: TemplateVariable[];
  onSave: (template: EmailTemplate) => void;
  onCancel: () => void;
}

function TemplateEditor({
  template,
  variables,
  onSave,
  onCancel,
}: TemplateEditorProps) {
  const [editedTemplate, setEditedTemplate] = useState<EmailTemplate>(template);
  const [activeTab, setActiveTab] = useState<
    'design' | 'preview' | 'variables'
  >('design');
  const [insertVariable, setInsertVariable] = useState<string>('');

  const handleInsertVariable = (variable: string) => {
    if (activeTab === 'design') {
      const textarea = document.getElementById(
        'html-editor'
      ) as HTMLTextAreaElement;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent =
          editedTemplate.htmlContent.substring(0, start) +
          variable +
          editedTemplate.htmlContent.substring(end);

        setEditedTemplate((prev) => ({ ...prev, htmlContent: newContent }));

        // Focus back to textarea and position cursor
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(
            start + variable.length,
            start + variable.length
          );
        }, 10);
      }
    }
  };

  const generatePreview = () => {
    let preview = editedTemplate.htmlContent;

    // Replace variables with example data
    variables.forEach((variable) => {
      const regex = new RegExp(variable.key.replace(/[{}]/g, '\\$&'), 'g');
      preview = preview.replace(
        regex,
        `<span style="background: #fef3c7; padding: 2px 4px; border-radius: 4px; font-weight: 500;">${variable.example}</span>`
      );
    });

    return preview;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card rounded-xl shadow-xl max-w-6xl w-full h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h3 className="text-xl font-semibold text-foreground">
              Edit Template: {editedTemplate.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              Customize your email template with variables and styling
            </p>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
          >
            <svg
              className="w-5 h-5 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 py-3 border-b border-border bg-muted/20">
          <nav className="flex space-x-1">
            {[
              { id: 'design', label: 'Design', icon: '🎨' },
              { id: 'preview', label: 'Preview', icon: '👀' },
              { id: 'variables', label: 'Variables', icon: '🔧' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'design' && (
            <div className="h-full flex">
              {/* Editor */}
              <div className="flex-1 p-6 space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={editedTemplate.subject}
                    onChange={(e) =>
                      setEditedTemplate((prev) => ({
                        ...prev,
                        subject: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div className="space-y-2 flex-1">
                  <label className="block text-sm font-medium text-foreground">
                    HTML Content
                  </label>
                  <textarea
                    id="html-editor"
                    value={editedTemplate.htmlContent}
                    onChange={(e) =>
                      setEditedTemplate((prev) => ({
                        ...prev,
                        htmlContent: e.target.value,
                      }))
                    }
                    className="w-full h-96 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-mono text-sm resize-none"
                    placeholder="Enter your HTML template content here..."
                  />
                </div>
              </div>

              {/* Variable Sidebar */}
              <div className="w-80 bg-muted/20 border-l border-border p-4 space-y-4">
                <h4 className="font-medium text-foreground">
                  Available Variables
                </h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {variables.map((variable) => (
                    <button
                      key={variable.key}
                      onClick={() => handleInsertVariable(variable.key)}
                      className="w-full text-left p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">
                          {variable.label}
                        </span>
                        {variable.required && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                            Required
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">
                        {variable.description}
                      </div>
                      <div className="text-xs font-mono bg-muted px-2 py-1 rounded">
                        {variable.key}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="h-full p-6">
              <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="text-sm text-gray-600">Subject:</div>
                  <div className="font-medium">{editedTemplate.subject}</div>
                </div>
                <div
                  className="p-6 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: generatePreview() }}
                />
              </div>
            </div>
          )}

          {activeTab === 'variables' && (
            <div className="h-full p-6">
              <div className="max-w-4xl mx-auto">
                <h4 className="text-lg font-semibold text-foreground mb-4">
                  Template Variables Reference
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {variables.map((variable) => (
                    <div
                      key={variable.key}
                      className="bg-card border border-border rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground">
                          {variable.label}
                        </span>
                        {variable.required && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {variable.description}
                      </p>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">
                          Variable:
                        </div>
                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                          {variable.key}
                        </code>
                      </div>
                      <div className="space-y-1 mt-2">
                        <div className="text-xs text-muted-foreground">
                          Example:
                        </div>
                        <div className="text-sm text-foreground">
                          {variable.example}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <span>Use variables to personalize emails for each customer</span>
          </div>

          <div className="flex items-center space-x-3">
            <Button onClick={onCancel} variant="outline">
              Cancel
            </Button>
            <Button
              onClick={() => onSave(editedTemplate)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Save Template
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

interface TemplateCardProps {
  template: EmailTemplate;
  onEdit: (template: EmailTemplate) => void;
  onDuplicate: (template: EmailTemplate) => void;
  onDelete: (id: string) => void;
}

function TemplateCard({
  template,
  onEdit,
  onDuplicate,
  onDelete,
}: TemplateCardProps) {
  const getCategoryInfo = (category: string) => {
    const configs = {
      call_summary: { label: 'Call Summary', color: '#6366f1', icon: '📞' },
      event_confirmation: {
        label: 'Event Confirmation',
        color: '#10b981',
        icon: '✅',
      },
      follow_up: { label: 'Follow-up', color: '#f59e0b', icon: '📧' },
      emergency: { label: 'Emergency', color: '#dc2626', icon: '🚨' },
    };
    return (configs as any)[category] || configs.call_summary;
  };

  const categoryInfo = getCategoryInfo(template.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: categoryInfo.color }}
          />
          <h4 className="text-lg font-semibold text-foreground">
            {template.name}
          </h4>
          {template.isDefault && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Default
            </span>
          )}
        </div>

        <span className="text-xs text-muted-foreground">
          {categoryInfo.icon} {categoryInfo.label}
        </span>
      </div>

      {/* Subject Preview */}
      <div className="mb-4">
        <div className="text-xs text-muted-foreground mb-1">Subject Line:</div>
        <div className="text-sm text-foreground font-medium truncate">
          {template.subject}
        </div>
      </div>

      {/* Content Preview */}
      <div className="mb-4">
        <div className="text-xs text-muted-foreground mb-1">
          Content Preview:
        </div>
        <div className="text-sm text-muted-foreground line-clamp-3">
          {template.htmlContent.replace(/<[^>]*>/g, '').substring(0, 150)}...
        </div>
      </div>

      {/* Variables */}
      <div className="mb-4">
        <div className="text-xs text-muted-foreground mb-2">
          Variables Used: {template.variables.length}
        </div>
        <div className="flex flex-wrap gap-1">
          {template.variables.slice(0, 4).map((variable, index) => (
            <span
              key={index}
              className="text-xs bg-muted px-2 py-1 rounded font-mono"
            >
              {variable}
            </span>
          ))}
          {template.variables.length > 4 && (
            <span className="text-xs text-muted-foreground">
              +{template.variables.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2">
        <Button
          onClick={() => onEdit(template)}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          Edit
        </Button>

        <Button
          onClick={() => onDuplicate(template)}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          Duplicate
        </Button>

        <Button
          onClick={() => onDelete(template.id)}
          variant="outline"
          size="sm"
          className="text-red-600 border-red-200 hover:bg-red-50"
          disabled={template.isDefault}
        >
          Delete
        </Button>
      </div>
    </motion.div>
  );
}

interface EmailTemplateConfigurationProps {
  industry: IndustryConfiguration;
  onChange: () => void;
}

export default function EmailTemplateConfiguration({
  industry,
  onChange,
}: EmailTemplateConfigurationProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Initialize with default templates
  useEffect(() => {
    const defaultTemplates: EmailTemplate[] = [
      {
        id: 'default_call_summary',
        name: 'Default Call Summary',
        subject:
          '{{company_name}} - {{appointment_type}} Scheduled with {{customer_name}}',
        htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
  <div style="border-bottom: 3px solid ${industry.colors.primary}; padding-bottom: 20px; margin-bottom: 30px;">
    <h1 style="color: ${industry.colors.primary}; margin: 0; font-size: 24px;">{{company_name}}</h1>
    <p style="color: #666; margin: 5px 0 0 0;">{{appointment_type}} Summary</p>
  </div>

  <h2 style="color: #333; font-size: 20px; margin-bottom: 15px;">Hello {{customer_name}},</h2>
  
  <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
    Thank you for calling! We've scheduled your {{appointment_type}} and wanted to confirm the details with you.
  </p>

  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h3 style="color: #333; margin-top: 0;">Appointment Details</h3>
    <p><strong>Type:</strong> {{appointment_type}}</p>
    <p><strong>Date:</strong> {{appointment_date}}</p>
    <p><strong>Time:</strong> {{appointment_time}}</p>
    <p><strong>Location:</strong> {{location}}</p>
    <p><strong>Priority:</strong> {{urgency_level}}</p>
  </div>

  <div style="margin-bottom: 20px;">
    <h3 style="color: #333;">Call Summary</h3>
    <p style="color: #666; line-height: 1.6;">{{call_summary}}</p>
  </div>

  <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
    <p style="color: #999; font-size: 14px;">
      This email was generated automatically from your call with {{company_name}}
    </p>
  </div>
</div>`,
        textContent: 'Text version of the email...',
        variables: [
          '{{customer_name}}',
          '{{company_name}}',
          '{{appointment_type}}',
          '{{appointment_date}}',
          '{{appointment_time}}',
          '{{location}}',
          '{{urgency_level}}',
          '{{call_summary}}',
        ],
        isDefault: true,
        category: 'call_summary',
      },
      {
        id: 'emergency_template',
        name: 'Emergency Notification',
        subject: 'URGENT: {{appointment_type}} - {{customer_name}}',
        htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
  <div style="background-color: #dc2626; color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
    <h1 style="margin: 0; font-size: 20px;">🚨 EMERGENCY SERVICE REQUEST</h1>
  </div>

  <h2 style="color: #333; font-size: 20px; margin-bottom: 15px;">Urgent Request from {{customer_name}}</h2>
  
  <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin-bottom: 20px;">
    <p style="color: #991b1b; font-weight: bold; margin: 0;">
      Priority Level: {{urgency_level}}
    </p>
  </div>

  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h3 style="color: #333; margin-top: 0;">Emergency Details</h3>
    <p><strong>Customer:</strong> {{customer_name}}</p>
    <p><strong>Phone:</strong> {{customer_phone}}</p>
    <p><strong>Location:</strong> {{location}}</p>
    <p><strong>Requested Time:</strong> {{appointment_time}}</p>
  </div>

  <div style="margin-bottom: 20px;">
    <h3 style="color: #333;">Situation Description</h3>
    <p style="color: #666; line-height: 1.6;">{{call_summary}}</p>
  </div>
</div>`,
        textContent: 'Emergency text version...',
        variables: [
          '{{customer_name}}',
          '{{customer_phone}}',
          '{{appointment_type}}',
          '{{appointment_time}}',
          '{{location}}',
          '{{urgency_level}}',
          '{{call_summary}}',
        ],
        isDefault: false,
        category: 'emergency',
      },
    ];

    setTemplates(defaultTemplates);
  }, [industry]);

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
  };

  const handleSave = (updatedTemplate: EmailTemplate) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t))
    );
    setEditingTemplate(null);
    onChange();
  };

  const handleDuplicate = (template: EmailTemplate) => {
    const newTemplate: EmailTemplate = {
      ...template,
      id: `${template.id}_copy_${Date.now()}`,
      name: `${template.name} (Copy)`,
      isDefault: false,
    };
    setTemplates((prev) => [...prev, newTemplate]);
    onChange();
  };

  const handleDelete = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    onChange();
  };

  const handleCreateNew = () => {
    const newTemplate: EmailTemplate = {
      id: `custom_${Date.now()}`,
      name: 'Custom Template',
      subject: 'New Template Subject',
      htmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1>Your Custom Template</h1>
  <p>Start designing your email template here...</p>
</div>`,
      textContent: '',
      variables: [],
      isDefault: false,
      category: 'call_summary',
    };
    setEditingTemplate(newTemplate);
  };

  const filteredTemplates = templates.filter(
    (template) =>
      selectedCategory === 'all' || template.category === selectedCategory
  );

  const categories = [
    { id: 'all', label: 'All Templates', count: templates.length },
    {
      id: 'call_summary',
      label: 'Call Summary',
      count: templates.filter((t) => t.category === 'call_summary').length,
    },
    {
      id: 'event_confirmation',
      label: 'Confirmations',
      count: templates.filter((t) => t.category === 'event_confirmation')
        .length,
    },
    {
      id: 'follow_up',
      label: 'Follow-ups',
      count: templates.filter((t) => t.category === 'follow_up').length,
    },
    {
      id: 'emergency',
      label: 'Emergency',
      count: templates.filter((t) => t.category === 'emergency').length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">
            Email Template Configuration
          </h3>
          <p className="text-muted-foreground mt-1">
            Customize email templates to match your brand and communication
            style
          </p>
        </div>

        <Button
          onClick={handleCreateNew}
          className="flex items-center space-x-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <span>Create Template</span>
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex items-center space-x-1 bg-muted/30 rounded-lg p-1 w-fit">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md transition-colors',
              selectedCategory === category.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            {category.label}
            <span className="ml-1 text-xs opacity-60">({category.count})</span>
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
          ))}
        </AnimatePresence>
      </div>

      {filteredTemplates.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-muted/30 rounded-xl border-2 border-dashed border-border"
        >
          <svg
            className="w-12 h-12 text-muted-foreground mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <h4 className="text-lg font-medium text-foreground mb-2">
            No templates in this category
          </h4>
          <p className="text-muted-foreground mb-4">
            Create your first template to get started
          </p>
          <Button onClick={handleCreateNew}>Create Template</Button>
        </motion.div>
      )}

      {/* Template Editor Modal */}
      <AnimatePresence>
        {editingTemplate && (
          <TemplateEditor
            template={editingTemplate}
            variables={TEMPLATE_VARIABLES}
            onSave={handleSave}
            onCancel={() => setEditingTemplate(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
