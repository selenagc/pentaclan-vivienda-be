import type { UserRepository } from '../../domain/repositories/UserRepository.js';
import type { PasswordService } from '../services/PasswordService.js';
import type { TokenService } from '../services/TokenService.js';
import { UnauthorizedError } from '../../shared/errors/UnauthorizedError.js';
import { toPublicUser, type PublicUser } from '../../domain/entities/User.js';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  user: PublicUser;
  accessToken: string;
}

export class LoginUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly passwords: PasswordService,
    private readonly tokens: TokenService,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const user = await this.users.findByEmail(input.email);
    if (!user) throw new UnauthorizedError('Invalid credentials');

    const matches = await this.passwords.compare(input.password, user.passwordHash);
    if (!matches) throw new UnauthorizedError('Invalid credentials');

    const accessToken = this.tokens.signAccessToken({ sub: user.id, role: user.role });

    return {
      user: toPublicUser(user),
      accessToken,
    };
  }
}
