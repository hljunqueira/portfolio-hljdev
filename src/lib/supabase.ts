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
    } else if (Array.isArray(options.headers)) {
      options.headers = options.headers.filter(([key]) => key.toLowerCase() !== 'x-retry-count');
    } else if (typeof options.headers === 'object') {
      const headers = { ...(options.headers as Record<string, string>) };
      delete headers['x-retry-count'];
      delete headers['X-Retry-Count'];
      options = {
        ...options,
        headers,
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


