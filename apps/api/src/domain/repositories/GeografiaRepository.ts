import type { Departamento } from '../entities/Departamento.js';
import type { Provincia } from '../entities/Provincia.js';
import type { Municipio } from '../entities/Municipio.js';

/**
 * Catalogo geografico (datos maestros). Solo lectura: la carga inicial se hace
 * por seeder, no hay operaciones de escritura expuestas.
 */
export interface GeografiaRepository {
  listDepartamentos(): Promise<Departamento[]>;
  departamentoExists(id: number): Promise<boolean>;
  listProvinciasByDepartamento(departamentoId: number): Promise<Provincia[]>;
  provinciaExists(id: number): Promise<boolean>;
  listMunicipiosByProvincia(provinciaId: number): Promise<Municipio[]>;
}
