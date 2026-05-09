import type { EvidenceProvenance, ExtractionPayload, TableExtractionRow } from '@/lib/schema/extraction-schema';

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type DocumentRow = {
  id: string;
  title: string;
  doi: string | null;
  journal: string | null;
  publication_year: number | null;
  storage_path: string | null;
  file_sha256: string | null;
  created_at: string;
};

export type ReconciliationConflict = {
  id: string;
  document_id: string;
  field_path: string;
  primary_value: Json;
  secondary_value: Json;
  resolution: string | null;
  resolved_at: string | null;
};

export type ActiveLearningEvent = {
  id: string;
  document_id: string;
  error_type: string;
  field_path: string | null;
  note: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
};

export type DocumentWorkspace = DocumentRow & {
  signedUrl: string | null;
  latestExtraction: ExtractionPayload | null;
  snippets: EvidenceProvenance[];
  tableRows: TableExtractionRow[];
  conflicts: ReconciliationConflict[];
};

export type Database = {
  public: {
    Tables: {
      documents: {
        Row: DocumentRow;
        Insert: Partial<DocumentRow> & Pick<DocumentRow, 'title'>;
        Update: Partial<DocumentRow>;
      };
      evidence_snippets: {
        Row: EvidenceProvenance & { id: string; document_id: string; field_path: string | null };
        Insert: EvidenceProvenance & { document_id: string; field_path?: string | null };
        Update: Partial<EvidenceProvenance & { field_path: string | null }>;
      };
      extractions: {
        Row: { id: string; document_id: string; reviewer_id: string; payload: ExtractionPayload; created_at: string };
        Insert: { document_id: string; reviewer_id: string; payload: ExtractionPayload };
        Update: { payload?: ExtractionPayload };
      };
      table_extractions: {
        Row: { id: string; document_id: string; rows: TableExtractionRow[]; created_at: string };
        Insert: { document_id: string; rows: TableExtractionRow[] };
        Update: { rows?: TableExtractionRow[] };
      };
      reconciliation_conflicts: {
        Row: ReconciliationConflict;
        Insert: Omit<ReconciliationConflict, 'id' | 'resolved_at'>;
        Update: Partial<ReconciliationConflict>;
      };
      active_learning_events: {
        Row: ActiveLearningEvent;
        Insert: Omit<ActiveLearningEvent, 'id' | 'created_at'>;
        Update: Partial<ActiveLearningEvent>;
      };
    };
  };
};
