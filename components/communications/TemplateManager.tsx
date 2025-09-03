// Flynn.ai v2 - Template Manager Component
// S-tier template management with CRUD operations and premium design

'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Switch,
  Divider,
  Tooltip,
} from '@nextui-org/react';
import {
  FileText,
  Plus,
  Edit3,
  Trash2,
  Copy,
  Eye,
  Mail,
  MessageSquare,
  Settings,
  Search,
  Filter,
  MoreVertical,
  Save,
  X,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Code,
  Globe,
} from 'lucide-react';

interface CommunicationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms';
  subject?: string;
  content: string;
  variables: string[];
  industry?: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Mock templates - in production these would come from your database
const mockTemplates: CommunicationTemplate[] = [
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
    variables: [
      'customerName',
      'serviceType',
      'appointmentDate',
      'serviceAddress',
      'duration',
      'companyName',
    ],
    industry: 'plumbing',
    isActive: true,
    isDefault: false,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'SMS Reminder',
    type: 'sms',
    content:
      'Hi {{customerName}}! Reminder: Your {{serviceType}} appointment is scheduled for {{appointmentTime}} at {{serviceAddress}}. Reply CONFIRM to acknowledge.',
    variables: [
      'customerName',
      'serviceType',
      'appointmentTime',
      'serviceAddress',
    ],
    industry: 'plumbing',
    isActive: true,
    isDefault: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
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
    variables: [
      'clientName',
      'propertyAddress',
      'showingDate',
      'duration',
      'agentName',
      'companyName',
    ],
    industry: 'real_estate',
    isActive: true,
    isDefault: false,
    createdAt: '2024-01-16T14:30:00Z',
    updatedAt: '2024-01-16T14:30:00Z',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] as any },
  },
};

