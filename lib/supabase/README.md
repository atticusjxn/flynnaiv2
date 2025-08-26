# Flynn.ai v2 Supabase Setup

This directory contains all the database setup and operations for Flynn.ai v2.

## 🚀 Quick Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and API keys

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and fill in:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 3. Run Database Migrations
Execute the SQL files in order in your Supabase SQL editor:

1. `migrations/001_initial_schema.sql` - Creates all tables, RLS policies, functions
2. `migrations/002_initial_data.sql` - Inserts default configurations and templates

### 4. Test Database Setup
Run the test operations to verify everything works:

```typescript
import { runAllTests } from '@/lib/supabase/test-operations';

// In a test environment or API route
await runAllTests();
```

## 📁 File Structure

```
lib/supabase/
├── migrations/           # Database migration files
│   ├── 001_initial_schema.sql
│   └── 002_initial_data.sql
├── users.ts             # User CRUD operations
├── calls.ts             # Call management operations
├── events.ts            # Event management operations
├── analytics.ts         # Analytics and reporting
├── test-operations.ts   # Database operation tests
└── README.md           # This file
```

## 🛠️ Database Operations

### User Operations
```typescript
import { UserService } from '@/lib/supabase/users';

const userService = new UserService();
const user = await userService.getCurrentUser();
```

### Call Operations
```typescript
import { CallService } from '@/lib/supabase/calls';

const callService = new CallService();
const call = await callService.createCall({
  user_id: userId,
  twilio_call_sid: 'CAxxxx',
  caller_number: '+1234567890'
});
```

### Event Operations
```typescript
import { EventService } from '@/lib/supabase/events';

const eventService = new EventService();
const events = await eventService.getUserEvents(userId);
```

### Analytics Operations
```typescript
import { AnalyticsService } from '@/lib/supabase/analytics';

const analyticsService = new AnalyticsService();
const stats = await analyticsService.getDashboardStats(userId);
```

## 🔒 Security Features

### Row Level Security (RLS)
All tables have RLS enabled with policies that ensure:
- Users can only access their own data
- Service role can access all data for system operations
- Audit logs track all data modifications

### Data Protection
- Sensitive fields are marked for encryption
- API keys stored separately from database
- Audit trail for all user actions

## 📊 Database Schema

### Core Tables
- **users** - User accounts and subscription info
- **phone_numbers** - Twilio phone numbers assigned to users
- **calls** - Call records with transcription and processing status
- **events** - Extracted events from calls (core feature)
- **calendar_integrations** - User calendar sync settings
- **email_templates** - Industry-specific email templates
- **communication_logs** - All outbound communications tracking
- **industry_configurations** - Industry-specific settings
- **audit_logs** - System activity tracking

### Key Features
- **Flexible Event System**: Supports all business types
- **Industry Configurations**: Pre-configured for plumbing, real estate, legal, medical, sales, consulting
- **Email Templates**: Industry-specific with variable substitution
- **Real-time Updates**: Enabled for calls, events, and communications
- **Analytics Functions**: Built-in stats and conversion tracking

## 🧪 Testing

The test operations verify:
- ✅ Database connection
- ✅ User operations (CRUD)
- ✅ Call operations (creation, updates)
- ✅ Event operations (extraction, management)
- ✅ Analytics functions (stats, metrics)

## 🔄 Data Flow

1. **Call Received** → Webhook creates call record
2. **AI Processing** → Extract events from transcription
3. **Event Creation** → Store extracted events with confidence scores
4. **Email Generation** → Send professional email with events
5. **Calendar Sync** → Optional sync to user calendars
6. **Analytics** → Track conversion rates and performance

## 📈 Performance Optimizations

- **Indexes** on frequently queried columns (user_id, created_at, status)
- **Partitioning** consideration for high-volume calls table
- **Connection Pooling** via Supabase
- **Real-time Subscriptions** only for critical updates

## 🚨 Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check environment variables
   - Verify Supabase project is active
   - Ensure RLS policies allow access

2. **Migration Errors**
   - Run migrations in order
   - Check for existing tables before running
   - Verify user has sufficient permissions

3. **RLS Policy Issues**
   - Ensure user is authenticated
   - Check policy conditions
   - Use service role for admin operations

4. **Real-time Not Working**
   - Verify tables are added to publication
   - Check client-side subscription setup
   - Ensure RLS allows real-time access

## 📝 Migration Notes

When updating the schema:
1. Create new migration files with incremental numbers
2. Update TypeScript types accordingly
3. Test migrations on staging environment first
4. Update this README with any new operations or changes

---

This setup provides a robust, scalable foundation for Flynn.ai v2's universal business call-to-calendar platform.