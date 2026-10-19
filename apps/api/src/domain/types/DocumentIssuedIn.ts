/**
 * Departamento donde se expidio el CI. Es parte de la clave natural de la
 * persona: el numero de carnet solo es unico junto con el lugar de expedicion.
 */
export type DocumentIssuedIn = 'LP' | 'CB' | 'SC' | 'OR' | 'PT' | 'TJ' | 'CH' | 'BE' | 'PD';

export const DOCUMENT_ISSUED_IN_VALUES: DocumentIssuedIn[] = [
  'LP',
  'CB',
  'SC',
  'OR',
  'PT',
  'TJ',
  'CH',
  'BE',
  'PD',
];
