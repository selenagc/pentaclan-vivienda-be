import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';
import { sequelize } from '../sequelize.js';

export class HealthConditionModel extends Model<
  InferAttributes<HealthConditionModel>,
  InferCreationAttributes<HealthConditionModel>
> {
  declare diagnosticRecordId: string;
  declare prevalentDiseases: CreationOptional<string | null>;
  declare healthCareAction: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

HealthConditionModel.init(
  {
    diagnosticRecordId: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      field: 'id_diagnostic_record',
    },
    prevalentDiseases: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'prevalent_diseases',
    },
    healthCareAction: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'health_care_action',
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
    tableName: 'health_conditions',
    modelName: 'HealthCondition',
  },
);
