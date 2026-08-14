import { ListEntidadesUseCase } from '../../src/application/entidades/ListEntidadesUseCase.js';
import { GetEntidadUseCase } from '../../src/application/entidades/GetEntidadUseCase.js';
import { ListEntidadesByDepartamentoUseCase } from '../../src/application/entidades/ListEntidadesByDepartamentoUseCase.js';
import { NotFoundError } from '../../src/shared/errors/NotFoundError.js';
import type { EntidadPublica } from '../../src/domain/entities/EntidadPublica.js';
import type { EntidadPublicaRepository } from '../../src/domain/repositories/EntidadPublicaRepository.js';
import type { Departamento } from '../../src/domain/entities/Departamento.js';
import type { Provincia } from '../../src/domain/entities/Provincia.js';
import type { Municipio } from '../../src/domain/entities/Municipio.js';
import type { GeografiaRepository } from '../../src/domain/repositories/GeografiaRepository.js';

const NIT_AEVIVIENDA = 192310023;

function entidad(id: number, departamentoId: number): EntidadPublica {
  return {
    id,
    nit: NIT_AEVIVIENDA,
    nombre: 'Agencia Estatal de Vivienda',
    sigla: 'AEVIVIENDA',
    departamentoId,
  };
}

class InMemoryEntidadPublicaRepository implements EntidadPublicaRepository {
  public readonly entidades: EntidadPublica[] = [
    entidad(1, 5),
    entidad(2, 6),
    entidad(3, 7),
  ];

  async list(): Promise<EntidadPublica[]> {
    return this.entidades;
  }

  async findById(id: number): Promise<EntidadPublica | null> {
    return this.entidades.find((e) => e.id === id) ?? null;
  }

  async listByDepartamento(departamentoId: number): Promise<EntidadPublica[]> {
    return this.entidades.filter((e) => e.departamentoId === departamentoId);
  }
}

/** Solo se usa `departamentoExists`; el resto satisface la interfaz. */
class StubGeografiaRepository implements GeografiaRepository {
  // Incluye el 8 (Oruro) a proposito: existe pero aun no tiene entidades.
  private readonly ids = [5, 6, 7, 8];

  async listDepartamentos(): Promise<Departamento[]> {
    return this.ids.map((id) => ({ id, nombre: `Departamento ${id}` }));
  }

  async departamentoExists(id: number): Promise<boolean> {
    return this.ids.includes(id);
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
}

describe('Entidades publicas use cases', () => {
  let repo: InMemoryEntidadPublicaRepository;
  let geografia: StubGeografiaRepository;

  beforeEach(() => {
    repo = new InMemoryEntidadPublicaRepository();
    geografia = new StubGeografiaRepository();
  });

  it('lista todas las entidades publicas', async () => {
    const result = await new ListEntidadesUseCase(repo).execute();
    expect(result).toHaveLength(3);
  });

  it('todas las entidades comparten el NIT institucional de AEVivienda', async () => {
    const result = await new ListEntidadesUseCase(repo).execute();
    expect(result.every((e) => e.nit === NIT_AEVIVIENDA)).toBe(true);
    // El NIT se repite: es dato, no identificador.
    expect(new Set(result.map((e) => e.id)).size).toBe(result.length);
  });

  it('devuelve la entidad pedida por id', async () => {
    const result = await new GetEntidadUseCase(repo).execute(2);
    expect(result.id).toBe(2);
    expect(result.departamentoId).toBe(6);
  });

  it('falla con 404 si la entidad no existe', async () => {
    await expect(new GetEntidadUseCase(repo).execute(999)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('devuelve solo las entidades del departamento pedido', async () => {
    const result = await new ListEntidadesByDepartamentoUseCase(repo, geografia).execute(6);
    expect(result.map((e) => e.id)).toEqual([2]);
    expect(result.every((e) => e.departamentoId === 6)).toBe(true);
  });

  it('falla con 404 si el departamento no existe', async () => {
    await expect(
      new ListEntidadesByDepartamentoUseCase(repo, geografia).execute(999),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('devuelve lista vacia si el departamento existe pero no tiene entidades', async () => {
    const result = await new ListEntidadesByDepartamentoUseCase(repo, geografia).execute(8);
    expect(result).toEqual([]);
  });
});
