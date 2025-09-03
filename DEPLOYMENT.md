# Flynn.ai v2 - Production Deployment Guide

## 🚀 Production Environment Setup

### Prerequisites

- **Vercel Account**: Enterprise or Pro plan recommended
- **Domain**: Custom domain configured with SSL
- **Monitoring**: Sentry, PostHog accounts configured
- **Services**: All third-party APIs provisioned for production

### 1. Vercel Project Configuration

```bash
# Install Vercel CLI
npm i -g vercel

# Login to your Vercel account
vercel login

# Link project (run in project root)
vercel link

# Deploy to production
vercel --prod
```

### 2. Environment Variables Setup

Copy production environment template:
```bash
cp .env.production.example .env.production
```

**Critical Production Variables:**
```bash
# Set all environment variables in Vercel dashboard
vercel env add NODE_ENV production
vercel env add NEXT_PUBLIC_APP_URL https://your-domain.com
# ... add all other variables from .env.production.example
```

### 3. Domain Configuration

1. **Custom Domain**: Add your domain in Vercel dashboard
2. **SSL Certificate**: Automatically managed by Vercel
3. **DNS Configuration**: Point your domain to Vercel

```bash
# Example DNS settings
A Record: @ -> 76.76.19.19
CNAME Record: www -> alias-to-vercel.vercel.app
```

### 4. Security Configuration

**Security Headers** (already configured in vercel.json):
- Content Security Policy
- HSTS (Strict-Transport-Security)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: origin-when-cross-origin

**API Security**:
- Rate limiting configured per endpoint
- Webhook signature verification
- JWT token validation
- CORS policy restrictions

### 5. Performance Optimization

**CDN Configuration**:
- Static assets cached for 1 year
- Images optimized with AVIF/WebP
- Gzip compression enabled
- Edge caching for API responses

**Database Optimization**:
```sql
-- Run these on production Supabase
CREATE INDEX CONCURRENTLY idx_calls_user_id_created_at ON calls(user_id, created_at);
CREATE INDEX CONCURRENTLY idx_events_call_id ON events(call_id);
CREATE INDEX CONCURRENTLY idx_events_status ON events(status);
```

### 6. Monitoring Setup

**Application Monitoring**:
- Sentry for error tracking
- PostHog for user analytics
- Vercel Analytics for performance

**Health Checks**:
- `/api/performance/health` - Basic health status
- `/api/performance/database` - Database connectivity
- `/api/performance/integrations` - Third-party services

**Alerts Configuration**:
```bash
# Set up alerts for:
# - API response time > 2 seconds
# - Error rate > 1%
# - Database connection failures
# - AI processing failures
```

### 7. Backup & Disaster Recovery

**Database Backups**:
- Supabase automatic daily backups
- Point-in-time recovery enabled
- Cross-region backup replication

**Application Backups**:
- Code repository on GitHub
- Environment variables documented
- Infrastructure as Code (vercel.json)

**Recovery Procedures**:
1. **Database Recovery**: Use Supabase dashboard or CLI
2. **Application Recovery**: Redeploy from GitHub
3. **DNS Recovery**: Update DNS settings if needed

### 8. Load Testing

Before production launch:
```bash
# Install load testing tools
npm install -g artillery k6

# Run load tests
artillery run load-tests/api-stress-test.yml
k6 run load-tests/user-journey.js

# Target metrics:
# - 99th percentile response time < 2s
# - Support 1000 concurrent users
# - 0.1% error rate under normal load
```

### 9. Security Audit

**Pre-launch Security Checklist**:
- [ ] All environment variables secured
- [ ] Database RLS policies active
- [ ] API endpoints authenticated
- [ ] Webhook signatures verified
- [ ] Rate limiting configured
- [ ] HTTPS enforced everywhere
- [ ] Security headers configured
- [ ] Third-party API keys rotated
- [ ] Audit logging enabled
- [ ] Data encryption verified

### 10. Go-Live Checklist

**Technical Readiness**:
- [ ] Production deploy successful
- [ ] Health checks passing
- [ ] SSL certificate active
- [ ] Domain pointing correctly
- [ ] All integrations tested
- [ ] Monitoring dashboards active
- [ ] Backup systems verified
- [ ] Load testing completed
- [ ] Security audit passed

**Business Readiness**:
- [ ] Customer support system ready
- [ ] Payment processing tested
- [ ] Email templates finalized
- [ ] Industry configurations validated
- [ ] Legal compliance verified
- [ ] Analytics tracking active

## 🔧 Production Maintenance

### Daily Monitoring

1. **Check Health Endpoints**:
   ```bash
   curl https://your-domain.com/health
   curl https://your-domain.com/api/performance/health
   ```

2. **Review Error Logs**:
   - Sentry dashboard
   - Vercel function logs
   - Supabase logs

3. **Monitor Key Metrics**:
   - API response times
   - AI processing success rate
   - Email delivery rates
   - User conversion metrics

### Weekly Maintenance

1. **Performance Review**:
   - Analyze slow queries
   - Review API usage patterns
   - Check cache hit rates
   - Monitor resource usage

2. **Security Updates**:
   - Update dependencies
   - Rotate API keys quarterly
   - Review access logs
   - Check for security advisories

### Monthly Operations

1. **Capacity Planning**:
   - Review usage growth
   - Scale resources if needed
   - Optimize database queries
   - Update rate limits

2. **Business Analysis**:
   - Customer success metrics
   - Revenue analytics
   - Feature usage statistics
   - Support ticket analysis

## 🚨 Emergency Procedures

### System Down

1. **Immediate Response**:
   ```bash
   # Check Vercel status
   vercel --prod status
   
   # Check external services
   curl https://status.supabase.com
   curl https://status.openai.com
   curl https://status.twilio.com
   ```

2. **Quick Recovery**:
   ```bash
   # Rollback to previous deployment
   vercel rollback
   
   # Force redeploy
   vercel --prod --force
   ```

### Database Issues

1. **Connection Problems**:
   - Check Supabase dashboard
   - Verify connection strings
   - Review connection pool settings

2. **Performance Issues**:
   - Check slow query log
   - Review database metrics
   - Consider scaling resources

### Third-Party Service Outages

1. **OpenAI API Issues**:
   - Enable fallback processing
   - Queue requests for retry
   - Notify users of delays

2. **Twilio Service Issues**:
   - Check Twilio status page
   - Review webhook delivery
   - Verify phone number configuration

## 📊 Production Metrics

### Success Criteria

- **Uptime**: 99.9% (8.77 hours downtime/year)
- **Response Time**: 95th percentile < 2 seconds
- **AI Accuracy**: 90%+ event extraction
- **Email Delivery**: 99%+ delivery rate
- **Customer Satisfaction**: 4.5+ rating

### Key Performance Indicators

- **Technical KPIs**:
  - API response time
  - Error rates by endpoint
  - Database query performance
  - Third-party service availability

- **Business KPIs**:
  - User conversion rates
  - Feature adoption rates
  - Customer lifetime value
  - Monthly recurring revenue

This deployment guide ensures Flynn.ai v2 meets enterprise-grade reliability, security, and performance standards for production use.