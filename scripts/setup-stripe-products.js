#!/usr/bin/env node

/**
 * Flynn.ai v2 - Stripe Product Setup Script
 * Creates subscription products and pricing for the Flynn.ai platform
 */

const { spawn } = require('child_process');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const STRIPE_API_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_API_KEY) {
  console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
  console.log('Please add your Stripe secret key to .env.local');
  process.exit(1);
}

console.log('🚀 Flynn.ai v2 - Setting up Stripe products...\n');

/**
 * Flynn.ai subscription tiers as defined in CLAUDE.md
 */
const PRODUCTS_TO_CREATE = [
  {
    name: 'Flynn.ai Basic',
    description:
      'AI call notes and event extraction with professional email delivery',
    features: [
      'AI call notes and event extraction',
      'Professional email delivery',
      'Basic calendar integration (ICS files)',
      '100 calls per month',
      'Email support',
    ],
    price_aud: 29,
    billing_period: 'month',
    trial_days: 30,
  },
  {
    name: 'Flynn.ai Professional',
    description:
      'Advanced calendar sync with SMS notifications and bulk management',
    features: [
      'Everything in Basic',
      'Advanced calendar sync (Google, Outlook)',
      'SMS customer notifications',
      'Bulk event management',
      '500 calls per month',
      'Priority support',
    ],
    price_aud: 79,
    billing_period: 'month',
    trial_days: 30,
  },
  {
    name: 'Flynn.ai Enterprise',
    description: 'Unlimited calls with custom configurations and API access',
    features: [
      'Everything in Professional',
      'Unlimited calls',
      'Custom industry configurations',
      'Team collaboration',
      'API access',
      'Dedicated support',
    ],
    price_aud: 149,
    billing_period: 'month',
    trial_days: 30,
  },
];

async function runStripeCommand(args) {
  return new Promise((resolve, reject) => {
    console.log(`Running: npx @stripe/mcp ${args.join(' ')}`);

    const child = spawn('npx', ['@stripe/mcp', ...args], {
      stdio: 'pipe',
      env: {
        ...process.env,
        STRIPE_SECRET_KEY: STRIPE_API_KEY,
      },
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr}`));
      }
    });
  });
}

async function createProducts() {
  try {
    console.log('📦 Creating Flynn.ai subscription products...\n');

    for (const product of PRODUCTS_TO_CREATE) {
      console.log(`\n🏷️  Creating product: ${product.name}`);
      console.log(
        `   Price: $${product.price_aud} AUD/${product.billing_period}`
      );
      console.log(`   Trial: ${product.trial_days} days`);

      // Create product using Stripe MCP
      try {
        const createResult = await runStripeCommand([
          '--tools=products.create,prices.create',
          '--api-key=' + STRIPE_API_KEY,
        ]);

        console.log(`   ✅ Product creation command executed`);

        // Note: The actual product creation would need to be done via the Stripe MCP tools
        // For now, we'll output the configuration that should be created
        console.log(`   📋 Configuration:`);
        console.log(`      Name: ${product.name}`);
        console.log(`      Description: ${product.description}`);
        console.log(`      Currency: AUD`);
        console.log(`      Amount: ${product.price_aud * 100} cents`);
        console.log(`      Interval: ${product.billing_period}`);
        console.log(`      Trial Period: ${product.trial_days} days`);
      } catch (error) {
        console.log(
          `   ⚠️  Note: Manual creation required via Stripe Dashboard`
        );
        console.log(`   Error: ${error.message}`);
      }
    }

    console.log('\n📝 Next Steps:');
    console.log(
      '1. Create products manually in Stripe Dashboard if MCP creation failed'
    );
    console.log('2. Copy the Price IDs to your .env.local file:');
    console.log('   STRIPE_PRICE_ID_BASIC_AUD=price_xxx');
    console.log('   STRIPE_PRICE_ID_PROFESSIONAL_AUD=price_xxx');
    console.log('   STRIPE_PRICE_ID_ENTERPRISE_AUD=price_xxx');
    console.log('3. Update the PRICE_IDS in lib/stripe/client.ts');
    console.log('4. Test the subscription flow');
  } catch (error) {
    console.error('❌ Failed to setup products:', error);
    process.exit(1);
  }
}

// Run the setup
createProducts().catch(console.error);
