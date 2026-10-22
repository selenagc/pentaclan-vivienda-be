import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';
import { sequelize } from '../sequelize.js';

export class HousingHygieneModel extends Model<
  InferAttributes<HousingHygieneModel>,
  InferCreationAttributes<HousingHygieneModel>
> {
  declare diagnosticRecordId: string;
  declare greywaterDisposal: CreationOptional<string | null>;
  declare garbageDisposal: CreationOptional<string | null>;
  declare roomsCleanlinessStatus: CreationOptional<string | null>;
  declare yardCleanlinessStatus: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

HousingHygieneModel.init(
  {
    diagnosticRecordId: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      field: 'id_diagnostic_record',
    },
    greywaterDisposal: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'greywater_disposal',
    },
    garbageDisposal: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'garbage_disposal',
    },
    roomsCleanlinessStatus: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'rooms_cleanliness_status',
    },
    yardCleanlinessStatus: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'yard_cleanliness_status',
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
    tableName: 'housing_hygiene',
    modelName: 'HousingHygiene',
  },
);
