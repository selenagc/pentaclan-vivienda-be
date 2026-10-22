import type { DiagnosticRecordRepository } from '../../domain/repositories/DiagnosticRecordRepository.js';
import type { ApplicationRepository } from '../../domain/repositories/ApplicationRepository.js';
import type { StorageAdapter } from '../../infrastructure/storage/S3StorageAdapter.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { ForbiddenError } from '../../shared/errors/ForbiddenError.js';
import { ConflictError } from '../../shared/errors/ConflictError.js';

export class DeleteDiagnosticPhotoUseCase {
  constructor(
    private readonly diagnosticRepo: DiagnosticRecordRepository,
    private readonly applicationsRepo: ApplicationRepository,
    private readonly storageAdapter: StorageAdapter,
  ) {}

  async execute(applicationId: string, photoId: number, userRole: string): Promise<void> {
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

    const photo = await this.diagnosticRepo.findPhotoById(photoId);
    if (!photo) {
      throw new NotFoundError(`Diagnostic photo ${photoId} not found`);
    }

    if (userRole === 'technical_lead' && photo.category !== 'technical') {
      throw new ForbiddenError('Technical leads can only delete technical inspection photos.');
    }
    if (userRole === 'social_lead' && photo.category !== 'social') {
      throw new ForbiddenError('Social leads can only delete social evaluation photos.');
    }

    // 1. Eliminar de la base de datos
    await this.diagnosticRepo.deletePhoto(photoId);

    // 2. Eliminar del almacenamiento en S3
    if (this.storageAdapter.isConfigured() && photo.s3Key) {
      try {
        await this.storageAdapter.delete(photo.s3Key);
      } catch (err) {
        // Log error y continuar (el registro de la BD ya fue eliminado)
        console.error(`Failed to delete S3 object for key ${photo.s3Key}:`, err);
      }
    }
  }
}
