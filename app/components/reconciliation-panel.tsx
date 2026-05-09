'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { resolveConflictFromForm, type ReconciliationState } from '@/lib/supabase/actions/reconciliation';
import type { ReconciliationConflict } from '@/lib/supabase/database.types';

type Props = {
  conflicts: ReconciliationConflict[];
};

const initialState: ReconciliationState = { ok: false, message: '' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? 'Resolving...' : 'Resolve'}</button>;
}

export function ReconciliationPanel({ conflicts }: Props) {
  const [state, formAction] = useActionState(resolveConflictFromForm, initialState);

  return (
    <section className="grid">
      {state.message ? (
        <p className="status" data-ok={state.ok}>
          {state.message}
        </p>
      ) : null}
      {conflicts.map((conflict) => (
        <article className="panel review-grid" key={conflict.id}>
          <div className="panel-header">
            <div>
              <div className="eyebrow">Conflict</div>
              <h2>{conflict.field_path}</h2>
              <p className="muted">Document {conflict.document_id}</p>
            </div>
            <span className="status-badge" data-tone="attention">Open</span>
          </div>
          <table className="table">
            <tbody>
              <tr>
                <th>Primary</th>
                <td>{JSON.stringify(conflict.primary_value)}</td>
              </tr>
              <tr>
                <th>Secondary</th>
                <td>{JSON.stringify(conflict.secondary_value)}</td>
              </tr>
            </tbody>
          </table>
          <form action={formAction} className="grid">
            <input type="hidden" name="conflictId" value={conflict.id} />
            <label>
              Final decision
              <textarea name="resolution" required />
            </label>
            <SubmitButton />
          </form>
        </article>
      ))}
      {conflicts.length === 0 ? <div className="empty-state">No open conflicts.</div> : null}
    </section>
  );
}
