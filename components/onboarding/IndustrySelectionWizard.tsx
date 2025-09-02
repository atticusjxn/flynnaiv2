'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@nextui-org/card';
import { Button } from '@nextui-org/button';
import { CheckIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { SUPPORTED_INDUSTRIES } from '@/utils/constants';

interface Industry {
  id: string;
  label: string;
  description: string;
  icon: string;
  keyFeatures: string[];
  eventTypes: string[];
  primaryColor: string;
  examples: string[];
}

interface IndustrySelectionWizardProps {
  onSelect: (industry: string) => void;
  selectedIndustry?: string;
  showHeader?: boolean;
  className?: string;
}

const INDUSTRIES: Industry[] = [
  {
    id: SUPPORTED_INDUSTRIES.PLUMBING,
    label: 'Plumbing & HVAC',
    description: 'Service calls, emergency repairs, and maintenance appointments',
    icon: '🔧',
    keyFeatures: ['Emergency detection', 'Service addresses', 'Urgency classification'],
    eventTypes: ['Service Call', 'Emergency', 'Quote', 'Follow-up'],
    primaryColor: '#1e40af',
    examples: ['Emergency leak repair at 123 Main St tomorrow at 2 PM', 'Schedule routine maintenance next week']
  },
  {
    id: SUPPORTED_INDUSTRIES.REAL_ESTATE,
    label: 'Real Estate',
    description: 'Property showings, client meetings, and inspections',
    icon: '🏡',
    keyFeatures: ['Property addresses', 'Client qualification', 'Showing schedules'],
    eventTypes: ['Showing', 'Meeting', 'Inspection', 'Closing'],
    primaryColor: '#059669',
    examples: ['Show the downtown condo to the Johnsons Friday at 3 PM', 'Schedule listing appointment']
  },
  {
    id: SUPPORTED_INDUSTRIES.LEGAL,
    label: 'Legal Services',
    description: 'Client consultations, court dates, and legal meetings',
    icon: '⚖️',
    keyFeatures: ['Consultation types', 'Court schedules', 'Client confidentiality'],
    eventTypes: ['Consultation', 'Meeting', 'Court Date', 'Deposition'],
    primaryColor: '#7c3aed',
    examples: ['Initial consultation for divorce case Monday morning', 'Court appearance scheduled']
  },
  {
    id: SUPPORTED_INDUSTRIES.MEDICAL,
    label: 'Medical Practice',
    description: 'Patient appointments, consultations, and follow-ups',
    icon: '🏥',
    keyFeatures: ['HIPAA compliance', 'Appointment types', 'Urgency handling'],
    eventTypes: ['Appointment', 'Consultation', 'Follow-up', 'Urgent'],
    primaryColor: '#dc2626',
    examples: ['Schedule annual checkup next month', 'Urgent appointment needed this week']
  },
  {
    id: SUPPORTED_INDUSTRIES.SALES,
    label: 'Sales & Business',
    description: 'Demos, discovery calls, and prospect meetings',
    icon: '📈',
    keyFeatures: ['Lead qualification', 'Demo scheduling', 'Follow-up tracking'],
    eventTypes: ['Demo', 'Discovery', 'Follow-up', 'Proposal'],
    primaryColor: '#ea580c',
    examples: ['Product demo for enterprise client Thursday', 'Follow-up call with qualified lead']
  },
  {
    id: SUPPORTED_INDUSTRIES.CONSULTING,
    label: 'Consulting',
    description: 'Strategy sessions, workshops, and client meetings',
    icon: '🧠',
    keyFeatures: ['Session planning', 'Workshop scheduling', 'Client management'],
    eventTypes: ['Consultation', 'Strategy Session', 'Workshop', 'Check-in'],
    primaryColor: '#0891b2',
    examples: ['Strategic planning workshop next Tuesday', 'One-on-one consultation scheduled']
  },
  {
    id: SUPPORTED_INDUSTRIES.GENERAL,
    label: 'General Services',
    description: 'Professional services and business appointments',
    icon: '💼',
    keyFeatures: ['Flexible scheduling', 'Generic event types', 'Business focus'],
    eventTypes: ['Appointment', 'Meeting', 'Consultation', 'Service'],
    primaryColor: '#6366f1',
    examples: ['Business meeting scheduled for next week', 'Service appointment confirmed']
  },
  {
    id: SUPPORTED_INDUSTRIES.OTHER,
    label: 'Other Industry',
    description: 'Custom configuration for specialized businesses',
    icon: '🏢',
    keyFeatures: ['Custom terminology', 'Flexible event types', 'Adaptable AI'],
    eventTypes: ['Appointment', 'Meeting', 'Event', 'Session'],
    primaryColor: '#64748b',
    examples: ['Custom business appointment', 'Specialized service meeting']
  }
];

export default function IndustrySelectionWizard({
  onSelect,
  selectedIndustry,
  showHeader = true,
  className = ''
}: IndustrySelectionWizardProps) {
  const [hoveredIndustry, setHoveredIndustry] = useState<string | null>(null);
  const [animationStarted, setAnimationStarted] = useState(false);

  useEffect(() => {
    // Start staggered animation for cards
    const timer = setTimeout(() => setAnimationStarted(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const handleIndustrySelect = (industryId: string) => {
    onSelect(industryId);
  };

  return (
    <div className={`w-full max-w-6xl mx-auto ${className}`}>
      {showHeader && (
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100/50 rounded-full mb-6 backdrop-blur-sm">
            <span className="text-2xl">🏢</span>
            <span className="text-sm font-medium text-blue-700">Industry Selection</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent mb-4">
            What type of business are you in?
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Flynn.ai adapts its AI processing to understand your industry's terminology and extract the right types of appointments from your calls. 
            Choose the option that best describes your business.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {INDUSTRIES.map((industry, index) => (
          <div
            key={industry.id}
            className={`group relative transition-all duration-500 ease-out ${
              animationStarted 
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-8 opacity-0'
            }`}
            style={{ 
              transitionDelay: `${index * 100}ms` 
            }}
          >
            {/* Premium Background Glow */}
            <div 
              className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
                selectedIndustry === industry.id 
                  ? 'bg-gradient-to-br opacity-20 scale-105' 
                  : hoveredIndustry === industry.id
                    ? 'bg-gradient-to-br opacity-10 scale-102'
                    : 'opacity-0'
              }`}
              style={{ 
                background: selectedIndustry === industry.id 
                  ? `linear-gradient(135deg, ${industry.primaryColor}20, ${industry.primaryColor}10)`
                  : `linear-gradient(135deg, ${industry.primaryColor}15, ${industry.primaryColor}05)`
              }}
            />
            
            <Card
              className={`
                cursor-pointer transition-all duration-300 transform relative overflow-hidden
                border-2 backdrop-blur-sm h-full
                ${selectedIndustry === industry.id 
                  ? 'border-2 scale-[1.02] shadow-2xl' 
                  : 'border-slate-200/60 hover:border-slate-300/80 hover:scale-[1.01] hover:shadow-xl'
                }
                ${hoveredIndustry === industry.id ? 'shadow-lg' : 'shadow-sm'}
              `}
              style={{
                borderColor: selectedIndustry === industry.id ? `${industry.primaryColor}80` : undefined,
                boxShadow: selectedIndustry === industry.id 
                  ? `0 20px 25px -5px ${industry.primaryColor}20, 0 10px 10px -5px ${industry.primaryColor}10`
                  : undefined
              }}
              isPressable
              onPress={() => handleIndustrySelect(industry.id)}
              onMouseEnter={() => setHoveredIndustry(industry.id)}
              onMouseLeave={() => setHoveredIndustry(null)}
            >
              {/* Premium shine effect for selected */}
              {selectedIndustry === industry.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform -translate-x-full animate-pulse" />
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between w-full">
                  <div className="flex items-start gap-4">
                    {/* Premium Icon Container */}
                    <div className="relative">
                      <div 
                        className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-all duration-300 ${
                          selectedIndustry === industry.id
                            ? 'shadow-lg'
                            : hoveredIndustry === industry.id
                              ? 'shadow-md scale-105'
                              : 'shadow-sm'
                        }`}
                        style={{ 
                          background: selectedIndustry === industry.id
                            ? `linear-gradient(135deg, ${industry.primaryColor}, ${industry.primaryColor}CC)`
                            : `linear-gradient(135deg, ${industry.primaryColor}15, ${industry.primaryColor}08)`,
                          color: selectedIndustry === industry.id ? 'white' : 'inherit'
                        }}
                      >
                        {industry.icon}
                        
                        {/* Animated ring for selected */}
                        {selectedIndustry === industry.id && (
                          <div 
                            className="absolute inset-0 rounded-xl border-2 animate-ping"
                            style={{ borderColor: `${industry.primaryColor}60` }}
                          />
                        )}
                      </div>
                      
                      {/* Premium badge for popular industries */}
                      {['plumbing', 'real_estate', 'sales'].includes(industry.id) && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className={`text-lg font-bold transition-colors duration-300 ${
                        selectedIndustry === industry.id ? 'text-slate-900' : 'text-slate-800'
                      }`}>
                        {industry.label}
                      </h3>
                      <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                        selectedIndustry === industry.id ? 'text-slate-600' : 'text-slate-500'
                      }`}>
                        {industry.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Selection Indicator */}
                  <div className={`transition-all duration-300 ${
                    selectedIndustry === industry.id ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                  }`}>
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg"
                      style={{ backgroundColor: industry.primaryColor }}
                    >
                      <CheckIcon className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardBody className="pt-0 space-y-4">
                {/* Key Features with premium styling */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                    Key Features
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {industry.keyFeatures.map((feature, featureIndex) => (
                      <span
                        key={featureIndex}
                        className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                          selectedIndustry === industry.id
                            ? 'text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                        }`}
                        style={{
                          backgroundColor: selectedIndustry === industry.id ? `${industry.primaryColor}CC` : undefined
                        }}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Event Types with premium styling */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                    Event Types
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {industry.eventTypes.map((eventType, typeIndex) => (
                      <span
                        key={typeIndex}
                        className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-all duration-200 ${
                          selectedIndustry === industry.id
                            ? 'border-transparent text-white bg-white/20'
                            : 'border-slate-200 text-slate-500 group-hover:border-slate-300 group-hover:text-slate-600'
                        }`}
                        style={{
                          borderColor: selectedIndustry === industry.id ? `${industry.primaryColor}40` : undefined
                        }}
                      >
                        {eventType}
                      </span>
                    ))}
                  </div>
                </div>

                {/* AI Understanding Preview */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                    AI Understanding Example
                  </h4>
                  <div className={`text-xs italic p-3 rounded-lg transition-all duration-300 ${
                    selectedIndustry === industry.id
                      ? 'bg-white/50 text-slate-700 border border-white/30'
                      : 'bg-slate-50 text-slate-600 border border-slate-200/60'
                  }`}>
                    "{industry.examples[0]}"
                  </div>
                </div>

                {/* Continue Button for Selected */}
                {selectedIndustry === industry.id && (
                  <div className="pt-3 border-t border-white/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-medium text-slate-700">Selected</span>
                      </div>
                      
                      <Button
                        size="sm"
                        className="text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        style={{ 
                          background: `linear-gradient(135deg, ${industry.primaryColor}, ${industry.primaryColor}DD)`
                        }}
                        endContent={<ArrowRightIcon className="w-3 h-3" />}
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        ))}
      </div>

      {selectedIndustry && (
        <div className="mt-12 relative">
          {/* Premium confirmation card */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 via-emerald-500/5 to-green-600/10 rounded-2xl" />
          <div className="relative bg-white/80 backdrop-blur-sm border border-green-200/50 rounded-2xl p-8 shadow-xl shadow-green-500/10">
            <div className="flex items-start gap-6">
              {/* Success Icon */}
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25">
                  <CheckIcon className="w-8 h-8 text-white" />
                </div>
                {/* Animated rings */}
                <div className="absolute inset-0 border-2 border-green-400/30 rounded-2xl animate-ping" />
                <div className="absolute inset-0 border border-green-300/40 rounded-2xl animate-ping" style={{ animationDelay: '0.5s' }} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h4 className="text-xl font-bold text-slate-800">Excellent Choice!</h4>
                  <div className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 rounded-full">
                    <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Optimized</span>
                  </div>
                </div>
                
                <p className="text-slate-600 leading-relaxed mb-4">
                  Flynn.ai is now specifically optimized for <strong className="text-slate-800">
                  {INDUSTRIES.find(i => i.id === selectedIndustry)?.label}</strong> businesses. 
                  Our AI will understand your industry terminology and extract the most relevant appointment types.
                </p>

                {/* Industry-specific benefits */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm text-slate-600">Industry-specific AI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm text-slate-600">Smart terminology</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm text-slate-600">Relevant event types</span>
                  </div>
                </div>

                {/* Change option */}
                <div className="mt-6 pt-4 border-t border-green-200/50">
                  <p className="text-xs text-slate-500">
                    Need to change this later? No problem - you can update your industry selection anytime in your account settings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}