'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '@/components/AuthProvider';
import { SUPPORTED_INDUSTRIES } from '@/utils/constants';

const INDUSTRY_OPTIONS = [
  { value: SUPPORTED_INDUSTRIES.PLUMBING, label: 'Plumbing & HVAC' },
  { value: SUPPORTED_INDUSTRIES.REAL_ESTATE, label: 'Real Estate' },
  { value: SUPPORTED_INDUSTRIES.LEGAL, label: 'Legal Services' },
  { value: SUPPORTED_INDUSTRIES.MEDICAL, label: 'Medical Practice' },
  { value: SUPPORTED_INDUSTRIES.SALES, label: 'Sales & Business Dev' },
  { value: SUPPORTED_INDUSTRIES.CONSULTING, label: 'Consulting' },
  { value: SUPPORTED_INDUSTRIES.GENERAL, label: 'General Services' },
  { value: SUPPORTED_INDUSTRIES.OTHER, label: 'Other' },
];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    companyName: '',
    industryType: '',
    phoneNumber: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { signUp, user, loading } = useAuthContext();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (
      !formData.email ||
      !formData.password ||
      !formData.fullName ||
      !formData.companyName ||
      !formData.industryType
    ) {
      setError('Please fill in all required fields');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const userData = {
      full_name: formData.fullName,
      company_name: formData.companyName,
      industry_type: formData.industryType,
      phone_number: formData.phoneNumber || null,
    };

    const { error } = await signUp(formData.email, formData.password, userData);

    if (error) {
      setError(error.message || 'Registration failed');
      setIsLoading(false);
    } else {
      // Registration successful - email confirmation required
      setEmailSent(true);
      setSuccess(
        `Registration successful! We've sent a confirmation email to ${formData.email}. Please check your inbox and click the confirmation link to activate your account.`
      );
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-accent">
            <div
              className={`w-6 h-6 rounded-full ${emailSent ? 'bg-primary' : 'bg-primary'}`}
            ></div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-foreground">
            {emailSent ? 'Check your email!' : 'Create your Flynn.ai account'}
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {emailSent
              ? "We've sent you a confirmation link to complete your registration"
              : 'Start transforming your business calls into calendar events'}
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-primary/10 border border-primary/20 text-primary px-4 py-3 rounded-lg text-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                </div>
              </div>
              <div className="ml-3">
                <p>{success}</p>
                <p className="mt-2 font-medium">
                  Don't see the email? Check your spam folder or{' '}
                  <button
                    type="button"
                    onClick={() => setEmailSent(false)}
                    className="underline hover:no-underline"
                  >
                    try again
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        {!emailSent && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
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
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-foreground"
                >
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring sm:text-sm"
                  placeholder="Repeat password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
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
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={isLoading}
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
                  value={formData.companyName}
                  onChange={handleChange}
                  disabled={isLoading}
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
                <div className="relative">
                  <select
                    id="industryType"
                    name="industryType"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring sm:text-sm appearance-none"
                    value={formData.industryType}
                    onChange={handleChange}
                    disabled={isLoading}
                  >
                    <option value="">Select your industry</option>
                    {INDUSTRY_OPTIONS.map((industry) => (
                      <option key={industry.value} value={industry.value}>
                        {industry.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-muted-foreground"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
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
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Creating account...' : 'Create account'}
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
        {emailSent && (
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
