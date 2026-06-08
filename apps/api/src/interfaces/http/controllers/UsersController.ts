import type { RequestHandler } from 'express';
import { SequelizeUserRepository } from '../../../infrastructure/repositories/SequelizeUserRepository.js';
import { PasswordService } from '../../../application/services/PasswordService.js';
import { CreateUserUseCase } from '../../../application/users/CreateUserUseCase.js';
import { GetUserUseCase } from '../../../application/users/GetUserUseCase.js';
import { ListUsersUseCase } from '../../../application/users/ListUsersUseCase.js';
import { UpdateUserUseCase } from '../../../application/users/UpdateUserUseCase.js';
import { DeleteUserUseCase } from '../../../application/users/DeleteUserUseCase.js';
import { UpdateMeUseCase } from '../../../application/users/UpdateMeUseCase.js';
import { asyncHandler } from '../../../shared/http/asyncHandler.js';
import { created, noContent, ok, paginated } from '../../../shared/http/responses.js';
import { buildPaginationMeta } from '../../../shared/http/pagination.js';
import { UnauthorizedError } from '../../../shared/errors/UnauthorizedError.js';
import type { Role } from '../../../domain/types/Role.js';

const repo = new SequelizeUserRepository();
const passwordService = new PasswordService();
const createUseCase = new CreateUserUseCase(repo, passwordService);
const getUseCase = new GetUserUseCase(repo);
const listUseCase = new ListUsersUseCase(repo);
const updateUseCase = new UpdateUserUseCase(repo, passwordService);
const deleteUseCase = new DeleteUserUseCase(repo);
const updateMeUseCase = new UpdateMeUseCase(repo, passwordService);

export const createUser: RequestHandler = asyncHandler(async (req, res) => {
  const user = await createUseCase.execute(req.body);
  created(res, user, 'User created');
});

export const getUser: RequestHandler = asyncHandler(async (req, res) => {
  const user = await getUseCase.execute(req.params.id);
  ok(res, user);
});

export const updateUser: RequestHandler = asyncHandler(async (req, res) => {
  const user = await updateUseCase.execute(req.params.id, req.body);
  ok(res, user, 'User updated');
});

export const deleteUser: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  await deleteUseCase.execute({ id: req.params.id, requesterId: req.user.id });
  noContent(res);
});

export const listUsers: RequestHandler = asyncHandler(async (req, res) => {
  const q = req.query as Record<string, string | undefined>;
  const page = Number(q.page) || 1;
  const limit = Number(q.limit) || 20;
  const offset = (page - 1) * limit;

  const result = await listUseCase.execute({
    pagination: { page, limit, offset },
    sort: {
      sortBy: q.sortBy ?? 'createdAt',
      sortOrder: (q.sortOrder as 'asc' | 'desc') ?? 'desc',
    },
    search: q.search,
    role: q.role as Role | undefined,
  });

  paginated(res, result.data, buildPaginationMeta(page, limit, result.total));
});

export const updateMe: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const user = await updateMeUseCase.execute({
    userId: req.user.id,
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  ok(res, user, 'Profile updated');
});
