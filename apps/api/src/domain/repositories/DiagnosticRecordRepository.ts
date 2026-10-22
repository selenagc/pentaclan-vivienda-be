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
  constructionKnowledgeObservations?: string | null;
  waterHabits?: WaterConsumptionHabit | null;
  hygiene?: HousingHygiene | null;
  health?: HealthCondition | null;
  isCompleted?: boolean;
}

export interface CreatePhotoInput {
  diagnosticRecordId: string;
  category: 'technical' | 'social';
  photoType: string;
  s3Key: string;
  capturedAt: Date | string;
  captureLatitude?: number | null;
  captureLongitude?: number | null;
  mimeType: string;
  fileSizeBytes: number;
  description?: string | null;
}

export interface DiagnosticRecordRepository {
  findByApplicationId(applicationId: string): Promise<DiagnosticRecord | null>;
  saveTechnical(
    applicationId: string,
    input: TechnicalDiagnosticInput,
    userId: string,
  ): Promise<DiagnosticRecord>;
  saveSocial(
    applicationId: string,
    input: SocialDiagnosticInput,
    userId: string,
  ): Promise<DiagnosticRecord>;
  getEvaluationQuestions(): Promise<EvaluationQuestion[]>;

  // Photo management
  addPhoto(input: CreatePhotoInput): Promise<DiagnosticPhoto>;
  findPhotosByApplicationId(
    applicationId: string,
    category?: 'technical' | 'social',
  ): Promise<DiagnosticPhoto[]>;
  findPhotoById(photoId: number): Promise<DiagnosticPhoto | null>;
  deletePhoto(photoId: number): Promise<void>;
  getOrCreateDiagnosticRecord(applicationId: string, userId: string): Promise<DiagnosticRecord>;
}
