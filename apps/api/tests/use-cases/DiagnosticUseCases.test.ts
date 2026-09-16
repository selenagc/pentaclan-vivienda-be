import { GetDiagnosticRecordUseCase } from '../../src/application/diagnostics/GetDiagnosticRecordUseCase.js';
import { SaveTechnicalDiagnosisUseCase } from '../../src/application/diagnostics/SaveTechnicalDiagnosisUseCase.js';
import { SaveSocialDiagnosisUseCase } from '../../src/application/diagnostics/SaveSocialDiagnosisUseCase.js';
import { GetEvaluationQuestionsUseCase } from '../../src/application/diagnostics/GetEvaluationQuestionsUseCase.js';
import type { ApplicationRepository } from '../../src/domain/repositories/ApplicationRepository.js';
import type {
  DiagnosticRecordRepository,
  SocialDiagnosticInput,
  TechnicalDiagnosticInput,
} from '../../src/domain/repositories/DiagnosticRecordRepository.js';
import type { Application } from '../../src/domain/entities/Application.js';
import type { DiagnosticRecord, EvaluationQuestion } from '../../src/domain/entities/DiagnosticRecord.js';
import { NotFoundError } from '../../src/shared/errors/NotFoundError.js';
import { ConflictError } from '../../src/shared/errors/ConflictError.js';

