import type { Application } from '../../domain/entities/Application.js';
import type {
  ApplicationRepository,
  PersonInput,
  PropertyInput,
} from '../../domain/repositories/ApplicationRepository.js';
import type { ProjectRepository } from '../../domain/repositories/ProjectRepository.js';
import type { PropertyRepository } from '../../domain/repositories/PropertyRepository.js';
import type { GeographyRepository } from '../../domain/repositories/GeographyRepository.js';
import { ConflictError } from '../../shared/errors/ConflictError.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { ValidationError } from '../../shared/errors/ValidationError.js';

/**
 * `status` no aparece: aprobar o rechazar es una operacion con sus propias
 * reglas y su propia auditoria (PV-31), no una edicion de formulario. `userId`
 * tampoco: es dato de auditoria inmutable.
 */
export interface UpdateApplicationDto {
  submittedAt?: Date;
  person?: Partial<PersonInput>;
  /** `null` desvincula al conyuge sin borrar a esa persona. */
  spouse?: PersonInput | null;
  /** Apuntar a otro inmueble ya registrado. Excluyente con `property`. */
  propertyId?: string;
  /** Corregir los datos del inmueble actual, sin cambiar de inmueble. */
  property?: Partial<PropertyInput>;
}

export class UpdateApplicationUseCase {
  constructor(
    private readonly applications: ApplicationRepository,
    private readonly projects: ProjectRepository,
    private readonly properties: PropertyRepository,
    private readonly geography: GeographyRepository,
  ) {}

  async execute(id: string, dto: UpdateApplicationDto): Promise<Application> {
    const application = await this.applications.findById(id);
    if (!application) throw new NotFoundError(`Application ${id} not found`);

    if (dto.propertyId !== undefined && dto.property !== undefined) {
      throw new ValidationError('Send either propertyId or property, not both');
    }

    if (dto.spouse && this.sameDocumentAsApplicant(application, dto.spouse)) {
      throw new ValidationError('The applicant and the spouse cannot be the same person');
    }

    // Solo se toca el proyecto si hay que revalidar la ubicacion: cambiar de
    // inmueble o mover el actual de municipio puede sacarlo del area del
    // proyecto, y esa es la regla que no se puede quebrar por una edicion.
    const nextMunicipalityId = await this.resolveNextMunicipality(dto);
    if (nextMunicipalityId !== null) {
      const project = await this.projects.findById(application.project.id);
      if (!project) throw new NotFoundError(`Project ${application.project.id} not found`);

      if (nextMunicipalityId !== project.municipality.id) {
        throw new ConflictError(
          `The property must be located in ${project.municipality.name}, where the project is carried out`,
        );
      }
    }

    const updated = await this.applications.update(id, dto);
    if (!updated) throw new NotFoundError(`Application ${id} not found`);

    return updated;
  }

  private sameDocumentAsApplicant(application: Application, spouse: PersonInput): boolean {
    return (
      application.person.documentNo === spouse.documentNo &&
      application.person.documentIssuedIn === spouse.documentIssuedIn
    );
  }

  /** `null` cuando la edicion no mueve la vivienda y no hay nada que revalidar. */
  private async resolveNextMunicipality(dto: UpdateApplicationDto): Promise<number | null> {
    if (dto.propertyId !== undefined) {
      const found = await this.properties.findById(dto.propertyId);
      if (!found) throw new NotFoundError(`Property ${dto.propertyId} not found`);
      return found.municipality.id;
    }

    if (dto.property?.municipalityId !== undefined) {
      const exists = await this.geography.municipalityExists(dto.property.municipalityId);
      if (!exists) {
        throw new NotFoundError(`Municipality ${dto.property.municipalityId} not found`);
      }
      return dto.property.municipalityId;
    }

    return null;
  }
}
