import type { TableExtractionRow } from '@/lib/schema/extraction-schema';
import type { TableCellCandidate } from './geometry';

export type TableLabelRequest = {
  documentId: string;
  candidates: TableCellCandidate[];
};

export type TableLabeler = (request: TableLabelRequest) => Promise<TableExtractionRow[]>;

export const heuristicTableLabeler: TableLabeler = async ({ candidates }) => {
  const rows = new Map<number, TableCellCandidate[]>();
  for (const candidate of candidates) {
    const current = rows.get(candidate.row) ?? [];
    current.push(candidate);
    rows.set(candidate.row, current);
  }

  return [...rows.entries()].map(([rowIndex, cells]) => ({
    rowId: `row-${rowIndex + 1}`,
    cells: cells.map((cell) => ({
      text: cell.text,
      role: rowIndex === 0 ? 'header' : inferCellRole(cell.text),
      provenance: {
        page: cell.page,
        bbox: cell.bbox,
        quote: cell.text,
        source: 'table-cell'
      }
    }))
  }));
};

function inferCellRole(text: string): 'data' | 'outcome' | 'arm' | 'timepoint' {
  const normalized = text.toLowerCase();
  if (/month|week|year|day/.test(normalized)) return 'timepoint';
  if (/survival|response|toxicity|event|hazard|risk/.test(normalized)) return 'outcome';
  if (/intervention|comparator|placebo|control|arm|group/.test(normalized)) return 'arm';
  return 'data';
}
