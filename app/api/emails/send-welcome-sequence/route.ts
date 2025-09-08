// Flynn.ai v2 - Welcome Email Sequence API Route
import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';
import WelcomeEmail from '@/components/email-templates/WelcomeEmail';
import SetupCompleteEmail from '@/components/email-templates/SetupCompleteEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      industry,
      phoneNumber,
      emailType = 'welcome',
    } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Get user information
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, full_name, company_name, industry_type')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let emailResult;
    const userIndustry = industry || user.industry_type || 'general';

    // Determine which email to send
    switch (emailType) {
      case 'welcome':
        emailResult = await sendWelcomeEmail(user, userIndustry);
        break;
      case 'setup_complete':
        emailResult = await sendSetupCompleteEmail(
          user,
          userIndustry,
          phoneNumber
        );
        break;
      case 'sequence':
        // Send both emails in sequence
        await sendWelcomeEmail(user, userIndustry);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Brief delay
        emailResult = await sendSetupCompleteEmail(
          user,
          userIndustry,
          phoneNumber
        );
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        );
    }

    // Track email sent
    await supabase.from('email_logs').insert({
      user_id: userId,
      email_type: `onboarding_${emailType}`,
      recipient_email: user.email,
      status: emailResult.error ? 'failed' : 'sent',
      external_id: emailResult.data?.id || null,
      created_at: new Date().toISOString(),
    });

    if (emailResult.error) {
      console.error('Email sending failed:', emailResult.error);
      return NextResponse.json(
        {
          error: 'Failed to send email',
          details: emailResult.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${emailType} email sent successfully`,
      emailId: emailResult.data?.id,
    });
  } catch (error) {
    console.error('Welcome sequence error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function sendWelcomeEmail(user: any, industry: string) {
  const setupUrl = `${process.env.NEXT_PUBLIC_APP_URL}/onboarding?step=2`;
  const supportUrl = `${process.env.NEXT_PUBLIC_APP_URL}/support`;

  const emailHtml = render(
    WelcomeEmail({
      userName: user.full_name || 'there',
      companyName: user.company_name || 'Your Business',
      industry: industry,
      setupUrl: setupUrl,
      supportUrl: supportUrl,
    })
  );

  return await resend.emails.send({
    from: 'Flynn.ai <noreply@flynn.ai>',
    to: user.email,
    subject: `Welcome to Flynn.ai! Let's set up your ${getIndustryLabel(industry)} business`,
    html: emailHtml,
    tags: [
      { name: 'category', value: 'onboarding' },
      { name: 'email_type', value: 'welcome' },
      { name: 'industry', value: industry },
    ],
  });
}

async function sendSetupCompleteEmail(
  user: any,
  industry: string,
  phoneNumber?: string
) {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;
  const supportUrl = `${process.env.NEXT_PUBLIC_APP_URL}/support`;

  const emailHtml = render(
    SetupCompleteEmail({
      userName: user.full_name || 'there',
      companyName: user.company_name || 'Your Business',
      industry: industry,
      phoneNumber: phoneNumber || 'Not configured',
      dashboardUrl: dashboardUrl,
      supportUrl: supportUrl,
    })
  );

  return await resend.emails.send({
    from: 'Flynn.ai <noreply@flynn.ai>',
    to: user.email,
    subject: `🎉 ${user.company_name || 'Your business'} is ready! Start using Flynn.ai today`,
    html: emailHtml,
    tags: [
      { name: 'category', value: 'onboarding' },
      { name: 'email_type', value: 'setup_complete' },
      { name: 'industry', value: industry },
    ],
  });
}

function getIndustryLabel(industry: string): string {
  const labels: Record<string, string> = {
    plumbing: 'Plumbing & HVAC',
    real_estate: 'Real Estate',
    legal: 'Legal Services',
    medical: 'Medical Practice',
    sales: 'Sales',
    consulting: 'Consulting',
    general: 'Professional Services',
    other: 'Business',
  };

  return labels[industry] || 'Professional Services';
}
