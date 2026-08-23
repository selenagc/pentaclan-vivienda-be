import type { EntidadPublica } from '../entities/EntidadPublica.js';

/**
 * Catalogo de entidades publicas (datos maestros). Solo lectura: la carga se
 * hace por seeder, no hay operaciones de escritura expuestas.
 */
export interface EntidadPublicaRepository {
  list(): Promise<EntidadPublica[]>;
  findById(id: number): Promise<EntidadPublica | null>;
}
