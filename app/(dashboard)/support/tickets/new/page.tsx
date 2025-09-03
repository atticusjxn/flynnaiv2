import { Card, CardBody, CardHeader } from '@nextui-org/card';
import { Link } from '@nextui-org/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import SupportTicketForm from '@/components/support/SupportTicketForm';

export default function NewSupportTicketPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/support/tickets"
          className="inline-flex items-center text-default-600 hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to My Tickets
        </Link>
        <h1 className="text-2xl font-bold text-foreground">
          Submit New Support Ticket
        </h1>
        <p className="text-default-600">
          Describe your issue and we'll get back to you within 24 hours
        </p>
      </div>

      {/* Help Before Submitting */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-semibold">
            Before submitting a ticket...
          </h2>
        </CardHeader>
        <CardBody>
          <p className="text-default-600 mb-4">
            You might find a quick solution in our help articles:
          </p>
          <div className="grid gap-2">
            <Link
              href="/support/articles/no-email-summaries"
              className="text-primary hover:underline text-sm"
            >
              • Not receiving email summaries after calls?
            </Link>
            <Link
              href="/support/articles/improve-ai-accuracy"
              className="text-primary hover:underline text-sm"
            >
              • AI extraction accuracy is low?
            </Link>
            <Link
              href="/support/articles/setup-call-forwarding"
              className="text-primary hover:underline text-sm"
            >
              • Need help with call forwarding setup?
            </Link>
            <Link
              href="/support/articles/calendar-integration"
              className="text-primary hover:underline text-sm"
            >
              • Calendar sync not working?
            </Link>
          </div>
        </CardBody>
      </Card>

      {/* Ticket Form */}
      <SupportTicketForm />

      {/* Additional Help */}
      <Card className="mt-6">
        <CardBody className="text-center">
          <h3 className="font-semibold mb-2">Need immediate help?</h3>
          <p className="text-default-600 text-sm mb-4">
            For urgent technical issues, you can also reach us directly:
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm">
            <span className="text-default-600">
              <strong>Email:</strong> support@flynn.ai
            </span>
            <span className="text-default-600">
              <strong>Response time:</strong> Within 24 hours
            </span>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
