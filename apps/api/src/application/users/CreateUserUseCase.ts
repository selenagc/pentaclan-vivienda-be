import type { UserRepository } from '../../domain/repositories/UserRepository.js';
import type { PasswordService } from '../services/PasswordService.js';
import type { Role } from '../../domain/types/Role.js';
import { toPublicUser, type PublicUser } from '../../domain/entities/User.js';
import { ConflictError } from '../../shared/errors/ConflictError.js';

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export class CreateUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly passwords: PasswordService,
  ) {}

  async execute(dto: CreateUserDto): Promise<PublicUser> {
    const existing = await this.users.findByEmail(dto.email);
    if (existing) throw new ConflictError('Email already in use');

    const passwordHash = await this.passwords.hash(dto.password);
    const user = await this.users.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: dto.role,
    });
    return toPublicUser(user);
  }
}
