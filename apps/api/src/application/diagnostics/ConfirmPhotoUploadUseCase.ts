import type { DiagnosticPhoto } from '../../domain/entities/DiagnosticRecord.js';
import type { DiagnosticRecordRepository } from '../../domain/repositories/DiagnosticRecordRepository.js';
import type { ApplicationRepository } from '../../domain/repositories/ApplicationRepository.js';
import type { StorageAdapter } from '../../infrastructure/storage/S3StorageAdapter.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { ConflictError } from '../../shared/errors/ConflictError.js';
import { ForbiddenError } from '../../shared/errors/ForbiddenError.js';

export interface ConfirmPhotoUploadInput {
  category: 'technical' | 'social';
  photoType: string;
  s3Key: string;
  capturedAt: string | Date;
  captureLatitude?: number | null;
  captureLongitude?: number | null;
  mimeType: string;
  fileSizeBytes: number;
  description?: string | null;
}

export class ConfirmPhotoUploadUseCase {
  constructor(
    private readonly diagnosticRepo: DiagnosticRecordRepository,
    private readonly applicationsRepo: ApplicationRepository,
    private readonly storageAdapter: StorageAdapter,
  ) {}

  async execute(
    applicationId: string,
    input: ConfirmPhotoUploadInput,
    userId: string,
    userRole: string,
  ): Promise<DiagnosticPhoto> {
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

    // Asegurar que exista la cabecera del registro diagnóstico
    const record = await this.diagnosticRepo.getOrCreateDiagnosticRecord(applicationId, userId);

    const createdPhoto = await this.diagnosticRepo.addPhoto({
      diagnosticRecordId: record.id,
      category: input.category,
      photoType: input.photoType,
      s3Key: input.s3Key,
      capturedAt: input.capturedAt,
      captureLatitude: input.captureLatitude ?? null,
      captureLongitude: input.captureLongitude ?? null,
      mimeType: input.mimeType,
      fileSizeBytes: input.fileSizeBytes,
      description: input.description ?? null,
    });

    // Adjuntar URL prefirmada de lectura para renderizado inmediato en el cliente
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
