import type { UserRepository } from '../../domain/repositories/UserRepository.js';
import { toPublicUser, type PublicUser } from '../../domain/entities/User.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';

export class GetMeUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(userId: string): Promise<PublicUser> {
    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    return toPublicUser(user);
  }
}
