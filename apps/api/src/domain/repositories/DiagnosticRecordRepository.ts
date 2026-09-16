import type {
  DiagnosticRecord,
  EvaluationQuestion,
  FamilyMember,
  WaterConsumptionHabit,
  HousingHygiene,
  HealthCondition,
  LandAccessibility,
  BasicUtility,
  HousingCharacteristic,
  ConstructionElement,
  DiagnosticPhoto,
} from '../entities/DiagnosticRecord.js';


export interface TechnicalDiagnosticInput {
  formNo?: string | null;
  evaluationDate?: string;
  requiresImprovement?: boolean;
  requiresExpansion?: boolean;
  requiresRenovation?: boolean;
  roomsToImprove?: string | null;
  bedroomSuggestion?: string | null;
  livingRoomSuggestion?: string | null;
  kitchenSuggestion?: string | null;
  bathroomSuggestion?: string | null;
  generalObservations?: string | null;
  landAccessibility?: LandAccessibility | null;
  basicUtilities?: BasicUtility | null;
  housingCharacteristics?: HousingCharacteristic | null;
  constructionElements?: ConstructionElement[];
  photos?: DiagnosticPhoto[];
  isCompleted?: boolean;
}

export interface SocialDiagnosticInput {
  formNo?: string | null;
  evaluationDate?: string;
  familyMembers?: FamilyMember[];
  answers?: {
    evaluationQuestionId: number;
    answerBoolean?: boolean | null;
    score?: string | null;
  }[];
  waterHabits?: WaterConsumptionHabit | null;
  hygiene?: HousingHygiene | null;
  health?: HealthCondition | null;
  isCompleted?: boolean;
}

export interface DiagnosticRecordRepository {
  findByApplicationId(applicationId: string): Promise<DiagnosticRecord | null>;
  saveTechnical(applicationId: string, input: TechnicalDiagnosticInput, userId: string): Promise<DiagnosticRecord>;
  saveSocial(applicationId: string, input: SocialDiagnosticInput, userId: string): Promise<DiagnosticRecord>;
  getEvaluationQuestions(): Promise<EvaluationQuestion[]>;
}
