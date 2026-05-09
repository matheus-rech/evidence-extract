'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { logExtractionError, type ActiveLearningState } from '@/lib/supabase/actions/active-learning';

const initialState: ActiveLearningState = { ok: false, message: '' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? 'Logging...' : 'Log event'}</button>;
}

export function ActiveLearningForm() {
  const [state, formAction] = useActionState(logExtractionError, initialState);

  return (
    <form action={formAction} className="grid">
      <label>
        Document id
        <input name="documentId" required />
      </label>
      <label>
        Error type
        <select name="errorType" required>
          <option value="">Choose type</option>
          <option value="units">Units</option>
          <option value="timepoint">Timepoint</option>
          <option value="arm_mixup">Arm mix-up</option>
          <option value="missing_provenance">Missing provenance</option>
          <option value="table_label">Table label</option>
        </select>
      </label>
      <label>
        Field path
        <input name="fieldPath" placeholder="outcomes.0" />
      </label>
      <label>
        Priority
        <select name="priority" defaultValue="medium">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>
      <label>
        Note
        <textarea name="note" required />
      </label>
      <SubmitButton />
      {state.message ? (
        <p className="status" data-ok={state.ok}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
