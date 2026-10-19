/**
 * Ubicacion del inmueble, resuelta hasta el departamento. Misma forma que
 * `ProjectMunicipality`: se devuelve anidada para que el cliente pueda mostrar
 * "Sacaba (Chapare, Cochabamba)" sin volver a consultar el catalogo.
 */
export interface PropertyMunicipality {
  id: number;
  name: string;
  province: { id: number; name: string };
  department: { id: number; name: string };
}

/**
 * La vivienda a mejorar: el objeto real del programa. Existe por si misma y no
 * pertenece a nadie de forma permanente, porque el mismo inmueble puede volver
 * a postular mas adelante con otro ocupante. Quien lo habita en cada tramite lo
 * dice la postulacion, no esta entidad.
 */
export interface Property {
  id: string;
  /** Los tres son opcionales: en area rural la direccion suele ser la comunidad. */
  community: string | null;
  zone: string | null;
  address: string | null;
  /**
   * Obligatorias. Al no existir codigo catastral confiable, la ubicacion es lo
   * unico que identifica fisicamente la vivienda, y hace falta igual para
   * planificar y supervisar la obra.
   */
  latitude: number;
  longitude: number;
  municipality: PropertyMunicipality;
  createdAt: Date;
  updatedAt: Date;
}
