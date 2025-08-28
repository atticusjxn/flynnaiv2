'use client';

export default function BillingPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Billing</h1>
        <p className="text-muted-foreground text-lg">
          Manage your subscription and billing preferences
        </p>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-12 text-center">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-foreground mb-4">Billing & Subscription</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
          Manage your Flynn.ai subscription, view usage metrics, and update payment methods. This billing portal is being developed to provide complete control over your account.
        </p>
        
        <div className="inline-flex items-center px-4 py-2 bg-muted text-muted-foreground rounded-xl text-sm font-medium">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          Coming Soon
        </div>
      </div>
    </div>
  );
}