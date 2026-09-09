import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../../shared/config/env.js';
import type { Role } from '../../domain/types/Role.js';

export interface AccessTokenPayload {
  sub: string;
  role: Role;
}

export class TokenService {
  signAccessToken(payload: AccessTokenPayload): string {
    const options: SignOptions = { expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'] };
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
  }
}
