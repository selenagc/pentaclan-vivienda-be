import type { RefreshTokenRepository } from '../../domain/repositories/RefreshTokenRepository.js';
import type { TokenService } from '../services/TokenService.js';

export interface LogoutInput {
  userId: string;
  refreshToken: string;
}

export class LogoutUseCase {
  constructor(
    private readonly refreshTokens: RefreshTokenRepository,
    private readonly tokens: TokenService,
  ) {}

  async execute(input: LogoutInput): Promise<{ revoked: number }> {
    const hash = this.tokens.hashToken(input.refreshToken);
    const revoked = await this.refreshTokens.deleteByHashForUser(input.userId, hash);
    return { revoked };
  }
}
