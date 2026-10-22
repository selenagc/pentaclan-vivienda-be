import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  type S3ClientConfig,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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
  getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresInSeconds?: number,
  ): Promise<string>;
  getPresignedReadUrl(key: string, expiresInSeconds?: number): Promise<string>;
  getSignedUrl(key: string, expiresInSeconds: number): Promise<string>;
  getObjectBuffer(key: string): Promise<{ buffer: Buffer; contentType?: string } | null>;
  delete(key: string): Promise<void>;
  isConfigured(): boolean;
}

/**
 * AWS S3 storage adapter for diagnostic photos and attachments.
 * Supports AWS S3 as well as local MinIO / LocalStack endpoints.
 */
export class S3StorageAdapter implements StorageAdapter {
  private readonly region: string;
  private readonly bucket: string;
  private s3Client: S3Client | null = null;

  constructor() {
    this.region = env.AWS_REGION || 'us-east-1';
    this.bucket = env.AWS_S3_BUCKET;
  }

  private getClient(): S3Client {
    if (!this.s3Client) {
      const config: S3ClientConfig = {
        region: this.region,
      };

      if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) {
        config.credentials = {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        };
      }

      if (env.AWS_S3_ENDPOINT) {
        config.endpoint = env.AWS_S3_ENDPOINT;
      }

      if (env.AWS_S3_FORCE_PATH_STYLE !== undefined) {
        config.forcePathStyle = env.AWS_S3_FORCE_PATH_STYLE;
      }

      this.s3Client = new S3Client(config);
    }
    return this.s3Client;
  }

  isConfigured(): boolean {
    return Boolean(this.bucket);
  }

  async getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresInSeconds: number = 300,
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('S3 storage is not configured. AWS_S3_BUCKET is required.');
    }
    const client = this.getClient();
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    return await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  }

  async getPresignedReadUrl(key: string, expiresInSeconds: number = 1800): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('S3 storage is not configured. AWS_S3_BUCKET is required.');
    }
    const client = this.getClient();
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  }

  async getSignedUrl(key: string, expiresInSeconds: number = 1800): Promise<string> {
    return this.getPresignedReadUrl(key, expiresInSeconds);
  }

  async getObjectBuffer(key: string): Promise<{ buffer: Buffer; contentType?: string } | null> {
    if (!this.isConfigured() || !key) {
      return null;
    }
    try {
      const client = this.getClient();
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      const response = await client.send(command);
      if (!response.Body) {
        return null;
      }
      const byteArray = await response.Body.transformToByteArray();
      return {
        buffer: Buffer.from(byteArray),
        contentType: response.ContentType,
      };
    } catch {
      return null;
    }
  }

  async upload(input: UploadInput): Promise<UploadResult> {
    if (!this.isConfigured()) {
      throw new Error('S3 storage is not configured. AWS_S3_BUCKET is required.');
    }
    const client = this.getClient();
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: input.key,
      Body: input.body,
      ContentType: input.contentType,
    });
    await client.send(command);
    const url = await this.getPresignedReadUrl(input.key);
    return { key: input.key, url };
  }

  async delete(key: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('S3 storage is not configured. AWS_S3_BUCKET is required.');
    }
    const client = this.getClient();
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    await client.send(command);
  }
}
