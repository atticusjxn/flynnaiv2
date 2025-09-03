'use client';

import React, { useState } from 'react';
import { render } from '@react-email/render';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Eye, Send, Download, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

// Import all email templates
import CallOverviewEmail from './CallOverviewEmail';
import PlumbingEmail from './industry/PlumbingEmail';
import RealEstateEmail from './industry/RealEstateEmail';
import LegalEmail from './industry/LegalEmail';
import MedicalEmail from './industry/MedicalEmail';
import SalesEmail from './industry/SalesEmail';
import ConsultingEmail from './industry/ConsultingEmail';

import {
  getIndustryConfiguration,
  getAllIndustries,
} from '@/lib/industry/configurations';
import { EmailNotificationService } from '@/lib/email/EmailNotificationService';

interface EmailPreviewProps {
  initialData?: any;
  onSendTest?: (data: any) => void;
  className?: string;
}

interface PreviewData {
  // Basic info
  userEmail: string;
  companyName: string;
  industry: string;

  // Call data
  callSummary: {
    callerPhone: string;
    callerName: string;
    duration: number;
    timestamp: string;
    callSid: string;
  };

  // Events
  extractedEvents: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    proposedDateTime: string;
    location: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    urgency: string;
    confidence: number;
    estimatedPrice?: number;
  }>;

  // Additional context
  transcriptionSnippet: string;
  callId: string;

  // Industry-specific toggles
  industryFeatures: {
    [key: string]: any;
  };
}

