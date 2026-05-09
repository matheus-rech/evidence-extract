import { withUserSupabase } from './server';

type DocumentRow = {
  id: string;
  title: string;
  latestExtraction: Record<string, unknown> | null;
};

export async function getDocumentWithExtractions(documentId: string): Promise<DocumentRow> {
  return withUserSupabase(async ({ supabase }) => {
    const { data, error } = await supabase
      .from('documents')
      .select('id,title,latestExtraction:extractions(payload)')
      .eq('id', documentId)
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Document not found');
    return data as unknown as DocumentRow;
  });
}
