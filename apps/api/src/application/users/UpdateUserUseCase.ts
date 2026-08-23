import type { UserRepository, UpdateUserInput } from '../../domain/repositories/UserRepository.js';
import type { PasswordService } from '../services/PasswordService.js';
import type { Role } from '../../domain/types/Role.js';
import { toPublicUser, type PublicUser } from '../../domain/entities/User.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { ConflictError } from '../../shared/errors/ConflictError.js';

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
}

export class UpdateUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly passwords: PasswordService,
  ) {}

  async execute(id: string, dto: UpdateUserDto): Promise<PublicUser> {
    if (dto.email !== undefined) {
      const existing = await this.users.findByEmail(dto.email);
      if (existing && existing.id !== id) throw new ConflictError('Email already in use');
    }

    const patch: UpdateUserInput = {};
    if (dto.name !== undefined) patch.name = dto.name;
    if (dto.email !== undefined) patch.email = dto.email;
    if (dto.role !== undefined) patch.role = dto.role;
    if (dto.password !== undefined) patch.passwordHash = await this.passwords.hash(dto.password);

    const updated = await this.users.update(id, patch);
    if (!updated) throw new NotFoundError(`User ${id} not found`);
    return toPublicUser(updated);
  }
}
