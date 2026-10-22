import type { DiagnosticRecord } from '../../domain/entities/DiagnosticRecord.js';
import type { DiagnosticRecordRepository } from '../../domain/repositories/DiagnosticRecordRepository.js';
import type { ApplicationRepository } from '../../domain/repositories/ApplicationRepository.js';
import type { StorageAdapter } from '../../infrastructure/storage/S3StorageAdapter.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';

export class GetDiagnosticRecordUseCase {
  constructor(
    private readonly diagnosticRepo: DiagnosticRecordRepository,
    private readonly applicationsRepo: ApplicationRepository,
    private readonly storageAdapter?: StorageAdapter,
  ) {}

  async execute(applicationId: string): Promise<DiagnosticRecord | null> {
    const application = await this.applicationsRepo.findById(applicationId);
    if (!application) {
      throw new NotFoundError(`Application ${applicationId} not found`);
    }

    const record = await this.diagnosticRepo.findByApplicationId(applicationId);
    if (!record) {
      return null;
    }

    // Si hay un storage adapter configurado, generar URLs prefirmadas de lectura para las fotos
    if (this.storageAdapter?.isConfigured() && record.photos && record.photos.length > 0) {
      for (const photo of record.photos) {
        if (photo.s3Key && (!photo.url || !photo.url.startsWith('http'))) {
          try {
            photo.url = await this.storageAdapter.getPresignedReadUrl(photo.s3Key, 1800);
          } catch {
            photo.url = photo.url || photo.s3Key;
          }
        } else {
          photo.url = photo.url || photo.s3Key;
        }
      }
    }

    return record;
  }
}
