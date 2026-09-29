import { v4 as uuidv4 } from 'uuid';
import type { DiagnosticPhoto } from '../../domain/entities/DiagnosticRecord.js';
import type { DiagnosticRecordRepository } from '../../domain/repositories/DiagnosticRecordRepository.js';
import type { ApplicationRepository } from '../../domain/repositories/ApplicationRepository.js';
import type { StorageAdapter } from '../../infrastructure/storage/S3StorageAdapter.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { ConflictError } from '../../shared/errors/ConflictError.js';
import { ForbiddenError } from '../../shared/errors/ForbiddenError.js';
import { ValidationError } from '../../shared/errors/ValidationError.js';

export interface UploadedFile {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalname?: string;
}

export interface UploadDiagnosticPhotoInput {
  category: 'technical' | 'social';
  photoType: string;
  capturedAt?: string | Date;
  captureLatitude?: number | null;
  captureLongitude?: number | null;
  description?: string | null;
}

export class UploadDiagnosticPhotoUseCase {
  constructor(
    private readonly diagnosticRepo: DiagnosticRecordRepository,
    private readonly applicationsRepo: ApplicationRepository,
    private readonly storageAdapter: StorageAdapter,
  ) {}

  async execute(
    applicationId: string,
    file: UploadedFile | undefined,
    input: UploadDiagnosticPhotoInput,
    userId: string,
    userRole: string,
  ): Promise<DiagnosticPhoto> {
    if (!file || !file.buffer) {
      throw new ValidationError('Se requiere un archivo de imagen en el campo "image"', [
        { field: 'image', message: 'Image file is required' },
      ]);
    }

    const application = await this.applicationsRepo.findById(applicationId);
    if (!application) {
      throw new NotFoundError(`Application ${applicationId} not found`);
    }

    if (application.status === 'rejected') {
      throw new ConflictError(
        'Cannot modify diagnostic record for a rejected application',
        'APPLICATION_REJECTED',
      );
    }

    if (userRole === 'technical_lead' && input.category !== 'technical') {
      throw new ForbiddenError('Technical leads can only upload technical inspection photos.');
    }
    if (userRole === 'social_lead' && input.category !== 'social') {
      throw new ForbiddenError('Social leads can only upload social evaluation photos.');
    }

    // 1. Generar clave única para S3
    const photoId = uuidv4();
    let ext = 'jpg';
    if (file.mimetype === 'image/png') ext = 'png';
    else if (file.mimetype === 'image/webp') ext = 'webp';

    const s3Key = `diagnostics/${applicationId}/${input.category}/${photoId}.${ext}`;

    // 2. Subir directamente el buffer a S3
    if (this.storageAdapter.isConfigured()) {
      await this.storageAdapter.upload({
        key: s3Key,
        body: file.buffer,
        contentType: file.mimetype,
      });
    }

    // 3. Asegurar que exista la cabecera del diagnóstico
    const record = await this.diagnosticRepo.getOrCreateDiagnosticRecord(applicationId, userId);

    // 4. Guardar metadatos en PostgreSQL
    const capturedAt = input.capturedAt ? new Date(input.capturedAt) : new Date();

    const createdPhoto = await this.diagnosticRepo.addPhoto({
      diagnosticRecordId: record.id,
      category: input.category,
      photoType: input.photoType,
      s3Key,
      capturedAt,
      captureLatitude: input.captureLatitude ?? null,
      captureLongitude: input.captureLongitude ?? null,
      mimeType: file.mimetype,
      fileSizeBytes: file.size,
      description: input.description ?? null,
    });

    // 5. Generar URL prefirmada de lectura para renderizado en el cliente
    if (this.storageAdapter.isConfigured() && createdPhoto.s3Key) {
      try {
        createdPhoto.url = await this.storageAdapter.getPresignedReadUrl(createdPhoto.s3Key, 1800);
      } catch {
        createdPhoto.url = createdPhoto.url || createdPhoto.s3Key;
      }
    } else {
      createdPhoto.url = createdPhoto.url || createdPhoto.s3Key;
    }

    return createdPhoto;
  }
}
