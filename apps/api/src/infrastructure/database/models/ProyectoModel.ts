import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional, type NonAttribute } from 'sequelize';
import { sequelize } from '../sequelize.js';
import type { UserModel } from './UserModel.js';
import type { MunicipioModel } from './MunicipioModel.js';
import type { EntidadPublicaModel } from './EntidadPublicaModel.js';

export class ProyectoModel extends Model<
  InferAttributes<ProyectoModel>,
  InferCreationAttributes<ProyectoModel>
> {
  declare id: CreationOptional<string>;
  declare nombre: string;
  declare nroContrato: string;
  declare entidadPublicaId: number;
  declare municipioId: number;
  declare usuarioId: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare usuario?: NonAttribute<UserModel>;
  declare municipio?: NonAttribute<MunicipioModel>;
  declare entidadPublica?: NonAttribute<EntidadPublicaModel>;
}

ProyectoModel.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      field: 'id_proyecto',
    },
    nombre: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'nombre_proyecto',
    },
    nroContrato: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'nro_contrato',
    },
    entidadPublicaId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'id_entidad_publica',
    },
    municipioId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'id_municipio',
    },
    usuarioId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      field: 'id_usuario',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'proyectos',
    modelName: 'Proyecto',
  },
);
