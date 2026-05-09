import { ReviewWorkspace } from '@/app/components/review-workspace';
import { getDocumentWithExtractions } from '@/lib/supabase/queries';

export const dynamic = 'force-dynamic';

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = await getDocumentWithExtractions(id);

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">Reviewer workstation</div>
          <h1>{doc.title}</h1>
          <p className="muted">
            {[doc.journal, doc.publication_year, doc.doi].filter(Boolean).join(' | ') || 'Document review workspace'}
          </p>
        </div>
        <span className="status-badge" data-tone={doc.signedUrl ? 'ready' : 'attention'}>
          {doc.signedUrl ? 'PDF ready' : 'PDF missing'}
        </span>
      </div>
      <ReviewWorkspace document={doc} />
    </main>
  );
}
