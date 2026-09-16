import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';
import { sequelize } from '../sequelize.js';

export class LandAccessibilityModel extends Model<
  InferAttributes<LandAccessibilityModel>,
  InferCreationAttributes<LandAccessibilityModel>
> {
  declare diagnosticRecordId: string;
  declare slopePercentage: CreationOptional<number | null>;
  declare pedestrianMinutes: CreationOptional<number | null>;
  declare abcStandard: CreationOptional<string | null>;
  declare accessibilityType: CreationOptional<string | null>;
  declare landCondition: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

LandAccessibilityModel.init(
  {
    diagnosticRecordId: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      field: 'id_diagnostic_record',
    },
    slopePercentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'slope_percentage',
      get() {
        const val = this.getDataValue('slopePercentage');
        return val === null || val === undefined ? null : Number(val);
      },
    },
    pedestrianMinutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'pedestrian_minutes',
    },
    abcStandard: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'abc_standard',
    },
    accessibilityType: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'accessibility_type',
    },
    landCondition: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'land_condition',
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
    tableName: 'land_accessibilities',
    modelName: 'LandAccessibility',
  },
);
