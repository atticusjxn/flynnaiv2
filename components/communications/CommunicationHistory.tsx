// Flynn.ai v2 - Communication History Component
// S-tier communication history with advanced filtering and premium design

'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tooltip,
  Spinner,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from '@nextui-org/react';
import {
  Search,
  Filter,
  Mail,
  MessageSquare,
  Phone,
  Calendar,
  User,
  RefreshCw,
  Download,
  MoreVertical,
  Eye,
  RotateCcw,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { useCommunications, useRetryCommunication } from '@/hooks/useCommunications';
import { Database } from '@/types/database.types';

type CommunicationLog = Database['public']['Tables']['communication_logs']['Row'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] }
  }
};

export default function CommunicationHistory() {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
  const [selectedCommunication, setSelectedCommunication] = useState<CommunicationLog | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal states
  const { isOpen: isViewModalOpen, onOpen: onViewModalOpen, onClose: onViewModalClose } = useDisclosure();
  
  // Build filters for the hook
  const filters = useMemo(() => {
    const baseFilters: any = {
      page: currentPage,
      limit: 20
    };

    if (selectedType !== 'all') {
      baseFilters.type = selectedType;
    }
    
    if (selectedStatus !== 'all') {
      baseFilters.status = selectedStatus;
    }

    if (searchQuery) {
      baseFilters.recipient = searchQuery;
    }

    // Date range filtering
    if (selectedDateRange !== 'all') {
      const now = new Date();
      let dateFrom: Date;
      
      switch (selectedDateRange) {
        case '24h':
          dateFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateFrom = new Date(0);
      }
      
      baseFilters.dateFrom = dateFrom.toISOString();
      baseFilters.dateTo = now.toISOString();
    }

    return baseFilters;
  }, [currentPage, selectedType, selectedStatus, searchQuery, selectedDateRange]);

  // Data fetching
  const { communications, loading, error, pagination, refetch } = useCommunications(filters);
  const { retryCommunication, loading: retryLoading } = useRetryCommunication();

  // Event handlers
  const handleViewCommunication = useCallback((communication: CommunicationLog) => {
    setSelectedCommunication(communication);
    onViewModalOpen();
  }, [onViewModalOpen]);

  const handleRetryCommunication = useCallback(async (communicationId: string) => {
    try {
      await retryCommunication(communicationId);
      refetch();
    } catch (error) {
      console.error('Failed to retry communication:', error);
    }
  }, [retryCommunication, refetch]);

  const handleExportData = useCallback(() => {
    // TODO: Implement CSV export functionality
    console.log('Exporting communication data...');
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedStatus('all');
    setSelectedDateRange('all');
    setCurrentPage(1);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'sent':
        return <CheckCircle2 className="h-4 w-4 text-success-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning-500" />;
      case 'failed':
      case 'bounced':
        return <XCircle className="h-4 w-4 text-danger-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-default-400" />;
    }
  };

  const getCommunicationIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4 text-primary-500" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4 text-success-500" />;
      case 'call':
        return <Phone className="h-4 w-4 text-secondary-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-default-400" />;
    }
  };

  const getStatusColor = (status: string): "success" | "warning" | "danger" | "default" => {
    switch (status) {
      case 'delivered':
      case 'sent':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
      case 'bounced':
        return 'danger';
      default:
        return 'default';
    }
  };

  if (error) {
    return (
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
        <CardBody className="text-center py-12">
          <XCircle className="h-12 w-12 text-danger-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load communication history</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
          <Button color="primary" onPress={refetch} startContent={<RefreshCw />}>
            Try Again
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Filters Section */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40">
                <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold">Communication History</h2>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              <Input
                placeholder="Search recipient..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                startContent={<Search className="h-4 w-4 text-slate-400" />}
                className="max-w-xs"
                variant="bordered"
              />

              <Select
                placeholder="Type"
                selectedKeys={selectedType ? [selectedType] : []}
                onSelectionChange={(keys) => setSelectedType(Array.from(keys)[0] as string || 'all')}
                variant="bordered"
                className="max-w-xs"
              >
                <SelectItem key="all">All Types</SelectItem>
                <SelectItem key="email">Email</SelectItem>
                <SelectItem key="sms">SMS</SelectItem>
                <SelectItem key="call">Call</SelectItem>
              </Select>

              <Select
                placeholder="Status"
                selectedKeys={selectedStatus ? [selectedStatus] : []}
                onSelectionChange={(keys) => setSelectedStatus(Array.from(keys)[0] as string || 'all')}
                variant="bordered"
                className="max-w-xs"
              >
                <SelectItem key="all">All Status</SelectItem>
                <SelectItem key="delivered">Delivered</SelectItem>
                <SelectItem key="sent">Sent</SelectItem>
                <SelectItem key="pending">Pending</SelectItem>
                <SelectItem key="failed">Failed</SelectItem>
                <SelectItem key="bounced">Bounced</SelectItem>
              </Select>

              <Select
                placeholder="Date Range"
                selectedKeys={selectedDateRange ? [selectedDateRange] : []}
                onSelectionChange={(keys) => setSelectedDateRange(Array.from(keys)[0] as string || 'all')}
                variant="bordered"
                className="max-w-xs"
              >
                <SelectItem key="all">All Time</SelectItem>
                <SelectItem key="24h">Last 24 Hours</SelectItem>
                <SelectItem key="7d">Last 7 Days</SelectItem>
                <SelectItem key="30d">Last 30 Days</SelectItem>
              </Select>

              <Button
                variant="flat"
                color="default"
                onPress={resetFilters}
                className="max-w-xs"
              >
                Reset Filters
              </Button>

              <Button
                variant="flat"
                color="primary"
                onPress={handleExportData}
                startContent={<Download className="h-4 w-4" />}
                className="max-w-xs"
              >
                Export
              </Button>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Communications Table */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
          <CardBody className="p-0">
            <Table
              aria-label="Communication history table"
              removeWrapper
              classNames={{
                th: "bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 font-semibold",
                td: "border-b border-slate-200 dark:border-slate-700",
                tbody: "divide-y divide-slate-200 dark:divide-slate-700"
              }}
            >
              <TableHeader>
                <TableColumn>TYPE</TableColumn>
                <TableColumn>RECIPIENT</TableColumn>
                <TableColumn>SUBJECT</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>SENT AT</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody
                emptyContent={
                  loading ? (
                    <div className="flex justify-center items-center h-32">
                      <Spinner size="lg" color="primary" />
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-500 dark:text-slate-400">No communications found</p>
                      <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                        Try adjusting your filters or search criteria
                      </p>
                    </div>
                  )
                }
              >
                {communications.map((communication) => (
                  <TableRow key={communication.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getCommunicationIcon(communication.communication_type)}
                        <span className="font-medium capitalize">
                          {communication.communication_type}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="font-mono text-sm">{communication.recipient}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="truncate text-sm">
                          {communication.subject || 'No subject'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(communication.status || 'unknown')}
                        <Chip
                          size="sm"
                          variant="flat"
                          color={getStatusColor(communication.status || 'unknown')}
                          className="capitalize"
                        >
                          {communication.status}
                        </Chip>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Calendar className="h-4 w-4" />
                        {communication.sent_at
                          ? new Date(communication.sent_at).toLocaleString()
                          : new Date(communication.created_at).toLocaleString()
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <CommunicationActions
                        communication={communication}
                        onView={handleViewCommunication}
                        onRetry={handleRetryCommunication}
                        retryLoading={retryLoading}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center py-4 border-t border-slate-200 dark:border-slate-700">
                <Pagination
                  total={pagination.totalPages}
                  page={pagination.page}
                  onChange={setCurrentPage}
                  color="primary"
                  showControls
                  classNames={{
                    wrapper: "gap-0 overflow-visible h-8",
                    item: "w-8 h-8 text-small rounded-none bg-transparent",
                    cursor: "bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg font-bold text-white"
                  }}
                />
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>

      {/* View Communication Modal */}
      <AnimatePresence>
        {isViewModalOpen && selectedCommunication && (
          <CommunicationViewModal
            communication={selectedCommunication}
            isOpen={isViewModalOpen}
            onClose={onViewModalClose}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Communication Actions Component
function CommunicationActions({
  communication,
  onView,
  onRetry,
  retryLoading
}: {
  communication: CommunicationLog;
  onView: (communication: CommunicationLog) => void;
  onRetry: (id: string) => void;
  retryLoading: boolean;
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
      <DropdownMenu
        aria-label="Communication actions"
        className="w-200"
      >
        <DropdownItem
          key="view"
          startContent={<Eye className="h-4 w-4" />}
          onPress={() => onView(communication)}
        >
          View Details
        </DropdownItem>
        
        {communication.status === 'failed' && (
          <DropdownItem
            key="retry"
            startContent={
              retryLoading ? (
                <Spinner size="sm" className="h-4 w-4" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )
            }
            onPress={() => onRetry(communication.id)}
            isDisabled={retryLoading}
          >
            Retry Communication
          </DropdownItem>
        )}
        
        {communication.external_id && (
          <DropdownItem
            key="external"
            startContent={<ExternalLink className="h-4 w-4" />}
            onPress={() => {
              // TODO: Open external service dashboard
              console.log('Opening external service:', communication.external_id);
            }}
          >
            View in Service
          </DropdownItem>
        )}
      </DropdownMenu>
    </Dropdown>
  );
}

// Communication View Modal
function CommunicationViewModal({
  communication,
  isOpen,
  onClose
}: {
  communication: CommunicationLog;
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
        base: "bg-white dark:bg-slate-800",
        backdrop: "bg-gradient-to-t from-zinc-900/60 to-zinc-900/20 backdrop-blur-sm"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            {communication.communication_type === 'email' && (
              <Mail className="h-6 w-6 text-primary-500" />
            )}
            {communication.communication_type === 'sms' && (
              <MessageSquare className="h-6 w-6 text-success-500" />
            )}
            {communication.communication_type === 'call' && (
              <Phone className="h-6 w-6 text-secondary-500" />
            )}
            <div>
              <h2 className="text-lg font-semibold">
                {communication.communication_type.toUpperCase()} Communication
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-normal">
                To: {communication.recipient}
              </p>
            </div>
          </div>
        </ModalHeader>
        <ModalBody className="py-6">
          <div className="space-y-6">
            {/* Status and Timing */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Status
                </label>
                <div className="mt-1">
                  <Chip
                    variant="flat"
                    color={
                      communication.status === 'delivered' || communication.status === 'sent'
                        ? 'success'
                        : communication.status === 'pending'
                        ? 'warning'
                        : 'danger'
                    }
                    className="capitalize"
                  >
                    {communication.status}
                  </Chip>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Sent At
                </label>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {communication.sent_at
                    ? new Date(communication.sent_at).toLocaleString()
                    : 'Not sent yet'
                  }
                </p>
              </div>
            </div>

            {/* Subject (for emails) */}
            {communication.subject && (
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Subject
                </label>
                <p className="mt-1 text-sm text-slate-900 dark:text-slate-100 font-medium">
                  {communication.subject}
                </p>
              </div>
            )}

            {/* Content */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Content
              </label>
              <div className="mt-2 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                <pre className="text-sm text-slate-900 dark:text-slate-100 whitespace-pre-wrap font-mono">
                  {communication.content || 'No content available'}
                </pre>
              </div>
            </div>

            {/* Error Message (if failed) */}
            {communication.error_message && (
              <div>
                <label className="text-sm font-medium text-red-700 dark:text-red-300">
                  Error Details
                </label>
                <div className="mt-2 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {communication.error_message}
                  </p>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300">
                  Created At
                </label>
                <p className="text-slate-600 dark:text-slate-400">
                  {new Date(communication.created_at).toLocaleString()}
                </p>
              </div>
              {communication.delivered_at && (
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300">
                    Delivered At
                  </label>
                  <p className="text-slate-600 dark:text-slate-400">
                    {new Date(communication.delivered_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* External ID */}
            {communication.external_id && (
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  External Service ID
                </label>
                <p className="mt-1 text-sm font-mono text-slate-600 dark:text-slate-400">
                  {communication.external_id}
                </p>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter className="border-t border-slate-200 dark:border-slate-700">
          <Button variant="light" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}