export default function TemplateManager() {
  // State management
  const [templates, setTemplates] =
    useState<CommunicationTemplate[]>(mockTemplates);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [editingTemplate, setEditingTemplate] =
    useState<CommunicationTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] =
    useState<CommunicationTemplate | null>(null);

  // Modal states
  const {
    isOpen: isEditModalOpen,
    onOpen: onEditModalOpen,
    onClose: onEditModalClose,
  } = useDisclosure();
  const {
    isOpen: isPreviewModalOpen,
    onOpen: onPreviewModalOpen,
    onClose: onPreviewModalClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure();

  // Filtered templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesSearch =
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType =
        selectedType === 'all' || template.type === selectedType;
      const matchesIndustry =
        selectedIndustry === 'all' || template.industry === selectedIndustry;

      return matchesSearch && matchesType && matchesIndustry;
    });
  }, [templates, searchQuery, selectedType, selectedIndustry]);

  // Industries from templates
  const availableIndustries = useMemo(() => {
    const industries = templates
      .filter((t) => t.industry)
      .map((t) => t.industry!)
      .filter((value, index, self) => self.indexOf(value) === index);
    return industries;
  }, [templates]);

  // Event handlers
  const handleCreateNew = useCallback(() => {
    const newTemplate: CommunicationTemplate = {
      id: '',
      name: '',
      type: 'email',
      subject: '',
      content: '',
      variables: [],
      industry: '',
      isActive: true,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingTemplate(newTemplate);
    onEditModalOpen();
  }, [onEditModalOpen]);

  const handleEdit = useCallback(
    (template: CommunicationTemplate) => {
      setEditingTemplate({ ...template });
      onEditModalOpen();
    },
    [onEditModalOpen]
  );

  const handlePreview = useCallback(
    (template: CommunicationTemplate) => {
      setPreviewTemplate(template);
      onPreviewModalOpen();
    },
    [onPreviewModalOpen]
  );

  const handleDuplicate = useCallback((template: CommunicationTemplate) => {
    const duplicatedTemplate: CommunicationTemplate = {
      ...template,
      id: `${template.id}_copy_${Date.now()}`,
      name: `${template.name} (Copy)`,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTemplates((prev) => [...prev, duplicatedTemplate]);
  }, []);

  const handleDelete = useCallback(
    (template: CommunicationTemplate) => {
      setEditingTemplate(template);
      onDeleteModalOpen();
    },
    [onDeleteModalOpen]
  );

  const confirmDelete = useCallback(() => {
    if (editingTemplate) {
      setTemplates((prev) => prev.filter((t) => t.id !== editingTemplate.id));
      onDeleteModalClose();
      setEditingTemplate(null);
    }
  }, [editingTemplate, onDeleteModalClose]);

  const handleSaveTemplate = useCallback(
    (template: CommunicationTemplate) => {
      if (template.id === '') {
        // Create new template
        const newTemplate = {
          ...template,
          id: `template_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setTemplates((prev) => [...prev, newTemplate]);
      } else {
        // Update existing template
        setTemplates((prev) =>
          prev.map((t) =>
            t.id === template.id
              ? { ...template, updatedAt: new Date().toISOString() }
              : t
          )
        );
      }
      onEditModalClose();
      setEditingTemplate(null);
    },
    [onEditModalClose]
  );

  const toggleTemplateStatus = useCallback((templateId: string) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === templateId
          ? { ...t, isActive: !t.isActive, updatedAt: new Date().toISOString() }
          : t
      )
    );
  }, []);

  const getTypeIcon = (type: string) => {
    return type === 'email' ? (
      <Mail className="h-4 w-4 text-primary-500" />
    ) : (
      <MessageSquare className="h-4 w-4 text-success-500" />
    );
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40">
                  <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Template Manager</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Manage communication templates for emails and SMS
                  </p>
                </div>
              </div>
              <Button
                color="primary"
                startContent={<Plus />}
                onPress={handleCreateNew}
                className="bg-gradient-to-r from-purple-600 to-pink-600 font-semibold"
              >
                New Template
              </Button>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Filters Section */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
          <CardBody>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                startContent={<Search className="h-4 w-4 text-slate-400" />}
                className="max-w-sm"
                variant="bordered"
              />

              <Select
                placeholder="Type"
                selectedKeys={selectedType ? [selectedType] : []}
                onSelectionChange={(keys) =>
                  setSelectedType((Array.from(keys)[0] as string) || 'all')
                }
                variant="bordered"
                className="max-w-xs"
              >
                <SelectItem key="all">All Types</SelectItem>
                <SelectItem key="email">Email</SelectItem>
                <SelectItem key="sms">SMS</SelectItem>
              </Select>

              <Select
                placeholder="Industry"
                selectedKeys={selectedIndustry ? [selectedIndustry] : []}
                onSelectionChange={(keys) =>
                  setSelectedIndustry((Array.from(keys)[0] as string) || 'all')
                }
                variant="bordered"
                className="max-w-xs"
              >
                <SelectItem key="all">All Industries</SelectItem>
                {availableIndustries.map((industry) => (
                  <SelectItem key={industry} className="capitalize">
                    {industry.replace('_', ' ')}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Templates Table */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
          <CardBody className="p-0">
            <Table
              aria-label="Templates table"
              removeWrapper
              classNames={{
                th: 'bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 font-semibold',
                td: 'border-b border-slate-200 dark:border-slate-700',
                tbody: 'divide-y divide-slate-200 dark:divide-slate-700',
              }}
            >
              <TableHeader>
                <TableColumn>NAME</TableColumn>
                <TableColumn>TYPE</TableColumn>
                <TableColumn>INDUSTRY</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>UPDATED</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody
                emptyContent={
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400">
                      No templates found
                    </p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                      Create your first template to get started
                    </p>
                  </div>
                }
              >
                {filteredTemplates.map((template) => (
                  <TableRow
                    key={template.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30"
                  >
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{template.name}</span>
                          {template.isDefault && (
                            <Chip size="sm" color="primary" variant="flat">
                              Default
                            </Chip>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {template.variables.slice(0, 3).map((variable) => (
                            <Chip
                              key={variable}
                              size="sm"
                              variant="bordered"
                              className="text-xs"
                            >
                              {variable}
                            </Chip>
                          ))}
                          {template.variables.length > 3 && (
                            <Chip
                              size="sm"
                              variant="bordered"
                              className="text-xs"
                            >
                              +{template.variables.length - 3}
                            </Chip>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getTypeIcon(template.type)}
                        <span className="capitalize font-medium">
                          {template.type}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {template.industry ? (
                        <Chip
                          size="sm"
                          color="secondary"
                          variant="flat"
                          className="capitalize"
                        >
                          {template.industry.replace('_', ' ')}
                        </Chip>
                      ) : (
                        <span className="text-slate-400">General</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          size="sm"
                          isSelected={template.isActive}
                          onValueChange={() =>
                            toggleTemplateStatus(template.id)
                          }
                          color="success"
                        />
                        <span
                          className={`text-sm ${template.isActive ? 'text-success-600' : 'text-slate-400'}`}
                        >
                          {template.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {new Date(template.updatedAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <TemplateActions
                        template={template}
                        onEdit={handleEdit}
                        onPreview={handlePreview}
                        onDuplicate={handleDuplicate}
                        onDelete={handleDelete}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </motion.div>

      {/* Edit Template Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingTemplate && (
          <EditTemplateModal
            template={editingTemplate}
            isOpen={isEditModalOpen}
            onClose={onEditModalClose}
            onSave={handleSaveTemplate}
          />
        )}
      </AnimatePresence>

      {/* Preview Template Modal */}
      <AnimatePresence>
        {isPreviewModalOpen && previewTemplate && (
          <PreviewTemplateModal
            template={previewTemplate}
            isOpen={isPreviewModalOpen}
            onClose={onPreviewModalClose}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={onDeleteModalClose}
        size="md"
        classNames={{
          base: 'bg-white dark:bg-slate-800',
          backdrop:
            'bg-gradient-to-t from-zinc-900/60 to-zinc-900/20 backdrop-blur-sm',
        }}
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-danger-500" />
              <div>
                <h2 className="text-lg font-semibold">Delete Template</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-normal">
                  This action cannot be undone
                </p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody>
            <p className="text-slate-600 dark:text-slate-400">
              Are you sure you want to delete the template "
              {editingTemplate?.name}"? This will permanently remove the
              template and cannot be undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onDeleteModalClose}>
              Cancel
            </Button>
            <Button color="danger" onPress={confirmDelete}>
              Delete Template
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </motion.div>
  );
}

// Template Actions Component
function TemplateActions({
  template,
  onEdit,
  onPreview,
  onDuplicate,
  onDelete,
}: {
  template: CommunicationTemplate;
  onEdit: (template: CommunicationTemplate) => void;
  onPreview: (template: CommunicationTemplate) => void;
  onDuplicate: (template: CommunicationTemplate) => void;
  onDelete: (template: CommunicationTemplate) => void;
}) {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          isIconOnly
          size="sm"
          variant="light"
          className="text-slate-500 hover:text-slate-700"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Template actions">
        <DropdownItem
          key="preview"
          startContent={<Eye className="h-4 w-4" />}
          onPress={() => onPreview(template)}
        >
          Preview
        </DropdownItem>
        <DropdownItem
          key="edit"
          startContent={<Edit3 className="h-4 w-4" />}
          onPress={() => onEdit(template)}
        >
          Edit
        </DropdownItem>
        <DropdownItem
          key="duplicate"
          startContent={<Copy className="h-4 w-4" />}
          onPress={() => onDuplicate(template)}
        >
          Duplicate
        </DropdownItem>
        <DropdownItem
          key="delete"
          className="text-danger"
          color="danger"
          startContent={<Trash2 className="h-4 w-4" />}
          onPress={() => onDelete(template)}
        >
          Delete
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

// Edit Template Modal
function EditTemplateModal({
  template,
  isOpen,
  onClose,
  onSave,
}: {
  template: CommunicationTemplate;
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: CommunicationTemplate) => void;
}) {
  const [editedTemplate, setEditedTemplate] =
    useState<CommunicationTemplate>(template);
  const [variablesInput, setVariablesInput] = useState(
    template.variables.join(', ')
  );

  const extractVariablesFromContent = useCallback(
    (content: string): string[] => {
      const matches = content.match(/\{\{(\w+)\}\}/g);
      if (!matches) return [];

      return [...new Set(matches.map((match) => match.replace(/[{}]/g, '')))];
    },
    []
  );

  const handleContentChange = useCallback(
    (content: string) => {
      const extractedVariables = extractVariablesFromContent(content);
      setEditedTemplate((prev) => ({
        ...prev,
        content,
        variables: extractedVariables,
      }));
      setVariablesInput(extractedVariables.join(', '));
    },
    [extractVariablesFromContent]
  );

  const handleSubjectChange = useCallback(
    (subject: string) => {
      const contentVariables = extractVariablesFromContent(
        editedTemplate.content
      );
      const subjectVariables = extractVariablesFromContent(subject);
      const allVariables = [
        ...new Set([...contentVariables, ...subjectVariables]),
      ];

      setEditedTemplate((prev) => ({
        ...prev,
        subject,
        variables: allVariables,
      }));
      setVariablesInput(allVariables.join(', '));
    },
    [editedTemplate.content, extractVariablesFromContent]
  );

  const handleSave = useCallback(() => {
    const variablesList = variablesInput
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0);

    onSave({
      ...editedTemplate,
      variables: variablesList,
    });
  }, [editedTemplate, variablesInput, onSave]);

  const isValid = editedTemplate.name && editedTemplate.content;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
      isDismissable={false}
      classNames={{
        base: 'bg-white dark:bg-slate-800',
        backdrop:
          'bg-gradient-to-t from-zinc-900/60 to-zinc-900/20 backdrop-blur-sm',
      }}
    >
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center gap-3">
            <Edit3 className="h-6 w-6 text-primary-500" />
            <div>
              <h2 className="text-lg font-semibold">
                {template.id ? 'Edit Template' : 'Create New Template'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-normal">
                Design your communication template
              </p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="py-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Template Name"
              placeholder="Enter template name..."
              value={editedTemplate.name}
              onValueChange={(value) =>
                setEditedTemplate((prev) => ({ ...prev, name: value }))
              }
              variant="bordered"
              isRequired
            />

            <Select
              label="Type"
              selectedKeys={[editedTemplate.type]}
              onSelectionChange={(keys) =>
                setEditedTemplate((prev) => ({
                  ...prev,
                  type: Array.from(keys)[0] as 'email' | 'sms',
                }))
              }
              variant="bordered"
              isRequired
            >
              <SelectItem key="email">Email</SelectItem>
              <SelectItem key="sms">SMS</SelectItem>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Industry (Optional)"
              placeholder="e.g., plumbing, real_estate"
              value={editedTemplate.industry || ''}
              onValueChange={(value) =>
                setEditedTemplate((prev) => ({ ...prev, industry: value }))
              }
              variant="bordered"
            />

            <div className="flex items-center gap-4">
              <Switch
                isSelected={editedTemplate.isActive}
                onValueChange={(value) =>
                  setEditedTemplate((prev) => ({ ...prev, isActive: value }))
                }
                color="success"
              >
                Active Template
              </Switch>

              <Switch
                isSelected={editedTemplate.isDefault}
                onValueChange={(value) =>
                  setEditedTemplate((prev) => ({ ...prev, isDefault: value }))
                }
                color="primary"
              >
                Default Template
              </Switch>
            </div>
          </div>

          {/* Subject (Email only) */}
          {editedTemplate.type === 'email' && (
            <Input
              label="Email Subject"
              placeholder="Enter email subject..."
              value={editedTemplate.subject || ''}
              onValueChange={handleSubjectChange}
              variant="bordered"
              isRequired
            />
          )}

          {/* Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Content
              </label>
              {editedTemplate.type === 'sms' && (
                <Chip
                  size="sm"
                  color={
                    editedTemplate.content.length > 160 ? 'danger' : 'success'
                  }
                  variant="flat"
                >
                  {editedTemplate.content.length}/160 chars
                </Chip>
              )}
            </div>

            <Textarea
              placeholder={
                editedTemplate.type === 'email'
                  ? 'Enter email content...'
                  : 'Enter SMS message...'
              }
              value={editedTemplate.content}
              onValueChange={handleContentChange}
              variant="bordered"
              minRows={editedTemplate.type === 'email' ? 8 : 4}
              maxRows={editedTemplate.type === 'email' ? 15 : 8}
              isRequired
            />

            {editedTemplate.type === 'sms' &&
              editedTemplate.content.length > 160 && (
                <p className="text-sm text-danger-500 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  SMS messages over 160 characters may be split into multiple
                  messages
                </p>
              )}
          </div>

          {/* Variables */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-primary-500" />
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Template Variables
              </label>
            </div>

            <Input
              placeholder="customerName, serviceType, appointmentDate"
              value={variablesInput}
              onValueChange={setVariablesInput}
              variant="bordered"
              description="Comma-separated list of variables. Use {{variableName}} in your content."
            />

            <div className="flex flex-wrap gap-2">
              {editedTemplate.variables.map((variable) => (
                <Chip key={variable} size="sm" color="primary" variant="flat">
                  {`{{${variable}}}`}
                </Chip>
              ))}
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleSave}
            isDisabled={!isValid}
            startContent={<Save />}
          >
            {template.id ? 'Update' : 'Create'} Template
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// Preview Template Modal
function PreviewTemplateModal({
  template,
  isOpen,
  onClose,
}: {
  template: CommunicationTemplate;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
      classNames={{
        base: 'bg-white dark:bg-slate-800',
        backdrop:
          'bg-gradient-to-t from-zinc-900/60 to-zinc-900/20 backdrop-blur-sm',
      }}
    >
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center gap-3">
            <Eye className="h-6 w-6 text-primary-500" />
            <div>
              <h2 className="text-lg font-semibold">Preview Template</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-normal">
                {template.name} • {template.type.toUpperCase()}
              </p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="py-6">
          <div className="space-y-4">
            {/* Template Info */}
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
              <div className="flex items-center gap-4 mb-3">
                <Chip size="sm" color="primary" variant="flat">
                  {template.type.toUpperCase()}
                </Chip>
                {template.industry && (
                  <Chip
                    size="sm"
                    color="secondary"
                    variant="flat"
                    className="capitalize"
                  >
                    {template.industry.replace('_', ' ')}
                  </Chip>
                )}
                <Chip
                  size="sm"
                  color={template.isActive ? 'success' : 'default'}
                  variant="flat"
                >
                  {template.isActive ? 'Active' : 'Inactive'}
                </Chip>
                {template.isDefault && (
                  <Chip size="sm" color="warning" variant="flat">
                    Default
                  </Chip>
                )}
              </div>
            </div>

            {/* Content Preview */}
            <div className="space-y-4">
              {template.subject && (
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Subject
                  </label>
                  <div className="mt-1 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                    <code className="text-sm text-slate-900 dark:text-slate-100">
                      {template.subject}
                    </code>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Content
                </label>
                <div className="mt-1 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                  <pre className="text-sm text-slate-900 dark:text-slate-100 whitespace-pre-wrap font-mono">
                    {template.content}
                  </pre>
                </div>
              </div>
            </div>

            {/* Variables */}
            {template.variables.length > 0 && (
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  Template Variables
                </label>
                <div className="flex flex-wrap gap-2">
                  {template.variables.map((variable) => (
                    <Chip
                      key={variable}
                      size="sm"
                      color="primary"
                      variant="bordered"
                    >
                      {`{{${variable}}}`}
                    </Chip>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
