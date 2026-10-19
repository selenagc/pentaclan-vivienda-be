import { CreateProjectUseCase } from '../../src/application/projects/CreateProjectUseCase.js';
import { GetProjectUseCase } from '../../src/application/projects/GetProjectUseCase.js';
import { ListProjectsUseCase } from '../../src/application/projects/ListProjectsUseCase.js';
import { UpdateProjectUseCase } from '../../src/application/projects/UpdateProjectUseCase.js';
import { ConflictError } from '../../src/shared/errors/ConflictError.js';
import { NotFoundError } from '../../src/shared/errors/NotFoundError.js';
import type {
  Project,
  ProjectPublicEntity,
  ProjectMunicipality,
} from '../../src/domain/entities/Project.js';
import type {
  CreateProjectInput,
  ListProjectsQuery,
  ProjectRepository,
  UpdateProjectInput,
} from '../../src/domain/repositories/ProjectRepository.js';
import type { PageResult } from '../../src/domain/types/Pagination.js';
import type { PublicEntity } from '../../src/domain/entities/PublicEntity.js';
import type { PublicEntityRepository } from '../../src/domain/repositories/PublicEntityRepository.js';
import type { Department } from '../../src/domain/entities/Department.js';
import type { Province } from '../../src/domain/entities/Province.js';
import type { Municipality } from '../../src/domain/entities/Municipality.js';
import type { GeographyRepository } from '../../src/domain/repositories/GeographyRepository.js';

const ADMIN_ID = '11111111-1111-4111-8111-111111111111';
const TECH_ID = '22222222-2222-4222-8222-222222222222';

const USER_NAMES: Record<string, string> = {
  [ADMIN_ID]: 'Admin Pentaclan',
  [TECH_ID]: 'Tecnico Pentaclan',
};

/** Catalogo geografico minimo compartido por el repo y el stub de geografia. */
const MUNICIPALITIES: Record<number, ProjectMunicipality> = {
  100: {
    id: 100,
    name: 'El Alto',
    province: { id: 10, name: 'Murillo' },
    department: { id: 1, name: 'La Paz' },
  },
  200: {
    id: 200,
    name: 'Sacaba',
    province: { id: 20, name: 'Chapare' },
    department: { id: 2, name: 'Cochabamba' },
  },
};

/** Catalogo minimo de entidades publicas, alineado con el stub del repo. */
const PUBLIC_ENTITIES: Record<number, ProjectPublicEntity> = {
  1: { id: 1, name: 'Agencia Estatal de Vivienda' },
  2: { id: 2, name: 'Agencia Estatal de Vivienda' },
  3: { id: 3, name: 'Agencia Estatal de Vivienda' },
};

class InMemoryProjectRepository implements ProjectRepository {
  public readonly projects: Project[] = [];
  private readonly creatorByProject = new Map<string, string>();
  private seq = 0;

  async create(input: CreateProjectInput): Promise<Project> {
    this.seq += 1;
    const now = new Date();
    const { userId, municipalityId, publicEntityId, ...resto } = input;
    const project: Project = {
      id: `p-${this.seq}`,
      ...resto,
      publicEntity: PUBLIC_ENTITIES[publicEntityId],
      municipality: MUNICIPALITIES[municipalityId],
      userName: USER_NAMES[userId] ?? 'Desconocido',
      createdAt: now,
      updatedAt: now,
    };
    this.projects.push(project);
    this.creatorByProject.set(project.id, userId);
    return project;
  }

  async findById(id: string): Promise<Project | null> {
    return this.projects.find((p) => p.id === id) ?? null;
  }

  async findByContractNo(contractNo: string): Promise<Project | null> {
    return this.projects.find((p) => p.contractNo === contractNo) ?? null;
  }

  async update(id: string, input: UpdateProjectInput): Promise<Project | null> {
    const project = this.projects.find((p) => p.id === id);
    if (!project) return null;

    // `municipalityId` / `publicEntityId` son columnas, no campos de la entidad:
    // se traducen a sus objetos anidados.
    const { municipalityId, publicEntityId, ...resto } = input;
    Object.assign(project, resto, { updatedAt: new Date() });
    if (municipalityId !== undefined) project.municipality = MUNICIPALITIES[municipalityId];
    if (publicEntityId !== undefined) project.publicEntity = PUBLIC_ENTITIES[publicEntityId];

    return project;
  }

  async list(query: ListProjectsQuery): Promise<PageResult<Project>> {
    let data = this.projects;
    if (query.userId) {
      data = data.filter((p) => this.creatorByProject.get(p.id) === query.userId);
    }
    if (query.publicEntityId !== undefined) {
      data = data.filter((p) => p.publicEntity.id === query.publicEntityId);
    }
    if (query.municipalityId !== undefined) {
      data = data.filter((p) => p.municipality.id === query.municipalityId);
    }
    return { data, total: data.length };
  }
}

/** Solo se usa `findById`; el resto satisface la interfaz. */
class StubPublicEntityRepository implements PublicEntityRepository {
  private readonly ids = [1, 2, 3];

  private build(id: number): PublicEntity {
    return {
      id,
      taxId: 192310023,
      name: 'Agencia Estatal de Vivienda',
      acronym: 'AEVIVIENDA',
    };
  }

  async list(): Promise<PublicEntity[]> {
    return this.ids.map((id) => this.build(id));
  }

  async findById(id: number): Promise<PublicEntity | null> {
    return this.ids.includes(id) ? this.build(id) : null;
  }

}

