import type { UserRepository } from '../../domain/repositories/UserRepository.js';
import type { RefreshTokenRepository } from '../../domain/repositories/RefreshTokenRepository.js';
import type { TokenService } from '../services/TokenService.js';
import { UnauthorizedError } from '../../shared/errors/UnauthorizedError.js';

export interface RefreshInput {
  refreshToken: string;
}

export interface RefreshOutput {
  accessToken: string;
  refreshToken: string;
}

export class RefreshTokenUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly refreshTokens: RefreshTokenRepository,
    private readonly tokens: TokenService,
  ) {}

  async execute(input: RefreshInput): Promise<RefreshOutput> {
    let payload;
    try {
      payload = this.tokens.verifyRefreshToken(input.refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const tokenHash = this.tokens.hashToken(input.refreshToken);
    const stored = await this.refreshTokens.findByHash(tokenHash);
    if (!stored || stored.userId !== payload.sub) {
      throw new UnauthorizedError('Refresh token is no longer valid');
    }
    if (stored.expiresAt.getTime() <= Date.now()) {
      await this.refreshTokens.deleteById(stored.id);
      throw new UnauthorizedError('Refresh token has expired');
    }

    const user = await this.users.findById(payload.sub);
    if (!user) {
      await this.refreshTokens.deleteById(stored.id);
      throw new UnauthorizedError('User no longer exists');
    }

    // Rotate: remove old, issue new
    await this.refreshTokens.deleteById(stored.id);

    const accessToken = this.tokens.signAccessToken({ sub: user.id, role: user.role });
    const { token: newRefreshToken } = this.tokens.signRefreshToken({ sub: user.id });

    await this.refreshTokens.create({
      userId: user.id,
      tokenHash: this.tokens.hashToken(newRefreshToken),
      expiresAt: this.tokens.parseExpiryFromJwt(newRefreshToken),
    });

    return { accessToken, refreshToken: newRefreshToken };
  }
}
