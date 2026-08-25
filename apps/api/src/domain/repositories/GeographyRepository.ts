import type { Department } from '../entities/Department.js';
import type { Province } from '../entities/Province.js';
import type { Municipality } from '../entities/Municipality.js';

/**
 * Catalogo geografico (datos maestros). Solo lectura: la carga inicial se hace
 * por seeder, no hay operaciones de escritura expuestas.
 */
export interface GeographyRepository {
  listDepartments(): Promise<Department[]>;
  departmentExists(id: number): Promise<boolean>;
  listProvincesByDepartment(departmentId: number): Promise<Province[]>;
  provinceExists(id: number): Promise<boolean>;
  listMunicipalitiesByProvince(provinceId: number): Promise<Municipality[]>;
  municipalityExists(id: number): Promise<boolean>;
}
