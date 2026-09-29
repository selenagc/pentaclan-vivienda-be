import { v4 as uuidv4 } from 'uuid';
import type { ApplicationRepository } from '../../domain/repositories/ApplicationRepository.js';
import type { StorageAdapter } from '../../infrastructure/storage/S3StorageAdapter.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { ConflictError } from '../../shared/errors/ConflictError.js';
import { ForbiddenError } from '../../shared/errors/ForbiddenError.js';

export interface GetPhotoUploadUrlInput {
  category: 'technical' | 'social';
  photoType: string;
  mimeType: string;
}

export interface GetPhotoUploadUrlResult {
  uploadUrl: string;
  s3Key: string;
  expiresInSeconds: number;
}

export class GetPhotoUploadUrlUseCase {
  constructor(
    private readonly applicationsRepo: ApplicationRepository,
    private readonly storageAdapter: StorageAdapter,
  ) {}

  async execute(
    applicationId: string,
    input: GetPhotoUploadUrlInput,
    userRole: string,
  ): Promise<GetPhotoUploadUrlResult> {
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

    // Role check: technical_lead can only upload technical, social_lead can only upload social
    if (userRole === 'technical_lead' && input.category !== 'technical') {
      throw new ForbiddenError('Technical leads can only upload technical inspection photos.');
    }
    if (userRole === 'social_lead' && input.category !== 'social') {
      throw new ForbiddenError('Social leads can only upload social evaluation photos.');
    }

    const photoId = uuidv4();
    let ext = 'jpg';
    if (input.mimeType === 'image/png') ext = 'png';
    else if (input.mimeType === 'image/webp') ext = 'webp';

    const s3Key = `diagnostics/${applicationId}/${input.category}/${photoId}.${ext}`;
    const expiresInSeconds = 300; // 5 minutos de validez para captura inmediata

    let uploadUrl: string;
    if (this.storageAdapter.isConfigured()) {
      uploadUrl = await this.storageAdapter.getPresignedUploadUrl(
        s3Key,
        input.mimeType,
        expiresInSeconds,
      );
    } else {
      // Fallback para entornos donde aún no se hayan cargado credenciales de S3/MinIO
      uploadUrl = `https://mock-s3-upload-url.local/${s3Key}?expiresIn=${expiresInSeconds}`;
    }

    return {
      uploadUrl,
      s3Key,
      expiresInSeconds,
    };
  }
}
