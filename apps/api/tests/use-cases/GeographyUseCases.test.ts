import { ListDepartmentsUseCase } from '../../src/application/geography/ListDepartmentsUseCase.js';
import { ListProvincesUseCase } from '../../src/application/geography/ListProvincesUseCase.js';
import { ListMunicipalitiesUseCase } from '../../src/application/geography/ListMunicipalitiesUseCase.js';
import { NotFoundError } from '../../src/shared/errors/NotFoundError.js';
import type { Department } from '../../src/domain/entities/Department.js';
import type { Province } from '../../src/domain/entities/Province.js';
import type { Municipality } from '../../src/domain/entities/Municipality.js';
import type { GeographyRepository } from '../../src/domain/repositories/GeographyRepository.js';

class InMemoryGeographyRepository implements GeographyRepository {
  public readonly departments: Department[] = [
    { id: 1, name: 'La Paz' },
    { id: 2, name: 'Cochabamba' },
  ];

  public readonly provinces: Province[] = [
    { id: 10, name: 'Murillo', departmentId: 1 },
    { id: 11, name: 'Los Andes', departmentId: 1 },
    { id: 20, name: 'Cercado', departmentId: 2 },
  ];

  public readonly municipalities: Municipality[] = [
    { id: 100, name: 'La Paz', provinceId: 10 },
    { id: 101, name: 'El Alto', provinceId: 10 },
    { id: 200, name: 'Cochabamba', provinceId: 20 },
  ];

  async listDepartments(): Promise<Department[]> {
    return this.departments;
  }

  async departmentExists(id: number): Promise<boolean> {
    return this.departments.some((d) => d.id === id);
  }

  async listProvincesByDepartment(departmentId: number): Promise<Province[]> {
    return this.provinces.filter((p) => p.departmentId === departmentId);
  }

  async provinceExists(id: number): Promise<boolean> {
    return this.provinces.some((p) => p.id === id);
  }

  async listMunicipalitiesByProvince(provinceId: number): Promise<Municipality[]> {
    return this.municipalities.filter((m) => m.provinceId === provinceId);
  }

  async municipalityExists(id: number): Promise<boolean> {
    return this.municipalities.some((m) => m.id === id);
  }
}

describe('Geography use cases', () => {
  let repo: InMemoryGeographyRepository;

  beforeEach(() => {
    repo = new InMemoryGeographyRepository();
  });

  it('lists every department', async () => {
    const result = await new ListDepartmentsUseCase(repo).execute();
    expect(result).toHaveLength(2);
    expect(result.map((d) => d.name)).toEqual(['La Paz', 'Cochabamba']);
  });

  it('returns only the provinces of the requested department', async () => {
    const result = await new ListProvincesUseCase(repo).execute(1);
    expect(result.map((p) => p.id)).toEqual([10, 11]);
    expect(result.every((p) => p.departmentId === 1)).toBe(true);
  });

  it('fails with 404 when the department does not exist', async () => {
    await expect(new ListProvincesUseCase(repo).execute(999)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('returns only the municipalities of the requested province', async () => {
    const result = await new ListMunicipalitiesUseCase(repo).execute(10);
    expect(result.map((m) => m.name)).toEqual(['La Paz', 'El Alto']);
    expect(result.every((m) => m.provinceId === 10)).toBe(true);
  });

  it('fails with 404 when the province does not exist', async () => {
    await expect(new ListMunicipalitiesUseCase(repo).execute(999)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('returns an empty list when the province exists but has no municipalities', async () => {
    const result = await new ListMunicipalitiesUseCase(repo).execute(11);
    expect(result).toEqual([]);
  });
});
