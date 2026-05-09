import Link from 'next/link';
import { DocumentUploadForm } from '@/app/components/document-upload-form';
import { listDocuments } from '@/lib/supabase/queries';

export const dynamic = 'force-dynamic';

export default async function DocumentsPage() {
  const documents = await listDocuments();

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">Document intake</div>
          <h1>Documents</h1>
          <p className="muted">Ingest PDFs, preserve hashes, and open reviewer workspaces.</p>
        </div>
        <span className="status-badge" data-tone={documents.length ? 'ready' : 'attention'}>
          {documents.length} queued
        </span>
      </div>

      <div className="two-column">
        <section className="panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">Ingestion</div>
              <h2>Upload PDF</h2>
            </div>
            <span className="status-badge" data-tone="ready">SHA-256 tracked</span>
          </div>
          <DocumentUploadForm />
        </section>

        <section>
          <div className="panel-header">
            <div>
              <div className="eyebrow">Reviewer queue</div>
              <h2>Review queue</h2>
            </div>
          </div>
          <div className="document-list">
            {documents.map((document) => (
              <article className="document-row" key={document.id}>
                <div>
                  <span className="document-title">{document.title}</span>
                  <div className="document-meta">
                    {[document.journal, document.publication_year, document.doi].filter(Boolean).join(' | ') || 'No citation metadata'}
                  </div>
                </div>
                <Link className="button-link" href={`/documents/${document.id}`}>
                  Review
                </Link>
              </article>
            ))}
            {documents.length === 0 ? <div className="empty-state">No documents are available yet. Upload a PDF to start a review session.</div> : null}
          </div>
        </section>
      </div>
    </main>
  );
}