/** Solo se usa `municipioExists`; el resto satisface la interfaz. */
class StubGeographyRepository implements GeographyRepository {
  async listDepartments(): Promise<Department[]> {
    return [];
  }

  async departmentExists(): Promise<boolean> {
    return false;
  }

  async listProvincesByDepartment(): Promise<Province[]> {
    return [];
  }

  async provinceExists(): Promise<boolean> {
    return false;
  }

  async listMunicipalitiesByProvince(): Promise<Municipality[]> {
    return [];
  }

  async municipalityExists(id: number): Promise<boolean> {
    return id in MUNICIPALITIES;
  }
}

describe('Project use cases', () => {
  let repo: InMemoryProjectRepository;
  let publicEntities: StubPublicEntityRepository;
  let geography: StubGeographyRepository;
  let create: CreateProjectUseCase;
  let update: UpdateProjectUseCase;

  const baseDto = {
    name: 'Viviendas sociales - Fase I',
    contractNo: 'AEV-2026-0042',
    publicEntityId: 2,
    municipalityId: 100,
    userId: ADMIN_ID,
  };

  beforeEach(() => {
    repo = new InMemoryProjectRepository();
    publicEntities = new StubPublicEntityRepository();
    geography = new StubGeographyRepository();
    create = new CreateProjectUseCase(repo, publicEntities, geography);
    update = new UpdateProjectUseCase(repo, publicEntities, geography);
  });

  it('records the project with the user taken from the session', async () => {
    const project = await create.execute(baseDto);
    expect(project.userName).toBe(USER_NAMES[ADMIN_ID]);
    expect(project.publicEntity).toEqual({ id: 2, name: 'Agencia Estatal de Vivienda' });
  });

  it('returns the location resolved up to the department', async () => {
    const project = await create.execute(baseDto);
    expect(project.municipality).toEqual(MUNICIPALITIES[100]);
  });

  it('fails with 404 when the municipality does not exist', async () => {
    await expect(create.execute({ ...baseDto, municipalityId: 999 })).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(repo.projects).toHaveLength(0);
  });

  it('fails with 404 when the funding public entity does not exist', async () => {
    await expect(
      create.execute({ ...baseDto, publicEntityId: 999 }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(repo.projects).toHaveLength(0);
  });

  it('fails with 409 when the contract number is already taken', async () => {
    await create.execute(baseDto);
    await expect(
      create.execute({ ...baseDto, name: 'Otro project' }),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(repo.projects).toHaveLength(1);
  });

  it('returns the requested project by id', async () => {
    const created = await create.execute(baseDto);
    const result = await new GetProjectUseCase(repo).execute(created.id);
    expect(result.id).toBe(created.id);
  });

  it('fails with 404 when the project does not exist', async () => {
    await expect(new GetProjectUseCase(repo).execute('p-999')).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('updates the editable fields', async () => {
    const created = await create.execute(baseDto);
    const result = await update.execute(created.id, { name: 'Nombre nuevo', publicEntityId: 3 });
    expect(result.name).toBe('Nombre nuevo');
    expect(result.publicEntity.id).toBe(3);
  });

  it('never changes the creator on update', async () => {
    const created = await create.execute(baseDto);
    await update.execute(created.id, { name: 'Nombre nuevo' });
    expect(repo.projects[0].userName).toBe(USER_NAMES[ADMIN_ID]);
  });

  it('allows resending its own contract number on update', async () => {
    const created = await create.execute(baseDto);
    const result = await update.execute(created.id, { contractNo: baseDto.contractNo });
    expect(result.contractNo).toBe(baseDto.contractNo);
  });

  it('fails with 409 when the update takes the contract number of another project', async () => {
    const primero = await create.execute(baseDto);
    await create.execute({ ...baseDto, contractNo: 'AEV-2026-0043' });

    await expect(
      update.execute(primero.id, { contractNo: 'AEV-2026-0043' }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('fails with 404 when the update points to a missing public entity', async () => {
    const created = await create.execute(baseDto);
    await expect(
      update.execute(created.id, { publicEntityId: 999 }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('allows fixing the municipality of the project', async () => {
    const created = await create.execute(baseDto);
    const result = await update.execute(created.id, { municipalityId: 200 });
    expect(result.municipality).toEqual(MUNICIPALITIES[200]);
  });

  it('fails with 404 when the update points to a missing municipality', async () => {
    const created = await create.execute(baseDto);
    await expect(update.execute(created.id, { municipalityId: 999 })).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(repo.projects[0].municipality).toEqual(MUNICIPALITIES[100]);
  });

  it('filters the list by creator user', async () => {
    await create.execute(baseDto);
    await create.execute({ ...baseDto, contractNo: 'AEV-2026-0043', userId: TECH_ID });

    const result = await new ListProjectsUseCase(repo).execute({
      pagination: { page: 1, limit: 20, offset: 0 },
      sort: { sortBy: 'createdAt', sortOrder: 'desc' },
      userId: TECH_ID,
    });

    expect(result.total).toBe(1);
    expect(result.data[0].userName).toBe(USER_NAMES[TECH_ID]);
  });

  it('filters the list by municipality', async () => {
    await create.execute(baseDto);
    await create.execute({ ...baseDto, contractNo: 'AEV-2026-0043', municipalityId: 200 });

    const result = await new ListProjectsUseCase(repo).execute({
      pagination: { page: 1, limit: 20, offset: 0 },
      sort: { sortBy: 'createdAt', sortOrder: 'desc' },
      municipalityId: 200,
    });

    expect(result.total).toBe(1);
    expect(result.data[0].municipality.name).toBe('Sacaba');
  });
});
