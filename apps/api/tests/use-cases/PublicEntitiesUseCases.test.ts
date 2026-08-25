import { ListPublicEntitiesUseCase } from '../../src/application/public-entities/ListPublicEntitiesUseCase.js';
import { GetPublicEntityUseCase } from '../../src/application/public-entities/GetPublicEntityUseCase.js';
import { NotFoundError } from '../../src/shared/errors/NotFoundError.js';
import type { PublicEntity } from '../../src/domain/entities/PublicEntity.js';
import type { PublicEntityRepository } from '../../src/domain/repositories/PublicEntityRepository.js';

const NIT_AEVIVIENDA = 192310023;

class InMemoryPublicEntityRepository implements PublicEntityRepository {
  // El catalogo es general: AEVivienda es una entrada mas, no la unica.
  public readonly publicEntities: PublicEntity[] = [
    { id: 1, taxId: NIT_AEVIVIENDA, name: 'Agencia Estatal de Vivienda', acronym: 'AEVIVIENDA' },
    { id: 2, taxId: 192310099, name: 'Otra PublicEntity Publica', acronym: 'OEP' },
  ];

  async list(): Promise<PublicEntity[]> {
    return this.publicEntities;
  }

  async findById(id: number): Promise<PublicEntity | null> {
    return this.publicEntities.find((e) => e.id === id) ?? null;
  }
}

describe('PublicEntity use cases', () => {
  let repo: InMemoryPublicEntityRepository;

  beforeEach(() => {
    repo = new InMemoryPublicEntityRepository();
  });

  it('lists every public entity', async () => {
    const result = await new ListPublicEntitiesUseCase(repo).execute();
    expect(result).toHaveLength(2);
  });

  it('each public entity appears once and its tax id is unique', async () => {
    const result = await new ListPublicEntitiesUseCase(repo).execute();
    // El NIT es la clave natural: sin duplicados por departamento (PV-19).
    expect(new Set(result.map((e) => e.taxId)).size).toBe(result.length);
  });

  it('returns the requested public entity by id', async () => {
    const result = await new GetPublicEntityUseCase(repo).execute(1);
    expect(result.id).toBe(1);
    expect(result.acronym).toBe('AEVIVIENDA');
    expect(result.taxId).toBe(NIT_AEVIVIENDA);
  });

  it('fails with 404 when the public entity does not exist', async () => {
    await expect(new GetPublicEntityUseCase(repo).execute(999)).rejects.toBeInstanceOf(NotFoundError);
  });
});
