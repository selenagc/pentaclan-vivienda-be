import type { Property } from '../entities/Property.js';
import type { PageRequest, PageResult, SortRequest } from '../types/Pagination.js';

export interface ListPropertiesQuery {
  pagination: PageRequest;
  sort: SortRequest;
  /** Busca en comunidad, zona y direccion. */
  search?: string;
  municipalityId?: number;
}

/**
 * Puerto de solo lectura, como el de entidades publicas pero por otro motivo:
 * aqui si hay escritura, solo que ocurre dentro del alta de una postulacion,
 * que crea persona, conyuge e inmueble en una sola transaccion. Exponer un
 * `create` suelto abriria la puerta a inmuebles huerfanos, sin postulacion.
 *
 * El listado existe para el buscador del formulario: sin codigo catastral, la
 * unica forma de que dos registros apunten al mismo inmueble fisico es que el
 * operador lo encuentre y lo elija en vez de crear uno nuevo.
 */
export interface PropertyRepository {
  findById(id: string): Promise<Property | null>;
  list(query: ListPropertiesQuery): Promise<PageResult<Property>>;
}
