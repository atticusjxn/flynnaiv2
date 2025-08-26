# Flynn.ai v2 AI Extraction System

## Overview
Industry-aware AI system using OpenAI GPT-4 for extracting events, topics, and metadata from business call transcriptions. The system adapts prompts and extraction logic based on detected industry context.

## Core AI Components

### 1. Call Topic Extraction
Generates email subject lines and call summaries.

### 2. Industry Classification
Identifies business type from call content and user profile.

### 3. Event Extraction
Finds time-sensitive commitments, appointments, and tasks.

### 4. Sentiment Analysis
Assesses urgency, customer satisfaction, and follow-up needs.

## Industry-Aware Prompt Engineering

### Base System Prompt
```
You are Flynn.ai, an expert AI assistant specializing in analyzing business phone calls across various industries. Your task is to extract actionable events, appointments, and commitments from call transcriptions.

Key Responsibilities:
1. Extract ALL time-sensitive events mentioned in the call
2. Classify events appropriately for the business context  
3. Generate professional summaries for email communication
4. Assess urgency and follow-up requirements
5. Structure data for calendar integration

Always prioritize accuracy over quantity. If information is unclear, mark confidence as low and flag for human review.
```

### Industry-Specific Prompt Modifiers

#### Plumbing/HVAC Services
```
INDUSTRY CONTEXT: Plumbing/HVAC Services
Common Event Types: service_call, quote, emergency, follow_up, inspection

TERMINOLOGY:
- "come out" or "come by" = service_call
- "take a look" = quote/inspection  
- "emergency" or "urgent" = emergency
- "estimate" or "quote" = quote
- "follow up" or "check back" = follow_up

EXTRACTION FOCUS:
- Service addresses (critical for field work)
- Problem descriptions (for preparation)
- Preferred time windows (morning/afternoon/evening)
- Emergency indicators (after hours, weekends)
- Equipment types and models mentioned
- Price estimates or budget discussions

URGENCY INDICATORS:
- Water damage, flooding = emergency
- No hot water, no heat = high
- Routine maintenance = low
- "when you can" = medium
```

#### Real Estate
```
INDUSTRY CONTEXT: Real Estate
Common Event Types: meeting, inspection, appointment, follow_up

TERMINOLOGY:
- "showing" or "show the property" = meeting
- "walk through" = inspection
- "meet up" or "get together" = meeting
- "look at properties" = meeting
- "closing" = appointment

EXTRACTION FOCUS:
- Property addresses (essential for showings)
- Property types (house, condo, commercial)
- Buyer/seller status and preferences
- Price ranges discussed
- Viewing preferences (times, days)
- Decision timelines

URGENCY INDICATORS:
- "closing soon" = high
- "pre-approved" buyer = high
- "just looking" = low
- "need to move quickly" = high
```

#### Legal Services
```
INDUSTRY CONTEXT: Legal Services
Common Event Types: consultation, meeting, appointment

TERMINOLOGY:
- "consult" or "consultation" = consultation
- "meet with attorney" = appointment
- "court date" = appointment
- "review documents" = meeting
- "legal advice" = consultation

EXTRACTION FOCUS:
- Case types (divorce, business, criminal, etc.)
- Document requirements
- Court dates and deadlines
- Client confidentiality considerations
- Billing structure discussions
- Referral sources

URGENCY INDICATORS:
- Court deadlines = emergency
- "statute of limitations" = high
- "general question" = low
- "time sensitive" = high
```

#### Medical/Healthcare
```
INDUSTRY CONTEXT: Medical/Healthcare
Common Event Types: appointment, consultation, follow_up, emergency

TERMINOLOGY:
- "appointment" = appointment
- "check-up" = appointment
- "follow-up" = follow_up
- "urgent care" = emergency
- "consultation" = consultation

EXTRACTION FOCUS:
- Patient information (name, DOB if mentioned)
- Symptoms or concerns
- Insurance information
- Preferred appointment times
- Physician preferences
- Referral information

URGENCY INDICATORS:
- "emergency" or "urgent" = emergency
- "pain" or "severe symptoms" = high
- "routine check-up" = low
- "follow-up" = medium

COMPLIANCE NOTES:
- Handle all information as potentially PHI
- Flag for HIPAA compliance review
- No storage of detailed medical information
```

#### Sales/Business Development
```
INDUSTRY CONTEXT: Sales/Business Development
Common Event Types: demo, meeting, follow_up, consultation

TERMINOLOGY:
- "demo" or "demonstration" = demo
- "sales call" = meeting
- "follow up" = follow_up
- "proposal meeting" = meeting
- "discovery call" = consultation

EXTRACTION FOCUS:
- Company size and industry
- Budget and timeline discussions
- Decision maker identification
- Product/service interest areas
- Competitor mentions
- Implementation timelines

URGENCY INDICATORS:
- "budget approved" = high
- "need by end of quarter" = high
- "exploring options" = low
- "decision next week" = high
```

