import { CreateProjectUseCase } from '../../src/application/projects/CreateProjectUseCase.js';
import type { Project } from '../../src/domain/entities/Project.js';
import type {
  CreateProjectInput,
  ListProjectsQuery,
  ProjectRepository,
  UpdateProjectInput,
} from '../../src/domain/repositories/ProjectRepository.js';
import type { PageResult } from '../../src/domain/types/Pagination.js';

class InMemoryProjectRepository implements ProjectRepository {
  public readonly items: Project[] = [];
  private counter = 0;

  async create(input: CreateProjectInput): Promise<Project> {
    this.counter += 1;
    const now = new Date();
    const project: Project = {
      id: `project-${this.counter}`,
      name: input.name,
      description: input.description,
      status: input.status,
      startDate: input.startDate,
      endDate: input.endDate,
      clientId: input.clientId,
      createdAt: now,
      updatedAt: now,
    };
    this.items.push(project);
    return project;
  }

  async findById(id: string): Promise<Project | null> {
    return this.items.find((p) => p.id === id) ?? null;
  }

  async update(id: string, input: UpdateProjectInput): Promise<Project | null> {
    const idx = this.items.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.items[idx] = { ...this.items[idx], ...input, updatedAt: new Date() };
    return this.items[idx];
  }

  async delete(id: string): Promise<boolean> {
    const idx = this.items.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    this.items.splice(idx, 1);
    return true;
  }

  async list(_query: ListProjectsQuery): Promise<PageResult<Project>> {
    return { data: this.items, total: this.items.length };
  }
}

describe('CreateProjectUseCase', () => {
  it('creates a project with provided fields and defaults status to active', async () => {
    const repo = new InMemoryProjectRepository();
    const useCase = new CreateProjectUseCase(repo);

    const project = await useCase.execute({
      name: 'Casa Bonita',
    });

    expect(project.id).toBeDefined();
    expect(project.name).toBe('Casa Bonita');
    expect(project.status).toBe('active');
    expect(project.description).toBeNull();
    expect(project.startDate).toBeNull();
    expect(project.endDate).toBeNull();
    expect(project.clientId).toBeNull();
    expect(repo.items).toHaveLength(1);
  });

  it('respects an explicit status and parses date strings', async () => {
    const repo = new InMemoryProjectRepository();
    const useCase = new CreateProjectUseCase(repo);

    const project = await useCase.execute({
      name: 'Edificio Norte',
      description: 'Construction phase',
      status: 'paused',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      clientId: '00000000-0000-4000-8000-000000000001',
    });

    expect(project.status).toBe('paused');
    expect(project.description).toBe('Construction phase');
    expect(project.startDate).toBeInstanceOf(Date);
    expect(project.endDate).toBeInstanceOf(Date);
    expect(project.startDate?.toISOString().startsWith('2026-01-01')).toBe(true);
    expect(project.clientId).toBe('00000000-0000-4000-8000-000000000001');
  });
});
