import { GetPhotoUploadUrlUseCase } from '../../src/application/diagnostics/GetPhotoUploadUrlUseCase.js';
import { ConfirmPhotoUploadUseCase } from '../../src/application/diagnostics/ConfirmPhotoUploadUseCase.js';
import { UploadDiagnosticPhotoUseCase } from '../../src/application/diagnostics/UploadDiagnosticPhotoUseCase.js';
import { GetDiagnosticPhotosUseCase } from '../../src/application/diagnostics/GetDiagnosticPhotosUseCase.js';
import { DeleteDiagnosticPhotoUseCase } from '../../src/application/diagnostics/DeleteDiagnosticPhotoUseCase.js';
import type { ApplicationRepository } from '../../src/domain/repositories/ApplicationRepository.js';
import type {
  DiagnosticRecordRepository,
  CreatePhotoInput,
} from '../../src/domain/repositories/DiagnosticRecordRepository.js';
import type {
  StorageAdapter,
  UploadInput,
  UploadResult,
} from '../../src/infrastructure/storage/S3StorageAdapter.js';
import type { Application } from '../../src/domain/entities/Application.js';
import type {
  DiagnosticPhoto,
  DiagnosticRecord,
} from '../../src/domain/entities/DiagnosticRecord.js';
import { NotFoundError } from '../../src/shared/errors/NotFoundError.js';
import { ConflictError } from '../../src/shared/errors/ConflictError.js';
import { ForbiddenError } from '../../src/shared/errors/ForbiddenError.js';
import { ValidationError } from '../../src/shared/errors/ValidationError.js';

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
      latitude: -16.5,
      longitude: -68.15,
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

class MockStorageAdapter implements StorageAdapter {
  deletedKeys: string[] = [];
  configured: boolean = true;

  async upload(_input: UploadInput): Promise<UploadResult> {
    return { key: _input.key, url: `https://s3.mock/${_input.key}` };
  }

  async getPresignedUploadUrl(
    key: string,
    _contentType: string,
    _expiresIn?: number,
  ): Promise<string> {
    return `https://s3.mock/upload/${key}`;
  }

  async getPresignedReadUrl(key: string, _expiresIn?: number): Promise<string> {
    return `https://s3.mock/read/${key}`;
  }

  async getSignedUrl(key: string, _expiresIn: number): Promise<string> {
    return this.getPresignedReadUrl(key);
  }

  async delete(key: string): Promise<void> {
    this.deletedKeys.push(key);
  }

  isConfigured(): boolean {
    return this.configured;
  }
}

class InMemoryDiagnosticRepo implements DiagnosticRecordRepository {
  photos: DiagnosticPhoto[] = [];
  private nextId = 1;

  async findByApplicationId(_applicationId: string): Promise<DiagnosticRecord | null> {
    return null;
  }

  async saveTechnical(): Promise<DiagnosticRecord> {
    throw new Error('Not implemented in mock');
  }

  async saveSocial(): Promise<DiagnosticRecord> {
    throw new Error('Not implemented in mock');
  }

  async getEvaluationQuestions() {
    return [];
  }

