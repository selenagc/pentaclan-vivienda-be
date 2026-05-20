import type { UserRepository } from '../../domain/repositories/UserRepository.js';
import type { RefreshTokenRepository } from '../../domain/repositories/RefreshTokenRepository.js';
import type { PasswordService } from '../services/PasswordService.js';
import type { TokenService } from '../services/TokenService.js';
import { UnauthorizedError } from '../../shared/errors/UnauthorizedError.js';
import { toPublicUser, type PublicUser } from '../../domain/entities/User.js';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
}

export class LoginUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly refreshTokens: RefreshTokenRepository,
    private readonly passwords: PasswordService,
    private readonly tokens: TokenService,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const user = await this.users.findByEmail(input.email);
    if (!user) throw new UnauthorizedError('Invalid credentials');

    const matches = await this.passwords.compare(input.password, user.passwordHash);
    if (!matches) throw new UnauthorizedError('Invalid credentials');

    const accessToken = this.tokens.signAccessToken({ sub: user.id, role: user.role });
    const { token: refreshToken } = this.tokens.signRefreshToken({ sub: user.id });

    await this.refreshTokens.create({
      userId: user.id,
      tokenHash: this.tokens.hashToken(refreshToken),
      expiresAt: this.tokens.parseExpiryFromJwt(refreshToken),
    });

    return {
      accessToken,
      refreshToken,
      user: toPublicUser(user),
    };
  }
}
