import { signup } from '../actions';
import Link from 'next/link';

const INDUSTRY_OPTIONS = [
  { value: 'plumbing', label: 'Plumbing & HVAC' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'legal', label: 'Legal Services' },
  { value: 'medical', label: 'Medical Practice' },
  { value: 'sales', label: 'Sales & Business Dev' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'general', label: 'General Services' },
  { value: 'other', label: 'Other' },
];

export default function RegisterPage({ searchParams }: { searchParams: { message: string } }) {
  const isSuccess = searchParams?.message?.includes('Check email');

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-accent">
            <div className="w-6 h-6 bg-primary rounded-full"></div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-foreground">
            {isSuccess ? 'Check your email!' : 'Create your Flynn.ai account'}
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {isSuccess
              ? "We've sent you a confirmation link to complete your registration"
              : 'Start transforming your business calls into calendar events'}
          </p>
        </div>

        {searchParams?.message && (
          <div className={`px-4 py-3 rounded-lg text-sm ${
            isSuccess 
              ? 'bg-primary/10 border border-primary/20 text-primary'
              : 'bg-destructive/10 border border-destructive/20 text-destructive'
          }`}>
            {searchParams.message}
            {isSuccess && (
              <p className="mt-2 font-medium">
                Don't see the email? Check your spam folder.
              </p>
            )}
          </div>
        )}

        {!isSuccess && (
          <form action={signup} className="mt-8 space-y-6">
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground"
                >
                  Email address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring sm:text-sm"
                  placeholder="your@email.com"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-foreground"
                >
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring sm:text-sm"
                  placeholder="At least 6 characters"
                />
              </div>

              {/* Full Name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-foreground"
                >
                  Full Name *
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring sm:text-sm"
                  placeholder="John Doe"
                />
              </div>

              {/* Company Name */}
              <div>
                <label
                  htmlFor="companyName"
                  className="block text-sm font-medium text-foreground"
                >
                  Company Name *
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  autoComplete="organization"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring sm:text-sm"
                  placeholder="Your Business Name"
                />
              </div>

              {/* Industry Selection */}
              <div>
                <label
                  htmlFor="industryType"
                  className="block text-sm font-medium text-foreground"
                >
                  Industry *
                </label>
                <select
                  id="industryType"
                  name="industryType"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring sm:text-sm"
                >
                  <option value="">Select your industry</option>
                  {INDUSTRY_OPTIONS.map((industry) => (
                    <option key={industry.value} value={industry.value}>
                      {industry.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone Number (Optional) */}
              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-foreground"
                >
                  Phone Number (Optional)
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  autoComplete="tel"
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring sm:text-sm"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors"
              >
                Create account
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-medium text-primary hover:text-primary/90"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        )}

        {/* Show login link for confirmed emails */}
        {isSuccess && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already confirmed your email?{' '}
              <Link
                href="/login"
                className="font-medium text-primary hover:text-primary/90"
              >
                Sign in here
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}