import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';
import { sequelize } from '../sequelize.js';

export class DepartmentModel extends Model<
  InferAttributes<DepartmentModel>,
  InferCreationAttributes<DepartmentModel>
> {
  declare id: CreationOptional<number>;
  declare name: string;
}

DepartmentModel.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_department',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: 'department_name',
    },
  },
  {
    sequelize,
    tableName: 'departments',
    modelName: 'Department',
    // Datos maestros: la tabla no lleva created_at / updated_at.
    timestamps: false,
  },
);
