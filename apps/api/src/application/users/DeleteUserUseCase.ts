import type { UserRepository } from '../../domain/repositories/UserRepository.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { ConflictError } from '../../shared/errors/ConflictError.js';

export interface DeleteUserDto {
  id: string;
  requesterId: string;
}

export class DeleteUserUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(dto: DeleteUserDto): Promise<void> {
    const target = await this.users.findById(dto.id);
    if (!target) throw new NotFoundError(`User ${dto.id} not found`);

    if (target.id === dto.requesterId) {
      throw new ConflictError('You cannot delete your own account');
    }

    if (target.role === 'admin') {
      const admins = await this.users.countByRole('admin');
      if (admins <= 1) throw new ConflictError('Cannot delete the last admin');
    }

    await this.users.delete(dto.id);
  }
}
