# evidence-extract

Evidence Extract is a Next.js App Router + React 19 + Supabase workspace for PDF-backed healthcare research extraction.

## Stack

- Node.js 22+
- Next.js 16 App Router
- React 19 Server Components, Server Actions, `useActionState`, `useFormStatus`, and `useOptimistic`
- Supabase Postgres, Storage, RLS, and explicit Data API grants
- PDF.js for browser PDF rendering and bbox capture
- AJV + JSON Schema + TypeScript types for extraction validation

## Core Workflows

1. Upload a PDF and persist document metadata plus the PDF object in Supabase Storage.
2. Review the PDF in `/documents/[id]`, capture bounding boxes, attach quotes, and save PICO/outcome fields with provenance.
3. Detect table-like PDF geometry and send rows through a typed AI-labeling interface.
4. Harmonize extracted outcomes against the canonical registry and persist reviewer overrides.
5. Compare primary and secondary reviewer payloads, resolve conflicts, and log active-learning errors.

## Local Commands

```bash
npm install
npm test
npm run build
```

Apply `supabase/migrations/20260509170000_evidence_extract_pipeline.sql` before connecting a fresh Supabase project. The migration enables RLS and bundles explicit grants with policies so tables are reachable only by intended roles.
