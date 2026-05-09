import type { EvidenceProvenance } from '@/lib/schema/extraction-schema';

type Props = {
  snippets: EvidenceProvenance[];
};

export function ProvenanceLedger({ snippets }: Props) {
  return (
    <section className="surface-panel provenance-ledger" aria-label="Provenance ledger">
      <div className="panel-header">
        <div>
          <div className="eyebrow">Evidence ledger</div>
          <h2>Attached provenance</h2>
        </div>
        <span className="provenance-badge">{snippets.length} snippets</span>
      </div>
      {snippets.length > 0 ? (
        <div className="provenance-list">
          {snippets.map((snippet, index) => (
            <article className="provenance-item" key={`${snippet.page}-${snippet.quote}-${index}`}>
              <div className="field-strip">
                <span className="provenance-badge">p. {snippet.page}</span>
                <span className="provenance-badge">{snippet.source}</span>
                <span className="provenance-badge">
                  bbox {snippet.bbox.map((value) => Math.round(value)).join(', ')}
                </span>
              </div>
              <p className="provenance-quote">{snippet.quote}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">No evidence snippets attached yet. Draw a PDF box and add a quote to populate the ledger.</div>
      )}
    </section>
  );
}
