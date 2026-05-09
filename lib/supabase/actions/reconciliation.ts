'use server';

import { revalidatePath } from 'next/cache';
import { withUserSupabase } from '@/lib/supabase/server';

export type ReconciliationState = {
  ok: boolean;
  message: string;
};

export async function resolveConflict(conflictId: string, resolution: string): Promise<ReconciliationState> {
  if (!conflictId || !resolution.trim()) return { ok: false, message: 'Conflict id and resolution are required.' };

  return withUserSupabase(async ({ supabase, userClaims }) => {
    const db = supabase as any;
    const { data, error } = await db
      .from('reconciliation_conflicts')
      .update({
        resolved_by: userClaims?.id ?? null,
        resolution,
        resolved_at: new Date().toISOString()
      })
      .eq('id', conflictId)
      .select('document_id')
      .single();

    if (error) return { ok: false, message: error.message };
    revalidatePath('/reconciliation');
    if (data?.document_id) revalidatePath(`/documents/${data.document_id}`);
    return { ok: true, message: 'Conflict resolved.' };
  });
}

export async function resolveConflictFromForm(
  _previousState: ReconciliationState,
  formData: FormData
): Promise<ReconciliationState> {
  return resolveConflict(String(formData.get('conflictId') ?? ''), String(formData.get('resolution') ?? ''));
}
