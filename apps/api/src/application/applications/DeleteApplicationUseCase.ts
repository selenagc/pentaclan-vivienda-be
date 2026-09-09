import type { ApplicationRepository } from '../../domain/repositories/ApplicationRepository.js';
import { ConflictError } from '../../shared/errors/ConflictError.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';

export class DeleteApplicationUseCase {
  constructor(private readonly applications: ApplicationRepository) {}

  async execute(id: string): Promise<void> {
    const application = await this.applications.findById(id);
    if (!application) throw new NotFoundError(`Application ${id} not found`);

    // Una postulacion aprobada es un beneficiario: sacarla del padron no es un
    // borrado sino una baja, y eso deja rastro con el estado `withdrawn`.
    if (application.status === 'approved') {
      throw new ConflictError('An approved application cannot be deleted; withdraw it instead');
    }

    // Borrado logico: la fila queda con deleted_at y sale de los listados.
    await this.applications.delete(id);
  }
}
