import type { PublicEntity } from '../../domain/entities/PublicEntity.js';
import type { PublicEntityRepository } from '../../domain/repositories/PublicEntityRepository.js';

export class ListPublicEntitiesUseCase {
  constructor(private readonly publicEntities: PublicEntityRepository) {}

  async execute(): Promise<PublicEntity[]> {
    return this.publicEntities.list();
  }
}
