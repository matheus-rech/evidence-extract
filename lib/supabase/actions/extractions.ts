'use server';

import { revalidatePath } from 'next/cache';
import { extractionFromFormData, validateExtractionPayload, validationSummary } from '@/lib/schema/validation';
import type { ExtractionPayload } from '@/lib/schema/extraction-schema';
import { withUserSupabase } from '@/lib/supabase/server';

export type ExtractionActionState = {
  ok: boolean;
  message: string;
  payload?: ExtractionPayload;
};

export async function saveExtraction(documentId: string, payload: ExtractionPayload): Promise<ExtractionActionState> {
  const validation = validateExtractionPayload(payload);
  if (!validation.ok) {
    return { ok: false, message: validationSummary(validation.errors) };
  }

  return withUserSupabase(async ({ supabase, userClaims }) => {
    const db = supabase as any;
    const reviewerId = userClaims?.id;
    if (!reviewerId) return { ok: false, message: 'Authenticated reviewer is required.' };

    const { error } = await db.from('extractions').insert({
      document_id: documentId,
      reviewer_id: reviewerId,
      payload: validation.payload
    });

    if (error) return { ok: false, message: error.message };

    const snippets = [
      ...validation.payload.provenance.map((snippet) => ({ ...snippet, document_id: documentId, field_path: null })),
      ...validation.payload.outcomes.flatMap((outcome, index) =>
        (outcome.provenance ?? []).map((snippet) => ({ ...snippet, document_id: documentId, field_path: `outcomes.${index}` }))
      )
    ];

    if (snippets.length > 0) {
      const { error: snippetError } = await db.from('evidence_snippets').insert(snippets);
      if (snippetError) return { ok: false, message: snippetError.message };
    }

    if ((validation.payload.tables ?? []).length > 0) {
      const { error: tableError } = await db
        .from('table_extractions')
        .insert({ document_id: documentId, rows: validation.payload.tables ?? [] });
      if (tableError) return { ok: false, message: tableError.message };
    }

    revalidatePath('/documents');
    revalidatePath(`/documents/${documentId}`);
    return { ok: true, message: 'Extraction saved.', payload: validation.payload };
  });
}

export async function saveExtractionFromForm(
  _previousState: ExtractionActionState,
  formData: FormData
): Promise<ExtractionActionState> {
  const documentId = String(formData.get('documentId') ?? '');
  if (!documentId) return { ok: false, message: 'Missing document id.' };

  try {
    return await saveExtraction(documentId, extractionFromFormData(formData));
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Unable to save extraction.' };
  }
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
