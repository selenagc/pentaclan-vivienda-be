import { PublicEntityModel } from '../database/models/PublicEntityModel.js';
import type { PublicEntity } from '../../domain/entities/PublicEntity.js';
import type { PublicEntityRepository } from '../../domain/repositories/PublicEntityRepository.js';

function toPublicEntity(model: PublicEntityModel): PublicEntity {
  return {
    id: model.id,
    // mysql2 devuelve BIGINT como string; el NIT cabe de sobra en un number.
    taxId: Number(model.taxId),
    name: model.name,
    acronym: model.acronym,
  };
}

const ORDEN: [string, string][] = [['acronym', 'ASC']];

export class SequelizePublicEntityRepository implements PublicEntityRepository {
  async list(): Promise<PublicEntity[]> {
    const rows = await PublicEntityModel.findAll({ order: ORDEN });
    return rows.map(toPublicEntity);
  }

  async findById(id: number): Promise<PublicEntity | null> {
    const row = await PublicEntityModel.findByPk(id);
    return row ? toPublicEntity(row) : null;
  }
}
