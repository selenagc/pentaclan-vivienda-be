import type { Application } from '../entities/Application.js';
import type { ApplicationDecision, ApplicationStatus } from '../types/ApplicationStatus.js';
import type { DocumentIssuedIn } from '../types/DocumentIssuedIn.js';
import type { Sex } from '../types/Sex.js';
import type { PageRequest, PageResult, SortRequest } from '../types/Pagination.js';

/** Datos de persona tal como llegan del formulario, sin id. */
export interface PersonInput {
  documentNo: string;
  documentIssuedIn: DocumentIssuedIn;
  givenNames: string;
  paternalSurname: string;
  maternalSurname: string | null;
  phone: string | null;
  occupation: string | null;
  birthDate: string;
  sex: Sex;
}

export interface PropertyInput {
  community: string | null;
  zone: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  municipalityId: number;
}

/**
 * Alta de una postulacion con todo lo que arrastra.
 *
 * El inmueble entra de dos formas porque no tiene clave natural: o el operador
 * eligio uno ya registrado en el buscador (`propertyId`), o levanto uno nuevo
 * (`property`). Exactamente uno de los dos.
 *
 * La persona no necesita esa distincion: el CI mas el lugar de expedicion la
 * identifican, asi que siempre llega completa y el repositorio decide si crea
 * una fila nueva o reutiliza la existente. El operador de campo llena el mismo
 * formulario sin tener que saber si esa persona ya estaba en el sistema.
 */
export interface RegisterApplicationInput {
  projectId: string;
  /** Auditoria: usuario que registra. Sale de la sesion, no del body. */
  userId: string;
  submittedAt: Date;
  person: PersonInput;
  /** Nulo cuando el titular no tiene conyuge. */
  spouse: PersonInput | null;
  propertyId: string | null;
  property: PropertyInput | null;
}

/**
 * `status` no aparece: cambiarlo es aprobar o rechazar, y eso es una operacion
 * con sus propias reglas y su propia auditoria (`decide`, PV-32), no una
 * edicion de formulario. Tampoco aparece `userId`, dato de auditoria inmutable.
 */
export interface UpdateApplicationInput {
  submittedAt?: Date;
  /** Correccion de los datos del titular; en campo los errores de tipeo abundan. */
  person?: Partial<PersonInput>;
  /** `null` desvincula al conyuge sin borrar a la persona. */
  spouse?: PersonInput | null;
  /** Cambiar a otro inmueble ya registrado. Excluyente con `property`. */
  propertyId?: string;
  /** Corregir los datos del inmueble actual. */
  property?: Partial<PropertyInput>;
}

/**
 * Decision sobre una postulacion (PV-32). Los tres campos de auditoria se
 * escriben juntos y de una sola vez: una fila decidida a la que le falte
 * `decidedBy` no le sirve a la auditoria del programa.
 *
 * `rejectionReason` viaja solo con `rejected`; aprobar no necesita motivo.
 */
export interface DecideApplicationInput {
  status: ApplicationDecision;
  /** Usuario que decide. Sale de la sesion, nunca del body. */
  decidedBy: string;
  decidedAt: Date;
  rejectionReason: string | null;
}

export interface ListApplicationsQuery {
  pagination: PageRequest;
  sort: SortRequest;
  /** Busca por nombres, apellidos o numero de documento. */
  search?: string;
  projectId?: string;
  /**
   * Estados admitidos, en OR. Una lista y no un valor suelto porque las dos
   * pantallas del padron se piden asi: los beneficiarios son
   * `['approved']`, y los solicitantes son «todos menos aprobados», que sin
   * lista habria que filtrar en el cliente y descuadraria el total y las
   * paginas, que los cuenta el servidor.
   *
   * Vacio o ausente significa "sin filtrar", no "ninguno".
   */
  statuses?: ApplicationStatus[];
  municipalityId?: number;
}

export interface ApplicationRepository {
  /**
   * Atomico: crea o reutiliza persona, conyuge e inmueble, y la postulacion,
   * todo en una transaccion. Es un solo metodo y no varios encadenados por el
   * caso de uso porque el formulario es uno solo: si fallara a la mitad
   * quedarian personas registradas sin postulacion, imposibles de encontrar y
   * de limpiar.
   */
  register(input: RegisterApplicationInput): Promise<Application>;
  findById(id: string): Promise<Application | null>;
  /**
   * Para devolver un 409 claro en vez de dejar que salte el indice unico. Se
   * busca por documento y no por id de persona porque al registrar todavia no
   * se sabe si esa persona existe: el CI es lo unico que se tiene en mano.
   */
  findByDocumentAndProject(
    documentNo: string,
    documentIssuedIn: DocumentIssuedIn,
    projectId: string,
  ): Promise<Application | null>;
  update(id: string, input: UpdateApplicationInput): Promise<Application | null>;
  /** Aplica la decision y sus tres campos de auditoria en una sola escritura. */
  decide(id: string, input: DecideApplicationInput): Promise<Application | null>;
  /**
   * Sostiene la regla anti doble beneficio antes de que salte el indice
   * `applications_property_project_approved_uq`: si la vivienda ya tiene un
   * aprobado en este proyecto, el caso de uso devuelve un 409 que nombra al
   * beneficiario en vez de un error de constraint que no le dice nada al
   * operador. Mismo criterio que `findByDocumentAndProject` al registrar.
   */
  findApprovedByPropertyAndProject(
    propertyId: string,
    projectId: string,
  ): Promise<Application | null>;
  /** Borrado logico: la fila queda con `deleted_at` y sale de los listados. */
  delete(id: string): Promise<boolean>;
  list(query: ListApplicationsQuery): Promise<PageResult<Application>>;
}
