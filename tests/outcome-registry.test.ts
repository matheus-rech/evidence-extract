import { describe, expect, it } from 'vitest';
import { harmonizeOutcome, suggestCanonicalOutcome } from '@/lib/schema/outcome-registry';

describe('outcome registry', () => {
  it('maps synonyms onto canonical outcomes', () => {
    expect(suggestCanonicalOutcome('OS')?.canonicalName).toBe('Overall survival');
    expect(suggestCanonicalOutcome('CNS response')?.canonicalName).toBe('Intracranial response');
  });

  it('adds canonical name and default unit without overwriting reviewer values', () => {
    const harmonized = harmonizeOutcome({ name: 'ORR', value: '54', provenance: [] });
    expect(harmonized.canonicalName).toBe('Objective response rate');
    expect(harmonized.unit).toBe('percent');
  });
});
