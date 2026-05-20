# Files Module

Placeholder module prepared for future S3 integration.

A `StorageAdapter` interface and `S3StorageAdapter` placeholder live at
`src/infrastructure/storage/S3StorageAdapter.ts`. AWS credentials are
already wired via the env validator (`AWS_REGION`, `AWS_S3_BUCKET`,
`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`).

Currently the `/files` route returns `501 Not Implemented`.
