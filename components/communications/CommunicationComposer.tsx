// Flynn.ai v2 - Communication Composer
// S-tier communication composer with template support and premium UX

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Textarea,
  Button,
  Select,
  SelectItem,
  Chip,
  Tabs,
  Tab,
  Switch,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Divider,
  Progress,
  Avatar
} from '@nextui-org/react';
import {
  Send,
  Mail,
  MessageSquare,
  Phone,
  Template,
  Users,
  Clock,
  Eye,
  Save,
  X,
  Plus,
  Calendar,
  User,
  CheckCircle2,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { useSendCommunication } from '@/hooks/useCommunications';

interface CommunicationData {
  eventId?: string;
  callId?: string;
  communicationType: 'email' | 'sms' | 'call';
  recipient: string;
  subject?: string;
  content: string;
}

interface Template {
  id: string;
  name: string;
  type: 'email' | 'sms';
  subject?: string;
  content: string;
  variables: string[];
  industry?: string;
}

// Mock templates - in production these would come from your database
const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Service Confirmation',
    type: 'email',
    subject: 'Service Appointment Confirmation - {{customerName}}',
    content: `Hi {{customerName}},

Thank you for scheduling a service appointment with us. Here are the details:

Service Type: {{serviceType}}
Date & Time: {{appointmentDate}}
Location: {{serviceAddress}}
Estimated Duration: {{duration}}

Our technician will arrive within the scheduled window. If you have any questions or need to reschedule, please don't hesitate to contact us.

Best regards,
{{companyName}}`,
    variables: ['customerName', 'serviceType', 'appointmentDate', 'serviceAddress', 'duration', 'companyName'],
    industry: 'plumbing'
  },
  {
    id: '2',
    name: 'SMS Reminder',
    type: 'sms',
    content: 'Hi {{customerName}}! Reminder: Your {{serviceType}} appointment is scheduled for {{appointmentTime}} at {{serviceAddress}}. Reply CONFIRM to acknowledge.',
    variables: ['customerName', 'serviceType', 'appointmentTime', 'serviceAddress']
  },
  {
    id: '3',
    name: 'Property Showing Confirmation',
    type: 'email',
    subject: 'Property Showing Confirmed - {{propertyAddress}}',
    content: `Hello {{clientName}},

Your property showing has been confirmed for:

Property: {{propertyAddress}}
Date & Time: {{showingDate}}
Duration: {{duration}}
Agent: {{agentName}}

Please bring a valid ID and arrive 5 minutes early. If you have any questions, feel free to call us.

Best regards,
{{companyName}} Real Estate`,
    variables: ['clientName', 'propertyAddress', 'showingDate', 'duration', 'agentName', 'companyName'],
    industry: 'real_estate'
  }
];

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export default function CommunicationComposer() {
  // State management
  const [communicationType, setCommunicationType] = useState<'email' | 'sms' | 'call'>('email');
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  const [scheduleForLater, setScheduleForLater] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  
  // Modals
  const { isOpen: isTemplateModalOpen, onOpen: onTemplateModalOpen, onClose: onTemplateModalClose } = useDisclosure();
  const { isOpen: isPreviewModalOpen, onOpen: onPreviewModalOpen, onClose: onPreviewModalClose } = useDisclosure();
  
  // Hooks
  const { sendCommunication, loading, error } = useSendCommunication();

  // Filter templates based on communication type
  const availableTemplates = mockTemplates.filter(template => template.type === communicationType);

  // Handle template selection
  const handleTemplateSelect = useCallback((template: Template) => {
    setSelectedTemplate(template);
    if (template.subject) {
      setSubject(template.subject);
    }
    setContent(template.content);
    
    // Initialize template variables
    const variables: Record<string, string> = {};
    template.variables.forEach(variable => {
      variables[variable] = '';
    });
    setTemplateVariables(variables);
    
    onTemplateModalClose();
  }, [onTemplateModalClose]);

  // Process template variables
  const processedContent = useMemo(() => {
    if (!selectedTemplate) return content;
    
    let processed = content;
    Object.entries(templateVariables).forEach(([key, value]) => {
      processed = processed.replace(new RegExp(`{{${key}}}`, 'g'), value || `{{${key}}}`);
    });
    return processed;
  }, [content, selectedTemplate, templateVariables]);

  const processedSubject = useMemo(() => {
    if (!selectedTemplate || !subject) return subject;
    
    let processed = subject;
    Object.entries(templateVariables).forEach(([key, value]) => {
      processed = processed.replace(new RegExp(`{{${key}}}`, 'g'), value || `{{${key}}}`);
    });
    return processed;
  }, [subject, selectedTemplate, templateVariables]);

  // Validation
  const isValid = recipient && content && (communicationType === 'sms' || subject);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!isValid) return;

    try {
      const communicationData: CommunicationData = {
        communicationType,
        recipient,
        content: processedContent,
        ...(communicationType === 'email' && { subject: processedSubject })
      };

      await sendCommunication(communicationData);
      
      // Reset form on success
      setRecipient('');
      setSubject('');
      setContent('');
      setSelectedTemplate(null);
      setTemplateVariables({});
      setScheduleForLater(false);
      setScheduledDate('');
    } catch (error) {
      console.error('Failed to send communication:', error);
    }
  }, [isValid, communicationType, recipient, processedContent, processedSubject, sendCommunication]);

  const handlePreview = useCallback(() => {
    setPreviewMode(true);
    onPreviewModalOpen();
  }, [onPreviewModalOpen]);

  const resetForm = useCallback(() => {
    setRecipient('');
    setSubject('');
    setContent('');
    setSelectedTemplate(null);
    setTemplateVariables({});
    setScheduleForLater(false);
    setScheduledDate('');
  }, []);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40">
                  <Send className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold">Compose Communication</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="flat"
                  color="primary"
                  startContent={<Template />}
                  onPress={onTemplateModalOpen}
                >
                  Templates
                </Button>
                <Button
                  size="sm"
                  variant="flat"
                  color="default"
                  startContent={<X />}
                  onPress={resetForm}
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardBody className="space-y-6">
            {/* Communication Type Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Communication Type
              </label>
              <Tabs
                selectedKey={communicationType}
                onSelectionChange={(key) => setCommunicationType(key as 'email' | 'sms' | 'call')}
                variant="bordered"
                color="primary"
                classNames={{
                  tabList: "bg-white/50 dark:bg-slate-800/50",
                  tab: "data-[selected=true]:bg-primary data-[selected=true]:text-white"
                }}
              >
                <Tab
                  key="email"
                  title={
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                  }
                />
                <Tab
                  key="sms"
                  title={
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      SMS
                    </div>
                  }
                />
                <Tab
                  key="call"
                  title={
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Call
                    </div>
                  }
                />
              </Tabs>
            </div>

            {/* Recipient */}
            <Input
              label="Recipient"
              placeholder={
                communicationType === 'email' 
                  ? "customer@example.com" 
                  : communicationType === 'sms' 
                  ? "+1 (555) 123-4567"
                  : "+1 (555) 123-4567"
              }
              value={recipient}
              onValueChange={setRecipient}
              variant="bordered"
              startContent={<User className="h-4 w-4 text-slate-400" />}
              className="max-w-md"
              isRequired
            />

            {/* Subject (Email only) */}
            {communicationType === 'email' && (
              <Input
                label="Subject"
                placeholder="Enter email subject..."
                value={subject}
                onValueChange={setSubject}
                variant="bordered"
                isRequired
              />
            )}

            {/* Template Variables (if template selected) */}
            {selectedTemplate && selectedTemplate.variables.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary-500" />
                  <h3 className="text-lg font-semibold">Template Variables</h3>
                  <Chip size="sm" color="primary" variant="flat">
                    {selectedTemplate.name}
                  </Chip>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                  {selectedTemplate.variables.map((variable) => (
                    <Input
                      key={variable}
                      label={variable.charAt(0).toUpperCase() + variable.slice(1)}
                      placeholder={`Enter ${variable}...`}
                      value={templateVariables[variable] || ''}
                      onValueChange={(value) => 
                        setTemplateVariables(prev => ({ ...prev, [variable]: value }))
                      }
                      variant="bordered"
                      size="sm"
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Content */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {communicationType === 'sms' ? 'Message' : 'Content'}
                </label>
                <div className="flex items-center gap-2">
                  {communicationType === 'sms' && (
                    <Chip 
                      size="sm" 
                      color={processedContent.length > 160 ? "danger" : "success"}
                      variant="flat"
                    >
                      {processedContent.length}/160 chars
                    </Chip>
                  )}
                  <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    startContent={<Eye />}
                    onPress={handlePreview}
                    isDisabled={!content}
                  >
                    Preview
                  </Button>
                </div>
              </div>
              
              <Textarea
                placeholder={
                  communicationType === 'sms'
                    ? "Enter your SMS message..."
                    : "Enter your email content..."
                }
                value={content}
                onValueChange={setContent}
                variant="bordered"
                minRows={communicationType === 'sms' ? 3 : 8}
                maxRows={communicationType === 'sms' ? 6 : 15}
                isRequired
              />
              
              {communicationType === 'sms' && processedContent.length > 160 && (
                <p className="text-sm text-danger-500 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  SMS messages over 160 characters may be split into multiple messages
                </p>
              )}
            </div>

            {/* Schedule for Later */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Schedule for later
                  </span>
                </div>
                <Switch
                  isSelected={scheduleForLater}
                  onValueChange={setScheduleForLater}
                  color="primary"
                  size="sm"
                />
              </div>
              
              {scheduleForLater && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Input
                    type="datetime-local"
                    label="Scheduled Date & Time"
                    value={scheduledDate}
                    onValueChange={setScheduledDate}
                    variant="bordered"
                    className="max-w-md"
                    isRequired={scheduleForLater}
                  />
                </motion.div>
              )}
            </div>

            <Divider />

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {error && (
                  <div className="flex items-center gap-2 text-danger-500">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="flat"
                  color="default"
                  startContent={<Save />}
                >
                  Save Draft
                </Button>
                
                <Button
                  color="primary"
                  startContent={<Send />}
                  onPress={handleSubmit}
                  isLoading={loading}
                  isDisabled={!isValid}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 font-semibold"
                >
                  {scheduleForLater ? 'Schedule' : 'Send Now'}
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Template Selection Modal */}
      <TemplateSelectionModal
        isOpen={isTemplateModalOpen}
        onClose={onTemplateModalClose}
        templates={availableTemplates}
        onSelect={handleTemplateSelect}
        communicationType={communicationType}
      />

      {/* Preview Modal */}
      <PreviewModal
        isOpen={isPreviewModalOpen}
        onClose={onPreviewModalClose}
        communicationType={communicationType}
        recipient={recipient}
        subject={processedSubject}
        content={processedContent}
      />
    </motion.div>
  );
}

// Template Selection Modal
function TemplateSelectionModal({
  isOpen,
  onClose,
  templates,
  onSelect,
  communicationType
}: {
  isOpen: boolean;
  onClose: () => void;
  templates: Template[];
  onSelect: (template: Template) => void;
  communicationType: string;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        base: "bg-white dark:bg-slate-800",
        backdrop: "bg-gradient-to-t from-zinc-900/60 to-zinc-900/20 backdrop-blur-sm"
      }}
    >
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center gap-3">
            <Template className="h-6 w-6 text-primary-500" />
            <div>
              <h2 className="text-lg font-semibold">Select Template</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-normal">
                Choose a {communicationType} template to get started
              </p>
            </div>
          </div>
        </ModalHeader>
        
        <ModalBody className="py-6">
          {templates.length === 0 ? (
            <div className="text-center py-12">
              <Template className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">
                No templates available for {communicationType}
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                Create custom templates to speed up your workflow
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {templates.map((template) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600"
                    onPress={() => onSelect(template)}
                  >
                    <CardBody className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg">{template.name}</h3>
                            {template.industry && (
                              <Chip size="sm" color="primary" variant="flat" className="capitalize">
                                {template.industry.replace('_', ' ')}
                              </Chip>
                            )}
                          </div>
                          
                          {template.subject && (
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              <span className="font-medium">Subject:</span> {template.subject}
                            </p>
                          )}
                          
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            <p className="line-clamp-3">{template.content}</p>
                          </div>
                          
                          {template.variables.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {template.variables.map((variable) => (
                                <Chip key={variable} size="sm" variant="bordered" className="text-xs">
                                  {variable}
                                </Chip>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </ModalBody>
        
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// Preview Modal
function PreviewModal({
  isOpen,
  onClose,
  communicationType,
  recipient,
  subject,
  content
}: {
  isOpen: boolean;
  onClose: () => void;
  communicationType: string;
  recipient: string;
  subject: string;
  content: string;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
      classNames={{
        base: "bg-white dark:bg-slate-800",
        backdrop: "bg-gradient-to-t from-zinc-900/60 to-zinc-900/20 backdrop-blur-sm"
      }}
    >
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center gap-3">
            <Eye className="h-6 w-6 text-primary-500" />
            <div>
              <h2 className="text-lg font-semibold">Preview {communicationType.toUpperCase()}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-normal">
                Review your message before sending
              </p>
            </div>
          </div>
        </ModalHeader>
        
        <ModalBody className="py-6">
          <div className="space-y-4">
            {/* Message Preview */}
            <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
              {communicationType === 'email' ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-600">
                    <Avatar size="sm" className="bg-primary-100 dark:bg-primary-900">
                      <Mail className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">To: {recipient}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Subject: {subject}
                      </p>
                    </div>
                  </div>
                  <div className="whitespace-pre-wrap text-sm">{content}</div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-success-500" />
                    <span className="text-sm font-medium">To: {recipient}</span>
                  </div>
                  <div className="bg-primary-500 text-white p-3 rounded-2xl rounded-bl-sm max-w-sm ml-auto">
                    <p className="text-sm whitespace-pre-wrap">{content}</p>
                  </div>
                  <div className="flex justify-end">
                    <Chip size="sm" color={content.length > 160 ? "danger" : "success"} variant="flat">
                      {content.length} characters
                    </Chip>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ModalBody>
        
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Close Preview
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}