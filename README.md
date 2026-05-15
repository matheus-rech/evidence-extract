# evidence-extract

## Secondary execution/service patterns (ideas)

If you want an action to run outside the primary app/runtime (so heavy jobs don’t block the main application flow), these are practical patterns:

1. **Queue + worker (recommended default)**
   - Primary app validates request and pushes a job to a queue (SQS, RabbitMQ, Redis, Pub/Sub).
   - Secondary worker service pulls jobs, runs extraction/transforms, writes artifacts to object storage.
   - Primary app polls status or receives webhook callbacks.

2. **Workflow orchestrator**
   - Use Temporal, Prefect, Airflow, or Dagster when you need retries, backfills, and audit trails.
   - Primary app triggers workflow run with parameters (years, UFs, filters).

3. **Serverless batch execution**
   - Trigger cloud batch jobs (AWS Batch, GCP Batch, Azure Container Apps Jobs, GitHub Actions workflow_dispatch).
   - Good for bursty workloads and avoiding always-on workers.

4. **Event-driven release artifacts**
   - Use CI/CD (GitHub Actions) to run jobs and publish outputs as release assets.
   - Useful when users want downloadable, versioned outputs with checksums.

## Minimal architecture for this project

- **Primary API**: receives action request, stores run metadata.
- **Job broker**: queue/topic with idempotency key.
- **Worker runtime**: containerized pipeline runner.
- **Artifact store**: S3/GCS/Azure Blob for Parquet/CSV/XLSX + logs.
- **Status store**: run state (queued, running, failed, completed) + timestamps.
- **Notification path**: webhook/email/Slack on completion/failure.

## Suggested first implementation

- Start with **Queue + worker** and keep payload simple:
  - `run_id`, `start_year`, `end_year`, `ufs`, `strict_validation`, `output_formats`.
- Workers should:
  - write heartbeat every N minutes,
  - checkpoint by UF/year/month to support resume,
  - emit structured logs,
  - produce deterministic file names and SHA256 manifests.

## Operational guardrails

- Add hard timeout and retry limits per shard.
- Use shard strategy (`UF x year`) for long historical runs.
- Preserve schema/version metadata with each artifact.
- Keep PII/PHI controls explicit (encryption at rest + access policy).

## Decision shortcut

- Need simple and fast: **Queue + worker**.
- Need rich orchestration/backfills: **Temporal/Prefect/Airflow**.
- Need no persistent infra: **Batch/serverless jobs**.
- Need reproducible downloadable outputs: **GitHub Actions release artifacts**.
