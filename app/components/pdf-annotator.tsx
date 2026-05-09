'use client';

import { useEffect, useRef, useState } from 'react';
import { normalizeBBox, provenanceFromSelection, type BBox } from '@/lib/pdf/geometry';
import type { EvidenceProvenance, ExtractionField } from '@/lib/schema/extraction-schema';

type DragState = {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
};

type Props = {
  fileUrl: string | null;
  selectedField: ExtractionField;
  onAttach: (field: ExtractionField, provenance: EvidenceProvenance) => void;
};

export function PdfAnnotator({ fileUrl, selectedField, onAttach }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState(fileUrl ? 'Loading PDF...' : 'No signed PDF URL available.');
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [lastBBox, setLastBBox] = useState<BBox | null>(null);
  const [quote, setQuote] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function renderPage() {
      if (!fileUrl || !canvasRef.current) return;
      setStatus('Loading PDF...');
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString();

      const pdf = await pdfjs.getDocument(fileUrl).promise;
      const pdfPage = await pdf.getPage(page);
      const viewport = pdfPage.getViewport({ scale: 1.25 });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context || cancelled) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await pdfPage.render({ canvas, canvasContext: context, viewport }).promise;

      if (!cancelled) {
        setPageCount(pdf.numPages);
        setStatus(`Page ${page} of ${pdf.numPages}`);
      }
    }

    renderPage().catch((error: unknown) => setStatus(error instanceof Error ? error.message : 'Unable to render PDF.'));
    return () => {
      cancelled = true;
    };
  }, [fileUrl, page]);

  function pointerPosition(event: React.PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  function completeSelection() {
    if (!drag) return;
    const bbox = normalizeBBox(drag.startX, drag.startY, drag.currentX, drag.currentY);
    if (bbox[2] >= 4 && bbox[3] >= 4) setLastBBox(bbox);
    setDrag(null);
  }

  function attachSelection() {
    if (!lastBBox || !quote.trim()) return;
    onAttach(selectedField, provenanceFromSelection(page, lastBBox, quote));
    setQuote('');
    setLastBBox(null);
  }

  const selection = drag ? normalizeBBox(drag.startX, drag.startY, drag.currentX, drag.currentY) : lastBBox;

  return (
    <section className="panel pdf-shell">
      <div className="panel-header">
        <div>
          <div className="eyebrow">Source PDF</div>
          <h2>PDF evidence</h2>
          <p className="muted">{status}</p>
        </div>
        <div className="field-strip" aria-label="PDF page controls">
          <button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
            Previous
          </button>
          <button type="button" disabled={page >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>
            Next
          </button>
        </div>
      </div>

      <div className="pdf-frame">
        <canvas
          ref={canvasRef}
          className="pdf-canvas"
          onPointerDown={(event) => {
            const point = pointerPosition(event);
            setDrag({ startX: point.x, startY: point.y, currentX: point.x, currentY: point.y });
          }}
          onPointerMove={(event) => {
            if (!drag) return;
            const point = pointerPosition(event);
            setDrag({ ...drag, currentX: point.x, currentY: point.y });
          }}
          onPointerUp={completeSelection}
          onPointerLeave={completeSelection}
        />
        {selection ? (
          <div
            className="selection-box"
            style={{ left: selection[0], top: selection[1], width: selection[2], height: selection[3] }}
          />
        ) : null}
      </div>

      <label>
        Quote for selected field: {selectedField}
        <textarea value={quote} onChange={(event) => setQuote(event.target.value)} placeholder="Paste or type the selected quote." />
      </label>
      <button type="button" disabled={!lastBBox || !quote.trim()} onClick={attachSelection}>
        Attach provenance
      </button>
    </section>
  );
}
