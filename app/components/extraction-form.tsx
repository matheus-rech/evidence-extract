'use client';

import { useActionState, useOptimistic } from 'react';
import { useFormStatus } from 'react-dom';
import { saveExtraction } from '@/app/actions/extractions';
import type { ExtractionPayload } from '@/lib/schema/extraction-schema';

type Props = { documentId: string; initial: ExtractionPayload | null };

type FormState = { message: string; saved: boolean };

const initialState: FormState = { message: '', saved: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending}>{pending ? 'Saving…' : 'Save extraction'}</button>;
}

export function ExtractionForm({ documentId, initial }: Props) {
  const [optimisticOutcome, setOptimisticOutcome] = useOptimistic(initial?.outcome ?? '', (_, next: string) => next);

  const [state, formAction] = useActionState(async (_prev: FormState, formData: FormData) => {
    const payload: ExtractionPayload = {
      population: String(formData.get('population') ?? ''),
      intervention: String(formData.get('intervention') ?? ''),
      comparator: String(formData.get('comparator') ?? ''),
      outcome: String(formData.get('outcome') ?? ''),
      provenance: []
    };
    setOptimisticOutcome(payload.outcome);
    await saveExtraction(documentId, payload);
    return { message: 'Saved successfully', saved: true };
  }, initialState);

  return (
    <form action={formAction}>
      <input name="population" defaultValue={String(initial?.population ?? '')} placeholder="Population" />
      <input name="intervention" defaultValue={String(initial?.intervention ?? '')} placeholder="Intervention" />
      <input name="comparator" defaultValue={String(initial?.comparator ?? '')} placeholder="Comparator" />
      <input name="outcome" defaultValue={String(initial?.outcome ?? '')} placeholder="Outcome" />
      <p>Optimistic outcome: {String(optimisticOutcome)}</p>
      <SubmitButton />
      <p>{state.message}</p>
    </form>
  );
}
