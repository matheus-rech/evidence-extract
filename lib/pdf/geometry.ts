import type { EvidenceProvenance } from '@/lib/schema/extraction-schema';

export type BBox = [number, number, number, number];

export type PdfTextBox = {
  text: string;
  page: number;
  bbox: BBox;
};

export type TableCellCandidate = PdfTextBox & {
  row: number;
  column: number;
};

export function normalizeBBox(startX: number, startY: number, endX: number, endY: number): BBox {
  const x = Math.min(startX, endX);
  const y = Math.min(startY, endY);
  return [x, y, Math.abs(endX - startX), Math.abs(endY - startY)];
}

export function bboxArea([, , width, height]: BBox): number {
  return Math.max(0, width) * Math.max(0, height);
}

export function bboxIntersects(a: BBox, b: BBox): boolean {
  const ax2 = a[0] + a[2];
  const ay2 = a[1] + a[3];
  const bx2 = b[0] + b[2];
  const by2 = b[1] + b[3];

  return a[0] < bx2 && ax2 > b[0] && a[1] < by2 && ay2 > b[1];
}

export function provenanceFromSelection(page: number, bbox: BBox, quote: string): EvidenceProvenance {
  return {
    page,
    bbox,
    quote: quote.trim(),
    source: 'selection'
  };
}

export function detectTableCandidates(textBoxes: PdfTextBox[], rowTolerance = 8): TableCellCandidate[] {
  const rows = [...textBoxes]
    .filter((box) => box.text.trim().length > 0 && bboxArea(box.bbox) > 0)
    .sort((a, b) => a.page - b.page || a.bbox[1] - b.bbox[1] || a.bbox[0] - b.bbox[0])
    .reduce<PdfTextBox[][]>((acc, box) => {
      const lastRow = acc.at(-1);
      const lastY = lastRow?.[0]?.bbox[1];
      if (!lastRow || lastY === undefined || box.page !== lastRow[0].page || Math.abs(box.bbox[1] - lastY) > rowTolerance) {
        acc.push([box]);
      } else {
        lastRow.push(box);
      }
      return acc;
    }, []);

  return rows.flatMap((row, rowIndex) =>
    row
      .sort((a, b) => a.bbox[0] - b.bbox[0])
      .map((box, columnIndex) => ({
        ...box,
        row: rowIndex,
        column: columnIndex
      }))
  );
}
