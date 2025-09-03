'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '@/components/AuthProvider';
import {
  PhoneIcon,
  BoltIcon,
  ClockIcon,
  CheckCircleIcon,
  StarIcon,
  SparklesIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  ScaleIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';

export default function HomePage() {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const [showDemo, setShowDemo] = useState(false);

  // Redirect authenticated users to dashboard (but allow override)
  useEffect(() => {
    if (!loading && user && !window.location.hash.includes('demo')) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary/20 border-t-primary"></div>
          <span className="text-lg font-medium text-gray-700">
            Loading Flynn.ai...
          </span>
        </div>
      </div>
    );
  }

  const australianIndustries = [
    {
      name: 'Plumbing & HVAC',
      icon: WrenchScrewdriverIcon,
      users: '12,000+',
      color: 'from-blue-500 to-blue-600',
    },
    {
      name: 'Real Estate',
      icon: BuildingOfficeIcon,
      users: '8,500+',
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      name: 'Legal Services',
      icon: ScaleIcon,
      users: '3,200+',
      color: 'from-purple-500 to-purple-600',
    },
    {
      name: 'Healthcare',
      icon: HeartIcon,
      users: '5,800+',
      color: 'from-pink-500 to-pink-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="relative z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Flynn.ai</span>
              <span className="text-xs px-2 py-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full font-semibold">
                AUSTRALIAN MADE
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowDemo(!showDemo)}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                See Demo
              </button>
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Hero Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 rounded-full mb-8 shadow-sm">
              <StarIcon className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-semibold text-blue-800">
                Trusted by 25,000+ Australian Professionals
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Never Miss Another
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent block mt-2">
                Business Call
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              Australia's #1 AI-powered call intelligence platform. Transform
              every business phone call into organized calendar events
              <strong className="text-gray-900"> within 2 minutes</strong>.
              Simple 10-second setup that works with any phone, any carrier.
            </p>

            {/* Primary CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                href="/register"
                className="group bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-3"
              >
                <span>Start Your Free Trial</span>
                <BoltIcon className="w-5 h-5 group-hover:animate-pulse" />
              </Link>

              <button
                onClick={() => setShowDemo(true)}
                className="group bg-white/90 backdrop-blur text-gray-700 font-semibold px-8 py-4 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-3"
              >
                <PhoneIcon className="w-5 h-5" />
                <span>Watch 2-Minute Demo</span>
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-5 h-5 text-blue-500" />
                <span>Setup in under 2 minutes</span>
              </div>
              <div className="flex items-center space-x-2">
                <StarIcon className="w-5 h-5 text-yellow-500" />
                <span>4.9/5 stars • 2,800+ reviews</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Australian Industries Showcase */}
      <section className="py-20 bg-white/60 backdrop-blur relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Built for Australian Businesses
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Industry-specific AI that understands Australian business
              terminology, time zones, and professional requirements
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {australianIndustries.map((industry, index) => (
              <div
                key={industry.name}
                className="group p-8 rounded-3xl bg-white border border-gray-200 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${industry.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                >
                  <industry.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {industry.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {industry.users} active users
                </p>
                <div className="text-xs text-emerald-600 font-semibold">
                  Australian-optimized
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How Flynn.ai Works
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to never miss another business opportunity
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                  <PhoneIcon className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  1
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Setup Call Forwarding
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Get your Flynn.ai number and set up call forwarding in under 2
                minutes. Works with Telstra, Optus, Vodafone, and all Australian
                carriers.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                  <SparklesIcon className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  2
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                AI Processes Calls
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Our AI automatically detects business calls, extracts
                appointment details, and identifies urgency levels using
                Australian business context.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                  <CalendarIcon className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  3
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Get Organized Events
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Receive SMS summaries, professional emails, and calendar events
                within 2 minutes. Integrates with Google Calendar, Outlook, and
                Apple Calendar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Simple Australian Pricing
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            All prices in AUD. GST included. Cancel anytime.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Basic</h3>
              <div className="text-3xl font-bold text-gray-900 mb-4">
                $39<span className="text-lg text-gray-600">/month</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-3 mb-6">
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-500 mr-2" />
                  AI call notes & summaries
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-500 mr-2" />
                  Email delivery
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-500 mr-2" />
                  100 calls/month
                </li>
              </ul>
            </div>

            {/* Professional Plan - Featured */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-8 rounded-2xl shadow-2xl transform scale-105 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  MOST POPULAR
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Professional
              </h3>
              <div className="text-3xl font-bold text-white mb-4">
                $99<span className="text-lg text-blue-200">/month</span>
              </div>
              <ul className="text-sm text-blue-100 space-y-3 mb-6">
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-300 mr-2" />
                  Everything in Basic
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-300 mr-2" />
                  Calendar integration
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-300 mr-2" />
                  SMS notifications
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-300 mr-2" />
                  500 calls/month
                </li>
              </ul>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Enterprise
              </h3>
              <div className="text-3xl font-bold text-gray-900 mb-4">
                $189<span className="text-lg text-gray-600">/month</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-3 mb-6">
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-500 mr-2" />
                  Everything in Pro
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-500 mr-2" />
                  Unlimited calls
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-500 mr-2" />
                  Team features
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-500 mr-2" />
                  Priority support
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12">
            <Link
              href="/register"
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 inline-flex items-center space-x-3"
            >
              <span>Start Free 14-Day Trial</span>
              <BoltIcon className="w-5 h-5" />
            </Link>
            <p className="text-sm text-gray-600 mt-4">
              No setup fees • No long-term contracts • Australian support team
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">Flynn.ai</span>
            </div>

            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Australia's premier AI-powered call intelligence platform. Trusted
              by professionals across all industries to never miss another
              business opportunity.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-gray-400">
              <span>Made in Australia 🇦🇺</span>
              <span>•</span>
              <span>Enterprise-grade security</span>
              <span>•</span>
              <span>GDPR & Privacy Act compliant</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
