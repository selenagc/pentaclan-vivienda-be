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

export interface RegisterApplicationDto {
  projectId: string;
  /**
   * Se toma de la sesion (req.user.id), nunca del cuerpo de la peticion.
   * El validator rechaza con 400 cualquier intento de enviarlo desde el cliente.
   */
  userId: string;
  /** Fecha del formulario en campo, que no siempre es la de captura. */
  submittedAt: Date;
  person: PersonInput;
  spouse: PersonInput | null;
  /** Inmueble ya registrado, elegido en el buscador. Excluyente con `property`. */
  propertyId: string | null;
  /** Inmueble nuevo levantado en el formulario. */
  property: PropertyInput | null;
}

/**
 * Alta de una postulacion. El formulario es uno solo, asi que este caso de uso
 * valida todo antes de tocar la base y delega la escritura en un unico metodo
 * transaccional del repositorio.
 */
export class RegisterApplicationUseCase {
  constructor(
    private readonly applications: ApplicationRepository,
    private readonly projects: ProjectRepository,
    private readonly properties: PropertyRepository,
    private readonly geography: GeographyRepository,
  ) {}

  async execute(dto: RegisterApplicationDto): Promise<Application> {
    const project = await this.projects.findById(dto.projectId);
    if (!project) throw new NotFoundError(`Project ${dto.projectId} not found`);

    if (dto.spouse && this.sameDocument(dto.person, dto.spouse)) {
      throw new ValidationError('The applicant and the spouse cannot be the same person');
    }

    const municipalityId = await this.resolvePropertyMunicipality(dto.propertyId, dto.property);

    // La regla del programa: solo se mejoran viviendas del municipio donde se
    // ejecuta el proyecto.
    if (municipalityId !== project.municipality.id) {
      throw new ConflictError(
        `The property must be located in ${project.municipality.name}, where the project is carried out`,
      );
    }

    const duplicate = await this.applications.findByDocumentAndProject(
      dto.person.documentNo,
      dto.person.documentIssuedIn,
      dto.projectId,
    );
    if (duplicate) throw new ConflictError('This person already applied to this project');

    return this.applications.register(dto);
  }

  private sameDocument(a: PersonInput, b: PersonInput): boolean {
    return a.documentNo === b.documentNo && a.documentIssuedIn === b.documentIssuedIn;
  }

  /** Devuelve el municipio de la vivienda, venga elegida del buscador o nueva. */
  private async resolvePropertyMunicipality(
    propertyId: string | null,
    property: PropertyInput | null,
  ): Promise<number> {
    if (propertyId && property) {
      throw new ValidationError('Send either propertyId or property, not both');
    }

    if (propertyId) {
      const found = await this.properties.findById(propertyId);
      if (!found) throw new NotFoundError(`Property ${propertyId} not found`);
      return found.municipality.id;
    }

    if (property) {
      const exists = await this.geography.municipalityExists(property.municipalityId);
      if (!exists) throw new NotFoundError(`Municipality ${property.municipalityId} not found`);
      return property.municipalityId;
    }

    throw new ValidationError('Either propertyId or property is required');
  }
}
