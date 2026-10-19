import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type NonAttribute,
} from 'sequelize';
import { sequelize } from '../sequelize.js';
import type { UserModel } from './UserModel.js';
import type { ProjectModel } from './ProjectModel.js';

export class ProjectAssignmentModel extends Model<
  InferAttributes<ProjectAssignmentModel>,
  InferCreationAttributes<ProjectAssignmentModel>
> {
  declare id: CreationOptional<number>;
  declare userId: string;
  declare projectId: string;
  declare assignedAt: CreationOptional<Date>;
  declare active: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare user?: NonAttribute<UserModel>;
  declare project?: NonAttribute<ProjectModel>;
}

ProjectAssignmentModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_project_assignment',
    },
    userId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      field: 'id_user',
    },
    projectId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      field: 'id_project',
    },
    assignedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'assigned_at',
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'active',
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
    tableName: 'project_assignments',
    modelName: 'ProjectAssignment',
  },
);
