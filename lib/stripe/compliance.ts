// Flynn.ai v2 - Australian Compliance Helpers
import { formatCurrency } from './client';

/**
 * Australian GST (Goods and Services Tax) utilities
 */
export const GST_RATE = 0.10; // 10% GST rate in Australia

/**
 * Calculate GST amount from an AUD price
 * @param price Price in AUD (GST inclusive)
 * @returns Object with GST exclusive price, GST amount, and GST inclusive price
 */
export function calculateGST(price: number) {
  const gstExclusivePrice = price / (1 + GST_RATE);
  const gstAmount = price - gstExclusivePrice;
  
  return {
    gstExclusivePrice: Math.round(gstExclusivePrice * 100) / 100,
    gstAmount: Math.round(gstAmount * 100) / 100,
    gstInclusivePrice: price,
  };
}

/**
 * Format price display with GST information for Australian customers
 * @param price Price in AUD
 * @param showBreakdown Whether to show GST breakdown
 * @returns Formatted price string
 */
export function formatAustralianPrice(price: number, showBreakdown: boolean = false): string {
  const formatted = formatCurrency(price);
  
  if (!showBreakdown) {
    return `${formatted} (GST inclusive)`;
  }
  
  const { gstExclusivePrice, gstAmount } = calculateGST(price);
  return `${formatted} (inc. ${formatCurrency(gstAmount)} GST)`;
}

/**
 * Australian Business Number (ABN) validation
 * @param abn ABN string to validate
 * @returns Whether the ABN is valid
 */
export function validateABN(abn: string): boolean {
  // Remove all non-digits
  const cleanABN = abn.replace(/\D/g, '');
  
  // Must be 11 digits
  if (cleanABN.length !== 11) {
    return false;
  }
  
  // Convert to array of numbers
  const digits = cleanABN.split('').map(Number);
  
  // Subtract 1 from the first digit
  digits[0] -= 1;
  
  // Apply weighting
  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  const sum = digits.reduce((acc, digit, index) => acc + digit * weights[index], 0);
  
  // Check if sum is divisible by 89
  return sum % 89 === 0;
}

/**
 * Australian Tax Invoice requirements for Stripe metadata
 * @param customerInfo Customer information
 * @returns Metadata object for Stripe
 */
export function generateTaxInvoiceMetadata(customerInfo: {
  companyName?: string;
  abn?: string;
  address?: string;
  email: string;
}) {
  const metadata: Record<string, string> = {
    country: 'AU',
    tax_type: 'GST',
    tax_rate: (GST_RATE * 100).toString(),
    invoice_type: 'tax_invoice',
    customer_email: customerInfo.email,
  };
  
  if (customerInfo.companyName) {
    metadata.company_name = customerInfo.companyName;
  }
  
  if (customerInfo.abn && validateABN(customerInfo.abn)) {
    metadata.customer_abn = customerInfo.abn;
  }
  
  if (customerInfo.address) {
    metadata.customer_address = customerInfo.address;
  }
  
  return metadata;
}

/**
 * Generate Australian Tax Invoice details for email
 * @param amount Amount in AUD cents
 * @param customerInfo Customer information
 * @returns Invoice details object
 */
export function generateTaxInvoiceDetails(
  amount: number, 
  customerInfo: { companyName?: string; abn?: string; email: string }
) {
  const priceInDollars = amount / 100;
  const gstDetails = calculateGST(priceInDollars);
  
  return {
    invoiceNumber: `FLY-${Date.now()}`,
    issueDate: new Date().toLocaleDateString('en-AU'),
    dueDate: new Date().toLocaleDateString('en-AU'), // Immediate payment
    
    // Supplier details (Flynn.ai)
    supplier: {
      name: 'Flynn.ai',
      abn: '12 345 678 901', // TODO: Replace with actual ABN when obtained
      address: 'Australia', // TODO: Replace with actual business address
      email: 'billing@flynn.ai',
    },
    
    // Customer details
    customer: {
      name: customerInfo.companyName || 'Individual',
      abn: customerInfo.abn,
      email: customerInfo.email,
    },
    
    // Invoice amounts
    amounts: {
      subtotal: formatCurrency(gstDetails.gstExclusivePrice),
      gst: formatCurrency(gstDetails.gstAmount),
      total: formatCurrency(gstDetails.gstInclusivePrice),
    },
    
    // Service description
    description: 'Flynn.ai - AI-Powered Call to Calendar Automation Service',
    period: 'Monthly Subscription',
  };
}

/**
 * Australian Consumer Law compliance notice
 */
export const CONSUMER_LAW_NOTICE = `
This service is provided in accordance with Australian Consumer Law. 
You have rights under the Australian Consumer Law that cannot be excluded. 
For major failures with the service, you are entitled to cancel and receive a refund, 
or to compensation for any drop in value. You are also entitled to have problems 
fixed in a reasonable time. If the problem cannot be fixed, you are entitled to a refund.
`;

/**
 * Privacy Act compliance notice for Australian customers
 */
export const PRIVACY_ACT_NOTICE = `
Flynn.ai collects personal information in accordance with the Privacy Act 1988 (Cth). 
We collect your information to provide our AI-powered call automation services. 
Our Privacy Policy is available at flynn.ai/privacy and explains how we handle your information.
`;

/**
 * Cooling-off period for Australian consumers (if applicable)
 */
export const COOLING_OFF_PERIOD_DAYS = 10;