import type { RequestHandler } from 'express';
import { SequelizeUserRepository } from '../../../infrastructure/repositories/SequelizeUserRepository.js';
import { SequelizeRefreshTokenRepository } from '../../../infrastructure/repositories/SequelizeRefreshTokenRepository.js';
import { PasswordService } from '../../../application/services/PasswordService.js';
import { TokenService } from '../../../application/services/TokenService.js';
import { LoginUseCase } from '../../../application/auth/LoginUseCase.js';
import { RefreshTokenUseCase } from '../../../application/auth/RefreshTokenUseCase.js';
import { LogoutUseCase } from '../../../application/auth/LogoutUseCase.js';
import { GetMeUseCase } from '../../../application/auth/GetMeUseCase.js';
import { asyncHandler } from '../../../shared/http/asyncHandler.js';
import { ok } from '../../../shared/http/responses.js';
import { UnauthorizedError } from '../../../shared/errors/UnauthorizedError.js';

const userRepo = new SequelizeUserRepository();
const refreshRepo = new SequelizeRefreshTokenRepository();
const passwordService = new PasswordService();
const tokenService = new TokenService();

const loginUseCase = new LoginUseCase(userRepo, refreshRepo, passwordService, tokenService);
const refreshUseCase = new RefreshTokenUseCase(userRepo, refreshRepo, tokenService);
const logoutUseCase = new LogoutUseCase(refreshRepo, tokenService);
const getMeUseCase = new GetMeUseCase(userRepo);

export const login: RequestHandler = asyncHandler(async (req, res) => {
  const result = await loginUseCase.execute(req.body);
  ok(res, result, 'Login successful');
});

export const refresh: RequestHandler = asyncHandler(async (req, res) => {
  const result = await refreshUseCase.execute(req.body);
  ok(res, result, 'Token refreshed');
});

export const logout: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const result = await logoutUseCase.execute({
    userId: req.user.id,
    refreshToken: req.body.refreshToken,
  });
  ok(res, result, 'Logged out');
});

export const me: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const user = await getMeUseCase.execute(req.user.id);
  ok(res, user);
});
