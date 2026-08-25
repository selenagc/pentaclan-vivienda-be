import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional, type NonAttribute } from 'sequelize';
import { sequelize } from '../sequelize.js';
import type { ProvinceModel } from './ProvinceModel.js';

export class MunicipalityModel extends Model<
  InferAttributes<MunicipalityModel>,
  InferCreationAttributes<MunicipalityModel>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare provinceId: number;
  declare province?: NonAttribute<ProvinceModel>;
}

MunicipalityModel.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_municipality',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'municipality_name',
    },
    provinceId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'id_province',
    },
  },
  {
    sequelize,
    tableName: 'municipalities',
    modelName: 'Municipality',
    timestamps: false,
  },
);