  async getOrCreateDiagnosticRecord(
    applicationId: string,
    _userId: string,
  ): Promise<DiagnosticRecord> {
    return {
      id: 'diag-rec-1',
      applicationId,
      evaluationDate: '2026-09-28',
      requiresImprovement: false,
      requiresExpansion: false,
      requiresRenovation: false,
      familyMembers: [],
      answers: [],
      constructionElements: [],
      photos: this.photos,
      changeHistory: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async addPhoto(input: CreatePhotoInput): Promise<DiagnosticPhoto> {
    const photo: DiagnosticPhoto = {
      id: this.nextId++,
      diagnosticRecordId: input.diagnosticRecordId,
      category: input.category,
      photoType: input.photoType,
      s3Key: input.s3Key,
      capturedAt: input.capturedAt,
      captureLatitude: input.captureLatitude,
      captureLongitude: input.captureLongitude,
      mimeType: input.mimeType,
      fileSizeBytes: input.fileSizeBytes,
      description: input.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.photos.push(photo);
    return { ...photo };
  }

  async findPhotosByApplicationId(
    _applicationId: string,
    category?: 'technical' | 'social',
  ): Promise<DiagnosticPhoto[]> {
    if (!category) return [...this.photos];
    return this.photos.filter((p) => p.category === category);
  }

  async findPhotoById(photoId: number): Promise<DiagnosticPhoto | null> {
    return this.photos.find((p) => p.id === photoId) ?? null;
  }

  async deletePhoto(photoId: number): Promise<void> {
    this.photos = this.photos.filter((p) => p.id !== photoId);
  }
}

describe('Diagnostic Photos & S3 Storage Use Cases', () => {
  let appRepo: Partial<ApplicationRepository>;
  let diagRepo: InMemoryDiagnosticRepo;
  let storage: MockStorageAdapter;

  beforeEach(() => {
    appRepo = {
      findById: jest.fn().mockResolvedValue(createMockApplication()),
    };
    diagRepo = new InMemoryDiagnosticRepo();
    storage = new MockStorageAdapter();
  });

  describe('GetPhotoUploadUrlUseCase', () => {
    it('generates a valid presigned upload URL and s3Key for technical photo by technical_lead', async () => {
      const useCase = new GetPhotoUploadUrlUseCase(appRepo as ApplicationRepository, storage);
      const res = await useCase.execute(
        'app-uuid-1',
        { category: 'technical', photoType: 'Fachada', mimeType: 'image/jpeg' },
        'technical_lead',
      );

      expect(res.uploadUrl).toContain('https://s3.mock/upload/diagnostics/app-uuid-1/technical/');
      expect(res.s3Key).toMatch(/^diagnostics\/app-uuid-1\/technical\/[a-f0-9-]+\.jpg$/);
      expect(res.expiresInSeconds).toBe(300);
    });

    it('generates a valid presigned upload URL and s3Key for social photo by social_lead', async () => {
      const useCase = new GetPhotoUploadUrlUseCase(appRepo as ApplicationRepository, storage);
      const res = await useCase.execute(
        'app-uuid-1',
        { category: 'social', photoType: 'Carnet de Discapacidad', mimeType: 'image/png' },
        'social_lead',
      );

      expect(res.uploadUrl).toContain('https://s3.mock/upload/diagnostics/app-uuid-1/social/');
      expect(res.s3Key).toMatch(/^diagnostics\/app-uuid-1\/social\/[a-f0-9-]+\.png$/);
    });

    it('allows admin to request upload URLs for both technical and social categories', async () => {
      const useCase = new GetPhotoUploadUrlUseCase(appRepo as ApplicationRepository, storage);
      const resTech = await useCase.execute(
        'app-uuid-1',
        { category: 'technical', photoType: 'Muros', mimeType: 'image/jpeg' },
        'admin',
      );
      const resSoc = await useCase.execute(
        'app-uuid-1',
        { category: 'social', photoType: 'Familia', mimeType: 'image/jpeg' },
        'admin',
      );

      expect(resTech.s3Key).toContain('/technical/');
      expect(resSoc.s3Key).toContain('/social/');
    });

    it('forbids technical_lead from requesting social photo upload URL', async () => {
      const useCase = new GetPhotoUploadUrlUseCase(appRepo as ApplicationRepository, storage);
      await expect(
        useCase.execute(
          'app-uuid-1',
          { category: 'social', photoType: 'Familia', mimeType: 'image/jpeg' },
          'technical_lead',
        ),
      ).rejects.toThrow(ForbiddenError);
    });

    it('forbids social_lead from requesting technical photo upload URL', async () => {
      const useCase = new GetPhotoUploadUrlUseCase(appRepo as ApplicationRepository, storage);
      await expect(
        useCase.execute(
          'app-uuid-1',
          { category: 'technical', photoType: 'Techo', mimeType: 'image/jpeg' },
          'social_lead',
        ),
      ).rejects.toThrow(ForbiddenError);
    });

    it('throws NotFoundError when application does not exist', async () => {
      appRepo.findById = jest.fn().mockResolvedValue(null);
      const useCase = new GetPhotoUploadUrlUseCase(appRepo as ApplicationRepository, storage);

      await expect(
        useCase.execute(
          'missing-app',
          { category: 'technical', photoType: 'Fachada', mimeType: 'image/jpeg' },
          'technical_lead',
        ),
      ).rejects.toThrow(NotFoundError);
    });

    it('throws ConflictError if application is rejected', async () => {
      appRepo.findById = jest.fn().mockResolvedValue(createMockApplication({ status: 'rejected' }));
      const useCase = new GetPhotoUploadUrlUseCase(appRepo as ApplicationRepository, storage);

      await expect(
        useCase.execute(
          'app-uuid-1',
          { category: 'technical', photoType: 'Fachada', mimeType: 'image/jpeg' },
          'technical_lead',
        ),
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('ConfirmPhotoUploadUseCase', () => {
    it('persists photo in database and attaches fresh read URL', async () => {
      const useCase = new ConfirmPhotoUploadUseCase(
        diagRepo,
        appRepo as ApplicationRepository,
        storage,
      );

      const capturedAt = new Date().toISOString();
      const photo = await useCase.execute(
        'app-uuid-1',
        {
          category: 'technical',
          photoType: 'Fachada',
          s3Key: 'diagnostics/app-uuid-1/technical/photo-1.jpg',
          capturedAt,
          captureLatitude: -16.512345,
          captureLongitude: -68.123456,
          mimeType: 'image/jpeg',
          fileSizeBytes: 450000,
          description: 'Foto tomada en vivo de la fachada',
        },
        'tech-user-1',
        'technical_lead',
      );

      expect(photo.id).toBeDefined();
      expect(photo.category).toBe('technical');
      expect(photo.photoType).toBe('Fachada');
      expect(photo.s3Key).toBe('diagnostics/app-uuid-1/technical/photo-1.jpg');
      expect(photo.url).toBe('https://s3.mock/read/diagnostics/app-uuid-1/technical/photo-1.jpg');
      expect(diagRepo.photos).toHaveLength(1);
    });

    it('forbids social_lead from confirming technical photo', async () => {
      const useCase = new ConfirmPhotoUploadUseCase(
        diagRepo,
        appRepo as ApplicationRepository,
        storage,
      );

      await expect(
        useCase.execute(
          'app-uuid-1',
          {
            category: 'technical',
            photoType: 'Fachada',
            s3Key: 'diagnostics/app-uuid-1/technical/photo-1.jpg',
            capturedAt: new Date().toISOString(),
            mimeType: 'image/jpeg',
            fileSizeBytes: 300000,
          },
          'social-user-1',
          'social_lead',
        ),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('GetDiagnosticPhotosUseCase', () => {
    it('returns all photos and populates presigned read URLs', async () => {
      await diagRepo.addPhoto({
        diagnosticRecordId: 'diag-rec-1',
        category: 'technical',
        photoType: 'Fachada',
        s3Key: 'diagnostics/app-1/technical/1.jpg',
        capturedAt: new Date(),
        mimeType: 'image/jpeg',
        fileSizeBytes: 200000,
      });
      await diagRepo.addPhoto({
        diagnosticRecordId: 'diag-rec-1',
        category: 'social',
        photoType: 'Carnet',
        s3Key: 'diagnostics/app-1/social/2.jpg',
        capturedAt: new Date(),
        mimeType: 'image/jpeg',
        fileSizeBytes: 180000,
      });

      const useCase = new GetDiagnosticPhotosUseCase(
        diagRepo,
        appRepo as ApplicationRepository,
        storage,
      );

      const all = await useCase.execute('app-uuid-1');
      expect(all).toHaveLength(2);
      expect(all[0].url).toContain('https://s3.mock/read/');

      const techOnly = await useCase.execute('app-uuid-1', 'technical');
      expect(techOnly).toHaveLength(1);
      expect(techOnly[0].category).toBe('technical');

      const socialOnly = await useCase.execute('app-uuid-1', 'social');
      expect(socialOnly).toHaveLength(1);
      expect(socialOnly[0].category).toBe('social');
    });
  });

  describe('DeleteDiagnosticPhotoUseCase', () => {
    it('deletes photo from database and from S3', async () => {
      const photo = await diagRepo.addPhoto({
        diagnosticRecordId: 'diag-rec-1',
        category: 'technical',
        photoType: 'Fachada',
        s3Key: 'diagnostics/app-1/technical/to-delete.jpg',
        capturedAt: new Date(),
        mimeType: 'image/jpeg',
        fileSizeBytes: 200000,
      });

      const useCase = new DeleteDiagnosticPhotoUseCase(
        diagRepo,
        appRepo as ApplicationRepository,
        storage,
      );

      await useCase.execute('app-uuid-1', photo.id!, 'technical_lead');

      expect(diagRepo.photos).toHaveLength(0);
      expect(storage.deletedKeys).toContain('diagnostics/app-1/technical/to-delete.jpg');
    });

    it('forbids social_lead from deleting technical photo', async () => {
      const photo = await diagRepo.addPhoto({
        diagnosticRecordId: 'diag-rec-1',
        category: 'technical',
        photoType: 'Fachada',
        s3Key: 'diagnostics/app-1/technical/photo.jpg',
        capturedAt: new Date(),
        mimeType: 'image/jpeg',
        fileSizeBytes: 200000,
      });

      const useCase = new DeleteDiagnosticPhotoUseCase(
        diagRepo,
        appRepo as ApplicationRepository,
        storage,
      );

      await expect(useCase.execute('app-uuid-1', photo.id!, 'social_lead')).rejects.toThrow(
        ForbiddenError,
      );
    });
  });

  describe('UploadDiagnosticPhotoUseCase (1 solo paso vía multipart)', () => {
    it('uploads file buffer to S3, registers photo in DB and returns read URL', async () => {
      const useCase = new UploadDiagnosticPhotoUseCase(
        diagRepo,
        appRepo as ApplicationRepository,
        storage,
      );

      const fakeFile = {
        buffer: Buffer.from('fake-image-binary-data'),
        mimetype: 'image/jpeg',
        size: 1024,
        originalname: 'fachada.jpg',
      };

      const photo = await useCase.execute(
        'app-uuid-1',
        fakeFile,
        {
          category: 'technical',
          photoType: 'Fachada Principal',
          description: 'Foto en vivo subida en 1 solo paso',
          captureLatitude: -16.5,
          captureLongitude: -68.1,
        },
        'user-tech-1',
        'technical_lead',
      );

      expect(photo.id).toBeDefined();
      expect(photo.category).toBe('technical');
      expect(photo.photoType).toBe('Fachada Principal');
      expect(photo.s3Key).toMatch(/^diagnostics\/app-uuid-1\/technical\/[a-f0-9-]+\.jpg$/);
      expect(photo.url).toContain('https://s3.mock/read/');
      expect(diagRepo.photos).toHaveLength(1);
    });

    it('throws ValidationError if file is not provided', async () => {
      const useCase = new UploadDiagnosticPhotoUseCase(
        diagRepo,
        appRepo as ApplicationRepository,
        storage,
      );

      await expect(
        useCase.execute(
          'app-uuid-1',
          undefined,
          { category: 'technical', photoType: 'Fachada' },
          'user-tech-1',
          'technical_lead',
        ),
      ).rejects.toThrow(ValidationError);
    });

    it('forbids technical_lead from uploading social photo', async () => {
      const useCase = new UploadDiagnosticPhotoUseCase(
        diagRepo,
        appRepo as ApplicationRepository,
        storage,
      );

      const fakeFile = {
        buffer: Buffer.from('fake-image'),
        mimetype: 'image/jpeg',
        size: 500,
      };

      await expect(
        useCase.execute(
          'app-uuid-1',
          fakeFile,
          { category: 'social', photoType: 'Carnet' },
          'user-tech-1',
          'technical_lead',
        ),
      ).rejects.toThrow(ForbiddenError);
    });
  });
});

