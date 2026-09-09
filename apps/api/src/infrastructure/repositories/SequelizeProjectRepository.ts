import { Op, type Includeable, type Order, type WhereOptions } from 'sequelize';
import { ProjectModel } from '../database/models/ProjectModel.js';
import type { Project } from '../../domain/entities/Project.js';
import type {
  CreateProjectInput,
  ListProjectsQuery,
  ProjectRepository,
  UpdateProjectInput,
} from '../../domain/repositories/ProjectRepository.js';
import type { PageResult } from '../../domain/types/Pagination.js';

const SORTABLE_FIELDS_MAP: Record<string, string> = {
  name: 'project_name',
  contractNo: 'contract_no',
  createdAt: 'created_at',
};

/**
 * La ubicacion se arrastra hasta el departamento: la FK del proyecto llega solo
 * al municipio, el resto de la cadena sale de la jerarquia del catalogo.
 */
const INCLUDE_RELATIONS: Includeable[] = [
  { association: 'user', attributes: ['name'] },
  { association: 'publicEntity', attributes: ['id', 'name'] },
  {
    association: 'municipality',
    attributes: ['id', 'name'],
    include: [
      {
        association: 'province',
        attributes: ['id', 'name'],
        include: [{ association: 'department', attributes: ['id', 'name'] }],
      },
    ],
  },
];

function toEntity(model: ProjectModel): Project {
  const user = model.user;
  const publicEntity = model.publicEntity;
  const municipality = model.municipality;
  const province = municipality?.province;
  const department = province?.department;

  // Falla ruidosamente en desarrollo en vez de devolver datos vacios.
  if (!user) {
    throw new Error('SequelizeProjectRepository: missing `user` include');
  }
  if (!publicEntity) {
    throw new Error('SequelizeProjectRepository: missing `publicEntity` include');
  }
  if (!municipality || !province || !department) {
    throw new Error('SequelizeProjectRepository: missing `municipality` include');
  }

  return {
    id: model.id,
    name: model.name,
    contractNo: model.contractNo,
    publicEntity: { id: publicEntity.id, name: publicEntity.name },
    municipality: {
      id: municipality.id,
      name: municipality.name,
      province: { id: province.id, name: province.name },
      department: { id: department.id, name: department.name },
    },
    userName: user.name,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}

export class SequelizeProjectRepository implements ProjectRepository {
  async create(input: CreateProjectInput): Promise<Project> {
    const created = await ProjectModel.create(input);
    await created.reload({ include: INCLUDE_RELATIONS });
    return toEntity(created);
  }

  async findById(id: string): Promise<Project | null> {
    const found = await ProjectModel.findByPk(id, { include: INCLUDE_RELATIONS });
    return found ? toEntity(found) : null;
  }

  async findByContractNo(contractNo: string): Promise<Project | null> {
    const found = await ProjectModel.findOne({
      where: { contractNo },
      include: INCLUDE_RELATIONS,
    });
    return found ? toEntity(found) : null;
  }

  async update(id: string, input: UpdateProjectInput): Promise<Project | null> {
    const found = await ProjectModel.findByPk(id);
    if (!found) return null;

    await found.update(input);
    await found.reload({ include: INCLUDE_RELATIONS });
    return toEntity(found);
  }

  async list(query: ListProjectsQuery): Promise<PageResult<Project>> {
    const conditions: WhereOptions[] = [];

    if (query.publicEntityId !== undefined) {
      conditions.push({ publicEntityId: query.publicEntityId });
    }
    if (query.municipalityId !== undefined) {
      conditions.push({ municipalityId: query.municipalityId });
    }
    if (query.userId) {
      conditions.push({ userId: query.userId });
    }
    if (query.search) {
      // iLike y no like: en Postgres LIKE distingue mayusculas, a diferencia
      // de MySQL, donde la collation por defecto ya las ignoraba.
      conditions.push({
        [Op.or]: [
          { name: { [Op.iLike]: `%${query.search}%` } },
          { contractNo: { [Op.iLike]: `%${query.search}%` } },
        ],
      });
    }

    const where: WhereOptions = conditions.length ? { [Op.and]: conditions } : {};

    const sortColumn = SORTABLE_FIELDS_MAP[query.sort.sortBy] ?? 'created_at';
    const order: Order = [[sortColumn, query.sort.sortOrder.toUpperCase()]];

    const { rows, count } = await ProjectModel.findAndCountAll({
      where,
      include: INCLUDE_RELATIONS,
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
