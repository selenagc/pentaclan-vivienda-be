import type { Application } from '../../domain/entities/Application.js';
import type { ApplicationRepository } from '../../domain/repositories/ApplicationRepository.js';
import { ConflictError } from '../../shared/errors/ConflictError.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';

/**
 * Preseleccionar una postulacion (PV-37).
 *
 * Pasa el estado de una postulacion de 'pending' a 'under_review'
 * tras la evaluacion de campo o diagnostico tecnico/social.
 * Solo puede preseleccionarse una postulacion que siga en 'pending'.
 */
export class PreselectApplicationUseCase {
  constructor(private readonly applications: ApplicationRepository) {}

  async execute(id: string): Promise<Application> {
    const application = await this.applications.findById(id);
    if (!application) throw new NotFoundError(`Application ${id} not found`);

    this.assertPreselectable(application);

    const preselected = await this.applications.preselect(id);
    if (!preselected) throw new NotFoundError(`Application ${id} not found`);

    return preselected;
  }

  /**
   * Solo se preselecciona lo que sigue en 'pending'.
   */
  private assertPreselectable(application: Application): void {
    if (application.status === 'pending') return;

    throw new ConflictError(
      `This application is already ${application.status} and cannot be preselected`,
      'APPLICATION_NOT_PENDING',
    );
  }
}
