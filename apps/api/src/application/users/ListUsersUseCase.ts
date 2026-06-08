import type { UserRepository } from '../../domain/repositories/UserRepository.js';
import type { Role } from '../../domain/types/Role.js';
import type { PageRequest, PageResult, SortRequest } from '../../domain/types/Pagination.js';
import { toPublicUser, type PublicUser } from '../../domain/entities/User.js';

export interface ListUsersDto {
  pagination: PageRequest;
  sort: SortRequest;
  search?: string;
  role?: Role;
}

export class ListUsersUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(dto: ListUsersDto): Promise<PageResult<PublicUser>> {
    const result = await this.users.list(dto);
    return {
      data: result.data.map(toPublicUser),
      total: result.total,
    };
  }
}
