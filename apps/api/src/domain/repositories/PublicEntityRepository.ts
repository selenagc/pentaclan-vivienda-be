import type { PublicEntity } from '../entities/PublicEntity.js';

/**
 * Catalogo de entidades publicas (datos maestros). Solo lectura: la carga se
 * hace por seeder, no hay operaciones de escritura expuestas.
 */
export interface PublicEntityRepository {
  list(): Promise<PublicEntity[]>;
  findById(id: number): Promise<PublicEntity | null>;
}
