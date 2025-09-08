'use client';

interface OnboardingContentProps {
  userId: string;
}

export default function OnboardingContent({ userId }: OnboardingContentProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to Flynn.ai</h1>
        <p className="text-muted-foreground text-lg">
          Let's get you set up with AI-powered call automation
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm p-12 text-center">
        <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-8 h-8 text-purple-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423L16.5 15.75l.394 1.183a2.25 2.25 0 001.423 1.423L19.5 18.75l-1.183.394a2.25 2.25 0 00-1.423 1.423z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Onboarding Flow</h2>
        <p className="text-muted-foreground mb-4">
          Onboarding functionality will be implemented here. User ID: {userId}
        </p>
      </div>
    </div>
  );
}