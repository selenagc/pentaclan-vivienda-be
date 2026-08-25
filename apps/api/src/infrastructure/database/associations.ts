import { DepartmentModel } from './models/DepartmentModel.js';
import { ProvinceModel } from './models/ProvinceModel.js';
import { MunicipalityModel } from './models/MunicipalityModel.js';
import { PublicEntityModel } from './models/PublicEntityModel.js';
import { ProjectModel } from './models/ProjectModel.js';
import { UserModel } from './models/UserModel.js';

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
