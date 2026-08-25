import { CreateProyectoUseCase } from '../../src/application/proyectos/CreateProyectoUseCase.js';
import { GetProyectoUseCase } from '../../src/application/proyectos/GetProyectoUseCase.js';
import { ListProyectosUseCase } from '../../src/application/proyectos/ListProyectosUseCase.js';
import { UpdateProyectoUseCase } from '../../src/application/proyectos/UpdateProyectoUseCase.js';
import { ConflictError } from '../../src/shared/errors/ConflictError.js';
import { NotFoundError } from '../../src/shared/errors/NotFoundError.js';
import type {
  Proyecto,
  ProyectoEntidadPublica,
  ProyectoMunicipio,
} from '../../src/domain/entities/Proyecto.js';
import type {
  CreateProyectoInput,
  ListProyectosQuery,
  ProyectoRepository,
  UpdateProyectoInput,
} from '../../src/domain/repositories/ProyectoRepository.js';
import type { PageResult } from '../../src/domain/types/Pagination.js';
import type { EntidadPublica } from '../../src/domain/entities/EntidadPublica.js';
import type { EntidadPublicaRepository } from '../../src/domain/repositories/EntidadPublicaRepository.js';
import type { Departamento } from '../../src/domain/entities/Departamento.js';
import type { Provincia } from '../../src/domain/entities/Provincia.js';
import type { Municipio } from '../../src/domain/entities/Municipio.js';
import type { GeografiaRepository } from '../../src/domain/repositories/GeografiaRepository.js';

const ADMIN_ID = '11111111-1111-4111-8111-111111111111';
const TECH_ID = '22222222-2222-4222-8222-222222222222';

const NOMBRES: Record<string, string> = {
  [ADMIN_ID]: 'Admin Pentaclan',
  [TECH_ID]: 'Tecnico Pentaclan',
};

/** Catalogo geografico minimo compartido por el repo y el stub de geografia. */
const MUNICIPIOS: Record<number, ProyectoMunicipio> = {
  100: {
    id: 100,
    nombre: 'El Alto',
    provincia: { id: 10, nombre: 'Murillo' },
    departamento: { id: 1, nombre: 'La Paz' },
  },
  200: {
    id: 200,
    nombre: 'Sacaba',
    provincia: { id: 20, nombre: 'Chapare' },
    departamento: { id: 2, nombre: 'Cochabamba' },
  },
};

/** Catalogo minimo de entidades publicas, alineado con el stub del repo. */
const ENTIDADES: Record<number, ProyectoEntidadPublica> = {
  1: { id: 1, nombre: 'Agencia Estatal de Vivienda' },
  2: { id: 2, nombre: 'Agencia Estatal de Vivienda' },
  3: { id: 3, nombre: 'Agencia Estatal de Vivienda' },
};

class InMemoryProyectoRepository implements ProyectoRepository {
  public readonly proyectos: Proyecto[] = [];
  private readonly creadorPorProyecto = new Map<string, string>();
  private seq = 0;

  async create(input: CreateProyectoInput): Promise<Proyecto> {
    this.seq += 1;
    const now = new Date();
    const { usuarioId, municipioId, entidadPublicaId, ...resto } = input;
    const proyecto: Proyecto = {
      id: `p-${this.seq}`,
      ...resto,
      entidadPublica: ENTIDADES[entidadPublicaId],
      municipio: MUNICIPIOS[municipioId],
      usuarioNombre: NOMBRES[usuarioId] ?? 'Desconocido',
      createdAt: now,
      updatedAt: now,
    };
    this.proyectos.push(proyecto);
    this.creadorPorProyecto.set(proyecto.id, usuarioId);
    return proyecto;
  }

  async findById(id: string): Promise<Proyecto | null> {
    return this.proyectos.find((p) => p.id === id) ?? null;
  }

  async findByNroContrato(nroContrato: string): Promise<Proyecto | null> {
    return this.proyectos.find((p) => p.nroContrato === nroContrato) ?? null;
  }

