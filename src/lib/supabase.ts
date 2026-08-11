import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

/**
 * Custom fetch wrapper to prevent CORS preflight failures caused by x-retry-count header
 * attached during Supabase client retry attempts.
 */
const customFetch = (url: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
  if (options && options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.delete('x-retry-count');
      options.headers.delete('X-Retry-Count');
    } else if (Array.isArray(options.headers)) {
      options.headers = options.headers.filter(([key]) => key.toLowerCase() !== 'x-retry-count');
    } else if (typeof options.headers === 'object') {
      const newHeaders: Record<string, string> = {};
      for (const [key, val] of Object.entries(options.headers as Record<string, string>)) {
        if (key.toLowerCase() !== 'x-retry-count') {
          newHeaders[key] = val;
        }
      }
      options = {
        ...options,
        headers: newHeaders,
      };
    }
  }
  return fetch(url, options);
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: customFetch,
  },
});


