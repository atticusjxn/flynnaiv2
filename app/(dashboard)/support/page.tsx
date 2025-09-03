import { Suspense } from 'react';
import { Card, CardBody, CardHeader } from '@nextui-org/card';
import { Button } from '@nextui-org/button';
import { Link } from '@nextui-org/link';
import {
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  BookOpenIcon,
  LifebuoyIcon,
} from '@heroicons/react/24/outline';
import SupportSearch from '@/components/support/SupportSearch';

// Server component to fetch initial articles
async function getInitialArticles() {
  try {
    // In a real app, this would be a server-side fetch
    // For now, return empty array - the SupportSearch component will handle the API call
    return [];
  } catch (error) {
    console.error('Error fetching initial articles:', error);
    return [];
  }
}

export default async function SupportPage() {
  const initialArticles = await getInitialArticles();

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Flynn.ai Support Center
        </h1>
        <p className="text-lg text-default-600">
          Get help with call processing, AI accuracy, billing, and more
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card
          isPressable
          as={Link}
          href="/support/tickets/new"
          className="hover:shadow-lg transition-shadow"
        >
          <CardBody className="text-center p-6">
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Submit a Ticket</h3>
            <p className="text-sm text-default-600">
              Get personal support from our team
            </p>
          </CardBody>
        </Card>

        <Card
          isPressable
          as={Link}
          href="/support/tickets"
          className="hover:shadow-lg transition-shadow"
        >
          <CardBody className="text-center p-6">
            <LifebuoyIcon className="h-8 w-8 text-secondary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">My Tickets</h3>
            <p className="text-sm text-default-600">
              View your support requests
            </p>
          </CardBody>
        </Card>

        <Card
          isPressable
          as={Link}
          href="/support/articles?category=getting-started"
          className="hover:shadow-lg transition-shadow"
        >
          <CardBody className="text-center p-6">
            <BookOpenIcon className="h-8 w-8 text-success mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Getting Started</h3>
            <p className="text-sm text-default-600">
              Setup guides and tutorials
            </p>
          </CardBody>
        </Card>

        <Card
          isPressable
          as={Link}
          href="/support/articles?category=troubleshooting"
          className="hover:shadow-lg transition-shadow"
        >
          <CardBody className="text-center p-6">
            <QuestionMarkCircleIcon className="h-8 w-8 text-warning mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Troubleshooting</h3>
            <p className="text-sm text-default-600">Solve common issues</p>
          </CardBody>
        </Card>
      </div>

      {/* Popular Articles Section */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-xl font-semibold">Popular Help Articles</h2>
        </CardHeader>
        <CardBody>
          <div className="grid gap-3">
            <Link
              href="/support/articles/what-is-flynn-ai"
              className="flex items-center p-3 hover:bg-default-50 rounded-lg transition-colors"
            >
              <BookOpenIcon className="h-5 w-5 text-default-400 mr-3" />
              <div>
                <h3 className="font-medium">
                  What is Flynn.ai and how does it work?
                </h3>
                <p className="text-sm text-default-600">
                  Learn about Flynn.ai's core features and benefits
                </p>
              </div>
            </Link>

            <Link
              href="/support/articles/setup-call-forwarding"
              className="flex items-center p-3 hover:bg-default-50 rounded-lg transition-colors"
            >
              <BookOpenIcon className="h-5 w-5 text-default-400 mr-3" />
              <div>
                <h3 className="font-medium">
                  How to set up call forwarding in 10 seconds
                </h3>
                <p className="text-sm text-default-600">
                  Quick setup guide for call forwarding
                </p>
              </div>
            </Link>

            <Link
              href="/support/articles/no-email-summaries"
              className="flex items-center p-3 hover:bg-default-50 rounded-lg transition-colors"
            >
              <BookOpenIcon className="h-5 w-5 text-default-400 mr-3" />
              <div>
                <h3 className="font-medium">
                  Why am I not receiving email summaries after calls?
                </h3>
                <p className="text-sm text-default-600">
                  Troubleshoot email delivery issues
                </p>
              </div>
            </Link>

            <Link
              href="/support/articles/pricing-plans"
              className="flex items-center p-3 hover:bg-default-50 rounded-lg transition-colors"
            >
              <BookOpenIcon className="h-5 w-5 text-default-400 mr-3" />
              <div>
                <h3 className="font-medium">
                  Flynn.ai Pricing Plans and Features
                </h3>
                <p className="text-sm text-default-600">
                  Compare subscription tiers and features
                </p>
              </div>
            </Link>
          </div>
        </CardBody>
      </Card>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Search Help Articles</h2>
        </CardHeader>
        <CardBody>
          <Suspense
            fallback={
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-default-600 mt-2">Loading articles...</p>
              </div>
            }
          >
            <SupportSearch initialArticles={initialArticles} />
          </Suspense>
        </CardBody>
      </Card>

      {/* Contact Section */}
      <Card className="mt-8">
        <CardBody className="text-center">
          <h3 className="text-lg font-semibold mb-2">Still need help?</h3>
          <p className="text-default-600 mb-4">
            Our support team typically responds within 24 hours
          </p>
          <div className="flex gap-3 justify-center">
            <Button as={Link} href="/support/tickets/new" color="primary">
              Submit Support Ticket
            </Button>
            <Button as={Link} href="mailto:support@flynn.ai" variant="bordered">
              Email Support
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