export default function EmailPreview({
  initialData,
  onSendTest,
  className,
}: EmailPreviewProps) {
  const [previewData, setPreviewData] = useState<PreviewData>(() => ({
    userEmail: 'user@example.com',
    companyName: 'Acme Services',
    industry: 'plumbing',
    callSummary: {
      callerPhone: '+1 (555) 123-4567',
      callerName: 'John Smith',
      duration: 180,
      timestamp: new Date().toISOString(),
      callSid: 'test-call-123',
    },
    extractedEvents: [
      {
        id: '1',
        type: 'service_call',
        title: 'Kitchen Sink Repair',
        description:
          'Customer reports slow draining kitchen sink, possible clog in main line',
        proposedDateTime: new Date(
          Date.now() + 24 * 60 * 60 * 1000
        ).toISOString(),
        location: '123 Main Street, Anytown, State 12345',
        customerName: 'John Smith',
        customerPhone: '+1 (555) 123-4567',
        customerEmail: 'john.smith@email.com',
        urgency: 'medium',
        confidence: 0.85,
        estimatedPrice: 150,
      },
    ],
    transcriptionSnippet:
      "Hi, I need someone to come look at my kitchen sink. It's been draining really slowly for the past few days...",
    callId: 'test-call-123',
    industryFeatures: {
      emergencyContact: '+1 (555) 999-0000',
      afterHoursAvailable: true,
    },
    ...initialData,
  }));

  const [renderedHtml, setRenderedHtml] = useState<string>('');
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [isLoading, setIsLoading] = useState(false);
  const [sendResult, setSendResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const industries = getAllIndustries();
  const currentIndustry = getIndustryConfiguration(previewData.industry);

  // Render the email template
  const renderEmailPreview = async () => {
    setIsLoading(true);
    try {
      const baseProps = {
        companyName: previewData.companyName,
        industry: previewData.industry,
        callSummary: previewData.callSummary,
        extractedEvents: previewData.extractedEvents,
        transcriptionSnippet: previewData.transcriptionSnippet,
        callId: previewData.callId,
        userEmail: previewData.userEmail,
        dashboardUrl: 'https://flynn.ai',
      };

      let emailComponent;

      switch (previewData.industry) {
        case 'plumbing':
          emailComponent = PlumbingEmail({
            ...baseProps,
            emergencyContact: previewData.industryFeatures.emergencyContact,
            afterHoursAvailable:
              previewData.industryFeatures.afterHoursAvailable,
          });
          break;
        case 'real_estate':
          emailComponent = RealEstateEmail({
            ...baseProps,
            agentLicense: previewData.industryFeatures.agentLicense,
            brokerageInfo: previewData.industryFeatures.brokerageInfo,
          });
          break;
        case 'legal':
          emailComponent = LegalEmail({
            ...baseProps,
            attorneyBarNumber: previewData.industryFeatures.attorneyBarNumber,
            lawFirm: previewData.industryFeatures.lawFirm,
            confidentialityRequired:
              previewData.industryFeatures.confidentialityRequired,
          });
          break;
        case 'medical':
          emailComponent = MedicalEmail({
            ...baseProps,
            providerNPI: previewData.industryFeatures.providerNPI,
            medicalFacility: previewData.industryFeatures.medicalFacility,
            hipaaCompliant: previewData.industryFeatures.hipaaCompliant,
          });
          break;
        case 'sales':
          emailComponent = SalesEmail({
            ...baseProps,
            salesRepName: previewData.industryFeatures.salesRepName,
            salesTerritory: previewData.industryFeatures.salesTerritory,
          });
          break;
        case 'consulting':
          emailComponent = ConsultingEmail({
            ...baseProps,
            consultantName: previewData.industryFeatures.consultantName,
            specialization: previewData.industryFeatures.specialization,
          });
          break;
        default:
          emailComponent = CallOverviewEmail(baseProps);
      }

      const html = render(emailComponent);
      setRenderedHtml(html);
    } catch (error) {
      console.error('Failed to render email:', error);
    }
    setIsLoading(false);
  };

  // Send test email
  const sendTestEmail = async () => {
    setIsLoading(true);
    setSendResult(null);

    try {
      const emailService = new EmailNotificationService();
      const result = await emailService.sendEmailPreview(
        previewData as any,
        testEmail
      );

      setSendResult({
        success: result.success,
        message: result.success
          ? 'Test email sent successfully!'
          : result.error || 'Failed to send test email',
      });

      if (onSendTest) {
        onSendTest({ ...previewData, testEmail, result });
      }
    } catch (error) {
      setSendResult({
        success: false,
        message:
          'Failed to send test email: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      });
    }

    setIsLoading(false);
  };

  // Download HTML
  const downloadHtml = () => {
    if (!renderedHtml) return;

    const blob = new Blob([renderedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${previewData.industry}-email-template.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Update industry and reset features
  const updateIndustry = (industry: string) => {
    setPreviewData((prev) => ({
      ...prev,
      industry,
      industryFeatures: getDefaultIndustryFeatures(industry),
    }));
  };

  // Get default industry features
  const getDefaultIndustryFeatures = (industry: string) => {
    switch (industry) {
      case 'plumbing':
        return {
          emergencyContact: '+1 (555) 999-0000',
          afterHoursAvailable: true,
        };
      case 'real_estate':
        return {
          agentLicense: 'RE123456',
          brokerageInfo: 'Acme Realty Group',
        };
      case 'legal':
        return {
          attorneyBarNumber: 'BAR123456',
          lawFirm: 'Smith & Associates Law Firm',
          confidentialityRequired: true,
        };
      case 'medical':
        return {
          providerNPI: '1234567890',
          medicalFacility: 'Acme Medical Center',
          hipaaCompliant: true,
        };
      case 'sales':
        return {
          salesRepName: 'Jane Doe',
          salesTerritory: 'Northeast Region',
        };
      case 'consulting':
        return {
          consultantName: 'Dr. John Expert',
          specialization: ['Strategy', 'Operations'],
        };
      default:
        return {};
    }
  };

  // Initialize with rendered HTML
  React.useEffect(() => {
    renderEmailPreview();
  }, [previewData]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Email Template Preview & Testing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList>
              <TabsTrigger value="basic">Basic Settings</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="industry">Industry Features</TabsTrigger>
              <TabsTrigger value="testing">Testing</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={previewData.industry}
                    onValueChange={updateIndustry}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry.id} value={industry.id}>
                          {industry.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={previewData.companyName}
                    onChange={(e) =>
                      setPreviewData((prev) => ({
                        ...prev,
                        companyName: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="callerName">Caller Name</Label>
                  <Input
                    id="callerName"
                    value={previewData.callSummary.callerName}
                    onChange={(e) =>
                      setPreviewData((prev) => ({
                        ...prev,
                        callSummary: {
                          ...prev.callSummary,
                          callerName: e.target.value,
                        },
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="callerPhone">Caller Phone</Label>
                  <Input
                    id="callerPhone"
                    value={previewData.callSummary.callerPhone}
                    onChange={(e) =>
                      setPreviewData((prev) => ({
                        ...prev,
                        callSummary: {
                          ...prev.callSummary,
                          callerPhone: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="transcription">Transcription Snippet</Label>
                <Textarea
                  id="transcription"
                  rows={3}
                  value={previewData.transcriptionSnippet}
                  onChange={(e) =>
                    setPreviewData((prev) => ({
                      ...prev,
                      transcriptionSnippet: e.target.value,
                    }))
                  }
                />
              </div>
            </TabsContent>

            <TabsContent value="events" className="space-y-4">
              {previewData.extractedEvents.map((event, index) => (
                <Card key={event.id}>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center justify-between">
                      Event {index + 1}
                      <Badge
                        variant={
                          event.urgency === 'emergency'
                            ? 'destructive'
                            : event.urgency === 'high'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {event.urgency}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={event.title}
                          onChange={(e) =>
                            setPreviewData((prev) => ({
                              ...prev,
                              extractedEvents: prev.extractedEvents.map(
                                (evt, i) =>
                                  i === index
                                    ? { ...evt, title: e.target.value }
                                    : evt
                              ),
                            }))
                          }
                        />
                      </div>

                      <div>
                        <Label>Urgency</Label>
                        <Select
                          value={event.urgency}
                          onValueChange={(value) =>
                            setPreviewData((prev) => ({
                              ...prev,
                              extractedEvents: prev.extractedEvents.map(
                                (evt, i) =>
                                  i === index ? { ...evt, urgency: value } : evt
                              ),
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea
                        rows={2}
                        value={event.description}
                        onChange={(e) =>
                          setPreviewData((prev) => ({
                            ...prev,
                            extractedEvents: prev.extractedEvents.map(
                              (evt, i) =>
                                i === index
                                  ? { ...evt, description: e.target.value }
                                  : evt
                            ),
                          }))
                        }
                      />
                    </div>

                    <div>
                      <Label>Location</Label>
                      <Input
                        value={event.location}
                        onChange={(e) =>
                          setPreviewData((prev) => ({
                            ...prev,
                            extractedEvents: prev.extractedEvents.map(
                              (evt, i) =>
                                i === index
                                  ? { ...evt, location: e.target.value }
                                  : evt
                            ),
                          }))
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="industry" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Industry:{' '}
                <Badge variant="outline">{currentIndustry.name}</Badge>
              </div>

              {renderIndustryFeatures()}
            </TabsContent>

            <TabsContent value="testing" className="space-y-4">
              <div>
                <Label htmlFor="testEmail">Test Email Address</Label>
                <Input
                  id="testEmail"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Enter email to receive test"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={sendTestEmail}
                  disabled={isLoading || !testEmail}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Test Email
                </Button>

                <Button
                  variant="outline"
                  onClick={downloadHtml}
                  disabled={!renderedHtml}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download HTML
                </Button>

                <Button
                  variant="outline"
                  onClick={renderEmailPreview}
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Preview
                </Button>
              </div>

              {sendResult && (
                <Alert variant={sendResult.success ? 'default' : 'destructive'}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{sendResult.message}</AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Email Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
          ) : renderedHtml ? (
            <div className="border rounded-lg overflow-hidden">
              <iframe
                srcDoc={renderedHtml}
                className="w-full h-screen"
                title="Email Preview"
                sandbox="allow-same-origin"
              />
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No preview available. Click "Refresh Preview" to generate.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  function renderIndustryFeatures() {
    switch (previewData.industry) {
      case 'plumbing':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input
                id="emergencyContact"
                value={previewData.industryFeatures.emergencyContact || ''}
                onChange={(e) =>
                  setPreviewData((prev) => ({
                    ...prev,
                    industryFeatures: {
                      ...prev.industryFeatures,
                      emergencyContact: e.target.value,
                    },
                  }))
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="afterHours"
                checked={
                  previewData.industryFeatures.afterHoursAvailable || false
                }
                onCheckedChange={(checked) =>
                  setPreviewData((prev) => ({
                    ...prev,
                    industryFeatures: {
                      ...prev.industryFeatures,
                      afterHoursAvailable: checked,
                    },
                  }))
                }
              />
              <Label htmlFor="afterHours">After Hours Available</Label>
            </div>
          </div>
        );

      case 'legal':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="attorneyBar">Attorney Bar Number</Label>
              <Input
                id="attorneyBar"
                value={previewData.industryFeatures.attorneyBarNumber || ''}
                onChange={(e) =>
                  setPreviewData((prev) => ({
                    ...prev,
                    industryFeatures: {
                      ...prev.industryFeatures,
                      attorneyBarNumber: e.target.value,
                    },
                  }))
                }
              />
            </div>

            <div>
              <Label htmlFor="lawFirm">Law Firm</Label>
              <Input
                id="lawFirm"
                value={previewData.industryFeatures.lawFirm || ''}
                onChange={(e) =>
                  setPreviewData((prev) => ({
                    ...prev,
                    industryFeatures: {
                      ...prev.industryFeatures,
                      lawFirm: e.target.value,
                    },
                  }))
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="confidential"
                checked={
                  previewData.industryFeatures.confidentialityRequired || false
                }
                onCheckedChange={(checked) =>
                  setPreviewData((prev) => ({
                    ...prev,
                    industryFeatures: {
                      ...prev.industryFeatures,
                      confidentialityRequired: checked,
                    },
                  }))
                }
              />
              <Label htmlFor="confidential">Confidentiality Required</Label>
            </div>
          </div>
        );

      // Add other industries as needed
      default:
        return (
          <div className="text-sm text-muted-foreground">
            No specific features available for this industry.
          </div>
        );
    }
  }
}
