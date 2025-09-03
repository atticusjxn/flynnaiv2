import '@testing-library/jest-dom';
import { beforeAll, afterAll, afterEach } from '@jest/globals';
import { TextEncoder, TextDecoder } from 'util';
import 'openai/shims/node';

// Polyfill for TextEncoder/TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Headers class
global.Headers = class Headers {
  constructor(init = {}) {
    this.map = new Map();
    if (init) {
      if (init instanceof Headers) {
        init.forEach((value, key) => this.set(key, value));
      } else {
        Object.entries(init).forEach(([key, value]) => this.set(key, value));
      }
    }
  }

  get(name) {
    return this.map.get(name.toLowerCase()) || null;
  }

  set(name, value) {
    this.map.set(name.toLowerCase(), String(value));
  }

  has(name) {
    return this.map.has(name.toLowerCase());
  }

  delete(name) {
    this.map.delete(name.toLowerCase());
  }

  forEach(callback) {
    this.map.forEach((value, key) => callback(value, key));
  }

  *[Symbol.iterator]() {
    yield* this.map.entries();
  }
};

// Mock Request class only if it doesn't exist
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init = {}) {
      this.url = typeof input === 'string' ? input : input.url;
      this.method = init.method || 'GET';
      this.headers = new Headers(init.headers);
      this.body = init.body || null;
    }

    async json() {
      return JSON.parse(this.body);
    }

    async text() {
      return this.body;
    }

    async formData() {
      const form = new FormData();
      if (this.body) {
        const params = new URLSearchParams(this.body);
        for (const [key, value] of params) {
          form.append(key, value);
        }
      }
      return form;
    }
  };
}

// Mock Response class
global.Response = class Response {
  constructor(body, options = {}) {
    this.body = body;
    this.status = options.status || 200;
    this.statusText = options.statusText || 'OK';
    this.headers = new Headers(options.headers);
  }

  async json() {
    return JSON.parse(this.body);
  }

  async text() {
    return this.body;
  }

  static json(object, options = {}) {
    return new Response(JSON.stringify(object), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }
};

// Mock FormData
global.FormData = class FormData {
  constructor() {
    this.data = new Map();
  }

  append(key, value) {
    if (!this.data.has(key)) {
      this.data.set(key, []);
    }
    this.data.get(key).push(value);
  }

  get(key) {
    const values = this.data.get(key);
    return values ? values[0] : null;
  }

  getAll(key) {
    return this.data.get(key) || [];
  }

  *[Symbol.iterator]() {
    for (const [key, values] of this.data) {
      for (const value of values) {
        yield [key, value];
      }
    }
  }
};

// Mock URLSearchParams if not available
if (typeof global.URLSearchParams === 'undefined') {
  global.URLSearchParams = class URLSearchParams {
    constructor(init = '') {
      this.params = new Map();
      if (typeof init === 'string') {
        const pairs = init.replace(/^\?/, '').split('&');
        pairs.forEach(pair => {
          const [key, value = ''] = pair.split('=');
          if (key) {
            this.params.set(decodeURIComponent(key), decodeURIComponent(value));
          }
        });
      }
    }

    get(name) {
      return this.params.get(name) || null;
    }

    set(name, value) {
      this.params.set(name, String(value));
    }

    toString() {
      const pairs = [];
      for (const [key, value] of this.params) {
        pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      }
      return pairs.join('&');
    }

    *[Symbol.iterator]() {
      yield* this.params.entries();
    }
  };
}

// Skip MSW setup for now to avoid issues
// const server = setupServer(...handlers)

// beforeAll(() => {
//   server.listen({
//     onUnhandledRequest: 'warn',
//   })
// })

// afterEach(() => {
//   server.resetHandlers()
// })

// afterAll(() => {
//   server.close()
// })

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  useSearchParams() {
    return {
      get: jest.fn(),
    };
  },
  usePathname() {
    return '';
  },
}));

// Mock OpenAI to avoid browser environment issues
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
      audio: {
        transcriptions: {
          create: jest.fn(),
        },
      },
    })),
  };
});

// Mock @faker-js/faker to avoid ES module issues
jest.mock('@faker-js/faker', () => ({
  faker: {
    string: {
      uuid: () => 'mock-uuid-123',
      alphanumeric: () => 'mock-alphanumeric',
    },
    internet: {
      email: () => 'test@example.com',
    },
    person: {
      fullName: () => 'John Doe',
    },
    company: {
      name: () => 'Test Company',
    },
    helpers: {
      arrayElement: (array) => array[0],
    },
    date: {
      past: () => new Date('2023-01-01'),
      future: () => new Date('2025-01-15'),
    },
    lorem: {
      sentences: () => 'Test transcript text',
      words: () => 'Test words',
      sentence: () => 'Test sentence',
    },
    phone: {
      number: () => '+15551234567',
    },
    number: {
      int: () => 120,
      float: () => 0.85,
    },
    location: {
      streetAddress: () => '123 Test Street',
    },
  },
}));

// Mock environment validation to always pass
jest.mock('@/lib/validation/schemas', () => ({
  validateEnvironment: jest.fn(() => ({
    OPENAI_API_KEY: 'sk-test-key',
    TWILIO_ACCOUNT_SID: 'ACtest123456789012345678901234567890',
    TWILIO_AUTH_TOKEN: 'test-token',
    SUPABASE_URL: 'http://localhost:54321',
    SUPABASE_ANON_KEY: 'test-key',
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
  })),
  EnvironmentSchema: {
    parse: jest.fn(() => ({})),
  },
}));

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.service-role-test';
process.env.OPENAI_API_KEY = 'sk-test-openai-key-1234567890';
process.env.TWILIO_ACCOUNT_SID = 'ACtest123456789012345678901234567890';
process.env.TWILIO_AUTH_TOKEN = 'test-twilio-token-1234567890';
process.env.TWILIO_WEBHOOK_SECRET = 'test-twilio-webhook-secret';
process.env.RESEND_API_KEY = 're_test_resend_key_1234567890';
process.env.EMAIL_DOMAIN = 'test.example.com';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