#### Consulting Services
```
INDUSTRY CONTEXT: Consulting Services
Common Event Types: consultation, meeting, follow_up

TERMINOLOGY:
- "strategy session" = meeting
- "consultation" = consultation
- "project kickoff" = meeting
- "check-in" = follow_up
- "planning session" = meeting

EXTRACTION FOCUS:
- Project scope and objectives
- Timeline and deliverables
- Budget and resource requirements
- Stakeholder identification
- Success metrics
- Engagement duration

URGENCY INDICATORS:
- "board meeting coming up" = high
- "quarterly planning" = high
- "general discussion" = low
- "time sensitive project" = high
```

## Main Extraction Prompt Template

```
CALL TRANSCRIPTION ANALYSIS

USER PROFILE:
Industry: {user_industry}
Company: {company_name}
Previous call patterns: {call_patterns}

CALL DETAILS:
Duration: {call_duration} seconds
Caller: {caller_number}
Timestamp: {call_timestamp}

TRANSCRIPTION:
{transcription_text}

PLEASE EXTRACT:

1. MAIN TOPIC (for email subject line):
   - One clear, professional phrase describing the call's primary purpose
   - Use industry-appropriate terminology
   - Keep under 60 characters

2. CALL SUMMARY:
   - 2-3 sentence professional summary
   - Include key customer needs and discussion points
   - Use business-appropriate language

3. EVENTS (JSON array):
   For each time-sensitive commitment or appointment:
   ```json
   {
     "event_type": "service_call|meeting|appointment|demo|follow_up|quote|consultation|inspection|emergency",
     "title": "Clear, descriptive title",
     "description": "Detailed description of what needs to happen",
     "proposed_datetime": "2025-01-16T14:00:00Z or null if unclear",
     "duration_minutes": 60,
     "location": "Full address or 'virtual' or 'phone' or 'TBD'",
     "location_type": "address|virtual|phone|tbd",
     "customer_name": "Full name if mentioned",
     "customer_phone": "Phone number if different from caller",
     "customer_email": "Email if mentioned",
     "price_estimate": 150.00,
     "urgency_level": "low|medium|high|emergency",
     "notes": "Additional context, special requests, etc.",
     "ai_confidence": 0.85,
     "follow_up_required": true,
     "follow_up_reason": "Need to confirm materials availability"
   }
   ```

4. SENTIMENT ANALYSIS:
   - customer_satisfaction: "positive|neutral|negative"
   - urgency_indicators: ["water damage", "no heat"]
   - follow_up_triggers: ["price concerns", "scheduling conflicts"]

5. EXTRACTION METADATA:
   - processing_time: timestamp
   - confidence_score: 0.0-1.0
   - industry_classification_confidence: 0.0-1.0
   - requires_human_review: boolean

EXTRACTION GUIDELINES:
{industry_specific_guidelines}

Be conservative with date/time extraction. If not clearly stated, mark as null and set follow_up_required: true.
Always include confidence scores for uncertain extractions.
Flag complex or unclear situations for human review.

OUTPUT FORMAT: Valid JSON only, no additional text.
```

## Event Classification Logic

### Event Type Decision Tree

```python
def classify_event_type(transcript, industry, keywords):
    """
    Classify event type based on transcript content, industry, and keywords.
    """
    
    # Emergency indicators (highest priority)
    emergency_keywords = ['emergency', 'urgent', 'asap', 'right away', 'water damage', 'no heat', 'broken']
    if any(keyword in transcript.lower() for keyword in emergency_keywords):
        return 'emergency'
    
    # Industry-specific classification
    if industry == 'plumbing':
        if any(word in transcript.lower() for word in ['quote', 'estimate', 'price']):
            return 'quote'
        if any(word in transcript.lower() for word in ['fix', 'repair', 'install']):
            return 'service_call'
            
    elif industry == 'real_estate':
        if any(word in transcript.lower() for word in ['showing', 'show property', 'tour']):
            return 'meeting'
        if any(word in transcript.lower() for word in ['inspection', 'walk through']):
            return 'inspection'
            
    elif industry == 'legal':
        if any(word in transcript.lower() for word in ['consult', 'consultation', 'legal advice']):
            return 'consultation'
        if any(word in transcript.lower() for word in ['court', 'hearing', 'deposition']):
            return 'appointment'
            
    elif industry == 'medical':
        if any(word in transcript.lower() for word in ['appointment', 'visit', 'checkup']):
            return 'appointment'
        if any(word in transcript.lower() for word in ['follow up', 'results', 'check back']):
            return 'follow_up'
            
    elif industry == 'sales':
        if any(word in transcript.lower() for word in ['demo', 'demonstration', 'show you']):
            return 'demo'
        if any(word in transcript.lower() for word in ['meeting', 'discuss', 'go over']):
            return 'meeting'
    
    # Default fallback
    return 'meeting'
```

## Confidence Scoring System

### Confidence Factors

