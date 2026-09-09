import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional, type NonAttribute } from 'sequelize';
import { sequelize } from '../sequelize.js';
import type { ApplicationStatus } from '../../../domain/types/ApplicationStatus.js';
import type { PersonModel } from './PersonModel.js';
import type { PropertyModel } from './PropertyModel.js';
import type { ProjectModel } from './ProjectModel.js';
import type { UserModel } from './UserModel.js';

export class ApplicationModel extends Model<
  InferAttributes<ApplicationModel>,
  InferCreationAttributes<ApplicationModel>
> {
  declare id: CreationOptional<string>;
  declare personId: string;
  declare projectId: string;
  declare propertyId: string;
  declare status: CreationOptional<ApplicationStatus>;
  declare submittedAt: Date;
  declare userId: string;
  declare decidedAt: CreationOptional<Date | null>;
  declare decidedById: CreationOptional<string | null>;
  declare rejectionReason: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
  declare person?: NonAttribute<PersonModel>;
  declare property?: NonAttribute<PropertyModel>;
  declare project?: NonAttribute<ProjectModel>;
  declare user?: NonAttribute<UserModel>;
  declare decidedBy?: NonAttribute<UserModel>;
}

ApplicationModel.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      field: 'id_application',
    },
    personId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      field: 'id_person',
    },
    projectId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      field: 'id_project',
    },
    // La vivienda a mejorar. No se deriva de la persona: ver Application.ts.
    propertyId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      field: 'id_property',
    },
    // El CHECK vive en la migracion; aqui se valida antes de llegar a la base
    // para devolver 400 en vez de un error de constraint.
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pending',
    },
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'submitted_at',
    },
    // Auditoria: usuario que registro la postulacion. Se toma de la sesion.
    userId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      field: 'id_user',
    },
    decidedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'decided_at',
    },
    decidedById: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      field: 'id_decided_by',
    },
    rejectionReason: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'rejection_reason',
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
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'deleted_at',
    },
  },
  {
    sequelize,
    tableName: 'applications',
    modelName: 'Application',
    paranoid: true,
  },
);
