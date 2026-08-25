import type { UserRepository } from '../../domain/repositories/UserRepository.js';
import { toPublicUser, type PublicUser } from '../../domain/entities/User.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';

export class GetUserUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(id: string): Promise<PublicUser> {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundError(`User ${id} not found`);
    return toPublicUser(user);
  }
}
