import { CreateProyectoUseCase } from '../../src/application/proyectos/CreateProyectoUseCase.js';
import { GetProyectoUseCase } from '../../src/application/proyectos/GetProyectoUseCase.js';
import { ListProyectosUseCase } from '../../src/application/proyectos/ListProyectosUseCase.js';
import { UpdateProyectoUseCase } from '../../src/application/proyectos/UpdateProyectoUseCase.js';
import { ConflictError } from '../../src/shared/errors/ConflictError.js';
import { NotFoundError } from '../../src/shared/errors/NotFoundError.js';
import type { Proyecto } from '../../src/domain/entities/Proyecto.js';
import type {
  CreateProyectoInput,
  ListProyectosQuery,
  ProyectoRepository,
  UpdateProyectoInput,
} from '../../src/domain/repositories/ProyectoRepository.js';
import type { PageResult } from '../../src/domain/types/Pagination.js';
import type { EntidadPublica } from '../../src/domain/entities/EntidadPublica.js';
import type { EntidadPublicaRepository } from '../../src/domain/repositories/EntidadPublicaRepository.js';

const ADMIN_ID = '11111111-1111-4111-8111-111111111111';
const TECH_ID = '22222222-2222-4222-8222-222222222222';

const NOMBRES: Record<string, string> = {
  [ADMIN_ID]: 'Admin Pentaclan',
  [TECH_ID]: 'Tecnico Pentaclan',
};

class InMemoryProyectoRepository implements ProyectoRepository {
  public readonly proyectos: Proyecto[] = [];
  private readonly creadorPorProyecto = new Map<string, string>();
  private seq = 0;

  async create(input: CreateProyectoInput): Promise<Proyecto> {
    this.seq += 1;
    const now = new Date();
    const { usuarioId, ...resto } = input;
    const proyecto: Proyecto = {
      id: `p-${this.seq}`,
      ...resto,
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
    Object.assign(proyecto, input, { updatedAt: new Date() });
    return proyecto;
  }

  async list(query: ListProyectosQuery): Promise<PageResult<Proyecto>> {
    let data = this.proyectos;
    if (query.usuarioId) {
      data = data.filter((p) => this.creadorPorProyecto.get(p.id) === query.usuarioId);
    }
    if (query.entidadPublicaId !== undefined) {
      data = data.filter((p) => p.entidadPublicaId === query.entidadPublicaId);
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

describe('Proyecto use cases', () => {
  let repo: InMemoryProyectoRepository;
  let entidades: StubEntidadPublicaRepository;
  let create: CreateProyectoUseCase;
  let update: UpdateProyectoUseCase;

  const baseDto = {
    nombre: 'Viviendas sociales - Fase I',
    nroContrato: 'AEV-2026-0042',
    entidadPublicaId: 2,
    usuarioId: ADMIN_ID,
  };

  beforeEach(() => {
    repo = new InMemoryProyectoRepository();
    entidades = new StubEntidadPublicaRepository();
    create = new CreateProyectoUseCase(repo, entidades);
    update = new UpdateProyectoUseCase(repo, entidades);
  });

  it('registra el proyecto con el usuario recibido de la sesion', async () => {
    const proyecto = await create.execute(baseDto);
    expect(proyecto.usuarioNombre).toBe(NOMBRES[ADMIN_ID]);
    expect(proyecto.entidadPublicaId).toBe(2);
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
    expect(result.entidadPublicaId).toBe(3);
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
});
