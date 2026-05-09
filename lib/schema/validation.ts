import Ajv, { type ErrorObject } from 'ajv';
import {
  emptyExtractionPayload,
  extractionSchema,
  type EvidenceProvenance,
  type ExtractionPayload,
  type OutcomeExtraction,
  type TableExtractionRow
} from './extraction-schema';

const ajv = new Ajv({ allErrors: true, useDefaults: true });
const validateExtractionSchema = ajv.compile(extractionSchema);

export type ValidationResult =
  | { ok: true; payload: ExtractionPayload }
  | { ok: false; errors: ErrorObject[] };

export function validateExtractionPayload(payload: unknown): ValidationResult {
  const candidate = structuredClone(payload) as unknown;
  if (validateExtractionSchema(candidate)) {
    return { ok: true, payload: candidate as ExtractionPayload };
  }

  return { ok: false, errors: validateExtractionSchema.errors ?? [] };
}

export function validationSummary(errors: ErrorObject[]): string {
  return errors.map((error) => `${error.instancePath || '/'} ${error.message ?? 'is invalid'}`).join('; ');
}

export function parseJsonArray<T>(value: FormDataEntryValue | null, fallback: T[]): T[] {
  if (typeof value !== 'string' || value.trim() === '') return fallback;
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
  return Array.isArray(parsed) ? (parsed as T[]) : fallback;
}

export function extractionFromFormData(formData: FormData): ExtractionPayload {
  const outcomes = parseJsonArray<OutcomeExtraction>(formData.get('outcomesJson'), []);
  const provenance = parseJsonArray<EvidenceProvenance>(formData.get('provenanceJson'), []);
  const tables = parseJsonArray<TableExtractionRow>(formData.get('tablesJson'), []);

  return {
    ...emptyExtractionPayload,
    population: String(formData.get('population') ?? ''),
    intervention: String(formData.get('intervention') ?? ''),
    comparator: String(formData.get('comparator') ?? ''),
    reviewerNotes: String(formData.get('reviewerNotes') ?? ''),
    outcomes,
    provenance,
    tables
  };
}
