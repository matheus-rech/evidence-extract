import { ReconciliationPanel } from '@/app/components/reconciliation-panel';
import { listOpenConflicts } from '@/lib/supabase/queries';

export const dynamic = 'force-dynamic';

export default async function ReconciliationPage() {
  const conflicts = await listOpenConflicts();

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">Dual review</div>
          <h1>Reconciliation</h1>
          <p className="muted">Resolve primary and secondary reviewer disagreements with a final decision.</p>
        </div>
        <span className="status-badge" data-tone={conflicts.length ? 'attention' : 'ready'}>
          {conflicts.length} open
        </span>
      </div>
      <ReconciliationPanel conflicts={conflicts} />
    </main>
  );
}
