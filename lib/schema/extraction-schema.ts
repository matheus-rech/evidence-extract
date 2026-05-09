import type { FromSchema } from 'json-schema-to-ts';

export const bboxSchema = {
  type: 'array',
  items: { type: 'number' },
  minItems: 4,
  maxItems: 4
} as const;

export const provenanceSchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1 },
    bbox: bboxSchema,
    quote: { type: 'string', minLength: 1 },
    source: { enum: ['selection', 'table-cell', 'ai-suggestion', 'reviewer-note'] }
  },
  required: ['page', 'bbox', 'quote', 'source'],
  additionalProperties: false
} as const;

export const outcomeExtractionSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1 },
    canonicalName: { type: 'string' },
    timepoint: { type: 'string' },
    effectMeasure: { type: 'string' },
    value: { type: 'string' },
    unit: { type: 'string' },
    provenance: { type: 'array', items: provenanceSchema, default: [] }
  },
  required: ['name', 'value'],
  additionalProperties: false
} as const;

export const tableExtractionRowSchema = {
  type: 'object',
  properties: {
    rowId: { type: 'string', minLength: 1 },
    label: { type: 'string' },
    cells: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          text: { type: 'string' },
          role: { enum: ['header', 'data', 'outcome', 'arm', 'timepoint', 'ignored'] },
          provenance: provenanceSchema
        },
        required: ['text', 'role', 'provenance'],
        additionalProperties: false
      }
    }
  },
  required: ['rowId', 'cells'],
  additionalProperties: false
} as const;

export const extractionSchema = {
  type: 'object',
  properties: {
    population: { type: 'string', minLength: 1 },
    intervention: { type: 'string', minLength: 1 },
    comparator: { type: 'string', minLength: 1 },
    outcomes: { type: 'array', items: outcomeExtractionSchema, minItems: 1 },
    provenance: { type: 'array', items: provenanceSchema, default: [] },
    tables: { type: 'array', items: tableExtractionRowSchema, default: [] },
    reviewerNotes: { type: 'string' }
  },
  required: ['population', 'intervention', 'comparator', 'outcomes'],
  additionalProperties: false
} as const;

export type EvidenceProvenance = FromSchema<typeof provenanceSchema>;
export type OutcomeExtraction = FromSchema<typeof outcomeExtractionSchema>;
export type TableExtractionRow = FromSchema<typeof tableExtractionRowSchema>;
export type ExtractionPayload = FromSchema<typeof extractionSchema>;

export type ExtractionField = 'population' | 'intervention' | 'comparator' | `outcomes.${number}`;

export const emptyExtractionPayload: ExtractionPayload = {
  population: '',
  intervention: '',
  comparator: '',
  outcomes: [{ name: '', value: '', provenance: [] }],
  provenance: [],
  tables: []
};
