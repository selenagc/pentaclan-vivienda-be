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

/**
 * La ubicacion se arrastra hasta el departamento: la FK del proyecto llega solo
 * al municipio, el resto de la cadena sale de la jerarquia del catalogo.
 */
const INCLUDE_RELACIONES: Includeable[] = [
  { association: 'usuario', attributes: ['name'] },
  { association: 'entidadPublica', attributes: ['id', 'nombre'] },
  {
    association: 'municipio',
    attributes: ['id', 'nombre'],
    include: [
      {
        association: 'provincia',
        attributes: ['id', 'nombre'],
        include: [{ association: 'departamento', attributes: ['id', 'nombre'] }],
      },
    ],
  },
];

function toEntity(model: ProyectoModel): Proyecto {
  const usuario = model.usuario;
  const entidadPublica = model.entidadPublica;
  const municipio = model.municipio;
  const provincia = municipio?.provincia;
  const departamento = provincia?.departamento;

  // Falla ruidosamente en desarrollo en vez de devolver datos vacios.
  if (!usuario) {
    throw new Error('SequelizeProyectoRepository: falta el include de `usuario`');
  }
  if (!entidadPublica) {
    throw new Error('SequelizeProyectoRepository: falta el include de `entidadPublica`');
  }
  if (!municipio || !provincia || !departamento) {
    throw new Error('SequelizeProyectoRepository: falta el include de `municipio`');
  }

  return {
    id: model.id,
    nombre: model.nombre,
    nroContrato: model.nroContrato,
    entidadPublica: { id: entidadPublica.id, nombre: entidadPublica.nombre },
    municipio: {
      id: municipio.id,
      nombre: municipio.nombre,
      provincia: { id: provincia.id, nombre: provincia.nombre },
      departamento: { id: departamento.id, nombre: departamento.nombre },
    },
    usuarioNombre: usuario.name,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}

export class SequelizeProyectoRepository implements ProyectoRepository {
  async create(input: CreateProyectoInput): Promise<Proyecto> {
    const created = await ProyectoModel.create(input);
    await created.reload({ include: INCLUDE_RELACIONES });
    return toEntity(created);
  }

  async findById(id: string): Promise<Proyecto | null> {
    const found = await ProyectoModel.findByPk(id, { include: INCLUDE_RELACIONES });
    return found ? toEntity(found) : null;
  }

  async findByNroContrato(nroContrato: string): Promise<Proyecto | null> {
    const found = await ProyectoModel.findOne({
      where: { nroContrato },
      include: INCLUDE_RELACIONES,
    });
    return found ? toEntity(found) : null;
  }

  async update(id: string, input: UpdateProyectoInput): Promise<Proyecto | null> {
    const found = await ProyectoModel.findByPk(id);
    if (!found) return null;

    await found.update(input);
    await found.reload({ include: INCLUDE_RELACIONES });
    return toEntity(found);
  }

  async list(query: ListProyectosQuery): Promise<PageResult<Proyecto>> {
    const conditions: WhereOptions[] = [];

    if (query.entidadPublicaId !== undefined) {
      conditions.push({ entidadPublicaId: query.entidadPublicaId });
    }
    if (query.municipioId !== undefined) {
      conditions.push({ municipioId: query.municipioId });
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
      include: INCLUDE_RELACIONES,
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
