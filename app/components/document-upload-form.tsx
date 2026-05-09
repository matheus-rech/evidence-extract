'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { ingestDocument, type IngestDocumentState } from '@/lib/supabase/actions/documents';

const initialState: IngestDocumentState = { ok: false, message: '' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? 'Uploading...' : 'Ingest document'}</button>;
}

export function DocumentUploadForm() {
  const [state, formAction] = useActionState(ingestDocument, initialState);

  return (
    <form action={formAction} className="grid">
      <label>
        Title
        <input name="title" required />
      </label>
      <label>
        DOI
        <input name="doi" />
      </label>
      <label>
        Journal
        <input name="journal" />
      </label>
      <label>
        Publication year
        <input name="publicationYear" inputMode="numeric" />
      </label>
      <label>
        PDF
        <input name="pdf" type="file" accept="application/pdf" required />
      </label>
      <SubmitButton />
      {state.message ? (
        <p className="status" data-ok={state.ok}>
          {state.message}
          {state.documentId ? ` Document id: ${state.documentId}` : ''}
        </p>
      ) : null}
    </form>
  );
}
