// Retry utility for handling API failures
export interface RetryOptions {
  maxRetries: number;
  delay: number;
  backoff: number;
  onRetry?: (error: any, attempt: number) => void;
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === options.maxRetries) {
        break; // No more retries
      }
      
      // Call retry callback if provided
      if (options.onRetry) {
        options.onRetry(error, attempt + 1);
      }
      
      // Calculate delay with exponential backoff
      const delay = options.delay * Math.pow(options.backoff, attempt);
      console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}