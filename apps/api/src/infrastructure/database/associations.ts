import { DepartmentModel } from './models/DepartmentModel.js';
import { ProvinceModel } from './models/ProvinceModel.js';
import { MunicipalityModel } from './models/MunicipalityModel.js';
import { PublicEntityModel } from './models/PublicEntityModel.js';
import { ProjectModel } from './models/ProjectModel.js';
import { UserModel } from './models/UserModel.js';
import { PropertyModel } from './models/PropertyModel.js';
import { PersonModel } from './models/PersonModel.js';
import { ApplicationModel } from './models/ApplicationModel.js';

// Jerarquia del catalogo geografico: Departamento -> Provincia -> Municipio.
// Se declara aqui (y no dentro de cada modelo) para evitar imports circulares.
DepartmentModel.hasMany(ProvinceModel, {
  foreignKey: 'departmentId',
  sourceKey: 'id',
  as: 'provinces',
  onDelete: 'RESTRICT',
});
ProvinceModel.belongsTo(DepartmentModel, {
  foreignKey: 'departmentId',
  targetKey: 'id',
  as: 'department',
});

ProvinceModel.hasMany(MunicipalityModel, {
  foreignKey: 'provinceId',
  sourceKey: 'id',
  as: 'municipalities',
  onDelete: 'RESTRICT',
});
MunicipalityModel.belongsTo(ProvinceModel, {
  foreignKey: 'provinceId',
  targetKey: 'id',
  as: 'province',
});

// Las entidades publicas no cuelgan de un departamento (PV-19): son un catalogo
// nacional. Si mas adelante hace falta cobertura departamental, va en una tabla
// puente, no en una FK aqui.

// Proyectos (PV-21): entidad financiadora y usuario creador. Ambas relaciones
// son RESTRICT, para que no se pueda borrar lo que un proyecto referencia.
PublicEntityModel.hasMany(ProjectModel, {
  foreignKey: 'publicEntityId',
  sourceKey: 'id',
  as: 'projects',
  onDelete: 'RESTRICT',
});
ProjectModel.belongsTo(PublicEntityModel, {
  foreignKey: 'publicEntityId',
  targetKey: 'id',
  as: 'publicEntity',
});

// Ubicacion del proyecto: se resuelve hasta el departamento a traves de la
// jerarquia del catalogo, por eso alcanza con la FK al municipio.
MunicipalityModel.hasMany(ProjectModel, {
  foreignKey: 'municipalityId',
  sourceKey: 'id',
  as: 'projects',
  onDelete: 'RESTRICT',
});
ProjectModel.belongsTo(MunicipalityModel, {
  foreignKey: 'municipalityId',
  targetKey: 'id',
  as: 'municipality',
});

UserModel.hasMany(ProjectModel, {
  foreignKey: 'userId',
  sourceKey: 'id',
  as: 'projects',
  onDelete: 'RESTRICT',
});
ProjectModel.belongsTo(UserModel, {
  foreignKey: 'userId',
  targetKey: 'id',
  as: 'user',
});

// Registro de solicitantes (PV-30).

// Ubicacion del inmueble: igual que el proyecto, la FK llega al municipio y el
// resto de la cadena sale de la jerarquia del catalogo.
MunicipalityModel.hasMany(PropertyModel, {
  foreignKey: 'municipalityId',
  sourceKey: 'id',
  as: 'properties',
  onDelete: 'RESTRICT',
});
PropertyModel.belongsTo(MunicipalityModel, {
  foreignKey: 'municipalityId',
  targetKey: 'id',
  as: 'municipality',
});

// El conyuge es otra persona de la misma tabla. La relacion se declara en un
// solo sentido, del titular al conyuge, que es lo que captura el formulario.
PersonModel.belongsTo(PersonModel, {
  foreignKey: 'spouseId',
  targetKey: 'id',
  as: 'spouse',
});

// La postulacion ata persona, vivienda y proyecto. Las tres son RESTRICT: si la
// postulacion existe, nada de lo que referencia se puede borrar por debajo.
PersonModel.hasMany(ApplicationModel, {
  foreignKey: 'personId',
  sourceKey: 'id',
  as: 'applications',
  onDelete: 'RESTRICT',
});
ApplicationModel.belongsTo(PersonModel, {
  foreignKey: 'personId',
  targetKey: 'id',
  as: 'person',
});

PropertyModel.hasMany(ApplicationModel, {
  foreignKey: 'propertyId',
  sourceKey: 'id',
  as: 'applications',
  onDelete: 'RESTRICT',
});
ApplicationModel.belongsTo(PropertyModel, {
  foreignKey: 'propertyId',
  targetKey: 'id',
  as: 'property',
});

ProjectModel.hasMany(ApplicationModel, {
  foreignKey: 'projectId',
  sourceKey: 'id',
  as: 'applications',
  onDelete: 'RESTRICT',
});
ApplicationModel.belongsTo(ProjectModel, {
  foreignKey: 'projectId',
  targetKey: 'id',
  as: 'project',
});

// Dos FK a users en la misma tabla, por eso los alias explicitos. Del lado de
// users solo se declara la inversa de `user` (quien registro): "las
// postulaciones que este usuario decidio" no la consulta nadie.
UserModel.hasMany(ApplicationModel, {
  foreignKey: 'userId',
  sourceKey: 'id',
  as: 'applications',
  onDelete: 'RESTRICT',
});
ApplicationModel.belongsTo(UserModel, {
  foreignKey: 'userId',
  targetKey: 'id',
  as: 'user',
});
ApplicationModel.belongsTo(UserModel, {
  foreignKey: 'decidedById',
  targetKey: 'id',
  as: 'decidedBy',
});
