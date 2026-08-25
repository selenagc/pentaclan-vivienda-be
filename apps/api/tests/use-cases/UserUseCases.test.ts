import { CreateUserUseCase } from '../../src/application/users/CreateUserUseCase.js';
import { DeleteUserUseCase } from '../../src/application/users/DeleteUserUseCase.js';
import { UpdateMeUseCase } from '../../src/application/users/UpdateMeUseCase.js';
import type { PasswordService } from '../../src/application/services/PasswordService.js';
import type { User } from '../../src/domain/entities/User.js';
import type {
  CreateUserInput,
  ListUsersQuery,
  UpdateUserInput,
  UserRepository,
} from '../../src/domain/repositories/UserRepository.js';
import type { Role } from '../../src/domain/types/Role.js';
import type { PageResult } from '../../src/domain/types/Pagination.js';

class FakePasswordService {
  async hash(plain: string): Promise<string> {
    return `hashed:${plain}`;
  }
  async compare(plain: string, hash: string): Promise<boolean> {
    return hash === `hashed:${plain}`;
  }
}

const passwords = new FakePasswordService() as unknown as PasswordService;

class InMemoryUserRepository implements UserRepository {
  public readonly items: User[] = [];
  private counter = 0;

  async findById(id: string): Promise<User | null> {
    return this.items.find((u) => u.id === id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.items.find((u) => u.email === email) ?? null;
  }

  async create(input: CreateUserInput): Promise<User> {
    this.counter += 1;
    const now = new Date();
    const user: User = {
      id: `user-${this.counter}`,
      name: input.name,
      email: input.email,
      passwordHash: input.passwordHash,
      role: input.role,
      createdAt: now,
      updatedAt: now,
    };
    this.items.push(user);
    return user;
  }

  async update(id: string, input: UpdateUserInput): Promise<User | null> {
    const idx = this.items.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.items[idx] = { ...this.items[idx], ...input, updatedAt: new Date() };
    return this.items[idx];
  }

  async delete(id: string): Promise<boolean> {
    const idx = this.items.findIndex((u) => u.id === id);
    if (idx === -1) return false;
    this.items.splice(idx, 1);
    return true;
  }

  async list(_query: ListUsersQuery): Promise<PageResult<User>> {
    return { data: this.items, total: this.items.length };
  }

  async countByRole(role: Role): Promise<number> {
    return this.items.filter((u) => u.role === role).length;
  }
}

describe('CreateUserUseCase', () => {
  it('hashes the password and never returns passwordHash', async () => {
    const repo = new InMemoryUserRepository();
    const useCase = new CreateUserUseCase(repo, passwords);

    const user = await useCase.execute({
      name: 'Alice',
      email: 'alice@pentaclan.com',
      password: 'secret123',
      role: 'social_lead',
    });

    expect(user).not.toHaveProperty('passwordHash');
    expect(user.role).toBe('social_lead');
    expect(repo.items[0].passwordHash).toBe('hashed:secret123');
  });

  it('rejects a duplicate email with a conflict', async () => {
    const repo = new InMemoryUserRepository();
    const useCase = new CreateUserUseCase(repo, passwords);

    await useCase.execute({
      name: 'Alice',
      email: 'dup@pentaclan.com',
      password: 'secret123',
      role: 'social_lead',
    });

    await expect(
      useCase.execute({
        name: 'Bob',
        email: 'dup@pentaclan.com',
        password: 'secret123',
        role: 'technical_lead',
      }),
    ).rejects.toThrow('Email already in use');
  });
});

describe('UpdateMeUseCase', () => {
  it('updates own fields and never changes the role', async () => {
    const repo = new InMemoryUserRepository();
    const created = await repo.create({
      name: 'Carol',
      email: 'carol@pentaclan.com',
      passwordHash: 'x',
      role: 'project_supervisor',
    });
    const useCase = new UpdateMeUseCase(repo, passwords);

    const updated = await useCase.execute({ userId: created.id, name: 'Carol Edited' });

    expect(updated.name).toBe('Carol Edited');
    expect(updated.role).toBe('project_supervisor');
    expect(updated).not.toHaveProperty('passwordHash');
  });

  it('rejects taking an email already used by another user', async () => {
    const repo = new InMemoryUserRepository();
    await repo.create({ name: 'A', email: 'taken@pentaclan.com', passwordHash: 'x', role: 'social_lead' });
    const me = await repo.create({ name: 'B', email: 'me@pentaclan.com', passwordHash: 'x', role: 'social_lead' });
    const useCase = new UpdateMeUseCase(repo, passwords);

    await expect(
      useCase.execute({ userId: me.id, email: 'taken@pentaclan.com' }),
    ).rejects.toThrow('Email already in use');
  });
});

describe('DeleteUserUseCase', () => {
  it('prevents deleting your own account', async () => {
    const repo = new InMemoryUserRepository();
    const admin = await repo.create({ name: 'Admin', email: 'a@pentaclan.com', passwordHash: 'x', role: 'admin' });
    await repo.create({ name: 'Admin2', email: 'a2@pentaclan.com', passwordHash: 'x', role: 'admin' });
    const useCase = new DeleteUserUseCase(repo);

    await expect(useCase.execute({ id: admin.id, requesterId: admin.id })).rejects.toThrow(
      'your own account',
    );
  });

  it('prevents deleting the last admin', async () => {
    const repo = new InMemoryUserRepository();
    const admin = await repo.create({ name: 'Admin', email: 'a@pentaclan.com', passwordHash: 'x', role: 'admin' });
    const social = await repo.create({ name: 'S', email: 's@pentaclan.com', passwordHash: 'x', role: 'social_lead' });
    const useCase = new DeleteUserUseCase(repo);

    await expect(useCase.execute({ id: admin.id, requesterId: social.id })).rejects.toThrow(
      'last admin',
    );
  });

  it('deletes a regular user', async () => {
    const repo = new InMemoryUserRepository();
    const admin = await repo.create({ name: 'Admin', email: 'a@pentaclan.com', passwordHash: 'x', role: 'admin' });
    const social = await repo.create({ name: 'S', email: 's@pentaclan.com', passwordHash: 'x', role: 'social_lead' });
    const useCase = new DeleteUserUseCase(repo);

    await useCase.execute({ id: social.id, requesterId: admin.id });

    expect(repo.items).toHaveLength(1);
    expect(repo.items[0].id).toBe(admin.id);
  });
});
