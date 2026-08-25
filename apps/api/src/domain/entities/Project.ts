/**
 * Ubicacion del proyecto, resuelta hasta el departamento. Se devuelve anidada
 * para que el cliente pueda mostrar "Sacaba (Chapare, Cochabamba)" sin volver a
 * consultar el catalogo geografico.
 */
export interface ProjectMunicipality {
  id: number;
  name: string;
  province: { id: number; name: string };
  department: { id: number; name: string };
}

/**
 * Entidad financiadora del proyecto. Se devuelve anidada (y no solo el id) para
 * que el listado pueda mostrar el nombre sin consultar el catalogo aparte.
 */
export interface ProjectPublicEntity {
  id: number;
  name: string;
}

export interface Project {
  id: string;
  name: string;
  contractNo: string;
  publicEntity: ProjectPublicEntity;
  municipality: ProjectMunicipality;
  userName: string;
  createdAt: Date;
  updatedAt: Date;
}
