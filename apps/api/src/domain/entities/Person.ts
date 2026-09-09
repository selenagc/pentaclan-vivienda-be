import type { DocumentIssuedIn } from '../types/DocumentIssuedIn.js';
import type { Sex } from '../types/Sex.js';

/**
 * Datos propios de la persona, sin el conyuge. Existe aparte de `Person` para
 * cortar la recursion: el conyuge es una persona completa, pero no se anida su
 * propio conyuge.
 */
export interface PersonData {
  id: string;
  /** Clave natural junto con `documentIssuedIn`. */
  documentNo: string;
  documentIssuedIn: DocumentIssuedIn;
  givenNames: string;
  paternalSurname: string;
  /** Opcional: hay gente que no lo tiene. */
  maternalSurname: string | null;
  phone: string | null;
  occupation: string | null;
  /**
   * `YYYY-MM-DD` y no `Date` a proposito. Sequelize devuelve DATEONLY como
   * string, y convertirlo a Date lo ancla a un huso horario: una fecha de
   * nacimiento boliviana serializada a UTC se corre un dia hacia atras. Se
   * guarda la fecha y nunca la edad, que se desactualiza sola.
   */
  birthDate: string;
  sex: Sex;
}

/**
 * Persona registrada. No tiene rol: "solicitante" y "beneficiario" son estados
 * de una postulacion, no tipos de persona. La misma persona puede ser titular
 * en un tramite y conyuge en otro.
 */
export interface Person extends PersonData {
  /**
   * Persona completa y no cuatro campos sueltos: hacen falta su fecha de
   * nacimiento y sexo para los mismos cortes demograficos que el titular
   * (adulto mayor, entre otros), y ademas permite detectar que el conyuge
   * postulo por su cuenta. Nulo cuando el titular no tiene conyuge.
   */
  spouse: PersonData | null;
  createdAt: Date;
  updatedAt: Date;
}
