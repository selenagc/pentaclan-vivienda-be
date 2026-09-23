import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional, type NonAttribute } from 'sequelize';
import { sequelize } from '../sequelize.js';
import type { UserModel } from './UserModel.js';
import type { ApplicationModel } from './ApplicationModel.js';
import type { FamilyMemberModel } from './FamilyMemberModel.js';
import type { ConstructionElementModel } from './ConstructionElementModel.js';
import type { DiagnosticPhotoModel } from './DiagnosticPhotoModel.js';
import type { WaterConsumptionHabitModel } from './WaterConsumptionHabitModel.js';
import type { HousingHygieneModel } from './HousingHygieneModel.js';
import type { HealthConditionModel } from './HealthConditionModel.js';
import type { LandAccessibilityModel } from './LandAccessibilityModel.js';
import type { BasicUtilityModel } from './BasicUtilityModel.js';
import type { HousingCharacteristicModel } from './HousingCharacteristicModel.js';
import type { DiagnosticAnswerModel } from './DiagnosticAnswerModel.js';

export class DiagnosticRecordModel extends Model<
  InferAttributes<DiagnosticRecordModel>,
  InferCreationAttributes<DiagnosticRecordModel>
> {
  declare id: CreationOptional<string>;
  declare applicationId: string;
  declare formNo: CreationOptional<string | null>;
  declare evaluationDate: string;
  declare technicalUserId: CreationOptional<string | null>;
  declare technicalCompletedAt: CreationOptional<Date | null>;
  declare socialUserId: CreationOptional<string | null>;
  declare socialCompletedAt: CreationOptional<Date | null>;

  // Propuesta de intervencion tecnica
  declare requiresImprovement: CreationOptional<boolean>;
  declare requiresExpansion: CreationOptional<boolean>;
  declare requiresRenovation: CreationOptional<boolean>;
  declare roomsToImprove: CreationOptional<string | null>;
  declare bedroomSuggestion: CreationOptional<string | null>;
  declare livingRoomSuggestion: CreationOptional<string | null>;
  declare kitchenSuggestion: CreationOptional<string | null>;
  declare bathroomSuggestion: CreationOptional<string | null>;
  declare generalObservations: CreationOptional<string | null>;
  declare constructionKnowledgeObservations: CreationOptional<string | null>;
  declare changeHistory: CreationOptional<object[]>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;

  declare application?: NonAttribute<ApplicationModel>;
  declare technicalUser?: NonAttribute<UserModel>;
  declare socialUser?: NonAttribute<UserModel>;
  declare familyMembers?: NonAttribute<FamilyMemberModel[]>;
  declare answers?: NonAttribute<DiagnosticAnswerModel[]>;
  declare waterHabits?: NonAttribute<WaterConsumptionHabitModel>;
  declare hygiene?: NonAttribute<HousingHygieneModel>;
  declare health?: NonAttribute<HealthConditionModel>;
  declare landAccessibility?: NonAttribute<LandAccessibilityModel>;
  declare basicUtilities?: NonAttribute<BasicUtilityModel>;
  declare housingCharacteristics?: NonAttribute<HousingCharacteristicModel>;
  declare constructionElements?: NonAttribute<ConstructionElementModel[]>;
  declare photos?: NonAttribute<DiagnosticPhotoModel[]>;
}

DiagnosticRecordModel.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      field: 'id_diagnostic_record',
    },
    applicationId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      field: 'id_application',
    },
    formNo: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'form_no',
    },
    evaluationDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'evaluation_date',
    },
    technicalUserId: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      field: 'id_technical_user',
    },
    technicalCompletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'technical_completed_at',
    },
    socialUserId: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      field: 'id_social_user',
    },
    socialCompletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'social_completed_at',
    },
    requiresImprovement: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'requires_improvement',
    },
    requiresExpansion: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'requires_expansion',
    },
    requiresRenovation: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'requires_renovation',
    },
    roomsToImprove: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'rooms_to_improve',
    },
    bedroomSuggestion: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'bedroom_suggestion',
    },
    livingRoomSuggestion: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'living_room_suggestion',
    },
    kitchenSuggestion: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'kitchen_suggestion',
    },
    bathroomSuggestion: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'bathroom_suggestion',
    },
    generalObservations: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'general_observations',
    },
    constructionKnowledgeObservations: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'construction_knowledge_observations',
    },
    changeHistory: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      field: 'change_history',
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
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'deleted_at',
    },
  },
  {
    sequelize,
    tableName: 'diagnostic_records',
    modelName: 'DiagnosticRecord',
    paranoid: true,
  },
);
