'use server';

import { revalidatePath } from 'next/cache';
import { suggestCanonicalOutcome } from '@/lib/schema/outcome-registry';
import { withUserSupabase } from '@/lib/supabase/server';

export type HarmonizationState = {
  ok: boolean;
  message: string;
  canonicalName?: string;
};

export async function saveOutcomeOverride(
  _previousState: HarmonizationState,
  formData: FormData
): Promise<HarmonizationState> {
  const documentId = String(formData.get('documentId') ?? '');
  const rawName = String(formData.get('rawName') ?? '').trim();
  const canonicalName = String(formData.get('canonicalName') ?? '').trim() || suggestCanonicalOutcome(rawName)?.canonicalName;

  if (!documentId || !rawName || !canonicalName) {
    return { ok: false, message: 'Document id, raw outcome, and canonical outcome are required.' };
  }

  return withUserSupabase(async ({ supabase, userClaims }) => {
    const db = supabase as any;
    const { error } = await db.from('outcome_overrides').insert({
      document_id: documentId,
      raw_name: rawName,
      canonical_name: canonicalName,
      reviewer_id: userClaims?.id ?? null
    });

    if (error) return { ok: false, message: error.message };
    revalidatePath('/harmonization');
    revalidatePath(`/documents/${documentId}`);
    return { ok: true, message: 'Outcome override saved.', canonicalName };
  });
}