```python
def calculate_confidence_score(extraction_data):
    """
    Calculate confidence score based on multiple factors.
    """
    confidence = 1.0
    
    # Date/time clarity
    if extraction_data.get('proposed_datetime'):
        confidence *= 0.9  # High confidence for explicit dates
    else:
        confidence *= 0.6  # Lower for vague timing
    
    # Location specificity
    location_type = extraction_data.get('location_type')
    if location_type == 'address' and len(extraction_data.get('location', '')) > 20:
        confidence *= 0.95  # High confidence for full addresses
    elif location_type == 'tbd':
        confidence *= 0.7   # Lower for unclear locations
    
    # Customer information completeness
    if extraction_data.get('customer_name') and extraction_data.get('customer_phone'):
        confidence *= 0.95
    elif not extraction_data.get('customer_name'):
        confidence *= 0.8
    
    # Transcription quality
    transcription_confidence = extraction_data.get('transcription_confidence', 0.8)
    confidence *= transcription_confidence
    
    return min(confidence, 1.0)
```

## Quality Assurance Rules

### Validation Checks

```python
def validate_extraction(extraction_result):
    """
    Validate extracted events for completeness and accuracy.
    """
    validation_errors = []
    
    for event in extraction_result.get('events', []):
        # Required fields check
        if not event.get('title'):
            validation_errors.append(f"Event missing title: {event.get('id')}")
        
        # Date format validation
        if event.get('proposed_datetime'):
            try:
                datetime.fromisoformat(event['proposed_datetime'].replace('Z', '+00:00'))
            except ValueError:
                validation_errors.append(f"Invalid datetime format: {event.get('proposed_datetime')}")
        
        # Phone number format
        if event.get('customer_phone'):
            if not re.match(r'^\+?1?[0-9]{10,}$', event['customer_phone'].replace('-', '').replace(' ', '')):
                validation_errors.append(f"Invalid phone format: {event.get('customer_phone')}")
        
        # Confidence threshold
        if event.get('ai_confidence', 0) < 0.3:
            validation_errors.append(f"Low confidence event: {event.get('title')} ({event.get('ai_confidence')})")
    
    return validation_errors
```

## Fallback Strategies

### When AI Extraction Fails

1. **Low Confidence Events**:
   - Flag for human review
   - Send basic email with transcript
   - Create generic "Follow-up Required" event

2. **No Events Detected**:
   - Create "Call Review" event
   - Include full transcript
   - Set status to "pending"

3. **Multiple Interpretation Possibilities**:
   - Extract all possibilities
   - Mark with lower confidence
   - Flag for user disambiguation

## Testing Prompts

### Test Cases by Industry

#### Plumbing Test Transcript
```
"Hi, I'm calling because my kitchen sink has been leaking for two days now and it's getting worse. I need someone to come out and fix it. I'm available tomorrow afternoon after 2 PM or Thursday morning before 10 AM. The address is 123 Oak Street in Springfield. My name is Sarah Johnson and my number is 555-0123. Can you give me an estimate over the phone or do you need to see it first?"

Expected Extraction:
- Main Topic: "Kitchen sink leak repair"
- Event Type: "service_call"
- Urgency: "high" (mentioned "getting worse")
- Proposed times: Multiple options
- Customer info: Complete
```

#### Real Estate Test Transcript  
```
"Hello, I'm interested in seeing the property at 456 Elm Avenue that's listed for $350,000. I'm pre-approved for up to $375K and I'm looking to move quickly. Could we schedule a showing this weekend? Saturday afternoon would be perfect. I'm John Smith, 555-0456. I've been working with Maria Lopez as my agent but she suggested I call you directly since it's your listing."

Expected Extraction:
- Main Topic: "Property showing - 456 Elm Avenue"  
- Event Type: "meeting"
- Urgency: "high" (pre-approved, wants to move quickly)
- Location: Full property address
- Price context: Important for notes
```

## Implementation Architecture

### AI Processing Pipeline

```python
class AIExtractionPipeline:
    def __init__(self):
        self.openai_client = OpenAI()
        self.industry_prompts = load_industry_prompts()
        
    async def process_call(self, call_record):
        """Main processing pipeline for call extraction."""
        
        # 1. Prepare context
        context = self.prepare_context(call_record)
        
        # 2. Select appropriate prompt
        prompt = self.select_industry_prompt(context['industry'])
        
        # 3. Execute extraction
        raw_result = await self.extract_with_openai(prompt, context)
        
        # 4. Validate and clean results
        validated_result = self.validate_extraction(raw_result)
        
        # 5. Calculate confidence scores
        final_result = self.calculate_confidence_scores(validated_result)
        
        return final_result
        
    async def extract_with_openai(self, prompt, context):
        """Call OpenAI API with retry logic."""
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": context['transcription']}
                ],
                temperature=0.1,  # Low temperature for consistency
                max_tokens=2000,
                response_format={"type": "json_object"}
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            return self.handle_extraction_failure(e, context)
```

## Performance Optimization

### Caching Strategy
- Cache industry prompts in memory
- Cache user industry classifications
- Store processed results for reprocessing

### Rate Limiting
- Batch multiple calls when possible
- Implement queue system for high volume
- Use OpenAI's batch API for non-real-time processing

### Error Handling
- Graceful degradation when AI unavailable
- Fallback to basic transcript parsing
- Human review queue for failed extractions

This AI extraction system provides robust, industry-aware processing of business calls while maintaining high accuracy and appropriate fallback mechanisms.