function createMockApplication(overrides: Partial<Application> = {}): Application {
  return {
    id: 'app-uuid-1',
    status: 'under_review',
    submittedAt: new Date('2026-09-01'),
    person: {
      id: 'person-1',
      documentNo: '1234567',
      documentIssuedIn: 'LP',
      givenNames: 'Juan',
      paternalSurname: 'Perez',
      maternalSurname: null,
      phone: null,
      occupation: null,
      birthDate: '1990-01-01',
      sex: 'M',
      spouse: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    property: {
      id: 'prop-1',
      community: 'Zona Norte',
      zone: null,
      address: 'Calle 1 #123',
      latitude: 0,
      longitude: 0,
      municipality: {
        id: 100,
        name: 'El Alto',
        province: { id: 10, name: 'Murillo' },
        department: { id: 1, name: 'La Paz' },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    project: {
      id: 'proj-1',
      name: 'Proyecto Piloto',
      contractNo: 'CTR-001',
    },
    userName: 'Operador Test',
    decidedAt: null,
    decidedByName: null,
    rejectionReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function createMockDiagnosticRecord(overrides: Partial<DiagnosticRecord> = {}): DiagnosticRecord {
  return {
    id: 'diag-uuid-1',
    applicationId: 'app-uuid-1',
    formNo: 'FICHA-001',
    evaluationDate: '2026-09-16',
    technicalUserId: 'tech-user-1',
    technicalUserName: 'Ing. Carlos',
    technicalCompletedAt: null,
    socialUserId: null,
    socialUserName: null,
    socialCompletedAt: null,
    requiresImprovement: true,
    requiresExpansion: false,
    requiresRenovation: false,
    roomsToImprove: 'Cocina y baño',
    bedroomSuggestion: null,
    livingRoomSuggestion: null,
    kitchenSuggestion: 'Mejorar piso y muros',
    bathroomSuggestion: 'Instalación de inodoro',
    generalObservations: 'Vivienda precaria',
    familyMembers: [],
    answers: [],
    waterHabits: null,
    hygiene: null,
    health: null,
    landAccessibility: null,
    basicUtilities: null,
    housingCharacteristics: null,
    constructionElements: [],
    photos: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('Diagnostic Record Use Cases', () => {
  let mockApplicationRepo: jest.Mocked<ApplicationRepository>;
  let mockDiagnosticRepo: jest.Mocked<DiagnosticRecordRepository>;

  beforeEach(() => {
    mockApplicationRepo = {
      findById: jest.fn(),
      findByDocumentAndProject: jest.fn(),
      findApprovedByPropertyAndProject: jest.fn(),
      list: jest.fn(),
      register: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      decide: jest.fn(),
      preselect: jest.fn(),
    };



    mockDiagnosticRepo = {
      findByApplicationId: jest.fn(),
      saveTechnical: jest.fn(),
      saveSocial: jest.fn(),
      getEvaluationQuestions: jest.fn(),
    };
  });

  describe('GetDiagnosticRecordUseCase', () => {
    it('throws NotFoundError if the application does not exist', async () => {
      mockApplicationRepo.findById.mockResolvedValue(null);
      const useCase = new GetDiagnosticRecordUseCase(mockDiagnosticRepo, mockApplicationRepo);

      await expect(useCase.execute('non-existent')).rejects.toBeInstanceOf(NotFoundError);
      expect(mockApplicationRepo.findById).toHaveBeenCalledWith('non-existent');
      expect(mockDiagnosticRepo.findByApplicationId).not.toHaveBeenCalled();
    });

    it('returns null if application exists but has no diagnostic record yet', async () => {
      mockApplicationRepo.findById.mockResolvedValue(createMockApplication());
      mockDiagnosticRepo.findByApplicationId.mockResolvedValue(null);

      const useCase = new GetDiagnosticRecordUseCase(mockDiagnosticRepo, mockApplicationRepo);
      const result = await useCase.execute('app-uuid-1');

      expect(result).toBeNull();
      expect(mockDiagnosticRepo.findByApplicationId).toHaveBeenCalledWith('app-uuid-1');
    });

    it('returns the diagnostic record when found', async () => {
      const mockRecord = createMockDiagnosticRecord();
      mockApplicationRepo.findById.mockResolvedValue(createMockApplication());
      mockDiagnosticRepo.findByApplicationId.mockResolvedValue(mockRecord);

      const useCase = new GetDiagnosticRecordUseCase(mockDiagnosticRepo, mockApplicationRepo);
      const result = await useCase.execute('app-uuid-1');

      expect(result).toEqual(mockRecord);
      expect(result?.requiresImprovement).toBe(true);
    });
  });

  describe('SaveTechnicalDiagnosisUseCase', () => {
    it('throws NotFoundError if the application does not exist', async () => {
      mockApplicationRepo.findById.mockResolvedValue(null);
      const useCase = new SaveTechnicalDiagnosisUseCase(mockDiagnosticRepo, mockApplicationRepo);

      await expect(
        useCase.execute('non-existent', {}, 'user-1'),
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it('throws ConflictError if the application is rejected', async () => {
      mockApplicationRepo.findById.mockResolvedValue(
        createMockApplication({ status: 'rejected' }),
      );
      const useCase = new SaveTechnicalDiagnosisUseCase(mockDiagnosticRepo, mockApplicationRepo);

      await expect(
        useCase.execute('app-uuid-1', {}, 'user-1'),
      ).rejects.toBeInstanceOf(ConflictError);
    });

    it('saves and returns technical diagnostic data successfully', async () => {
      const app = createMockApplication({ status: 'under_review' });
      mockApplicationRepo.findById.mockResolvedValue(app);

      const input: TechnicalDiagnosticInput = {
        formNo: 'TEC-001',
        requiresImprovement: true,
        basicUtilities: {
          waterAccess: 'Red pública',
          electricityService: 'Red pública',
          privateBathroom: true,
          sharedBathroom: false,
          bathroomType: 'Inodoro con arrastre de agua',
          sharedKitchen: false,
          privateKitchen: true,
          adequateKitchen: true,
          kitchenType: 'Exclusiva',
        },
      };

      const savedRecord = createMockDiagnosticRecord({
        formNo: 'TEC-001',
        requiresImprovement: true,
      });
      mockDiagnosticRepo.saveTechnical.mockResolvedValue(savedRecord);

      const useCase = new SaveTechnicalDiagnosisUseCase(mockDiagnosticRepo, mockApplicationRepo);
      const result = await useCase.execute('app-uuid-1', input, 'tech-user-1');

      expect(mockDiagnosticRepo.saveTechnical).toHaveBeenCalledWith('app-uuid-1', input, 'tech-user-1');
      expect(result).toEqual(savedRecord);
    });
  });

  describe('SaveSocialDiagnosisUseCase', () => {
    it('throws NotFoundError if the application does not exist', async () => {
      mockApplicationRepo.findById.mockResolvedValue(null);
      const useCase = new SaveSocialDiagnosisUseCase(mockDiagnosticRepo, mockApplicationRepo);

      await expect(
        useCase.execute('non-existent', {}, 'user-1'),
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it('throws ConflictError if the application is rejected', async () => {
      mockApplicationRepo.findById.mockResolvedValue(
        createMockApplication({ status: 'rejected' }),
      );
      const useCase = new SaveSocialDiagnosisUseCase(mockDiagnosticRepo, mockApplicationRepo);

      await expect(
        useCase.execute('app-uuid-1', {}, 'user-1'),
      ).rejects.toBeInstanceOf(ConflictError);
    });

    it('saves and returns social diagnostic data successfully', async () => {
      const app = createMockApplication({ status: 'under_review' });
      mockApplicationRepo.findById.mockResolvedValue(app);

      const input: SocialDiagnosticInput = {
        formNo: 'SOC-001',
        familyMembers: [
          {
            fullName: 'Maria Gomez',
            relationship: 'Hija',
            age: 10,
            hasDisability: false,
          },
        ],
        answers: [
          { evaluationQuestionId: 1, answerBoolean: true, score: '5' },
        ],
      };

      const savedRecord = createMockDiagnosticRecord({
        formNo: 'SOC-001',
        socialUserId: 'soc-user-1',
        socialUserName: 'Lic. Maria',
      });
      mockDiagnosticRepo.saveSocial.mockResolvedValue(savedRecord);

      const useCase = new SaveSocialDiagnosisUseCase(mockDiagnosticRepo, mockApplicationRepo);
      const result = await useCase.execute('app-uuid-1', input, 'soc-user-1');

      expect(mockDiagnosticRepo.saveSocial).toHaveBeenCalledWith('app-uuid-1', input, 'soc-user-1');
      expect(result).toEqual(savedRecord);
    });
  });

  describe('GetEvaluationQuestionsUseCase', () => {
    it('returns the active evaluation questions catalog', async () => {
      const mockQuestions: EvaluationQuestion[] = [
        { id: 1, questionText: '¿Cuenta con título de propiedad?', category: 'Legal', active: true },
        { id: 2, questionText: '¿Habita la vivienda?', category: 'Social', active: true },
      ];
      mockDiagnosticRepo.getEvaluationQuestions.mockResolvedValue(mockQuestions);

      const useCase = new GetEvaluationQuestionsUseCase(mockDiagnosticRepo);
      const result = await useCase.execute();

      expect(mockDiagnosticRepo.getEvaluationQuestions).toHaveBeenCalled();
      expect(result).toEqual(mockQuestions);
      expect(result.length).toBe(2);
    });
  });
});
