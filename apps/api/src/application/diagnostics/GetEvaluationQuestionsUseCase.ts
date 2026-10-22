import type { EvaluationQuestion } from '../../domain/entities/DiagnosticRecord.js';
import type { DiagnosticRecordRepository } from '../../domain/repositories/DiagnosticRecordRepository.js';

export class GetEvaluationQuestionsUseCase {
  constructor(private readonly diagnosticRepo: DiagnosticRecordRepository) {}

  async execute(): Promise<EvaluationQuestion[]> {
    return await this.diagnosticRepo.getEvaluationQuestions();
  }
}
