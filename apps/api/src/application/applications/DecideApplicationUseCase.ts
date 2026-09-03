import type { Application } from '../../domain/entities/Application.js';
import type {
  ApplicationRepository,
  DecideApplicationInput,
} from '../../domain/repositories/ApplicationRepository.js';
import {
  DECIDABLE_STATUSES,
  type ApplicationDecision,
} from '../../domain/types/ApplicationStatus.js';
import { ConflictError } from '../../shared/errors/ConflictError.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { ValidationError } from '../../shared/errors/ValidationError.js';

export interface DecideApplicationDto {
  decision: ApplicationDecision;
  /**
   * Usuario que decide. Sale de la sesion (req.user.id), nunca del cuerpo de la
   * peticion: el validator rechaza con 400 cualquier intento de enviarlo.
   */
  decidedBy: string;
  /** Obligatorio al rechazar, prohibido al aprobar. */
  rejectionReason?: string | null;
}

/**
 * Aprobar o rechazar una postulacion (PV-32).
 *
 * Es un caso de uso aparte de `UpdateApplicationUseCase` y no un campo mas del
 * formulario porque aqui esta la frontera entre solicitante y beneficiario:
 * aprobar no corrige un dato, cambia lo que la persona es frente al programa.
 * Tiene sus propias reglas de transicion y deja rastro de quien decidio.
 */
export class DecideApplicationUseCase {
  constructor(private readonly applications: ApplicationRepository) {}

  async execute(id: string, dto: DecideApplicationDto): Promise<Application> {
    const application = await this.applications.findById(id);
    if (!application) throw new NotFoundError(`Application ${id} not found`);

    this.assertDecidable(application);

    const rejectionReason = this.resolveRejectionReason(dto);

    if (dto.decision === 'approved') {
      await this.assertNoApprovedTwin(application);
    }

    const input: DecideApplicationInput = {
      status: dto.decision,
      decidedBy: dto.decidedBy,
      // La hora la pone el servidor: es un hecho de auditoria, no un dato de
      // campo como `submittedAt`.
      decidedAt: new Date(),
      rejectionReason,
    };

    const decided = await this.applications.decide(id, input);
    if (!decided) throw new NotFoundError(`Application ${id} not found`);

    return decided;
  }

  /**
   * Solo se decide sobre lo que sigue abierto. El mensaje nombra el estado
   * actual porque el operador necesita saber si alguien se le adelanto o si se
   * equivoco de ficha.
   */
  private assertDecidable(application: Application): void {
    if (DECIDABLE_STATUSES.includes(application.status)) return;

    throw new ConflictError(
      `This application is already ${application.status} and cannot be decided again`,
    );
  }

  /**
   * El motivo es la contraparte del rechazo: sin el, un rechazado es una fila
   * que nadie puede explicar seis meses despues. Al aprobar sobra, y aceptarlo
   * en silencio dejaria un motivo de rechazo colgado en un beneficiario.
   */
  private resolveRejectionReason(dto: DecideApplicationDto): string | null {
    if (dto.decision === 'rejected') {
      const reason = dto.rejectionReason?.trim();
      if (!reason) throw new ValidationError('A rejection needs a reason');
      return reason;
    }

    if (dto.rejectionReason) {
      throw new ValidationError('An approval cannot carry a rejection reason');
    }

    return null;
  }

  /**
   * La regla anti doble beneficio: una sola postulacion aprobada por vivienda y
   * proyecto. Marido y esposa pueden postular ambos la misma casa (dos filas
   * `pending`), pero solo una puede terminar aprobada.
   *
   * La base ya lo garantiza con un indice unico parcial; esto se adelanta para
   * devolver un mensaje que el operador entienda. Si dos aprobaciones llegan a
   * la vez, la carrera la corta el indice y sale un 409 igual, mas seco.
   */
  private async assertNoApprovedTwin(application: Application): Promise<void> {
    const approved = await this.applications.findApprovedByPropertyAndProject(
      application.property.id,
      application.project.id,
    );
    if (!approved || approved.id === application.id) return;

    const { givenNames, paternalSurname } = approved.person;
    throw new ConflictError(
      `This property already has an approved application in this project, under ${givenNames} ${paternalSurname}`,
    );
  }
}
