'use server';

import { revalidatePath } from 'next/cache';
import { withUserSupabase } from '@/lib/supabase/server';

export type ActiveLearningState = {
  ok: boolean;
  message: string;
};

export async function logExtractionError(
  _previousState: ActiveLearningState,
  formData: FormData
): Promise<ActiveLearningState> {
  const documentId = String(formData.get('documentId') ?? '');
  const errorType = String(formData.get('errorType') ?? '').trim();
  const fieldPath = String(formData.get('fieldPath') ?? '').trim() || null;
  const note = String(formData.get('note') ?? '').trim();
  const priority = String(formData.get('priority') ?? 'medium') as 'low' | 'medium' | 'high';

  if (!documentId || !errorType || !note) {
    return { ok: false, message: 'Document id, error type, and note are required.' };
  }

  return withUserSupabase(async ({ supabase }) => {
    const db = supabase as any;
    const { error } = await db.from('active_learning_events').insert({
      document_id: documentId,
      error_type: errorType,
      field_path: fieldPath,
      note,
      priority
    });

    if (error) return { ok: false, message: error.message };
    revalidatePath('/admin/active-learning');
    return { ok: true, message: 'Active-learning event logged.' };
  });
}
