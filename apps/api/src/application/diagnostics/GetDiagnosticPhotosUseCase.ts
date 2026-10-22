import type { DiagnosticPhoto } from '../../domain/entities/DiagnosticRecord.js';
import type { DiagnosticRecordRepository } from '../../domain/repositories/DiagnosticRecordRepository.js';
import type { ApplicationRepository } from '../../domain/repositories/ApplicationRepository.js';
import type { StorageAdapter } from '../../infrastructure/storage/S3StorageAdapter.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';

export class GetDiagnosticPhotosUseCase {
  constructor(
    private readonly diagnosticRepo: DiagnosticRecordRepository,
    private readonly applicationsRepo: ApplicationRepository,
    private readonly storageAdapter: StorageAdapter,
  ) {}

  async execute(
    applicationId: string,
    category?: 'technical' | 'social',
  ): Promise<DiagnosticPhoto[]> {
    const application = await this.applicationsRepo.findById(applicationId);
    if (!application) {
      throw new NotFoundError(`Application ${applicationId} not found`);
    }

    const photos = await this.diagnosticRepo.findPhotosByApplicationId(applicationId, category);

    // Enriquecer cada foto con URL prefirmada de lectura vigente
    const isStorageConfigured = this.storageAdapter.isConfigured();
    for (const photo of photos) {
      if (isStorageConfigured && photo.s3Key && (!photo.url || !photo.url.startsWith('http'))) {
        try {
          photo.url = await this.storageAdapter.getPresignedReadUrl(photo.s3Key, 1800);
        } catch {
          photo.url = photo.url || photo.s3Key;
        }
      } else {
        photo.url = photo.url || photo.s3Key;
      }
    }

    return photos;
  }
}
