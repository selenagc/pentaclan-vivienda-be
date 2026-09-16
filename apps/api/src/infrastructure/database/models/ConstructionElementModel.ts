import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';
import { sequelize } from '../sequelize.js';

export class ConstructionElementModel extends Model<
  InferAttributes<ConstructionElementModel>,
  InferCreationAttributes<ConstructionElementModel>
> {
  declare id: CreationOptional<number>;
  declare diagnosticRecordId: string;
  declare constructionNumber: CreationOptional<number>;
  declare usageType: CreationOptional<string | null>;
  declare foundationMaterial: CreationOptional<string | null>;
  declare foundationState: CreationOptional<string | null>;
  declare wallsMaterial: CreationOptional<string | null>;
  declare wallsState: CreationOptional<string | null>;
  declare roofMaterial: CreationOptional<string | null>;
  declare roofState: CreationOptional<string | null>;
  declare exteriorPlasterMaterial: CreationOptional<string | null>;
  declare exteriorPlasterState: CreationOptional<string | null>;
  declare interiorPlasterMaterial: CreationOptional<string | null>;
  declare interiorPlasterState: CreationOptional<string | null>;
  declare ceilingPlasterMaterial: CreationOptional<string | null>;
  declare ceilingPlasterState: CreationOptional<string | null>;
  declare floorsMaterial: CreationOptional<string | null>;
  declare floorsState: CreationOptional<string | null>;
  declare doorsMaterial: CreationOptional<string | null>;
  declare doorsState: CreationOptional<string | null>;
  declare windowsMaterial: CreationOptional<string | null>;
  declare windowsState: CreationOptional<string | null>;
  declare electricalInstallation: CreationOptional<string | null>;
  declare electricalInstallationState: CreationOptional<string | null>;
  declare canBeImproved: CreationOptional<number>;
  declare cannotBeImproved: CreationOptional<number>;
  declare noImprovementNeeded: CreationOptional<number>;
  declare observations: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ConstructionElementModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_construction_element',
    },
    diagnosticRecordId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      field: 'id_diagnostic_record',
    },
    constructionNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      field: 'construction_number',
    },
    usageType: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'usage_type',
    },
    foundationMaterial: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'foundation_material',
    },
    foundationState: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'foundation_state',
    },
    wallsMaterial: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'walls_material',
    },
    wallsState: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'walls_state',
    },
    roofMaterial: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'roof_material',
    },
    roofState: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'roof_state',
    },
    exteriorPlasterMaterial: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'exterior_plaster_material',
    },
    exteriorPlasterState: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'exterior_plaster_state',
    },
    interiorPlasterMaterial: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'interior_plaster_material',
    },
    interiorPlasterState: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'interior_plaster_state',
    },
    ceilingPlasterMaterial: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'ceiling_plaster_material',
    },
    ceilingPlasterState: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'ceiling_plaster_state',
    },
    floorsMaterial: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'floors_material',
    },
    floorsState: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'floors_state',
    },
    doorsMaterial: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'doors_material',
    },
    doorsState: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'doors_state',
    },
    windowsMaterial: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'windows_material',
    },
    windowsState: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'windows_state',
    },
    electricalInstallation: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'electrical_installation',
    },
    electricalInstallationState: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'electrical_installation_state',
    },
    canBeImproved: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'can_be_improved',
    },
    cannotBeImproved: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'cannot_be_improved',
    },
    noImprovementNeeded: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'no_improvement_needed',
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
    tableName: 'construction_elements',
    modelName: 'ConstructionElement',
  },
);
