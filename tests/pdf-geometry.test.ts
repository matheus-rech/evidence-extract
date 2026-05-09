import { describe, expect, it } from 'vitest';
import { bboxArea, bboxIntersects, detectTableCandidates, normalizeBBox } from '@/lib/pdf/geometry';

describe('PDF geometry helpers', () => {
  it('normalizes drag direction into positive bbox dimensions', () => {
    expect(normalizeBBox(40, 50, 10, 20)).toEqual([10, 20, 30, 30]);
  });

  it('computes bbox area and intersections', () => {
    expect(bboxArea([0, 0, 10, 20])).toBe(200);
    expect(bboxIntersects([0, 0, 10, 10], [5, 5, 10, 10])).toBe(true);
    expect(bboxIntersects([0, 0, 10, 10], [20, 20, 10, 10])).toBe(false);
  });

  it('detects row and column candidates from aligned text boxes', () => {
    const candidates = detectTableCandidates([
      { text: 'Outcome', page: 1, bbox: [10, 10, 60, 10] },
      { text: 'TTC', page: 1, bbox: [90, 11, 30, 10] },
      { text: 'OS', page: 1, bbox: [10, 30, 20, 10] },
      { text: '18 months', page: 1, bbox: [90, 31, 70, 10] }
    ]);

    expect(candidates.map((candidate) => [candidate.row, candidate.column])).toEqual([
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1]
    ]);
  });
});
