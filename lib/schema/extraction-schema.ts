import type { FromSchema } from 'json-schema-to-ts';

export const extractionSchema = {
  type: 'object',
  properties: {
    population: { type: 'string' },
    intervention: { type: 'string' },
    comparator: { type: 'string' },
    outcome: { type: 'string' },
    provenance: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          page: { type: 'integer' },
          bbox: { type: 'array', 'items': { type: 'number' }, minItems: 4, maxItems: 4 },
          quote: { type: 'string' }
        },
        required: ['page', 'bbox', 'quote']
      }
    }
  },
  required: ['population', 'intervention', 'comparator', 'outcome']
} as const;

export type ExtractionPayload = FromSchema<typeof extractionSchema>;
