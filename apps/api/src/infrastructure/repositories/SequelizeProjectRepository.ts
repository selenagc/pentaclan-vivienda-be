import { Op, type Order, type WhereOptions } from 'sequelize';
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
  name: 'name',
  status: 'status',
  startDate: 'start_date',
  endDate: 'end_date',
  createdAt: 'created_at',
};

function toEntity(model: ProjectModel): Project {
  return {
    id: model.id,
    name: model.name,
    description: model.description,
    status: model.status,
    startDate: model.startDate ? new Date(model.startDate) : null,
    endDate: model.endDate ? new Date(model.endDate) : null,
    clientId: model.clientId,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}

export class SequelizeProjectRepository implements ProjectRepository {
  async create(input: CreateProjectInput): Promise<Project> {
    const created = await ProjectModel.create({
      name: input.name,
      description: input.description,
      status: input.status,
      startDate: input.startDate,
      endDate: input.endDate,
      clientId: input.clientId,
    });
    return toEntity(created);
  }

  async findById(id: string): Promise<Project | null> {
    const found = await ProjectModel.findByPk(id);
    return found ? toEntity(found) : null;
  }

  async update(id: string, input: UpdateProjectInput): Promise<Project | null> {
    const found = await ProjectModel.findByPk(id);
    if (!found) return null;
    await found.update(input);
    return toEntity(found);
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await ProjectModel.destroy({ where: { id } });
    return deleted > 0;
  }

  async list(query: ListProjectsQuery): Promise<PageResult<Project>> {
    const where: WhereOptions = {};

    if (query.status) {
      (where as Record<string, unknown>).status = query.status;
    }
    if (query.clientId) {
      (where as Record<string, unknown>).clientId = query.clientId;
    }
    if (query.search) {
      (where as Record<string, unknown>).name = { [Op.like]: `%${query.search}%` };
    }

    const sortColumn = SORTABLE_FIELDS_MAP[query.sort.sortBy] ?? 'created_at';
    const order: Order = [[sortColumn, query.sort.sortOrder.toUpperCase()]];

    const { rows, count } = await ProjectModel.findAndCountAll({
      where,
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
