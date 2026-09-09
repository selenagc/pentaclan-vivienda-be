import { Op, type Includeable, type Order, type WhereOptions } from 'sequelize';
import { ProyectoModel } from '../database/models/ProyectoModel.js';
import type { Proyecto } from '../../domain/entities/Proyecto.js';
import type {
  CreateProyectoInput,
  ListProyectosQuery,
  ProyectoRepository,
  UpdateProyectoInput,
} from '../../domain/repositories/ProyectoRepository.js';
import type { PageResult } from '../../domain/types/Pagination.js';

const SORTABLE_FIELDS_MAP: Record<string, string> = {
  nombre: 'nombre_proyecto',
  nroContrato: 'nro_contrato',
  createdAt: 'created_at',
};

const INCLUDE_USUARIO: Includeable[] = [{ association: 'usuario', attributes: ['name'] }];

function toEntity(model: ProyectoModel): Proyecto {
  const usuario = model.usuario;
  if (!usuario) {
    // Falla ruidosamente en desarrollo en vez de devolver un nombre vacio.
    throw new Error('SequelizeProyectoRepository: falta el include de `usuario`');
  }

  return {
    id: model.id,
    nombre: model.nombre,
    nroContrato: model.nroContrato,
    entidadPublicaId: model.entidadPublicaId,
    usuarioNombre: usuario.name,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}

export class SequelizeProyectoRepository implements ProyectoRepository {
  async create(input: CreateProyectoInput): Promise<Proyecto> {
    const created = await ProyectoModel.create(input);
    await created.reload({ include: INCLUDE_USUARIO });
    return toEntity(created);
  }

  async findById(id: string): Promise<Proyecto | null> {
    const found = await ProyectoModel.findByPk(id, { include: INCLUDE_USUARIO });
    return found ? toEntity(found) : null;
  }

  async findByNroContrato(nroContrato: string): Promise<Proyecto | null> {
    const found = await ProyectoModel.findOne({
      where: { nroContrato },
      include: INCLUDE_USUARIO,
    });
    return found ? toEntity(found) : null;
  }

  async update(id: string, input: UpdateProyectoInput): Promise<Proyecto | null> {
    const found = await ProyectoModel.findByPk(id);
    if (!found) return null;

    await found.update(input);
    await found.reload({ include: INCLUDE_USUARIO });
    return toEntity(found);
  }

  async list(query: ListProyectosQuery): Promise<PageResult<Proyecto>> {
    const conditions: WhereOptions[] = [];

    if (query.entidadPublicaId !== undefined) {
      conditions.push({ entidadPublicaId: query.entidadPublicaId });
    }
    if (query.usuarioId) {
      conditions.push({ usuarioId: query.usuarioId });
    }
    if (query.search) {
      conditions.push({
        [Op.or]: [
          { nombre: { [Op.like]: `%${query.search}%` } },
          { nroContrato: { [Op.like]: `%${query.search}%` } },
        ],
      });
    }

    const where: WhereOptions = conditions.length ? { [Op.and]: conditions } : {};

    const sortColumn = SORTABLE_FIELDS_MAP[query.sort.sortBy] ?? 'created_at';
    const order: Order = [[sortColumn, query.sort.sortOrder.toUpperCase()]];

    const { rows, count } = await ProyectoModel.findAndCountAll({
      where,
      include: INCLUDE_USUARIO,
      limit: query.pagination.limit,
      offset: query.pagination.offset,
      order,
    });

    return {
      data: rows.map(toEntity),
      total: count,
    };
  }
}
