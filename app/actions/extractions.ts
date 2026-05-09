'use server';

import { revalidatePath } from 'next/cache';
import { withUserSupabase } from '@/lib/supabase/server';
import type { ExtractionPayload } from '@/lib/schema/extraction-schema';

export async function saveExtraction(documentId: string, payload: ExtractionPayload) {
  return withUserSupabase(async ({ supabase, claims }) => {
    const reviewerId = claims.sub;
    const { error } = await supabase.from('extractions').insert({
      document_id: documentId,
      reviewer_id: reviewerId,
      payload
    });
    if (error) throw new Error(error.message);
    revalidatePath(`/documents/${documentId}`);
    return { ok: true as const };
  });
}

export async function resolveConflict(conflictId: string, resolution: string) {
  return withUserSupabase(async ({ supabase, user }) => {
    const { error } = await supabase
      .from('reconciliation_conflicts')
      .update({ resolved_by: user.id, resolution, resolved_at: new Date().toISOString() })
      .eq('id', conflictId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
}

export async function exchangeOAuthToken(code: string) {
  const res = await fetch('https://api.supabase.com/v1/oauth/token', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ code })
  });

  if (res.status !== 200) {
    throw new Error(`Unexpected OAuth status: ${res.status}`);
  }

  return (await res.json()) as { access_token: string };
}
