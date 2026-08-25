import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional, type NonAttribute } from 'sequelize';
import { sequelize } from '../sequelize.js';
import type { DepartamentoModel } from './DepartamentoModel.js';

export class ProvinciaModel extends Model<
  InferAttributes<ProvinciaModel>,
  InferCreationAttributes<ProvinciaModel>
> {
  declare id: CreationOptional<number>;
  declare nombre: string;
  declare departamentoId: number;
  declare departamento?: NonAttribute<DepartamentoModel>;
}

ProvinciaModel.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_provincia',
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'nombre_provincia',
    },
    departamentoId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'id_departamento',
    },
  },
  {
    sequelize,
    tableName: 'provincias',
    modelName: 'Provincia',
    timestamps: false,
  },
);
