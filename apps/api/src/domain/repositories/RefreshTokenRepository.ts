import type { RefreshToken } from '../entities/RefreshToken.js';

export interface CreateRefreshTokenInput {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface RefreshTokenRepository {
  create(input: CreateRefreshTokenInput): Promise<RefreshToken>;
  findByHash(tokenHash: string): Promise<RefreshToken | null>;
  deleteById(id: string): Promise<void>;
  deleteByHashForUser(userId: string, tokenHash: string): Promise<number>;
  deleteAllForUser(userId: string): Promise<number>;
}
