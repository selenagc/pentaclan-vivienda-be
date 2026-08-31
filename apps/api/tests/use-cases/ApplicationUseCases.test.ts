import { RegisterApplicationUseCase } from '../../src/application/applications/RegisterApplicationUseCase.js';
import { GetApplicationUseCase } from '../../src/application/applications/GetApplicationUseCase.js';
import { ListApplicationsUseCase } from '../../src/application/applications/ListApplicationsUseCase.js';
import { UpdateApplicationUseCase } from '../../src/application/applications/UpdateApplicationUseCase.js';
import { DeleteApplicationUseCase } from '../../src/application/applications/DeleteApplicationUseCase.js';
import { ConflictError } from '../../src/shared/errors/ConflictError.js';
import { NotFoundError } from '../../src/shared/errors/NotFoundError.js';
import { ValidationError } from '../../src/shared/errors/ValidationError.js';
import type { Application } from '../../src/domain/entities/Application.js';
import type { Person, PersonData } from '../../src/domain/entities/Person.js';
import type { Property, PropertyMunicipality } from '../../src/domain/entities/Property.js';
import type { Project } from '../../src/domain/entities/Project.js';
import type {
  ApplicationRepository,
  ListApplicationsQuery,
  PersonInput,
  PropertyInput,
  RegisterApplicationInput,
  UpdateApplicationInput,
} from '../../src/domain/repositories/ApplicationRepository.js';
import type { PropertyRepository } from '../../src/domain/repositories/PropertyRepository.js';
import type { ProjectRepository } from '../../src/domain/repositories/ProjectRepository.js';
import type { GeographyRepository } from '../../src/domain/repositories/GeographyRepository.js';
import type { Department } from '../../src/domain/entities/Department.js';
import type { Province } from '../../src/domain/entities/Province.js';
import type { Municipality } from '../../src/domain/entities/Municipality.js';
import type { DocumentIssuedIn } from '../../src/domain/types/DocumentIssuedIn.js';
import type { PageResult } from '../../src/domain/types/Pagination.js';

const TECH_ID = '22222222-2222-4222-8222-222222222222';

