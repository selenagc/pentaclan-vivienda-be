import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';
import { sequelize } from '../sequelize.js';

export class WaterConsumptionHabitModel extends Model<
  InferAttributes<WaterConsumptionHabitModel>,
  InferCreationAttributes<WaterConsumptionHabitModel>
> {
  declare diagnosticRecordId: string;
  declare waterSource: CreationOptional<string | null>;
  declare waterSourceOther: CreationOptional<string | null>;
  declare containerClean: CreationOptional<boolean | null>;
  declare containerStatus: CreationOptional<string | null>;
  declare waterTreatment: CreationOptional<string | null>;
  declare otherDetails: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

WaterConsumptionHabitModel.init(
  {
    diagnosticRecordId: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      field: 'id_diagnostic_record',
    },
    waterSource: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'water_source',
    },
    waterSourceOther: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'water_source_other',
    },
    containerClean: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'container_clean',
    },
    containerStatus: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'container_status',
    },
    waterTreatment: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'water_treatment',
    },
    otherDetails: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'other_details',
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
    tableName: 'water_consumption_habits',
    modelName: 'WaterConsumptionHabit',
  },
);
