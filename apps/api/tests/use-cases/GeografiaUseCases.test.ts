import { ListDepartamentosUseCase } from '../../src/application/geografia/ListDepartamentosUseCase.js';
import { ListProvinciasUseCase } from '../../src/application/geografia/ListProvinciasUseCase.js';
import { ListMunicipiosUseCase } from '../../src/application/geografia/ListMunicipiosUseCase.js';
import { NotFoundError } from '../../src/shared/errors/NotFoundError.js';
import type { Departamento } from '../../src/domain/entities/Departamento.js';
import type { Provincia } from '../../src/domain/entities/Provincia.js';
import type { Municipio } from '../../src/domain/entities/Municipio.js';
import type { GeografiaRepository } from '../../src/domain/repositories/GeografiaRepository.js';

class InMemoryGeografiaRepository implements GeografiaRepository {
  public readonly departamentos: Departamento[] = [
    { id: 1, nombre: 'La Paz' },
    { id: 2, nombre: 'Cochabamba' },
  ];

  public readonly provincias: Provincia[] = [
    { id: 10, nombre: 'Murillo', departamentoId: 1 },
    { id: 11, nombre: 'Los Andes', departamentoId: 1 },
    { id: 20, nombre: 'Cercado', departamentoId: 2 },
  ];

  public readonly municipios: Municipio[] = [
    { id: 100, nombre: 'La Paz', provinciaId: 10 },
    { id: 101, nombre: 'El Alto', provinciaId: 10 },
    { id: 200, nombre: 'Cochabamba', provinciaId: 20 },
  ];

  async listDepartamentos(): Promise<Departamento[]> {
    return this.departamentos;
  }

  async departamentoExists(id: number): Promise<boolean> {
    return this.departamentos.some((d) => d.id === id);
  }

  async listProvinciasByDepartamento(departamentoId: number): Promise<Provincia[]> {
    return this.provincias.filter((p) => p.departamentoId === departamentoId);
  }

  async provinciaExists(id: number): Promise<boolean> {
    return this.provincias.some((p) => p.id === id);
  }

  async listMunicipiosByProvincia(provinciaId: number): Promise<Municipio[]> {
    return this.municipios.filter((m) => m.provinciaId === provinciaId);
  }
}

describe('Geografia use cases', () => {
  let repo: InMemoryGeografiaRepository;

  beforeEach(() => {
    repo = new InMemoryGeografiaRepository();
  });

  it('lista todos los departamentos', async () => {
    const result = await new ListDepartamentosUseCase(repo).execute();
    expect(result).toHaveLength(2);
    expect(result.map((d) => d.nombre)).toEqual(['La Paz', 'Cochabamba']);
  });

  it('devuelve solo las provincias del departamento pedido', async () => {
    const result = await new ListProvinciasUseCase(repo).execute(1);
    expect(result.map((p) => p.id)).toEqual([10, 11]);
    expect(result.every((p) => p.departamentoId === 1)).toBe(true);
  });

  it('falla con 404 si el departamento no existe', async () => {
    await expect(new ListProvinciasUseCase(repo).execute(999)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('devuelve solo los municipios de la provincia pedida', async () => {
    const result = await new ListMunicipiosUseCase(repo).execute(10);
    expect(result.map((m) => m.nombre)).toEqual(['La Paz', 'El Alto']);
    expect(result.every((m) => m.provinciaId === 10)).toBe(true);
  });

  it('falla con 404 si la provincia no existe', async () => {
    await expect(new ListMunicipiosUseCase(repo).execute(999)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('devuelve lista vacia si la provincia existe pero no tiene municipios', async () => {
    const result = await new ListMunicipiosUseCase(repo).execute(11);
    expect(result).toEqual([]);
  });
});
