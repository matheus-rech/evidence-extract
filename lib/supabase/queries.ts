import { cache } from 'react';
import { withUserSupabase } from './server';
import type { ActiveLearningEvent, DocumentRow, DocumentWorkspace, ReconciliationConflict } from './database.types';
import type { EvidenceProvenance, ExtractionPayload, TableExtractionRow } from '@/lib/schema/extraction-schema';

function isMissingSupabaseError(error: unknown): boolean {
  return error instanceof Error && error.message.includes('Missing NEXT_PUBLIC_SUPABASE_URL');
}

const demoDocument: DocumentWorkspace = {
  id: 'demo-doc',
  title: 'HER2+ Brain Metastases Evidence Review',
  doi: '10.0000/demo-review',
  journal: 'Clinical Evidence Notebook',
  publication_year: 2026,
  storage_path: null,
  file_sha256: null,
  created_at: new Date(0).toISOString(),
  signedUrl: null,
  latestExtraction: {
    population: 'Adults with HER2-positive metastatic breast cancer and brain metastases.',
    intervention: 'Tucatinib, trastuzumab, and capecitabine.',
    comparator: 'Trastuzumab deruxtecan.',
    outcomes: [
      {
        name: 'Overall survival',
        canonicalName: 'Overall survival',
        value: 'Not extracted',
        provenance: []
      }
    ],
    provenance: [
      {
        page: 1,
        bbox: [72, 118, 260, 34],
        quote: 'Reviewer demo provenance appears here after PDF selection.',
        source: 'reviewer-note'
      }
    ],
    tables: [],
    reviewerNotes: 'Demo workspace for local UI validation without Supabase credentials.'
  },
  snippets: [
    {
      page: 1,
      bbox: [72, 118, 260, 34],
      quote: 'Reviewer demo provenance appears here after PDF selection.',
      source: 'reviewer-note'
    }
  ],
  tableRows: [],
  conflicts: []
};

export const listDocuments = cache(async (): Promise<DocumentRow[]> => {
  try {
    return await withUserSupabase(async ({ supabase }) => {
    const db = supabase as any;
    const { data, error } = await db
      .from('documents')
      .select('id,title,doi,journal,publication_year,storage_path,file_sha256,created_at')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as DocumentRow[];
  });
  } catch (error) {
    if (isMissingSupabaseError(error) && process.env.NODE_ENV !== 'production') return [demoDocument];
    throw error;
  }
});

export const getDocumentWithExtractions = cache(async (documentId: string): Promise<DocumentWorkspace> => {
  try {
    return await withUserSupabase(async ({ supabase }) => {
    const db = supabase as any;
    const [documentResult, extractionResult, snippetsResult, tablesResult, conflictsResult] = await Promise.all([
      db
        .from('documents')
        .select('id,title,doi,journal,publication_year,storage_path,file_sha256,created_at')
        .eq('id', documentId)
        .single(),
      db
        .from('extractions')
        .select('payload,created_at')
        .eq('document_id', documentId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      db.from('evidence_snippets').select('page,bbox,quote,source').eq('document_id', documentId),
      db
        .from('table_extractions')
        .select('rows,created_at')
        .eq('document_id', documentId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      db
        .from('reconciliation_conflicts')
        .select('id,document_id,field_path,primary_value,secondary_value,resolution,resolved_at')
        .eq('document_id', documentId)
        .order('resolved_at', { ascending: true })
    ]);

    if (documentResult.error || !documentResult.data) {
      throw new Error(documentResult.error?.message ?? 'Document not found');
    }

    const storagePath = documentResult.data.storage_path;
    const signedUrl = storagePath
      ? (
          await db.storage
            .from('documents')
            .createSignedUrl(storagePath, 60 * 60)
        ).data?.signedUrl ?? null
      : null;

    return {
      ...(documentResult.data as DocumentRow),
      signedUrl,
      latestExtraction: (extractionResult.data?.payload as ExtractionPayload | undefined) ?? null,
      snippets: (snippetsResult.data ?? []) as EvidenceProvenance[],
      tableRows: ((tablesResult.data?.rows as TableExtractionRow[] | undefined) ?? []),
      conflicts: (conflictsResult.data ?? []) as ReconciliationConflict[]
    };
  });
  } catch (error) {
    if (isMissingSupabaseError(error) && documentId === demoDocument.id) return demoDocument;
    throw error;
  }
});

export const listOpenConflicts = cache(async (): Promise<ReconciliationConflict[]> => {
  try {
    return await withUserSupabase(async ({ supabase }) => {
    const db = supabase as any;
    const { data, error } = await db
      .from('reconciliation_conflicts')
      .select('id,document_id,field_path,primary_value,secondary_value,resolution,resolved_at')
      .is('resolved_at', null)
      .order('document_id');

    if (error) throw new Error(error.message);
    return (data ?? []) as ReconciliationConflict[];
  });
  } catch (error) {
    if (isMissingSupabaseError(error)) return [];
    throw error;
  }
});

export const listActiveLearningEvents = cache(async (): Promise<ActiveLearningEvent[]> => {
  try {
    return await withUserSupabase(async ({ supabase }) => {
    const db = supabase as any;
    const { data, error } = await db
      .from('active_learning_events')
      .select('id,document_id,error_type,field_path,note,priority,created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw new Error(error.message);
    return (data ?? []) as ActiveLearningEvent[];
  });
  } catch (error) {
    if (isMissingSupabaseError(error)) return [];
    throw error;
  }
});
