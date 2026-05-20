import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';
import { sequelize } from '../sequelize.js';
import type { ProjectStatus } from '../../../domain/types/ProjectStatus.js';

export class ProjectModel extends Model<
  InferAttributes<ProjectModel>,
  InferCreationAttributes<ProjectModel>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare description: string | null;
  declare status: ProjectStatus;
  declare startDate: Date | null;
  declare endDate: Date | null;
  declare clientId: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ProjectModel.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'paused', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'active',
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'start_date',
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'end_date',
    },
    clientId: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      field: 'client_id',
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
    indexes: [
      { fields: ['status'] },
      { fields: ['client_id'] },
      { fields: ['name'] },
    ],
  },
);
