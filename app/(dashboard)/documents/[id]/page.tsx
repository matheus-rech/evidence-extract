import { getDocumentWithExtractions } from '@/lib/supabase/queries';
import { ExtractionForm } from '@/app/components/extraction-form';

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = await getDocumentWithExtractions(id);

  return (
    <section>
      <h2>{doc.title}</h2>
      <ExtractionForm documentId={id} initial={doc.latestExtraction ?? null} />
    </section>
  );
}
