/**
 * Estados de una postulacion. Aqui vive la distincion solicitante/beneficiario:
 * un beneficiario es una postulacion en `approved`, no una entidad aparte.
 *
 * PV-30 solo escribe `pending`. La transicion a los demas estados es de PV-31,
 * pero los valores se declaran desde ahora para que ese ticket no tenga que
 * migrar el CHECK de la tabla.
 */
export type ApplicationStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'withdrawn';

export const APPLICATION_STATUS_VALUES: ApplicationStatus[] = [
  'pending',
  'under_review',
  'approved',
  'rejected',
  'withdrawn',
];
