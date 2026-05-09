'use client';

import { useState } from 'react';
import { ExtractionForm } from '@/app/components/extraction-form';
import { OutcomeHarmonizer } from '@/app/components/outcome-harmonizer';
import { PdfAnnotator } from '@/app/components/pdf-annotator';
import { ProvenanceLedger } from '@/app/components/provenance-ledger';
import { ReviewStatusRail } from '@/app/components/review-status-rail';
import { TableExtractionPanel } from '@/app/components/table-extraction-panel';
import { defaultOutcomeRegistry } from '@/lib/schema/outcome-registry';
import type { DocumentWorkspace } from '@/lib/supabase/database.types';
import type { EvidenceProvenance, ExtractionField, OutcomeExtraction, TableExtractionRow } from '@/lib/schema/extraction-schema';

type Props = {
  document: DocumentWorkspace;
};

export function ReviewWorkspace({ document }: Props) {
  const [selectedField, setSelectedField] = useState<ExtractionField>('population');
  const [provenance, setProvenance] = useState<EvidenceProvenance[]>(document.latestExtraction?.provenance ?? document.snippets ?? []);
  const [outcomes, setOutcomes] = useState<OutcomeExtraction[]>(
    document.latestExtraction?.outcomes?.length ? document.latestExtraction.outcomes : [{ name: '', value: '', provenance: [] }]
  );
  const [tables, setTables] = useState<TableExtractionRow[]>(document.latestExtraction?.tables ?? document.tableRows ?? []);

  function attachProvenance(field: ExtractionField, snippet: EvidenceProvenance) {
    if (field.startsWith('outcomes.')) {
      const index = Number(field.split('.')[1]);
      setOutcomes((current) =>
        current.map((outcome, currentIndex) =>
          currentIndex === index ? { ...outcome, provenance: [...(outcome.provenance ?? []), snippet] } : outcome
        )
      );
      return;
    }
    setProvenance((current) => [...current, snippet]);
  }

  const firstOutcomeName = outcomes.find((outcome) => outcome.name.trim())?.name ?? '';
  const allProvenance = [
    ...provenance,
    ...outcomes.flatMap((outcome) => outcome.provenance ?? []),
    ...tables.flatMap((row) => row.cells.map((cell) => cell.provenance))
  ];

  return (
    <div className="review-workbench">
      <div className="review-sidebar">
        <ReviewStatusRail
          selectedField={selectedField}
          provenance={allProvenance}
          outcomes={outcomes}
          tables={tables}
          signedUrl={document.signedUrl}
        />
      </div>
      <div className="review-main-column">
        <PdfAnnotator fileUrl={document.signedUrl} selectedField={selectedField} onAttach={attachProvenance} />
        <ProvenanceLedger snippets={allProvenance} />
      </div>
      <div className="review-form-column">
        <ExtractionForm
          documentId={document.id}
          initial={document.latestExtraction}
          selectedField={selectedField}
          onSelectedFieldChange={setSelectedField}
          provenance={provenance}
          outcomes={outcomes}
          tables={tables}
          onOutcomesChange={setOutcomes}
        />
        <TableExtractionPanel documentId={document.id} rows={tables} onRowsChange={setTables} />
        <OutcomeHarmonizer documentId={document.id} rawName={firstOutcomeName} registry={defaultOutcomeRegistry} />
      </div>
    </div>
  );
}
