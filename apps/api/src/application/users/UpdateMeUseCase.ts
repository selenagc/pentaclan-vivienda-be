import type { UserRepository, UpdateUserInput } from '../../domain/repositories/UserRepository.js';
import type { PasswordService } from '../services/PasswordService.js';
import { toPublicUser, type PublicUser } from '../../domain/entities/User.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { ConflictError } from '../../shared/errors/ConflictError.js';

export interface UpdateMeDto {
  userId: string;
  name?: string;
  email?: string;
  password?: string;
}

export class UpdateMeUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly passwords: PasswordService,
  ) {}

  async execute(dto: UpdateMeDto): Promise<PublicUser> {
    if (dto.email !== undefined) {
      const existing = await this.users.findByEmail(dto.email);
      if (existing && existing.id !== dto.userId) throw new ConflictError('Email already in use');
    }

    const patch: UpdateUserInput = {};
    if (dto.name !== undefined) patch.name = dto.name;
    if (dto.email !== undefined) patch.email = dto.email;
    if (dto.password !== undefined) patch.passwordHash = await this.passwords.hash(dto.password);

    const updated = await this.users.update(dto.userId, patch);
    if (!updated) throw new NotFoundError(`User ${dto.userId} not found`);
    return toPublicUser(updated);
  }
}
