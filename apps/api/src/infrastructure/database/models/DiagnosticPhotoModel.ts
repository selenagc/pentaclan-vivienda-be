import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from 'sequelize';
import { sequelize } from '../sequelize.js';

export class DiagnosticPhotoModel extends Model<
  InferAttributes<DiagnosticPhotoModel>,
  InferCreationAttributes<DiagnosticPhotoModel>
> {
  declare id: CreationOptional<number>;
  declare diagnosticRecordId: string;
  declare category: CreationOptional<string>;
  declare photoType: string;
  declare s3Key: string;
  declare capturedAt: CreationOptional<Date>;
  declare captureLatitude: CreationOptional<number | null>;
  declare captureLongitude: CreationOptional<number | null>;
  declare mimeType: CreationOptional<string>;
  declare fileSizeBytes: CreationOptional<number>;
  declare url: CreationOptional<string | null>;
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
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'technical',
      field: 'category',
    },
    photoType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'photo_type',
    },
    s3Key: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 's3_key',
    },
    capturedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'captured_at',
    },
    captureLatitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
      field: 'capture_latitude',
    },
    captureLongitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
      field: 'capture_longitude',
    },
    mimeType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'image/jpeg',
      field: 'mime_type',
    },
    fileSizeBytes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'file_size_bytes',
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: true,
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
