/**
 * Estados de una postulacion. Aqui vive la distincion solicitante/beneficiario:
 * un beneficiario es una postulacion en `approved`, no una entidad aparte.
 *
 * PV-30 solo escribe `pending`. PV-32 agrega la transicion a `approved` y
 * `rejected`. `withdrawn` sigue sin escritura: dar de baja a un beneficiario ya
 * aprobado es otra operacion, con reglas propias, y queda para su ticket.
 */
export type ApplicationStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'withdrawn';

export const APPLICATION_STATUS_VALUES: ApplicationStatus[] = [
  'pending',
  'under_review',
  'approved',
  'rejected',
  'withdrawn',
];

/** Los dos estados que puede fijar una decision (PV-32). */
export type ApplicationDecision = Extract<ApplicationStatus, 'approved' | 'rejected'>;

/**
 * Estados desde los que todavia se puede decidir. Los otros tres son terminales
 * a proposito: reabrir una decision ya tomada pisaria `decided_at` y
 * `id_decided_by`, que son justamente el rastro que la auditoria del programa
 * necesita. Corregir una decision equivocada es un caso aparte, no un segundo
 * POST sobre el mismo recurso.
 */
export const DECIDABLE_STATUSES: ApplicationStatus[] = ['pending', 'under_review'];
