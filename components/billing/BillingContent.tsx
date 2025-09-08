'use client';

interface BillingContentProps {
  userId: string;
}

export default function BillingContent({ userId }: BillingContentProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Billing</h1>
        <p className="text-muted-foreground text-lg">
          Manage your subscription and billing preferences
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm p-12 text-center">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Billing Dashboard</h2>
        <p className="text-muted-foreground mb-4">
          Billing functionality will be implemented here. User ID: {userId}
        </p>
      </div>
    </div>
  );
}