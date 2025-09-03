# Stripe Setup Guide for Flynn.ai v2 (Australian Market)

## Environment Variables Required

Add these to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRICE_ID_MONTHLY_AUD=price_your_monthly_aud_price_id
```

## Stripe Dashboard Setup

### 1. Create Product

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → Products → **Add Product**
2. Fill in product details:
   - **Name**: "Flynn.ai Monthly Subscription"
   - **Description**: "AI-powered call-to-calendar automation for Australian businesses"
   - **Upload Flynn.ai logo**

### 2. Set Up Pricing

1. **Pricing Model**: Recurring
2. **Price**: $29.00 AUD
3. **Billing Period**: Monthly
4. **Tax Behavior**: **Inclusive** (GST is already included in the $29 price)
5. **Currency**: Australian Dollar (AUD)
6. Copy the **Price ID** (starts with `price_`) and add to `STRIPE_PRICE_ID_MONTHLY_AUD`

### 3. Configure Webhooks

1. Go to **Developers** → **Webhooks** → **Add endpoint**
2. **Endpoint URL**: `https://yourapp.com/api/webhooks/stripe` (use ngrok for local development)
3. **Events to send**:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `checkout.session.completed`
4. Copy the **Signing secret** and add to `STRIPE_WEBHOOK_SECRET`

### 4. Test Mode vs Live Mode

- **Development**: Use test mode keys (`sk_test_` and `pk_test_`)
- **Production**: Switch to live mode keys (`sk_live_` and `pk_live_`)

## Australian Compliance Features

### GST (Goods and Services Tax)

- **Rate**: 10% (automatically calculated)
- **Pricing**: GST inclusive ($29 AUD includes GST)
- **Invoicing**: Automatic tax invoices for Australian customers
- **ABN**: Update `FLYNN_AI_ABN` when you obtain your Australian Business Number

### Customer Portal Features

- **Invoice History**: Download tax invoices
- **Payment Methods**: Update credit cards
- **Subscription Management**: Cancel with Australian consumer protection (end of period)
- **Customer Details**: Update address and tax information

### Privacy & Consumer Law

- Automatic compliance notices for Australian Consumer Law
- Privacy Act 1988 compliance
- Clear cancellation terms

## Testing the Integration

### Test Credit Cards (Australia)

```
Visa: 4000 0000 0000 0036 (AU)
Mastercard: 5555 5555 5555 4444
```

### Test Scenarios

1. **Free Trial Signup**: No credit card required, 30-day trial
2. **Trial to Paid**: Upgrade flow with Australian checkout
3. **Failed Payment**: Test dunning management
4. **Cancellation**: Test consumer protection cancellation
5. **Webhooks**: Verify all subscription events are processed

## Production Checklist

- [ ] Switch to live Stripe keys
- [ ] Update webhook URL to production domain
- [ ] Obtain Australian Business Number (ABN)
- [ ] Set up proper business address
- [ ] Configure tax settings in Stripe
- [ ] Test payment flows with real cards
- [ ] Verify GST calculations
- [ ] Review customer portal settings
- [ ] Set up monitoring and alerts

## Troubleshooting

### Common Issues

1. **Webhook 400 errors**: Check webhook secret and signature verification
2. **GST not calculating**: Verify tax_behavior is set to 'inclusive'
3. **AUD conversion**: Ensure currency is set to 'aud' in all API calls
4. **Test vs Live**: Double-check you're using the right mode keys

### Logs to Monitor

- Stripe webhook events in Dashboard → Developers → Events
- Application logs for payment processing
- Database updates for subscription status
- Customer emails for payment confirmations

## Support

- **Stripe Support**: Available via dashboard
- **Australian Business**: Contact Australian Business Registry for ABN
- **Flynn.ai**: Internal documentation and development team
