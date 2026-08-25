import { DepartamentoModel } from './models/DepartamentoModel.js';
import { ProvinciaModel } from './models/ProvinciaModel.js';
import { MunicipioModel } from './models/MunicipioModel.js';
import { EntidadPublicaModel } from './models/EntidadPublicaModel.js';
import { ProyectoModel } from './models/ProyectoModel.js';
import { UserModel } from './models/UserModel.js';

// Jerarquia del catalogo geografico: Departamento -> Provincia -> Municipio.
// Se declara aqui (y no dentro de cada modelo) para evitar imports circulares.
DepartamentoModel.hasMany(ProvinciaModel, {
  foreignKey: 'departamentoId',
  sourceKey: 'id',
  as: 'provincias',
  onDelete: 'RESTRICT',
});
ProvinciaModel.belongsTo(DepartamentoModel, {
  foreignKey: 'departamentoId',
  targetKey: 'id',
  as: 'departamento',
});

ProvinciaModel.hasMany(MunicipioModel, {
  foreignKey: 'provinciaId',
  sourceKey: 'id',
  as: 'municipios',
  onDelete: 'RESTRICT',
});
MunicipioModel.belongsTo(ProvinciaModel, {
  foreignKey: 'provinciaId',
  targetKey: 'id',
  as: 'provincia',
});

// Las entidades publicas no cuelgan de un departamento (PV-19): son un catalogo
// nacional. Si mas adelante hace falta cobertura departamental, va en una tabla
// puente, no en una FK aqui.

// Proyectos (PV-21): entidad financiadora y usuario creador. Ambas relaciones
// son RESTRICT, para que no se pueda borrar lo que un proyecto referencia.
EntidadPublicaModel.hasMany(ProyectoModel, {
  foreignKey: 'entidadPublicaId',
  sourceKey: 'id',
  as: 'proyectos',
  onDelete: 'RESTRICT',
});
ProyectoModel.belongsTo(EntidadPublicaModel, {
  foreignKey: 'entidadPublicaId',
  targetKey: 'id',
  as: 'entidadPublica',
});

// Ubicacion del proyecto: se resuelve hasta el departamento a traves de la
// jerarquia del catalogo, por eso alcanza con la FK al municipio.
MunicipioModel.hasMany(ProyectoModel, {
  foreignKey: 'municipioId',
  sourceKey: 'id',
  as: 'proyectos',
  onDelete: 'RESTRICT',
});
ProyectoModel.belongsTo(MunicipioModel, {
  foreignKey: 'municipioId',
  targetKey: 'id',
  as: 'municipio',
});

UserModel.hasMany(ProyectoModel, {
  foreignKey: 'usuarioId',
  sourceKey: 'id',
  as: 'proyectos',
  onDelete: 'RESTRICT',
});
ProyectoModel.belongsTo(UserModel, {
  foreignKey: 'usuarioId',
  targetKey: 'id',
  as: 'usuario',
});
