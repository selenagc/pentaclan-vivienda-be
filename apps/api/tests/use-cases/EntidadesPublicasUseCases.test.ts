import { ListEntidadesUseCase } from '../../src/application/entidades/ListEntidadesUseCase.js';
import { GetEntidadUseCase } from '../../src/application/entidades/GetEntidadUseCase.js';
import { NotFoundError } from '../../src/shared/errors/NotFoundError.js';
import type { EntidadPublica } from '../../src/domain/entities/EntidadPublica.js';
import type { EntidadPublicaRepository } from '../../src/domain/repositories/EntidadPublicaRepository.js';

const NIT_AEVIVIENDA = 192310023;

class InMemoryEntidadPublicaRepository implements EntidadPublicaRepository {
  // El catalogo es general: AEVivienda es una entrada mas, no la unica.
  public readonly entidades: EntidadPublica[] = [
    { id: 1, nit: NIT_AEVIVIENDA, nombre: 'Agencia Estatal de Vivienda', sigla: 'AEVIVIENDA' },
    { id: 2, nit: 192310099, nombre: 'Otra Entidad Publica', sigla: 'OEP' },
  ];

  async list(): Promise<EntidadPublica[]> {
    return this.entidades;
  }

  async findById(id: number): Promise<EntidadPublica | null> {
    return this.entidades.find((e) => e.id === id) ?? null;
  }
}

describe('Entidades publicas use cases', () => {
  let repo: InMemoryEntidadPublicaRepository;

  beforeEach(() => {
    repo = new InMemoryEntidadPublicaRepository();
  });

  it('lista todas las entidades publicas', async () => {
    const result = await new ListEntidadesUseCase(repo).execute();
    expect(result).toHaveLength(2);
  });

  it('cada entidad aparece una sola vez y su NIT es unico', async () => {
    const result = await new ListEntidadesUseCase(repo).execute();
    // El NIT es la clave natural: sin duplicados por departamento (PV-19).
    expect(new Set(result.map((e) => e.nit)).size).toBe(result.length);
  });

  it('devuelve la entidad pedida por id', async () => {
    const result = await new GetEntidadUseCase(repo).execute(1);
    expect(result.id).toBe(1);
    expect(result.sigla).toBe('AEVIVIENDA');
    expect(result.nit).toBe(NIT_AEVIVIENDA);
  });

  it('falla con 404 si la entidad no existe', async () => {
    await expect(new GetEntidadUseCase(repo).execute(999)).rejects.toBeInstanceOf(NotFoundError);
  });
});
