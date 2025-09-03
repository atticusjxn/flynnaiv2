'use client';

import { useState } from 'react';

const industries = [
  { value: 'plumbing', label: 'Plumbing & HVAC' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'legal', label: 'Legal Services' },
  { value: 'medical', label: 'Medical Practice' },
  { value: 'sales', label: 'Sales & Business Dev' },
  { value: 'consulting', label: 'Consulting' },
];

export default function EmailPreviewPage() {
  const [selectedIndustry, setSelectedIndustry] = useState('plumbing');
  const [hasUrgentEvents, setHasUrgentEvents] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  const handleRefresh = () => {
    setPreviewKey((prev) => prev + 1);
  };

  const previewUrl = `/api/email/preview?industry=${selectedIndustry}&urgent=${hasUrgentEvents}`;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Professional Email Templates Preview
          </h1>
          <p className="text-gray-600 mb-6">
            Preview and test the industry-adaptive email templates for Flynn.ai
            call summaries.
          </p>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-6 mb-6">
            <div className="flex items-center gap-3">
              <label
                htmlFor="industry"
                className="text-sm font-medium text-gray-700"
              >
                Industry:
              </label>
              <select
                id="industry"
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {industries.map((industry) => (
                  <option key={industry.value} value={industry.value}>
                    {industry.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={hasUrgentEvents}
                  onChange={(e) => setHasUrgentEvents(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  Include Urgent Events
                </span>
              </label>
            </div>

            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Refresh Preview
            </button>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-sm font-medium text-gray-700 mr-2">
              Quick Tests:
            </span>
            {industries.map((industry) => (
              <button
                key={industry.value}
                onClick={() => setSelectedIndustry(industry.value)}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                  selectedIndustry === industry.value
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                }`}
              >
                {industry.label}
              </button>
            ))}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-600">✅</span>
                <span className="text-sm font-medium text-green-800">
                  Industry-Adaptive
                </span>
              </div>
              <p className="text-xs text-green-700">
                Templates automatically adjust terminology, colors, and content
                based on industry
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-600">📱</span>
                <span className="text-sm font-medium text-blue-800">
                  Mobile-Responsive
                </span>
              </div>
              <p className="text-xs text-blue-700">
                Emails render perfectly across all email clients and mobile
                devices
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-purple-600">🎨</span>
                <span className="text-sm font-medium text-purple-800">
                  Professional Design
                </span>
              </div>
              <p className="text-xs text-purple-700">
                Clean, modern design with clear visual hierarchy and actionable
                CTAs
              </p>
            </div>
          </div>
        </div>

        {/* Email Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Email Preview -{' '}
                {industries.find((i) => i.value === selectedIndustry)?.label}
              </h2>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>Industry: {selectedIndustry}</span>
                {hasUrgentEvents && (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                    🚨 Urgent Events
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="relative" style={{ height: '800px' }}>
            <iframe
              key={previewKey}
              src={previewUrl}
              className="w-full h-full border-0"
              title="Email Preview"
              style={{
                backgroundColor: '#f8fafc',
                minHeight: '800px',
              }}
            />
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Technical Implementation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-800 mb-2">
                React Email Components
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• BaseEmailLayout.tsx - Universal email wrapper</li>
                <li>• CallOverviewEmail.tsx - Main email template</li>
                <li>• EventCard.tsx - Individual event display</li>
                <li>• Industry-specific adaptations</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-800 mb-2">
                Features
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Industry-aware terminology and colors</li>
                <li>• Urgent event highlighting</li>
                <li>• Mobile-responsive design</li>
                <li>• Actionable CTA buttons with deep links</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
