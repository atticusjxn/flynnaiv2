// Flynn.ai v2 - Communication Error Component
// Simple error fallback for communication components

'use client';

import { Card, CardBody, Button } from '@nextui-org/react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface CommunicationErrorProps {
  error: string;
  onRetry?: () => void;
}

export default function CommunicationError({ error, onRetry }: CommunicationErrorProps) {
  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
      <CardBody className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-danger-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Communication Error</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
        {onRetry && (
          <Button color="primary" onPress={onRetry} startContent={<RefreshCw />}>
            Try Again
          </Button>
        )}
      </CardBody>
    </Card>
  );
}