import { describe, expect, it, vi } from 'vitest';
import { exchangeOAuthToken } from '@/app/actions/extractions';

describe('exchangeOAuthToken', () => {
  it('accepts HTTP 200 response from Supabase OAuth endpoint', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ access_token: 'token' }), { status: 200 })));
    const result = await exchangeOAuthToken('abc');
    expect(result.access_token).toBe('token');
  });
});
