import { ActiveLearningForm } from '@/app/components/active-learning-form';
import { listActiveLearningEvents } from '@/lib/supabase/queries';

export const dynamic = 'force-dynamic';

export default async function ActiveLearningPage() {
  const events = await listActiveLearningEvents();

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">Prompt feedback</div>
          <h1>Active learning</h1>
          <p className="muted">Log extraction failures so prompt and table-labeling behavior can be improved.</p>
        </div>
        <span className="status-badge" data-tone={events.length ? 'attention' : 'ready'}>
          {events.length} logged
        </span>
      </div>
      <div className="two-column">
        <section className="panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">New signal</div>
              <h2>Log error</h2>
            </div>
          </div>
          <ActiveLearningForm />
        </section>
        <section className="panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">Review queue</div>
              <h2>Recent events</h2>
            </div>
          </div>
          {events.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Error</th>
                <th>Field</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>{event.error_type}</td>
                  <td>{event.field_path ?? 'document'}</td>
                  <td>{event.priority}</td>
                </tr>
              ))}
            </tbody>
          </table>
          ) : (
            <div className="empty-state">No active-learning events have been logged.</div>
          )}
        </section>
      </div>
    </main>
  );
}
