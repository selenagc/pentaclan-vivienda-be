import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional, type NonAttribute } from 'sequelize';
import { sequelize } from '../sequelize.js';
import type { UserModel } from './UserModel.js';
import type { MunicipalityModel } from './MunicipalityModel.js';
import type { PublicEntityModel } from './PublicEntityModel.js';

export class ProjectModel extends Model<
  InferAttributes<ProjectModel>,
  InferCreationAttributes<ProjectModel>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare contractNo: string;
  declare publicEntityId: number;
  declare municipalityId: number;
  declare userId: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare user?: NonAttribute<UserModel>;
  declare municipality?: NonAttribute<MunicipalityModel>;
  declare publicEntity?: NonAttribute<PublicEntityModel>;
}

ProjectModel.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      field: 'id_project',
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'project_name',
    },
    contractNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'contract_no',
    },
    publicEntityId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'id_public_entity',
    },
    municipalityId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'id_municipality',
    },
    userId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      field: 'id_user',
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
    tableName: 'projects',
    modelName: 'Project',
  },
);
