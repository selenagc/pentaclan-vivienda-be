import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional, type NonAttribute } from 'sequelize';
import { sequelize } from '../sequelize.js';
import type { DepartmentModel } from './DepartmentModel.js';

export class ProvinceModel extends Model<
  InferAttributes<ProvinceModel>,
  InferCreationAttributes<ProvinceModel>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare departmentId: number;
  declare department?: NonAttribute<DepartmentModel>;
}

ProvinceModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_province',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'province_name',
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_department',
    },
  },
  {
    sequelize,
    tableName: 'provinces',
    modelName: 'Province',
    timestamps: false,
  },
);
