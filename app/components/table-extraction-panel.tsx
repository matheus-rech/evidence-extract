'use client';

import { useState } from 'react';
import { heuristicTableLabeler } from '@/lib/pdf/ai-table-labeler';
import { detectTableCandidates, type PdfTextBox } from '@/lib/pdf/geometry';
import type { TableExtractionRow } from '@/lib/schema/extraction-schema';

type Props = {
  documentId: string;
  rows: TableExtractionRow[];
  onRowsChange: (rows: TableExtractionRow[]) => void;
};

export function TableExtractionPanel({ documentId, rows, onRowsChange }: Props) {
  const [rawRows, setRawRows] = useState('');

  async function detectRows() {
    const boxes: PdfTextBox[] = rawRows
      .split('\n')
      .map((line, index) => line.trim())
      .filter(Boolean)
      .map((text, index) => ({
        text,
        page: 1,
        bbox: [32, 32 + index * 22, Math.max(40, text.length * 7), 18]
      }));
    const candidates = detectTableCandidates(boxes);
    onRowsChange(await heuristicTableLabeler({ documentId, candidates }));
  }

  return (
    <section className="panel review-grid">
      <div className="panel-header">
        <div>
          <div className="eyebrow">Table geometry</div>
          <h2>Table extraction</h2>
          <p className="muted">Paste PDF text rows to simulate geometry-derived table candidates, then label cells.</p>
        </div>
        <span className="status-badge" data-tone={rows.length ? 'ready' : 'attention'}>
          {rows.length} rows
        </span>
      </div>
      <textarea value={rawRows} onChange={(event) => setRawRows(event.target.value)} placeholder="Header row&#10;Outcome row&#10;Arm data row" />
      <button type="button" onClick={detectRows}>
        Detect and label table rows
      </button>
      {rows.length > 0 ? (
      <table className="table">
        <thead>
          <tr>
            <th>Row</th>
            <th>Cells</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.rowId}>
              <td>{row.rowId}</td>
              <td>{row.cells.map((cell) => `${cell.role}: ${cell.text}`).join(' | ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
      ) : (
        <div className="empty-state">No detected rows yet. Add table-like text and run the labeler.</div>
      )}
    </section>
  );
}
