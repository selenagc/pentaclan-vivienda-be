import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';
import { sequelize } from '../sequelize.js';

export class BasicUtilityModel extends Model<
  InferAttributes<BasicUtilityModel>,
  InferCreationAttributes<BasicUtilityModel>
> {
  declare diagnosticRecordId: string;
  declare waterAccess: CreationOptional<string | null>;
  declare electricityService: CreationOptional<string | null>;
  declare sharedBathroom: CreationOptional<boolean | null>;
  declare privateBathroom: CreationOptional<boolean | null>;
  declare bathroomType: CreationOptional<string | null>;
  declare sharedKitchen: CreationOptional<boolean | null>;
  declare privateKitchen: CreationOptional<boolean | null>;
  declare adequateKitchen: CreationOptional<boolean | null>;
  declare kitchenType: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

BasicUtilityModel.init(
  {
    diagnosticRecordId: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      field: 'id_diagnostic_record',
    },
    waterAccess: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'water_access',
    },
    electricityService: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'electricity_service',
    },
    sharedBathroom: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'shared_bathroom',
    },
    privateBathroom: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'private_bathroom',
    },
    bathroomType: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'bathroom_type',
    },
    sharedKitchen: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'shared_kitchen',
    },
    privateKitchen: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'private_kitchen',
    },
    adequateKitchen: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'adequate_kitchen',
    },
    kitchenType: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'kitchen_type',
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
    tableName: 'basic_utilities',
    modelName: 'BasicUtility',
  },
);
