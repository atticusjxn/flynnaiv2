'use client';

export default function CalendarPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Calendar</h1>
        <p className="text-muted-foreground text-lg">
          Connect and manage your calendar integrations
        </p>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-12 text-center">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-violet-500 to-violet-600 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-4">
          Calendar Integration
        </h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
          Connect your Google Calendar, Outlook, or other calendar services to
          automatically sync extracted events. This integration hub is currently
          in development.
        </p>

        <div className="inline-flex items-center px-4 py-2 bg-muted text-muted-foreground rounded-xl text-sm font-medium">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          Coming Soon
        </div>
      </div>
    </div>
  );
}
