import { GenerateProjectPresentationUseCase } from '../../src/application/projects/GenerateProjectPresentationUseCase.js';
import type { ProjectRepository } from '../../src/domain/repositories/ProjectRepository.js';
import type { ApplicationRepository } from '../../src/domain/repositories/ApplicationRepository.js';
import type { DiagnosticRecordRepository } from '../../src/domain/repositories/DiagnosticRecordRepository.js';
import type { StorageAdapter } from '../../src/infrastructure/storage/S3StorageAdapter.js';
import type { Project } from '../../src/domain/entities/Project.js';
import type { Application } from '../../src/domain/entities/Application.js';
import type { DiagnosticPhoto } from '../../src/domain/entities/DiagnosticRecord.js';
import { NotFoundError } from '../../src/shared/errors/NotFoundError.js';

// Imagen PNG transparente de 1x1 en base64 para pruebas reales con pptxgenjs
const TINY_PNG_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

const mockProject: Project = {
  id: 'proj-1',
  name: 'Proyecto Vivienda Digna Sacaba',
  contractNo: 'AEV-CBA-2026-01',
  publicEntity: { id: 1, name: 'Agencia Estatal de Vivienda' },
  municipality: {
    id: 10,
    name: 'Sacaba',
    province: { id: 2, name: 'Chapare' },
    department: { id: 3, name: 'Cochabamba' },
  },
  userName: 'Admin Sistema',
  createdAt: new Date('2026-01-15T10:00:00Z'),
  updatedAt: new Date('2026-01-15T10:00:00Z'),
};

function makeApplication(id: string, givenNames: string, paternalSurname: string): Application {
  return {
    id,
    status: 'under_review',
    submittedAt: new Date('2026-05-10T12:00:00Z'),
    person: {
      id: `person-${id}`,
      documentNo: `7000${id}`,
      documentIssuedIn: 'CB',
      givenNames,
      paternalSurname,
      maternalSurname: 'Mamani',
      phone: '71234567',
      occupation: 'Agricultor',
      birthDate: '1985-04-20',
      sex: 'M',
      spouse: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    property: {
      id: `prop-${id}`,
      community: 'Comunidad Lava Lava',
      zone: 'Zona Sur',
      address: 'Av. Principal s/n',
      latitude: -17.404,
      longitude: -66.04,
      municipality: {
        id: 10,
        name: 'Sacaba',
        province: { id: 2, name: 'Chapare' },
        department: { id: 3, name: 'Cochabamba' },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    project: {
      id: mockProject.id,
      name: mockProject.name,
      contractNo: mockProject.contractNo,
    },
    userName: 'Evaluador Campo',
    decidedAt: null,
    decidedByName: null,
    rejectionReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function makePhotos(count: number): DiagnosticPhoto[] {
  return Array.from({ length: count }, (_, idx) => ({
    id: idx + 1,
    diagnosticRecordId: 'diag-1',
    category: idx % 2 === 0 ? 'technical' : 'social',
    photoType: idx % 2 === 0 ? 'Fachada Principal' : 'Cocina',
    s3Key: `diagnostics/app/photo_${idx + 1}.png`,
    capturedAt: new Date(2026, 5, 1, 10, idx),
    mimeType: 'image/png',
    fileSizeBytes: TINY_PNG_BUFFER.length,
    description: `Foto #${idx + 1}`,
  }));
}

describe('GenerateProjectPresentationUseCase', () => {
  const mockStorage: StorageAdapter = {
    upload: async (input) => ({ key: input.key, url: `https://s3.test/${input.key}` }),
    getPresignedUploadUrl: async () => 'https://s3.test/upload',
    getPresignedReadUrl: async () => 'https://s3.test/read',
    getSignedUrl: async () => 'https://s3.test/read',
    getObjectBuffer: async () => ({ buffer: TINY_PNG_BUFFER, contentType: 'image/png' }),
    delete: async () => {},
    isConfigured: () => true,
  };

  it('lanza NotFoundError cuando el proyecto no existe', async () => {
    const projectRepo = {
      findById: async () => null,
    } as unknown as ProjectRepository;
    const appRepo = {} as unknown as ApplicationRepository;
    const diagRepo = {} as unknown as DiagnosticRecordRepository;

    const useCase = new GenerateProjectPresentationUseCase(
      projectRepo,
      appRepo,
      diagRepo,
      mockStorage,
    );

    await expect(useCase.execute('non-existent')).rejects.toThrow(NotFoundError);
  });

  it('genera PPTX respetando la regla de paginacion de fotos (0 fotos = 1 slide, 7 fotos = 2 slides, 13 fotos = 3 slides)', async () => {
    const apps = [
      makeApplication('1', 'Carlos', 'Alvarez'), // 0 fotos -> 1 slide
      makeApplication('2', 'Maria', 'Benitez'), // 7 fotos -> 2 slides
      makeApplication('3', 'Pedro', 'Condori'), // 13 fotos -> 3 slides
    ];

    const photosByApp: Record<string, DiagnosticPhoto[]> = {
      '1': makePhotos(0),
      '2': makePhotos(7),
      '3': makePhotos(13),
    };

    const projectRepo = {
      findById: async () => mockProject,
    } as unknown as ProjectRepository;

    const appRepo = {
      list: async () => ({ data: apps, total: apps.length }),
    } as unknown as ApplicationRepository;

    const diagRepo = {
      findPhotosByApplicationId: async (appId: string) => photosByApp[appId] ?? [],
    } as unknown as DiagnosticRecordRepository;

    const useCase = new GenerateProjectPresentationUseCase(
      projectRepo,
      appRepo,
      diagRepo,
      mockStorage,
    );

    const result = await useCase.execute(mockProject.id);

    expect(result.fileName).toBe('presentacion_proyecto_vivienda_digna_sacaba.pptx');
    expect(Buffer.isBuffer(result.buffer)).toBe(true);
    expect(result.buffer.length).toBeGreaterThan(1000);
    // Cabecera ZIP (PK\x03\x04) de un archivo .pptx válido
    expect(result.buffer.subarray(0, 2).toString('utf8')).toBe('PK');

    // Contar entradas ppt/slides/slideN.xml dentro del buffer ZIP:
    // 1 portada de proyecto + 1 (0 fotos) + 2 (7 fotos) + 3 (13 fotos) = 7 slides en total
    const zipString = result.buffer.toString('latin1');
    const slideMatches = new Set(zipString.match(/ppt\/slides\/slide\d+\.xml/g) ?? []);
    expect(slideMatches.size).toBe(7);
  });
});
