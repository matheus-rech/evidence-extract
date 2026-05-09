import { describe, expect, it } from 'vitest';
import { validateExtractionPayload } from '@/lib/schema/validation';

describe('extraction schema validation', () => {
  it('accepts PICO, outcome, and bbox provenance payloads', () => {
    const result = validateExtractionPayload({
      population: 'Adults with HER2-positive metastatic breast cancer',
      intervention: 'Tucatinib, trastuzumab, and capecitabine',
      comparator: 'Trastuzumab deruxtecan',
      outcomes: [
        {
          name: 'Overall survival',
          value: '18.1 months',
          provenance: [{ page: 2, bbox: [10, 20, 120, 18], quote: 'Median OS was 18.1 months', source: 'selection' }]
        }
      ],
      provenance: [],
      tables: []
    });

    expect(result.ok).toBe(true);
  });

  it('rejects missing required outcome values', () => {
    const result = validateExtractionPayload({
      population: 'Population',
      intervention: 'Intervention',
      comparator: 'Comparator',
      outcomes: [{ name: 'OS' }]
    });

    expect(result.ok).toBe(false);
  });
});
