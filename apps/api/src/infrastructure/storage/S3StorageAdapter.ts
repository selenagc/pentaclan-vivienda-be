import { env } from '../../shared/config/env.js';

export interface UploadInput {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType?: string;
}

export interface UploadResult {
  key: string;
  url: string;
}

export interface StorageAdapter {
  upload(input: UploadInput): Promise<UploadResult>;
  getSignedUrl(key: string, expiresInSeconds: number): Promise<string>;
  delete(key: string): Promise<void>;
}

/**
 * Placeholder for future AWS S3 integration.
 * Reads AWS_* env vars but does not perform any network calls yet.
 */
export class S3StorageAdapter implements StorageAdapter {
  private readonly region: string;
  private readonly bucket: string;

  constructor() {
    this.region = env.AWS_REGION;
    this.bucket = env.AWS_S3_BUCKET;
  }

  async upload(_input: UploadInput): Promise<UploadResult> {
    throw new Error('S3StorageAdapter.upload is not implemented yet');
  }

  async getSignedUrl(_key: string, _expiresInSeconds: number): Promise<string> {
    throw new Error('S3StorageAdapter.getSignedUrl is not implemented yet');
  }

  async delete(_key: string): Promise<void> {
    throw new Error('S3StorageAdapter.delete is not implemented yet');
  }

  isConfigured(): boolean {
    return Boolean(this.region && this.bucket);
  }
}
