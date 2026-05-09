import type { EvidenceProvenance, ExtractionField, OutcomeExtraction, TableExtractionRow } from '@/lib/schema/extraction-schema';

type Props = {
  selectedField: ExtractionField;
  provenance: EvidenceProvenance[];
  outcomes: OutcomeExtraction[];
  tables: TableExtractionRow[];
  signedUrl: string | null;
};

export function ReviewStatusRail({ selectedField, provenance, outcomes, tables, signedUrl }: Props) {
  const completedOutcomes = outcomes.filter((outcome) => outcome.name.trim() && outcome.value.trim()).length;

  return (
    <aside className="status-rail" aria-label="Review status">
      <div className="active-field">
        <div className="metric-label">Active field</div>
        <strong>{selectedField}</strong>
      </div>
      <div className="metric-card">
        <div className="metric-label">Provenance</div>
        <div className="metric-value">{provenance.length}</div>
      </div>
      <div className="metric-card">
        <div className="metric-label">Outcomes</div>
        <div className="metric-value">
          {completedOutcomes}/{outcomes.length}
        </div>
      </div>
      <div className="metric-card">
        <div className="metric-label">Tables</div>
        <div className="metric-value">{tables.length}</div>
      </div>
      <span className="status-badge" data-tone={signedUrl ? 'ready' : 'attention'}>
        {signedUrl ? 'PDF signed URL ready' : 'PDF unavailable'}
      </span>
    </aside>
  );
}
