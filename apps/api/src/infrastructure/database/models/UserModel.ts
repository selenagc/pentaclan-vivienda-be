import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';
import { sequelize } from '../sequelize.js';
import type { Role } from '../../../domain/types/Role.js';

export class UserModel extends Model<InferAttributes<UserModel>, InferCreationAttributes<UserModel>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare email: string;
  declare passwordHash: string;
  declare role: Role;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

UserModel.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(180),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash',
    },
    role: {
      type: DataTypes.ENUM('admin', 'social_lead', 'technical_lead', 'project_supervisor'),
      allowNull: false,
      defaultValue: 'social_lead',
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
    tableName: 'users',
    modelName: 'User',
  },
);
