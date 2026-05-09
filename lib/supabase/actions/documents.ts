'use server';

import { createHash } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { withUserSupabase } from '@/lib/supabase/server';

export type IngestDocumentState = {
  ok: boolean;
  message: string;
  documentId?: string;
};

export async function ingestDocument(
  _previousState: IngestDocumentState,
  formData: FormData
): Promise<IngestDocumentState> {
  const title = String(formData.get('title') ?? '').trim();
  const doi = String(formData.get('doi') ?? '').trim() || null;
  const journal = String(formData.get('journal') ?? '').trim() || null;
  const publicationYearRaw = String(formData.get('publicationYear') ?? '').trim();
  const publication_year = publicationYearRaw ? Number(publicationYearRaw) : null;
  const file = formData.get('pdf');

  if (!title) return { ok: false, message: 'Document title is required.' };
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: 'A PDF file is required.' };
  if (file.type && file.type !== 'application/pdf') return { ok: false, message: 'Only PDF uploads are supported.' };

  const buffer = Buffer.from(await file.arrayBuffer());
  const file_sha256 = createHash('sha256').update(buffer).digest('hex');
  const storage_path = `${file_sha256}/${file.name.replace(/[^a-zA-Z0-9._-]+/g, '-')}`;

  return withUserSupabase(async ({ supabase }) => {
    const db = supabase as any;
    const upload = await db.storage.from('documents').upload(storage_path, buffer, {
      contentType: 'application/pdf',
      upsert: true
    });
    if (upload.error) return { ok: false, message: upload.error.message };

    const { data, error } = await db
      .from('documents')
      .insert({ title, doi, journal, publication_year, storage_path, file_sha256 })
      .select('id')
      .single();

    if (error || !data) return { ok: false, message: error?.message ?? 'Document insert failed.' };

    revalidatePath('/');
    revalidatePath('/documents');
    return { ok: true, message: 'Document ingested.', documentId: data.id };
  });
}
