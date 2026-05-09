import { OutcomeHarmonizer } from '@/app/components/outcome-harmonizer';
import { defaultOutcomeRegistry } from '@/lib/schema/outcome-registry';

export default function HarmonizationPage() {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">Outcome registry</div>
          <h1>Outcome harmonization</h1>
          <p className="muted">Map reviewer-entered labels onto canonical outcomes while preserving overrides.</p>
        </div>
        <span className="status-badge" data-tone="ready">Registry available</span>
      </div>
      <OutcomeHarmonizer documentId="" registry={defaultOutcomeRegistry} />
    </main>
  );
}
