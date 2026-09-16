import type { DiagnosticRecord } from '../../domain/entities/DiagnosticRecord.js';
import type {
  DiagnosticRecordRepository,
  TechnicalDiagnosticInput,
} from '../../domain/repositories/DiagnosticRecordRepository.js';
import type { ApplicationRepository } from '../../domain/repositories/ApplicationRepository.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { ConflictError } from '../../shared/errors/ConflictError.js';

export class SaveTechnicalDiagnosisUseCase {
  constructor(
    private readonly diagnosticRepo: DiagnosticRecordRepository,
    private readonly applicationsRepo: ApplicationRepository,
  ) {}

  async execute(
    applicationId: string,
    input: TechnicalDiagnosticInput,
    userId: string,
  ): Promise<DiagnosticRecord> {
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

    return await this.diagnosticRepo.saveTechnical(applicationId, input, userId);
  }
}
