import { Op, type Includeable, type Order, type WhereOptions } from 'sequelize';
import { PropertyModel } from '../database/models/PropertyModel.js';
import type { Property } from '../../domain/entities/Property.js';
import type {
  ListPropertiesQuery,
  PropertyRepository,
} from '../../domain/repositories/PropertyRepository.js';
import type { PageResult } from '../../domain/types/Pagination.js';

const SORTABLE_FIELDS_MAP: Record<string, string> = {
  community: 'community',
  zone: 'zone',
  address: 'address',
  createdAt: 'created_at',
};

/** La ubicacion se arrastra hasta el departamento, igual que en projects. */
export const PROPERTY_INCLUDE: Includeable = {
  association: 'municipality',
  attributes: ['id', 'name'],
  include: [
    {
      association: 'province',
      attributes: ['id', 'name'],
      include: [{ association: 'department', attributes: ['id', 'name'] }],
    },
  ],
};

/**
 * Se exporta porque el repositorio de postulaciones anida el inmueble completo
 * y no tiene sentido que lo mapee dos veces con criterios distintos.
 */
export function toPropertyEntity(model: PropertyModel): Property {
  const municipality = model.municipality;
  const province = municipality?.province;
  const department = province?.department;

  // Falla ruidosamente en desarrollo en vez de devolver datos vacios.
  if (!municipality || !province || !department) {
    throw new Error('SequelizePropertyRepository: missing `municipality` include');
  }

  return {
    id: model.id,
    community: model.community,
    zone: model.zone,
    address: model.address,
    // El driver de Postgres devuelve DECIMAL como string para no perder
    // precision; sin este Number() la API serializaria "-17.393100" entre
    // comillas y el front tendria que parsearlo.
    latitude: Number(model.latitude),
    longitude: Number(model.longitude),
    municipality: {
      id: municipality.id,
      name: municipality.name,
      province: { id: province.id, name: province.name },
      department: { id: department.id, name: department.name },
    },
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}

export class SequelizePropertyRepository implements PropertyRepository {
  async findById(id: string): Promise<Property | null> {
    const found = await PropertyModel.findByPk(id, { include: [PROPERTY_INCLUDE] });
    return found ? toPropertyEntity(found) : null;
  }

  async list(query: ListPropertiesQuery): Promise<PageResult<Property>> {
    const conditions: WhereOptions[] = [];

    if (query.municipalityId !== undefined) {
      conditions.push({ municipalityId: query.municipalityId });
    }
    if (query.search) {
      // iLike y no like: en Postgres LIKE distingue mayusculas.
      conditions.push({
        [Op.or]: [
          { community: { [Op.iLike]: `%${query.search}%` } },
          { zone: { [Op.iLike]: `%${query.search}%` } },
          { address: { [Op.iLike]: `%${query.search}%` } },
        ],
      });
    }

    const where: WhereOptions = conditions.length ? { [Op.and]: conditions } : {};

    const sortColumn = SORTABLE_FIELDS_MAP[query.sort.sortBy] ?? 'created_at';
    const order: Order = [[sortColumn, query.sort.sortOrder.toUpperCase()]];

    const { rows, count } = await PropertyModel.findAndCountAll({
      where,
      include: [PROPERTY_INCLUDE],
      limit: query.pagination.limit,
      offset: query.pagination.offset,
      order,
    });

    return {
      data: rows.map(toPropertyEntity),
      total: count,
    };
  }
}
