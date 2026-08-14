import { DepartamentoModel } from './models/DepartamentoModel.js';
import { ProvinciaModel } from './models/ProvinciaModel.js';
import { MunicipioModel } from './models/MunicipioModel.js';
import { EntidadPublicaModel } from './models/EntidadPublicaModel.js';

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

// Catalogo de entidades publicas (PV-19): una entidad pertenece a un departamento.
DepartamentoModel.hasMany(EntidadPublicaModel, {
  foreignKey: 'departamentoId',
  sourceKey: 'id',
  as: 'entidadesPublicas',
  onDelete: 'RESTRICT',
});
EntidadPublicaModel.belongsTo(DepartamentoModel, {
  foreignKey: 'departamentoId',
  targetKey: 'id',
  as: 'departamento',
});
