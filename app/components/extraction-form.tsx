'use client';

import { useActionState, useMemo, useOptimistic } from 'react';
import { useFormStatus } from 'react-dom';
import { saveExtractionFromForm, type ExtractionActionState } from '@/lib/supabase/actions/extractions';
import { harmonizeOutcome } from '@/lib/schema/outcome-registry';
import type { EvidenceProvenance, ExtractionField, ExtractionPayload, OutcomeExtraction, TableExtractionRow } from '@/lib/schema/extraction-schema';

type Props = {
  documentId: string;
  initial: ExtractionPayload | null;
  selectedField: ExtractionField;
  onSelectedFieldChange: (field: ExtractionField) => void;
  provenance: EvidenceProvenance[];
  outcomes: OutcomeExtraction[];
  tables: TableExtractionRow[];
  onOutcomesChange: (outcomes: OutcomeExtraction[]) => void;
};

const initialState: ExtractionActionState = { ok: false, message: '' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? 'Saving extraction...' : 'Save extraction'}</button>;
}

export function ExtractionForm({
  documentId,
  initial,
  selectedField,
  onSelectedFieldChange,
  provenance,
  outcomes,
  tables,
  onOutcomesChange
}: Props) {
  const [optimisticSummary, setOptimisticSummary] = useOptimistic('Not saved yet', (_current, next: string) => next);
  const [state, formAction] = useActionState(async (previousState: ExtractionActionState, formData: FormData) => {
    setOptimisticSummary(`Saving ${outcomes.length} outcome${outcomes.length === 1 ? '' : 's'}...`);
    return saveExtractionFromForm(previousState, formData);
  }, initialState);

  const harmonizedOutcomes = useMemo(() => outcomes.map(harmonizeOutcome), [outcomes]);

  function updateOutcome(index: number, patch: Partial<OutcomeExtraction>) {
    onOutcomesChange(outcomes.map((outcome, currentIndex) => (currentIndex === index ? { ...outcome, ...patch } : outcome)));
  }

  function addOutcome() {
    onOutcomesChange([...outcomes, { name: '', value: '', provenance: [] }]);
  }

  function removeOutcome(index: number) {
    onOutcomesChange(outcomes.filter((_, currentIndex) => currentIndex !== index));
  }

  return (
    <form action={formAction} className="panel review-grid extraction-form">
      <div className="panel-header">
        <div>
          <div className="eyebrow">Structured extraction</div>
          <h2>Schema fields</h2>
          <p className="muted">Choose a field, draw a box on the PDF, attach the quote, then save.</p>
        </div>
        <span className="status-badge" data-tone={provenance.length ? 'ready' : 'attention'}>
          {provenance.length} direct snippets
        </span>
      </div>

      <input type="hidden" name="documentId" value={documentId} />
      <input type="hidden" name="provenanceJson" value={JSON.stringify(provenance)} />
      <input type="hidden" name="outcomesJson" value={JSON.stringify(harmonizedOutcomes)} />
      <input type="hidden" name="tablesJson" value={JSON.stringify(tables)} />

      <div className="field-strip" aria-label="Active evidence field">
        {(['population', 'intervention', 'comparator'] as const).map((field) => (
          <button
            key={field}
            type="button"
            aria-pressed={selectedField === field}
            onClick={() => onSelectedFieldChange(field)}
          >
            {field}
          </button>
        ))}
        {outcomes.map((_, index) => (
          <button
            key={`outcome-${index}`}
            type="button"
            aria-pressed={selectedField === `outcomes.${index}`}
            onClick={() => onSelectedFieldChange(`outcomes.${index}`)}
          >
            outcome {index + 1}
          </button>
        ))}
      </div>

      <div className="form-section">
        <label>
          Population
          <textarea name="population" defaultValue={initial?.population ?? ''} required />
        </label>
        <label>
          Intervention
          <textarea name="intervention" defaultValue={initial?.intervention ?? ''} required />
        </label>
        <label>
          Comparator
          <textarea name="comparator" defaultValue={initial?.comparator ?? ''} required />
        </label>
      </div>

      <div className="form-section">
        <div className="page-header">
          <div>
            <div className="eyebrow">Outcome set</div>
            <h3>Outcomes</h3>
          </div>
          <button type="button" onClick={addOutcome}>
            Add outcome
          </button>
        </div>
        <div className="outcome-list">
        {outcomes.map((outcome, index) => (
          <div className="outcome-card" key={index}>
            <div className="panel-header">
              <strong>Outcome {index + 1}</strong>
              <span className="status-badge" data-tone={outcome.name && outcome.value ? 'ready' : 'attention'}>
                {outcome.name && outcome.value ? 'Ready' : 'Needs value'}
              </span>
            </div>
            <div className="outcome-fields">
              <label>
                Outcome name
                <input value={outcome.name} onChange={(event) => updateOutcome(index, { name: event.target.value })} required />
              </label>
              <label>
                Canonical suggestion
                <input
                  value={harmonizedOutcomes[index]?.canonicalName ?? ''}
                  onChange={(event) => updateOutcome(index, { canonicalName: event.target.value })}
                />
              </label>
              <label>
                Value
                <input value={outcome.value} onChange={(event) => updateOutcome(index, { value: event.target.value })} required />
              </label>
              <label>
                Timepoint
                <input value={outcome.timepoint ?? ''} onChange={(event) => updateOutcome(index, { timepoint: event.target.value })} />
              </label>
              <label>
                Effect measure
                <input
                  value={outcome.effectMeasure ?? ''}
                  onChange={(event) => updateOutcome(index, { effectMeasure: event.target.value })}
                />
              </label>
              <button type="button" onClick={() => removeOutcome(index)} disabled={outcomes.length === 1}>
                Remove outcome
              </button>
            </div>
          </div>
        ))}
        </div>
      </div>

      <label>
        Reviewer notes
        <textarea name="reviewerNotes" defaultValue={initial?.reviewerNotes ?? ''} />
      </label>

      <div className="form-footer">
        <div className="fine-print">
          Provenance snippets: {provenance.length}. Table rows: {tables.length}. Optimistic status: {optimisticSummary}
        </div>
        <SubmitButton />
        {state.message ? (
          <p className="status" data-ok={state.ok}>
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
