import { RefreshTokenModel } from '../database/models/RefreshTokenModel.js';
import type { RefreshToken } from '../../domain/entities/RefreshToken.js';
import type {
  CreateRefreshTokenInput,
  RefreshTokenRepository,
} from '../../domain/repositories/RefreshTokenRepository.js';

function toEntity(model: RefreshTokenModel): RefreshToken {
  return {
    id: model.id,
    userId: model.userId,
    tokenHash: model.tokenHash,
    expiresAt: model.expiresAt,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}

export class SequelizeRefreshTokenRepository implements RefreshTokenRepository {
  async create(input: CreateRefreshTokenInput): Promise<RefreshToken> {
    const created = await RefreshTokenModel.create({
      userId: input.userId,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
    });
    return toEntity(created);
  }

  async findByHash(tokenHash: string): Promise<RefreshToken | null> {
    const found = await RefreshTokenModel.findOne({ where: { tokenHash } });
    return found ? toEntity(found) : null;
  }

  async deleteById(id: string): Promise<void> {
    await RefreshTokenModel.destroy({ where: { id } });
  }

  async deleteByHashForUser(userId: string, tokenHash: string): Promise<number> {
    return RefreshTokenModel.destroy({ where: { userId, tokenHash } });
  }

  async deleteAllForUser(userId: string): Promise<number> {
    return RefreshTokenModel.destroy({ where: { userId } });
  }
}
