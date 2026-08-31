import type { Person } from './Person.js';
import type { Property } from './Property.js';
import type { ApplicationStatus } from '../types/ApplicationStatus.js';

/**
 * Proyecto al que se postula, resumido. No se anida el proyecto completo: el
 * listado de postulaciones no necesita su entidad financiadora ni su ubicacion,
 * y traerlas multiplicaria el peso de cada fila.
 */
export interface ApplicationProject {
  id: string;
  name: string;
  contractNo: string;
}

/**
 * Postulacion: quien, que vivienda, a que proyecto y en que estado.
 *
 * Es el centro del modulo. Un solicitante es una postulacion `pending`; un
 * beneficiario es una misma postulacion en `approved`. Nada se mueve de tabla
 * al aprobar, solo cambia `status`, y por eso los rechazados siguen ahi con su
 * motivo, que es lo que exige la auditoria del programa.
 */
export interface Application {
  id: string;
  status: ApplicationStatus;
  /** Fecha del formulario en campo, que no siempre es la de captura. */
  submittedAt: Date;
  person: Person;
  /**
   * La vivienda a mejorar. Se guarda en la postulacion y no se deriva de la
   * persona: la misma persona puede postular a otro proyecto con otro inmueble,
   * y derivarlo corromperia el historico en cuanto se actualice.
   */
  property: Property;
  project: ApplicationProject;
  /** Auditoria: nombre del usuario que registro la postulacion. */
  userName: string;
  /**
   * Los tres quedan nulos mientras la postulacion no se decide. Los llena la
   * aprobacion o el rechazo (PV-31).
   */
  decidedAt: Date | null;
  decidedByName: string | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}
