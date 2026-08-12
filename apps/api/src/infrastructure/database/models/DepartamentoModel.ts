import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';
import { sequelize } from '../sequelize.js';

export class DepartamentoModel extends Model<
  InferAttributes<DepartamentoModel>,
  InferCreationAttributes<DepartamentoModel>
> {
  declare id: CreationOptional<number>;
  declare nombre: string;
}

DepartamentoModel.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_departamento',
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: 'nombre_departamento',
    },
  },
  {
    sequelize,
    tableName: 'departamentos',
    modelName: 'Departamento',
    // Datos maestros: la tabla no lleva created_at / updated_at.
    timestamps: false,
  },
);
