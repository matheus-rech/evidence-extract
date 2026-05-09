import { createServerClient } from '@supabase/ssr';
import type { SupabaseContext, SupabaseEnv } from '@supabase/server';
import { createAdminClient, createContextClient, verifyCredentials } from '@supabase/server/core';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

type ContextResult =
  | { data: SupabaseContext<Database>; error: null }
  | { data: null; error: Error };

function resolveSupabaseEnv(): Partial<SupabaseEnv> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  const jwks = process.env.SUPABASE_JWKS ? (JSON.parse(process.env.SUPABASE_JWKS) as SupabaseEnv['jwks']) : undefined;

  return {
    url: url ?? undefined,
    jwks,
    publishableKeys: publishableKey ? { default: publishableKey } : {},
    secretKeys: secretKey ? { default: secretKey } : {}
  };
}

let cachedJwks: SupabaseEnv['jwks'] | undefined;

async function getJwks(supabaseUrl: string): Promise<SupabaseEnv['jwks'] | undefined> {
  if (cachedJwks !== undefined) return cachedJwks;
  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/.well-known/jwks.json`, { next: { revalidate: 3600 } });
    cachedJwks = response.ok ? ((await response.json()) as SupabaseEnv['jwks']) : null;
  } catch {
    cachedJwks = null;
  }
  return cachedJwks;
}

export async function createSupabaseContext(auth: 'user' | 'secret' | 'none' = 'user'): Promise<ContextResult> {
  const env = resolveSupabaseEnv();
  if (!env.url || !env.publishableKeys?.default) {
    return { data: null, error: new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') };
  }

  const cookieStore = await cookies();
  const ssrClient = createServerClient(env.url, env.publishableKeys.default, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot write cookies; middleware handles refresh when configured.
        }
      }
    }
  });

  const {
    data: { session }
  } = await ssrClient.auth.getSession();
  const nextEnv = { ...env, jwks: env.jwks ?? (await getJwks(env.url)) };
  const { data: authResult, error } = await verifyCredentials(
    { token: session?.access_token ?? null, apikey: null },
    { auth, env: nextEnv }
  );

  if (error) return { data: null, error };

  const supabase = createContextClient<Database>({
    auth: { token: authResult?.token ?? null },
    env: nextEnv
  });
  const supabaseAdmin = createAdminClient<Database>({ env: nextEnv });

  return {
    data: {
      supabase,
      supabaseAdmin,
      userClaims: authResult?.userClaims ?? null,
      jwtClaims: authResult?.jwtClaims ?? null,
      authMode: authResult?.authMode ?? auth
    },
    error: null
  };
}

export async function withUserSupabase<T>(handler: (ctx: SupabaseContext<Database>) => Promise<T>): Promise<T> {
  const { data, error } = await createSupabaseContext('user');
  if (error || !data) throw error ?? new Error('Unable to create Supabase context');
  return handler(data);
}

export async function withAdminSupabase<T>(handler: (ctx: SupabaseContext<Database>) => Promise<T>): Promise<T> {
  const { data, error } = await createSupabaseContext('secret');
  if (error || !data) throw error ?? new Error('Unable to create Supabase admin context');
  return handler(data);
}