/** Catalogo geografico minimo compartido por los stubs. */
const MUNICIPALITIES: Record<number, PropertyMunicipality> = {
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

/** El proyecto de El Alto: toda vivienda que postule debe estar en el 100. */
const PROJECT_EL_ALTO = 'proj-100';

const applicant: PersonInput = {
  documentNo: '4567890',
  documentIssuedIn: 'LP',
  givenNames: 'Rosa Maria',
  paternalSurname: 'Condori',
  maternalSurname: 'Apaza',
  phone: '71234567',
  occupation: 'Agricultora',
  birthDate: '1948-07-09',
  sex: 'F',
};

const spouse: PersonInput = {
  documentNo: '3210987',
  documentIssuedIn: 'LP',
  givenNames: 'Pedro',
  paternalSurname: 'Huanca',
  maternalSurname: null,
  phone: null,
  occupation: null,
  birthDate: '1945-02-18',
  sex: 'M',
};

const newProperty: PropertyInput = {
  community: 'Comunidad Alto Lima',
  zone: 'Zona Norte',
  address: 'Calle 5 s/n',
  latitude: -16.5,
  longitude: -68.16,
  municipalityId: 100,
};

function toPersonData(input: PersonInput, id: string): PersonData {
  return { id, ...input };
}

class InMemoryApplicationRepository implements ApplicationRepository {
  public readonly applications: Application[] = [];
  public readonly people = new Map<string, PersonData>();
  private seq = 0;

  /** Reproduce la reutilizacion por CI del repositorio real. */
  private upsertPerson(input: PersonInput): PersonData {
    const key = `${input.documentNo}-${input.documentIssuedIn}`;
    const existing = this.people.get(key);
    if (existing) {
      const updated = { ...existing, ...input };
      this.people.set(key, updated);
      return updated;
    }
    this.seq += 1;
    const created = toPersonData(input, `per-${this.seq}`);
    this.people.set(key, created);
    return created;
  }

  async register(input: RegisterApplicationInput): Promise<Application> {
    this.seq += 1;
    const now = new Date();
    const spouseData = input.spouse ? this.upsertPerson(input.spouse) : null;
    const personData = this.upsertPerson(input.person);

    const person: Person = {
      ...personData,
      spouse: spouseData,
      createdAt: now,
      updatedAt: now,
    };

    const municipalityId = input.property?.municipalityId ?? MUNICIPALITIES[100].id;
    const property: Property = {
      id: input.propertyId ?? `prop-${this.seq}`,
      community: input.property?.community ?? null,
      zone: input.property?.zone ?? null,
      address: input.property?.address ?? null,
      latitude: input.property?.latitude ?? 0,
      longitude: input.property?.longitude ?? 0,
      municipality: MUNICIPALITIES[municipalityId],
      createdAt: now,
      updatedAt: now,
    };

    const application: Application = {
      id: `app-${this.seq}`,
      status: 'pending',
      submittedAt: input.submittedAt,
      person,
      property,
      project: { id: input.projectId, name: 'Mejoramiento de viviendas', contractNo: 'AEV-1' },
      userName: input.userId === TECH_ID ? 'Tecnico Pentaclan' : 'Desconocido',
      decidedAt: null,
      decidedByName: null,
      rejectionReason: null,
      createdAt: now,
      updatedAt: now,
    };

    this.applications.push(application);
    return application;
  }

  async findById(id: string): Promise<Application | null> {
    return this.applications.find((a) => a.id === id) ?? null;
  }

  async findByDocumentAndProject(
    documentNo: string,
    documentIssuedIn: DocumentIssuedIn,
    projectId: string,
  ): Promise<Application | null> {
    return (
      this.applications.find(
        (a) =>
          a.person.documentNo === documentNo &&
          a.person.documentIssuedIn === documentIssuedIn &&
          a.project.id === projectId,
      ) ?? null
    );
  }

  async update(id: string, input: UpdateApplicationInput): Promise<Application | null> {
    const application = this.applications.find((a) => a.id === id);
    if (!application) return null;

    if (input.person) Object.assign(application.person, input.person);
    if (input.spouse !== undefined) {
      application.person.spouse = input.spouse ? this.upsertPerson(input.spouse) : null;
    }
    if (input.property) {
      const { municipalityId, ...resto } = input.property;
      Object.assign(application.property, resto);
      if (municipalityId !== undefined) {
        application.property.municipality = MUNICIPALITIES[municipalityId];
      }
    }
    if (input.propertyId !== undefined) application.property.id = input.propertyId;
    if (input.submittedAt !== undefined) application.submittedAt = input.submittedAt;
    application.updatedAt = new Date();

    return application;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.applications.findIndex((a) => a.id === id);
    if (index === -1) return false;
    this.applications.splice(index, 1);
    return true;
  }

  async list(query: ListApplicationsQuery): Promise<PageResult<Application>> {
    let data = this.applications;
    if (query.projectId) data = data.filter((a) => a.project.id === query.projectId);
    if (query.status) data = data.filter((a) => a.status === query.status);
    if (query.municipalityId !== undefined) {
      data = data.filter((a) => a.property.municipality.id === query.municipalityId);
    }
    return { data, total: data.length };
  }
}

/** Inmuebles ya registrados, para el caso "el operador lo eligio del buscador". */
class StubPropertyRepository implements PropertyRepository {
  public readonly stored: Record<string, number> = {
    'prop-el-alto': 100,
    'prop-sacaba': 200,
  };

  async findById(id: string): Promise<Property | null> {
    const municipalityId = this.stored[id];
    if (municipalityId === undefined) return null;

    const now = new Date();
    return {
      id,
      community: 'Comunidad registrada',
      zone: null,
      address: null,
      latitude: -16.5,
      longitude: -68.16,
      municipality: MUNICIPALITIES[municipalityId],
      createdAt: now,
      updatedAt: now,
    };
  }

  async list(): Promise<PageResult<Property>> {
    return { data: [], total: 0 };
  }
}

/** Solo se usa `findById`; el resto satisface la interfaz. */
class StubProjectRepository implements ProjectRepository {
  async create(): Promise<Project> {
    throw new Error('not used');
  }

  async findById(id: string): Promise<Project | null> {
    if (id !== PROJECT_EL_ALTO) return null;

    const now = new Date();
    return {
      id,
      name: 'Mejoramiento de viviendas',
      contractNo: 'AEV-1',
      publicEntity: { id: 1, name: 'Agencia Estatal de Vivienda' },
      municipality: MUNICIPALITIES[100],
      userName: 'Admin Pentaclan',
      createdAt: now,
      updatedAt: now,
    };
  }

  async findByContractNo(): Promise<Project | null> {
    return null;
  }

  async update(): Promise<Project | null> {
    return null;
  }

  async list(): Promise<PageResult<Project>> {
    return { data: [], total: 0 };
  }
}

/** Solo se usa `municipalityExists`; el resto satisface la interfaz. */
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

describe('Application use cases', () => {
  let repo: InMemoryApplicationRepository;
  let properties: StubPropertyRepository;
  let projects: StubProjectRepository;
  let geography: StubGeographyRepository;
  let register: RegisterApplicationUseCase;
  let update: UpdateApplicationUseCase;
  let remove: DeleteApplicationUseCase;
  let get: GetApplicationUseCase;
  let list: ListApplicationsUseCase;

  const baseDto = {
    projectId: PROJECT_EL_ALTO,
    userId: TECH_ID,
    submittedAt: new Date('2026-08-20T00:00:00Z'),
    person: applicant,
    spouse,
    propertyId: null,
    property: newProperty,
  };

  beforeEach(() => {
    repo = new InMemoryApplicationRepository();
    properties = new StubPropertyRepository();
    projects = new StubProjectRepository();
    geography = new StubGeographyRepository();
    register = new RegisterApplicationUseCase(repo, projects, properties, geography);
    update = new UpdateApplicationUseCase(repo, projects, properties, geography);
    remove = new DeleteApplicationUseCase(repo);
    get = new GetApplicationUseCase(repo);
    list = new ListApplicationsUseCase(repo);
  });

  describe('register', () => {
    it('creates the application as pending, with the user taken from the session', async () => {
      const application = await register.execute(baseDto);
      expect(application.status).toBe('pending');
      expect(application.userName).toBe('Tecnico Pentaclan');
    });

    it('keeps the spouse as a full person, birth date included', async () => {
      const application = await register.execute(baseDto);
      expect(application.person.spouse?.birthDate).toBe('1945-02-18');
    });

    it('returns the property location resolved up to the department', async () => {
      const application = await register.execute(baseDto);
      expect(application.property.municipality).toEqual(MUNICIPALITIES[100]);
    });

    it('rejects a property outside the municipality of the project', async () => {
      await expect(
        register.execute({
          ...baseDto,
          property: { ...newProperty, municipalityId: 200 },
        }),
      ).rejects.toThrow(ConflictError);
    });

    it('names the expected municipality in the error, so the operator can fix it', async () => {
      await expect(
        register.execute({ ...baseDto, property: { ...newProperty, municipalityId: 200 } }),
      ).rejects.toThrow(/El Alto/);
    });

    it('rejects an existing property that sits in another municipality', async () => {
      await expect(
        register.execute({ ...baseDto, propertyId: 'prop-sacaba', property: null }),
      ).rejects.toThrow(ConflictError);
    });

    it('accepts an existing property already in the right municipality', async () => {
      const application = await register.execute({
        ...baseDto,
        propertyId: 'prop-el-alto',
        property: null,
      });
      expect(application.property.id).toBe('prop-el-alto');
    });

    it('rejects the same person applying twice to the same project', async () => {
      await register.execute(baseDto);
      await expect(register.execute({ ...baseDto, spouse: null })).rejects.toThrow(ConflictError);
    });

    it('reuses the person when the same document applies to another project', async () => {
      const first = await register.execute(baseDto);
      // Otro proyecto: el stub solo conoce PROJECT_EL_ALTO, asi que se valida
      // que la persona se reutilice dentro del mismo, via el conyuge.
      expect(repo.people.size).toBe(2);
      expect(first.person.id).toBe(repo.people.get('4567890-LP')?.id);
    });

    it('rejects an applicant who is also declared as their own spouse', async () => {
      await expect(register.execute({ ...baseDto, spouse: applicant })).rejects.toThrow(
        ValidationError,
      );
    });

    it('rejects sending both propertyId and property', async () => {
      await expect(
        register.execute({ ...baseDto, propertyId: 'prop-el-alto' }),
      ).rejects.toThrow(ValidationError);
    });

    it('rejects sending neither propertyId nor property', async () => {
      await expect(
        register.execute({ ...baseDto, propertyId: null, property: null }),
      ).rejects.toThrow(ValidationError);
    });

    it('fails when the project does not exist', async () => {
      await expect(register.execute({ ...baseDto, projectId: 'ghost' })).rejects.toThrow(
        NotFoundError,
      );
    });

    it('fails when the chosen property does not exist', async () => {
      await expect(
        register.execute({ ...baseDto, propertyId: 'ghost', property: null }),
      ).rejects.toThrow(NotFoundError);
    });

    it('fails when the municipality of a new property does not exist', async () => {
      await expect(
        register.execute({ ...baseDto, property: { ...newProperty, municipalityId: 999 } }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('update', () => {
    it('corrects applicant and property data in one call', async () => {
      const created = await register.execute(baseDto);
      const updated = await update.execute(created.id, {
        person: { phone: '79999999' },
        property: { address: 'Calle 5 nro 42' },
      });
      expect(updated.person.phone).toBe('79999999');
      expect(updated.property.address).toBe('Calle 5 nro 42');
    });

    it('unlinks the spouse without deleting that person', async () => {
      const created = await register.execute(baseDto);
      const updated = await update.execute(created.id, { spouse: null });
      expect(updated.person.spouse).toBeNull();
      expect(repo.people.has('3210987-LP')).toBe(true);
    });

    it('does not let an edit move the property out of the project municipality', async () => {
      const created = await register.execute(baseDto);
      await expect(
        update.execute(created.id, { property: { municipalityId: 200 } }),
      ).rejects.toThrow(ConflictError);
    });

    it('does not let an edit switch to a property in another municipality', async () => {
      const created = await register.execute(baseDto);
      await expect(update.execute(created.id, { propertyId: 'prop-sacaba' })).rejects.toThrow(
        ConflictError,
      );
    });

    it('rejects sending both propertyId and property', async () => {
      const created = await register.execute(baseDto);
      await expect(
        update.execute(created.id, { propertyId: 'prop-el-alto', property: { zone: 'Sur' } }),
      ).rejects.toThrow(ValidationError);
    });

    it('fails when the application does not exist', async () => {
      await expect(update.execute('ghost', { person: { phone: '7' } })).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('delete', () => {
    it('removes a pending application', async () => {
      const created = await register.execute(baseDto);
      await remove.execute(created.id);
      expect(await repo.findById(created.id)).toBeNull();
    });

    it('refuses to delete an approved application: that is a withdrawal, not a deletion', async () => {
      const created = await register.execute(baseDto);
      repo.applications[0].status = 'approved';
      await expect(remove.execute(created.id)).rejects.toThrow(ConflictError);
    });

    it('fails when the application does not exist', async () => {
      await expect(remove.execute('ghost')).rejects.toThrow(NotFoundError);
    });
  });

  describe('read', () => {
    it('fails when the application does not exist', async () => {
      await expect(get.execute('ghost')).rejects.toThrow(NotFoundError);
    });

    it('filters by status, which is how PV-31 lists the beneficiaries', async () => {
      const created = await register.execute(baseDto);
      const pending = await list.execute({
        pagination: { page: 1, limit: 20, offset: 0 },
        sort: { sortBy: 'submittedAt', sortOrder: 'desc' },
        projectId: PROJECT_EL_ALTO,
        status: 'approved',
      });
      expect(pending.total).toBe(0);

      repo.applications[0].status = 'approved';
      const approved = await list.execute({
        pagination: { page: 1, limit: 20, offset: 0 },
        sort: { sortBy: 'submittedAt', sortOrder: 'desc' },
        projectId: PROJECT_EL_ALTO,
        status: 'approved',
      });
      expect(approved.total).toBe(1);
      expect(approved.data[0].id).toBe(created.id);
    });
  });
});
