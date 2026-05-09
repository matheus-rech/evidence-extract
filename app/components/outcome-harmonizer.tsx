'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { saveOutcomeOverride, type HarmonizationState } from '@/lib/supabase/actions/harmonization';
import { suggestCanonicalOutcome, type OutcomeRegistryEntry } from '@/lib/schema/outcome-registry';

type Props = {
  documentId: string;
  registry: OutcomeRegistryEntry[];
  rawName?: string;
};

const initialState: HarmonizationState = { ok: false, message: '' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? 'Saving...' : 'Save override'}</button>;
}

export function OutcomeHarmonizer({ documentId, registry, rawName = '' }: Props) {
  const [state, formAction] = useActionState(saveOutcomeOverride, initialState);
  const suggestion = suggestCanonicalOutcome(rawName, registry);

  return (
    <section className="panel review-grid">
      <div className="panel-header">
        <div>
          <div className="eyebrow">Registry mapping</div>
          <h2>Canonical outcomes</h2>
          <p className="muted">Registry suggestions can be accepted or manually overridden.</p>
        </div>
        <span className="status-badge" data-tone={suggestion ? 'ready' : 'attention'}>
          {suggestion ? 'Suggestion found' : 'Manual mapping'}
        </span>
      </div>
      <form action={formAction} className="grid">
        <input type="hidden" name="documentId" value={documentId} />
        <label>
          Raw outcome name
          <input name="rawName" defaultValue={rawName} required />
        </label>
        <label>
          Canonical outcome
          <select name="canonicalName" defaultValue={suggestion?.canonicalName ?? ''}>
            <option value="">Choose canonical outcome</option>
            {registry.map((entry) => (
              <option key={entry.canonicalName} value={entry.canonicalName}>
                {entry.canonicalName}
              </option>
            ))}
          </select>
        </label>
        <SubmitButton />
        {state.message ? (
          <p className="status" data-ok={state.ok}>
            {state.message}
          </p>
        ) : null}
      </form>
    </section>
  );
}
