import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';
import { sequelize } from '../sequelize.js';

export class DiagnosticPhotoModel extends Model<
  InferAttributes<DiagnosticPhotoModel>,
  InferCreationAttributes<DiagnosticPhotoModel>
> {
  declare id: CreationOptional<number>;
  declare diagnosticRecordId: string;
  declare photoType: string;
  declare url: string;
  declare description: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

DiagnosticPhotoModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_diagnostic_photo',
    },
    diagnosticRecordId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      field: 'id_diagnostic_record',
    },
    photoType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'photo_type',
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'url',
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'description',
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
    tableName: 'diagnostic_photos',
    modelName: 'DiagnosticPhoto',
  },
);
