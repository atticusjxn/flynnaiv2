'use client';

export default function CallsPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Calls</h1>
        <p className="text-muted-foreground text-lg">
          Manage your call history and AI extractions
        </p>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-12 text-center">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-foreground mb-4">Calls Management</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
          This comprehensive calls management interface is coming soon. You'll be able to view all your processed calls, listen to recordings, and review AI extractions.
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