import type { User } from '../entities/User.js';
import type { Role } from '../types/Role.js';
import type { PageRequest, PageResult, SortRequest } from '../types/Pagination.js';

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
}

export type UpdateUserInput = Partial<{
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
}>;

export interface ListUsersQuery {
  pagination: PageRequest;
  sort: SortRequest;
  search?: string;
  role?: Role;
}

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(input: CreateUserInput): Promise<User>;
  update(id: string, input: UpdateUserInput): Promise<User | null>;
  delete(id: string): Promise<boolean>;
  list(query: ListUsersQuery): Promise<PageResult<User>>;
  countByRole(role: Role): Promise<number>;
}
