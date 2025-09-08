import { Suspense } from 'react'
import { signUp } from '@/app/auth/actions'
import Link from 'next/link'

const INDUSTRIES = [
  'Plumbing',
  'Real Estate',
  'Legal Services',
  'Healthcare',
  'Consulting',
  'Construction',
  'Sales',
  'Other'
]

function ErrorDisplay({ error }: { error: string }) {
  return (
    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
      <p className="text-sm text-red-800">{error}</p>
    </div>
  )
}

function SuccessDisplay({ success }: { success: string }) {
  return (
    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
      <p className="text-sm text-green-800">{success}</p>
    </div>
  )
}

export default function RegisterPage({ 
  searchParams 
}: { 
  searchParams: { error?: string; success?: string } 
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Join Flynn.ai
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Start your AI-powered call automation journey
            </p>
          </div>

          {searchParams.error && <ErrorDisplay error={searchParams.error} />}
          {searchParams.success && <SuccessDisplay success={searchParams.success} />}

          <form className="mt-8 space-y-6" action={signUp}>
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="mt-1 relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Your full name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-1 relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="At least 6 characters"
                />
              </div>

              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                  Company Name
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  className="mt-1 relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Your company name"
                />
              </div>

              <div>
                <label htmlFor="industryType" className="block text-sm font-medium text-gray-700">
                  Industry
                </label>
                <select
                  id="industryType"
                  name="industryType"
                  required
                  className="mt-1 relative block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select your industry</option>
                  {INDUSTRIES.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Account
              </button>
            </div>

            <div className="text-center">
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </Suspense>
  )
}