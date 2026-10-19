import { Op, type Order, type WhereOptions } from 'sequelize';
import { UserModel } from '../database/models/UserModel.js';
import type { User } from '../../domain/entities/User.js';
import type {
  CreateUserInput,
  ListUsersQuery,
  UpdateUserInput,
  UserRepository,
} from '../../domain/repositories/UserRepository.js';
import type { Role } from '../../domain/types/Role.js';
import type { PageResult } from '../../domain/types/Pagination.js';

const SORTABLE_FIELDS_MAP: Record<string, string> = {
  name: 'name',
  email: 'email',
  role: 'role',
  createdAt: 'created_at',
};

function toEntity(model: UserModel): User {
  return {
    id: model.id,
    name: model.name,
    email: model.email,
    passwordHash: model.passwordHash,
    role: model.role,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}

export class SequelizeUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const found = await UserModel.findByPk(id);
    return found ? toEntity(found) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const found = await UserModel.findOne({ where: { email } });
    return found ? toEntity(found) : null;
  }

  async create(input: CreateUserInput): Promise<User> {
    const created = await UserModel.create({
      name: input.name,
      email: input.email,
      passwordHash: input.passwordHash,
      role: input.role,
    });
    return toEntity(created);
  }

  async update(id: string, input: UpdateUserInput): Promise<User | null> {
    const found = await UserModel.findByPk(id);
    if (!found) return null;
    await found.update(input);
    return toEntity(found);
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await UserModel.destroy({ where: { id } });
    return deleted > 0;
  }

  async list(query: ListUsersQuery): Promise<PageResult<User>> {
    const conditions: WhereOptions[] = [];

    if (query.role) {
      conditions.push({ role: query.role });
    }
    if (query.search) {
      // iLike y no like: en Postgres LIKE distingue mayusculas, a diferencia
      // de MySQL, donde la collation por defecto ya las ignoraba.
      conditions.push({
        [Op.or]: [
          { name: { [Op.iLike]: `%${query.search}%` } },
          { email: { [Op.iLike]: `%${query.search}%` } },
        ],
      });
    }

    const where: WhereOptions = conditions.length ? { [Op.and]: conditions } : {};

    const sortColumn = SORTABLE_FIELDS_MAP[query.sort.sortBy] ?? 'created_at';
    const order: Order = [[sortColumn, query.sort.sortOrder.toUpperCase()]];

    const { rows, count } = await UserModel.findAndCountAll({
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

  async countByRole(role: Role): Promise<number> {
    return UserModel.count({ where: { role } });
  }
}
