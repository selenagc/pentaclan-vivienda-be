import crypto from 'node:crypto';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../../shared/config/env.js';
import type { Role } from '../../domain/types/Role.js';

export interface AccessTokenPayload {
  sub: string;
  role: Role;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
}

export class TokenService {
  signAccessToken(payload: AccessTokenPayload): string {
    const options: SignOptions = { expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'] };
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
  }

  signRefreshToken(payload: { sub: string }): { token: string; jti: string } {
    const jti = crypto.randomUUID();
    const options: SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'], jwtid: jti };
    const token = jwt.sign({ sub: payload.sub }, env.JWT_REFRESH_SECRET, options);
    return { token, jti };
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
  }

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  parseExpiryFromJwt(token: string): Date {
    const decoded = jwt.decode(token) as { exp?: number } | null;
    if (!decoded?.exp) {
      // Fallback: 7 days from now
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
    return new Date(decoded.exp * 1000);
  }
}
