import type { OutcomeExtraction } from './extraction-schema';

export type OutcomeRegistryEntry = {
  canonicalName: string;
  synonyms: string[];
  defaultUnit?: string;
};

export const defaultOutcomeRegistry: OutcomeRegistryEntry[] = [
  {
    canonicalName: 'Overall survival',
    synonyms: ['os', 'overall survival', 'death', 'mortality'],
    defaultUnit: 'months'
  },
  {
    canonicalName: 'Progression-free survival',
    synonyms: ['pfs', 'progression-free survival', 'progression free survival'],
    defaultUnit: 'months'
  },
  {
    canonicalName: 'Objective response rate',
    synonyms: ['orr', 'objective response', 'response rate'],
    defaultUnit: 'percent'
  },
  {
    canonicalName: 'Intracranial response',
    synonyms: ['cns response', 'intracranial response', 'brain response'],
    defaultUnit: 'percent'
  },
  {
    canonicalName: 'Adverse events',
    synonyms: ['toxicity', 'safety', 'adverse event', 'grade 3']
  }
];

function normalizeOutcome(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export function suggestCanonicalOutcome(
  outcomeName: string,
  registry: OutcomeRegistryEntry[] = defaultOutcomeRegistry
): OutcomeRegistryEntry | null {
  const normalized = normalizeOutcome(outcomeName);
  if (!normalized) return null;

  return (
    registry.find((entry) =>
      [entry.canonicalName, ...entry.synonyms].some((candidate) => normalizeOutcome(candidate) === normalized)
    ) ??
    registry.find((entry) =>
      [entry.canonicalName, ...entry.synonyms].some((candidate) => {
        const synonym = normalizeOutcome(candidate);
        return normalized.includes(synonym) || synonym.includes(normalized);
      })
    ) ??
    null
  );
}

export function harmonizeOutcome(outcome: OutcomeExtraction): OutcomeExtraction {
  const suggestion = suggestCanonicalOutcome(outcome.name);
  if (!suggestion) return outcome;

  return {
    ...outcome,
    canonicalName: outcome.canonicalName || suggestion.canonicalName,
    unit: outcome.unit || suggestion.defaultUnit
  };
}
