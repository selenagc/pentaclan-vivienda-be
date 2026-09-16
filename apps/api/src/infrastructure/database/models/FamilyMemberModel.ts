import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';
import { sequelize } from '../sequelize.js';

export class FamilyMemberModel extends Model<
  InferAttributes<FamilyMemberModel>,
  InferCreationAttributes<FamilyMemberModel>
> {
  declare id: CreationOptional<number>;
  declare diagnosticRecordId: string;
  declare fullName: string;
  declare relationship: string;
  declare age: CreationOptional<number | null>;
  declare occupation: CreationOptional<string | null>;
  declare hasDisability: CreationOptional<boolean>;
  declare disabilityType: CreationOptional<string | null>;
  declare disabilityDocument: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

FamilyMemberModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_family_member',
    },
    diagnosticRecordId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      field: 'id_diagnostic_record',
    },
    fullName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'full_name',
    },
    relationship: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'relationship',
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'age',
    },
    occupation: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'occupation',
    },
    hasDisability: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'has_disability',
    },
    disabilityType: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'disability_type',
    },
    disabilityDocument: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'disability_document',
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
    tableName: 'family_members',
    modelName: 'FamilyMember',
  },
);
