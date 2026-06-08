import type { RequestHandler } from 'express';
import { SequelizeUserRepository } from '../../../infrastructure/repositories/SequelizeUserRepository.js';
import { PasswordService } from '../../../application/services/PasswordService.js';
import { TokenService } from '../../../application/services/TokenService.js';
import { LoginUseCase } from '../../../application/auth/LoginUseCase.js';
import { GetMeUseCase } from '../../../application/auth/GetMeUseCase.js';
import { asyncHandler } from '../../../shared/http/asyncHandler.js';
import { ok } from '../../../shared/http/responses.js';
import { UnauthorizedError } from '../../../shared/errors/UnauthorizedError.js';

const userRepo = new SequelizeUserRepository();
const passwordService = new PasswordService();
const tokenService = new TokenService();

const loginUseCase = new LoginUseCase(userRepo, passwordService, tokenService);
const getMeUseCase = new GetMeUseCase(userRepo);

export const login: RequestHandler = asyncHandler(async (req, res) => {
  const result = await loginUseCase.execute(req.body);
  // Respuesta sin el envelope estandar (sin "success"/"message"), solo { data }.
  res.status(200).json({ data: result });
});

export const me: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const user = await getMeUseCase.execute(req.user.id);
  ok(res, user);
});
