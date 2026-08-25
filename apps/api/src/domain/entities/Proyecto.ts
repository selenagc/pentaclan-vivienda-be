/**
 * Ubicacion del proyecto, resuelta hasta el departamento. Se devuelve anidada
 * para que el cliente pueda mostrar "Sacaba (Chapare, Cochabamba)" sin volver a
 * consultar el catalogo geografico.
 */
export interface ProyectoMunicipio {
  id: number;
  nombre: string;
  provincia: { id: number; nombre: string };
  departamento: { id: number; nombre: string };
}

/**
 * Entidad financiadora del proyecto. Se devuelve anidada (y no solo el id) para
 * que el listado pueda mostrar el nombre sin consultar el catalogo aparte.
 */
export interface ProyectoEntidadPublica {
  id: number;
  nombre: string;
}

export interface Proyecto {
  id: string;
  nombre: string;
  nroContrato: string;
  entidadPublica: ProyectoEntidadPublica;
  municipio: ProyectoMunicipio;
  usuarioNombre: string;
  createdAt: Date;
  updatedAt: Date;
}
