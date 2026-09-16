import type { DiagnosticRecord } from '../../domain/entities/DiagnosticRecord.js';
import type { DiagnosticRecordRepository } from '../../domain/repositories/DiagnosticRecordRepository.js';
import type { ApplicationRepository } from '../../domain/repositories/ApplicationRepository.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';

export class GetDiagnosticRecordUseCase {
  constructor(
    private readonly diagnosticRepo: DiagnosticRecordRepository,
    private readonly applicationsRepo: ApplicationRepository,
  ) {}

  async execute(applicationId: string): Promise<DiagnosticRecord | null> {
    const application = await this.applicationsRepo.findById(applicationId);
    if (!application) {
      throw new NotFoundError(`Application ${applicationId} not found`);
    }

    return await this.diagnosticRepo.findByApplicationId(applicationId);
  }
}