  async update(id: string, input: UpdateProyectoInput): Promise<Proyecto | null> {
    const proyecto = this.proyectos.find((p) => p.id === id);
    if (!proyecto) return null;

    // `municipioId` / `entidadPublicaId` son columnas, no campos de la entidad:
    // se traducen a sus objetos anidados.
    const { municipioId, entidadPublicaId, ...resto } = input;
    Object.assign(proyecto, resto, { updatedAt: new Date() });
    if (municipioId !== undefined) proyecto.municipio = MUNICIPIOS[municipioId];
    if (entidadPublicaId !== undefined) proyecto.entidadPublica = ENTIDADES[entidadPublicaId];

    return proyecto;
  }

  async list(query: ListProyectosQuery): Promise<PageResult<Proyecto>> {
    let data = this.proyectos;
    if (query.usuarioId) {
      data = data.filter((p) => this.creadorPorProyecto.get(p.id) === query.usuarioId);
    }
    if (query.entidadPublicaId !== undefined) {
      data = data.filter((p) => p.entidadPublica.id === query.entidadPublicaId);
    }
    if (query.municipioId !== undefined) {
      data = data.filter((p) => p.municipio.id === query.municipioId);
    }
    return { data, total: data.length };
  }
}

/** Solo se usa `findById`; el resto satisface la interfaz. */
class StubEntidadPublicaRepository implements EntidadPublicaRepository {
  private readonly ids = [1, 2, 3];

  private build(id: number): EntidadPublica {
    return {
      id,
      nit: 192310023,
      nombre: 'Agencia Estatal de Vivienda',
      sigla: 'AEVIVIENDA',
    };
  }

  async list(): Promise<EntidadPublica[]> {
    return this.ids.map((id) => this.build(id));
  }

  async findById(id: number): Promise<EntidadPublica | null> {
    return this.ids.includes(id) ? this.build(id) : null;
  }

}

/** Solo se usa `municipioExists`; el resto satisface la interfaz. */
class StubGeografiaRepository implements GeografiaRepository {
  async listDepartamentos(): Promise<Departamento[]> {
    return [];
  }

  async departamentoExists(): Promise<boolean> {
    return false;
  }

  async listProvinciasByDepartamento(): Promise<Provincia[]> {
    return [];
  }

  async provinciaExists(): Promise<boolean> {
    return false;
  }

  async listMunicipiosByProvincia(): Promise<Municipio[]> {
    return [];
  }

  async municipioExists(id: number): Promise<boolean> {
    return id in MUNICIPIOS;
  }
}

