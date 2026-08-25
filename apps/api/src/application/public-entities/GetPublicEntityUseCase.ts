import type { PublicEntity } from '../../domain/entities/PublicEntity.js';
import type { PublicEntityRepository } from '../../domain/repositories/PublicEntityRepository.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';

export class GetPublicEntityUseCase {
  constructor(private readonly publicEntities: PublicEntityRepository) {}

  async execute(id: number): Promise<PublicEntity> {
    const publicEntity = await this.publicEntities.findById(id);
    if (!publicEntity) throw new NotFoundError(`Public entity ${id} not found`);

    return publicEntity;
  }
}
