import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';
import { sequelize } from '../sequelize.js';

export class HousingCharacteristicModel extends Model<
  InferAttributes<HousingCharacteristicModel>,
  InferCreationAttributes<HousingCharacteristicModel>
> {
  declare diagnosticRecordId: string;
  declare housingTypology: CreationOptional<string | null>;
  declare tenureStatus: CreationOptional<string | null>;
  declare observations: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

HousingCharacteristicModel.init(
  {
    diagnosticRecordId: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      field: 'id_diagnostic_record',
    },
    housingTypology: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'housing_typology',
    },
    tenureStatus: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'tenure_status',
    },
    observations: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'observations',
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
    tableName: 'housing_characteristics',
    modelName: 'HousingCharacteristic',
  },
);