describe('Proyecto use cases', () => {
  let repo: InMemoryProyectoRepository;
  let entidades: StubEntidadPublicaRepository;
  let geografia: StubGeografiaRepository;
  let create: CreateProyectoUseCase;
  let update: UpdateProyectoUseCase;

  const baseDto = {
    nombre: 'Viviendas sociales - Fase I',
    nroContrato: 'AEV-2026-0042',
    entidadPublicaId: 2,
    municipioId: 100,
    usuarioId: ADMIN_ID,
  };

  beforeEach(() => {
    repo = new InMemoryProyectoRepository();
    entidades = new StubEntidadPublicaRepository();
    geografia = new StubGeografiaRepository();
    create = new CreateProyectoUseCase(repo, entidades, geografia);
    update = new UpdateProyectoUseCase(repo, entidades, geografia);
  });

  it('registra el proyecto con el usuario recibido de la sesion', async () => {
    const proyecto = await create.execute(baseDto);
    expect(proyecto.usuarioNombre).toBe(NOMBRES[ADMIN_ID]);
    expect(proyecto.entidadPublica).toEqual({ id: 2, nombre: 'Agencia Estatal de Vivienda' });
  });

  it('devuelve la ubicacion resuelta hasta el departamento', async () => {
    const proyecto = await create.execute(baseDto);
    expect(proyecto.municipio).toEqual(MUNICIPIOS[100]);
  });

  it('falla con 404 si el municipio no existe', async () => {
    await expect(create.execute({ ...baseDto, municipioId: 999 })).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(repo.proyectos).toHaveLength(0);
  });

  it('falla con 404 si la entidad financiadora no existe', async () => {
    await expect(
      create.execute({ ...baseDto, entidadPublicaId: 999 }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(repo.proyectos).toHaveLength(0);
  });

  it('falla con 409 si el nro de contrato ya existe', async () => {
    await create.execute(baseDto);
    await expect(
      create.execute({ ...baseDto, nombre: 'Otro proyecto' }),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(repo.proyectos).toHaveLength(1);
  });

  it('devuelve el proyecto pedido por id', async () => {
    const creado = await create.execute(baseDto);
    const result = await new GetProyectoUseCase(repo).execute(creado.id);
    expect(result.id).toBe(creado.id);
  });

  it('falla con 404 si el proyecto no existe', async () => {
    await expect(new GetProyectoUseCase(repo).execute('p-999')).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('actualiza los campos editables', async () => {
    const creado = await create.execute(baseDto);
    const result = await update.execute(creado.id, { nombre: 'Nombre nuevo', entidadPublicaId: 3 });
    expect(result.nombre).toBe('Nombre nuevo');
    expect(result.entidadPublica.id).toBe(3);
  });

  it('no cambia el creador al actualizar', async () => {
    const creado = await create.execute(baseDto);
    await update.execute(creado.id, { nombre: 'Nombre nuevo' });
    expect(repo.proyectos[0].usuarioNombre).toBe(NOMBRES[ADMIN_ID]);
  });

  it('permite reenviar el propio nro de contrato en un update', async () => {
    const creado = await create.execute(baseDto);
    const result = await update.execute(creado.id, { nroContrato: baseDto.nroContrato });
    expect(result.nroContrato).toBe(baseDto.nroContrato);
  });

  it('falla con 409 si el update toma el contrato de otro proyecto', async () => {
    const primero = await create.execute(baseDto);
    await create.execute({ ...baseDto, nroContrato: 'AEV-2026-0043' });

    await expect(
      update.execute(primero.id, { nroContrato: 'AEV-2026-0043' }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('falla con 404 si el update apunta a una entidad inexistente', async () => {
    const creado = await create.execute(baseDto);
    await expect(
      update.execute(creado.id, { entidadPublicaId: 999 }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('permite corregir el municipio del proyecto', async () => {
    const creado = await create.execute(baseDto);
    const result = await update.execute(creado.id, { municipioId: 200 });
    expect(result.municipio).toEqual(MUNICIPIOS[200]);
  });

  it('falla con 404 si el update apunta a un municipio inexistente', async () => {
    const creado = await create.execute(baseDto);
    await expect(update.execute(creado.id, { municipioId: 999 })).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(repo.proyectos[0].municipio).toEqual(MUNICIPIOS[100]);
  });

  it('filtra el listado por usuario creador', async () => {
    await create.execute(baseDto);
    await create.execute({ ...baseDto, nroContrato: 'AEV-2026-0043', usuarioId: TECH_ID });

    const result = await new ListProyectosUseCase(repo).execute({
      pagination: { page: 1, limit: 20, offset: 0 },
      sort: { sortBy: 'createdAt', sortOrder: 'desc' },
      usuarioId: TECH_ID,
    });

    expect(result.total).toBe(1);
    expect(result.data[0].usuarioNombre).toBe(NOMBRES[TECH_ID]);
  });

  it('filtra el listado por municipio', async () => {
    await create.execute(baseDto);
    await create.execute({ ...baseDto, nroContrato: 'AEV-2026-0043', municipioId: 200 });

    const result = await new ListProyectosUseCase(repo).execute({
      pagination: { page: 1, limit: 20, offset: 0 },
      sort: { sortBy: 'createdAt', sortOrder: 'desc' },
      municipioId: 200,
    });

    expect(result.total).toBe(1);
    expect(result.data[0].municipio.nombre).toBe('Sacaba');
  });
});
