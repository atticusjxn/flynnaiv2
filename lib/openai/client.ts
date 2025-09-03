// OpenAI Client Configuration for Flynn.ai v2
import OpenAI from 'openai';

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// OpenAI configuration constants
export const OPENAI_CONFIG = {
  // Whisper transcription settings
  transcription: {
    model: 'whisper-1',
    response_format: 'json' as const,
    language: 'en', // English for business calls
    temperature: 0, // Deterministic for accuracy
  },

  // GPT-4 event extraction settings
  extraction: {
    model: 'gpt-4o-mini', // Cost-effective while maintaining quality
    temperature: 0.1, // Low temperature for consistent extraction
    max_tokens: 2000, // Sufficient for event details
    response_format: { type: 'json_object' as const },
  },

  // Rate limiting and retry configuration
  rateLimit: {
    maxRetries: 3,
    retryDelay: 1000, // 1 second
    backoffMultiplier: 2,
  },
} as const;

// Validate OpenAI configuration
export function validateOpenAIConfig(): { isValid: boolean; error?: string } {
  if (!process.env.OPENAI_API_KEY) {
    return {
      isValid: false,
      error: 'OPENAI_API_KEY environment variable is not set',
    };
  }

  if (!process.env.OPENAI_API_KEY.startsWith('sk-')) {
    return {
      isValid: false,
      error: 'OPENAI_API_KEY appears to be invalid (should start with sk-)',
    };
  }

  return { isValid: true };
}

// Test OpenAI connection
export async function testOpenAIConnection(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const validation = validateOpenAIConfig();
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    // Test with a simple completion request
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Respond with "OK"' }],
      max_tokens: 5,
      temperature: 0,
    });

    if (response.choices[0]?.message?.content?.includes('OK')) {
      return { success: true };
    } else {
      return { success: false, error: 'Unexpected response from OpenAI API' };
    }
  } catch (error) {
    return {
      success: false,
      error: `OpenAI API test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
