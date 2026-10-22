import type { Transaction, Includeable } from 'sequelize';
import { sequelize } from '../database/sequelize.js';
import { computeApplicationFormNo } from './SequelizeApplicationRepository.js';
import { DiagnosticRecordModel } from '../database/models/DiagnosticRecordModel.js';
import { FamilyMemberModel } from '../database/models/FamilyMemberModel.js';
import { EvaluationQuestionModel } from '../database/models/EvaluationQuestionModel.js';
import { DiagnosticAnswerModel } from '../database/models/DiagnosticAnswerModel.js';
import { WaterConsumptionHabitModel } from '../database/models/WaterConsumptionHabitModel.js';
import { HousingHygieneModel } from '../database/models/HousingHygieneModel.js';
import { HealthConditionModel } from '../database/models/HealthConditionModel.js';
import { LandAccessibilityModel } from '../database/models/LandAccessibilityModel.js';
import { BasicUtilityModel } from '../database/models/BasicUtilityModel.js';
import { HousingCharacteristicModel } from '../database/models/HousingCharacteristicModel.js';
import { ConstructionElementModel } from '../database/models/ConstructionElementModel.js';
import { DiagnosticPhotoModel } from '../database/models/DiagnosticPhotoModel.js';
import type {
  DiagnosticRecord,
  EvaluationQuestion,
} from '../../domain/entities/DiagnosticRecord.js';
import type {
  DiagnosticRecordRepository,
  SocialDiagnosticInput,
  TechnicalDiagnosticInput,
} from '../../domain/repositories/DiagnosticRecordRepository.js';

const FULL_RECORD_INCLUDES: Includeable[] = [
  { association: 'application', attributes: ['id', 'status', 'personId'] },
  { association: 'technicalUser', attributes: ['id', 'name'] },
  { association: 'socialUser', attributes: ['id', 'name'] },
  { association: 'familyMembers' },
  {
    association: 'answers',
    include: [{ association: 'question' }],
  },
  { association: 'waterHabits' },
  { association: 'hygiene' },
  { association: 'health' },
  { association: 'landAccessibility' },
  { association: 'basicUtilities' },
  { association: 'housingCharacteristics' },
  { association: 'constructionElements' },
  { association: 'photos' },
];

function toDiagnosticRecordEntity(model: DiagnosticRecordModel): DiagnosticRecord {
  return {
    id: model.id,
    applicationId: model.applicationId,
    formNo: model.formNo,
    evaluationDate: model.evaluationDate,
    technicalUserId: model.technicalUserId,
    technicalUserName: model.technicalUser?.name ?? null,
    technicalCompletedAt: model.technicalCompletedAt,
    socialUserId: model.socialUserId,
    socialUserName: model.socialUser?.name ?? null,
    socialCompletedAt: model.socialCompletedAt,
    requiresImprovement: model.requiresImprovement,
    requiresExpansion: model.requiresExpansion,
    requiresRenovation: model.requiresRenovation,
    roomsToImprove: model.roomsToImprove,
    bedroomSuggestion: model.bedroomSuggestion,
    livingRoomSuggestion: model.livingRoomSuggestion,
    kitchenSuggestion: model.kitchenSuggestion,
    bathroomSuggestion: model.bathroomSuggestion,
    generalObservations: model.generalObservations,
    constructionKnowledgeObservations: model.constructionKnowledgeObservations,
    familyMembers: (model.familyMembers ?? []).map((fm) => {
      const appStatus = (model as any).application?.status;
      const appPersonId = (model as any).application?.personId;
      const isHead =
        (appPersonId && fm.personId === appPersonId) ||
        fm.relationship === 'Solicitante' ||
        fm.relationship === 'Beneficiario' ||
        fm.relationship === 'Jefe(a) de Hogar';
      const resolvedRelationship = isHead
        ? appStatus === 'approved'
          ? 'Beneficiario'
          : 'Solicitante'
        : fm.relationship;

      return {
        id: fm.id,
        personId: fm.personId ?? null,
        fullName: fm.fullName,
        relationship: resolvedRelationship,
        documentNo: fm.documentNo ?? null,
        documentIssuedIn: fm.documentIssuedIn ?? null,
        sex: fm.sex ?? null,
        birthDate: fm.birthDate ?? null,
        age: fm.age,
        occupation: fm.occupation,
        hasDisability: fm.hasDisability,
        disabilityType: fm.disabilityType,
        disabilityDocument: fm.disabilityDocument,
      };
    }),
    answers: (model.answers ?? []).map((a) => ({
      evaluationQuestionId: a.evaluationQuestionId,
      answerBoolean: a.answerBoolean,
      score: a.score,
      question: a.question
        ? {
            id: a.question.id,
            questionText: a.question.questionText,
            category: a.question.category,
            active: a.question.active,
          }
        : undefined,
    })),
    waterHabits: model.waterHabits
      ? {
          waterSource: model.waterHabits.waterSource,
          containerClean: model.waterHabits.containerClean,
          containerStatus: model.waterHabits.containerStatus,
          waterTreatment: model.waterHabits.waterTreatment,
          otherDetails: model.waterHabits.otherDetails,
        }
      : null,
    hygiene: model.hygiene
      ? {
          greywaterDisposal: model.hygiene.greywaterDisposal,
          garbageDisposal: model.hygiene.garbageDisposal,
          cleanlinessStatus: model.hygiene.cleanlinessStatus,
        }
      : null,
    health: model.health
      ? {
          prevalentDiseases: model.health.prevalentDiseases,
          healthCareAction: model.health.healthCareAction,
        }
      : null,
    landAccessibility: model.landAccessibility
      ? {
          slopePercentage:
            model.landAccessibility.slopePercentage !== null
              ? Number(model.landAccessibility.slopePercentage)
              : null,
          pedestrianMinutes: model.landAccessibility.pedestrianMinutes,
          abcStandard: model.landAccessibility.abcStandard,
          accessibilityType: model.landAccessibility.accessibilityType,
          landCondition: model.landAccessibility.landCondition,
        }
      : null,
    basicUtilities: model.basicUtilities
      ? {
          waterAccess: model.basicUtilities.waterAccess,
          electricityService: model.basicUtilities.electricityService,
          sharedBathroom: model.basicUtilities.sharedBathroom,
          privateBathroom: model.basicUtilities.privateBathroom,
          bathroomType: model.basicUtilities.bathroomType,
          sharedKitchen: model.basicUtilities.sharedKitchen,
          privateKitchen: model.basicUtilities.privateKitchen,
          adequateKitchen: model.basicUtilities.adequateKitchen,
          kitchenType: model.basicUtilities.kitchenType,
        }
      : null,
    housingCharacteristics: model.housingCharacteristics
      ? {
          housingTypology: model.housingCharacteristics.housingTypology,
          tenureStatus: model.housingCharacteristics.tenureStatus,
          observations: model.housingCharacteristics.observations,
        }
      : null,
    constructionElements: (model.constructionElements ?? [])
      .sort((a, b) => a.constructionNumber - b.constructionNumber)
      .map((ce) => ({
        id: ce.id,
        constructionNumber: ce.constructionNumber,
        usageType: ce.usageType,
        foundationMaterial: ce.foundationMaterial,
        foundationState: ce.foundationState,
        wallsMaterial: ce.wallsMaterial,
        wallsState: ce.wallsState,
        roofMaterial: ce.roofMaterial,
        roofState: ce.roofState,
        exteriorPlasterMaterial: ce.exteriorPlasterMaterial,
        exteriorPlasterState: ce.exteriorPlasterState,
        interiorPlasterMaterial: ce.interiorPlasterMaterial,
        interiorPlasterState: ce.interiorPlasterState,
        ceilingPlasterMaterial: ce.ceilingPlasterMaterial,
        ceilingPlasterState: ce.ceilingPlasterState,
        floorsMaterial: ce.floorsMaterial,
        floorsState: ce.floorsState,
        doorsMaterial: ce.doorsMaterial,
        doorsState: ce.doorsState,
        windowsMaterial: ce.windowsMaterial,
        windowsState: ce.windowsState,
        electricalInstallation: ce.electricalInstallation,
        electricalInstallationState: ce.electricalInstallationState,
        canBeImproved: ce.canBeImproved,
        cannotBeImproved: ce.cannotBeImproved,
        noImprovementNeeded: ce.noImprovementNeeded,
        observations: ce.observations,
      })),
    photos: (model.photos ?? []).map((p) => ({
      id: p.id,
      photoType: p.photoType,
      url: p.url,
      description: p.description,
    })),
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}

export class SequelizeDiagnosticRecordRepository implements DiagnosticRecordRepository {
  async findByApplicationId(applicationId: string): Promise<DiagnosticRecord | null> {
    const record = await DiagnosticRecordModel.findOne({
      where: { applicationId },
      include: FULL_RECORD_INCLUDES,
    });
    if (!record) return null;
    const entity = toDiagnosticRecordEntity(record);
    const computedFormNo = await computeApplicationFormNo(applicationId);
    if (computedFormNo) {
      entity.formNo = computedFormNo;
    }
    return entity;
  }

  async saveTechnical(
    applicationId: string,
    input: TechnicalDiagnosticInput,
    userId: string,
  ): Promise<DiagnosticRecord> {
    return await sequelize.transaction(async (t: Transaction) => {
      const computedFormNo = await computeApplicationFormNo(applicationId, t);
      let record = await DiagnosticRecordModel.findOne({
        where: { applicationId },
        transaction: t,
      });

      const today = new Date().toISOString().split('T')[0];

      if (!record) {
        record = await DiagnosticRecordModel.create(
          {
            applicationId,
            formNo: computedFormNo ?? input.formNo ?? null,
            evaluationDate: input.evaluationDate || today,
            technicalUserId: userId,
            technicalCompletedAt: input.isCompleted ? new Date() : null,
            requiresImprovement: input.requiresImprovement ?? false,
            requiresExpansion: input.requiresExpansion ?? false,
            requiresRenovation: input.requiresRenovation ?? false,
            roomsToImprove: input.roomsToImprove ?? null,
            bedroomSuggestion: input.bedroomSuggestion ?? null,
            livingRoomSuggestion: input.livingRoomSuggestion ?? null,
            kitchenSuggestion: input.kitchenSuggestion ?? null,
            bathroomSuggestion: input.bathroomSuggestion ?? null,
            generalObservations: input.generalObservations ?? null,
          },
          { transaction: t },
        );
      } else {
        const updateData: Partial<DiagnosticRecordModel> = {
          technicalUserId: userId,
          formNo: computedFormNo ?? record.formNo,
        };

        if (input.evaluationDate) updateData.evaluationDate = input.evaluationDate;
        if (input.isCompleted) updateData.technicalCompletedAt = new Date();

        if (input.requiresImprovement !== undefined) {
          updateData.requiresImprovement = input.requiresImprovement;
        }
        if (input.requiresExpansion !== undefined) {
          updateData.requiresExpansion = input.requiresExpansion;
        }
        if (input.requiresRenovation !== undefined) {
          updateData.requiresRenovation = input.requiresRenovation;
        }
        if (input.roomsToImprove !== undefined) {
          updateData.roomsToImprove = input.roomsToImprove;
        }
        if (input.bedroomSuggestion !== undefined) {
          updateData.bedroomSuggestion = input.bedroomSuggestion;
        }
        if (input.livingRoomSuggestion !== undefined) {
          updateData.livingRoomSuggestion = input.livingRoomSuggestion;
        }
        if (input.kitchenSuggestion !== undefined) {
          updateData.kitchenSuggestion = input.kitchenSuggestion;
        }
        if (input.bathroomSuggestion !== undefined) {
          updateData.bathroomSuggestion = input.bathroomSuggestion;
        }
        if (input.generalObservations !== undefined) {
          updateData.generalObservations = input.generalObservations;
        }

        await record.update(updateData, { transaction: t });
      }

      const diagnosticRecordId = record.id;

      // 1:1 Land Accessibility
      if (input.landAccessibility !== undefined) {
        if (input.landAccessibility === null) {
          await LandAccessibilityModel.destroy({
            where: { diagnosticRecordId },
            transaction: t,
          });
        } else {
          await LandAccessibilityModel.upsert(
            {
              diagnosticRecordId,
              slopePercentage: input.landAccessibility.slopePercentage ?? null,
              pedestrianMinutes: input.landAccessibility.pedestrianMinutes ?? null,
              abcStandard: input.landAccessibility.abcStandard ?? null,
              accessibilityType: input.landAccessibility.accessibilityType ?? null,
              landCondition: input.landAccessibility.landCondition ?? null,
            },
            { transaction: t },
          );
        }
      }

      // 1:1 Basic Utilities
      if (input.basicUtilities !== undefined) {
        if (input.basicUtilities === null) {
          await BasicUtilityModel.destroy({
            where: { diagnosticRecordId },
            transaction: t,
          });
        } else {
          await BasicUtilityModel.upsert(
            {
              diagnosticRecordId,
              waterAccess: input.basicUtilities.waterAccess ?? null,
              electricityService: input.basicUtilities.electricityService ?? null,
              sharedBathroom: input.basicUtilities.sharedBathroom ?? false,
              privateBathroom: input.basicUtilities.privateBathroom ?? false,
              bathroomType: input.basicUtilities.bathroomType ?? null,
              sharedKitchen: input.basicUtilities.sharedKitchen ?? false,
              privateKitchen: input.basicUtilities.privateKitchen ?? false,
              adequateKitchen: input.basicUtilities.adequateKitchen ?? false,
              kitchenType: input.basicUtilities.kitchenType ?? null,
            },
            { transaction: t },
          );
        }
      }

      // 1:1 Housing Characteristics
      if (input.housingCharacteristics !== undefined) {
        if (input.housingCharacteristics === null) {
          await HousingCharacteristicModel.destroy({
            where: { diagnosticRecordId },
            transaction: t,
          });
        } else {
          await HousingCharacteristicModel.upsert(
            {
              diagnosticRecordId,
              housingTypology: input.housingCharacteristics.housingTypology ?? null,
              tenureStatus: input.housingCharacteristics.tenureStatus ?? null,
              observations: input.housingCharacteristics.observations ?? null,
            },
            { transaction: t },
          );
        }
      }

      // 1:N Construction Elements
      if (input.constructionElements !== undefined) {
        await ConstructionElementModel.destroy({
          where: { diagnosticRecordId },
          transaction: t,
        });
        if (input.constructionElements.length > 0) {
          await ConstructionElementModel.bulkCreate(
            input.constructionElements.map((ce, index) => ({
              diagnosticRecordId,
              constructionNumber: ce.constructionNumber || index + 1,
              usageType: ce.usageType ?? null,
              foundationMaterial: ce.foundationMaterial ?? null,
              foundationState: ce.foundationMaterial === 'NO TIENE' ? null : (ce.foundationState ?? null),
              wallsMaterial: ce.wallsMaterial ?? null,
              wallsState: ce.wallsState ?? null,
              roofMaterial: ce.roofMaterial ?? null,
              roofState: ce.roofState ?? null,
              exteriorPlasterMaterial: ce.exteriorPlasterMaterial ?? null,
              exteriorPlasterState: ce.exteriorPlasterMaterial === 'NO TIENE' ? null : (ce.exteriorPlasterState ?? null),
              interiorPlasterMaterial: ce.interiorPlasterMaterial ?? null,
              interiorPlasterState: ce.interiorPlasterMaterial === 'NO TIENE' ? null : (ce.interiorPlasterState ?? null),
              ceilingPlasterMaterial: ce.ceilingPlasterMaterial ?? null,
              ceilingPlasterState: ce.ceilingPlasterMaterial === 'NO TIENE' ? null : (ce.ceilingPlasterState ?? null),
              floorsMaterial: ce.floorsMaterial ?? null,
              floorsState: ce.floorsState ?? null,
              doorsMaterial: ce.doorsMaterial ?? null,
              doorsState: ce.doorsMaterial === 'NO TIENE' ? null : (ce.doorsState ?? null),
              windowsMaterial: ce.windowsMaterial ?? null,
              windowsState: ce.windowsMaterial === 'NO TIENE' ? null : (ce.windowsState ?? null),
              electricalInstallation: ce.electricalInstallation ?? null,
              electricalInstallationState: ce.electricalInstallation === 'NO TIENE' ? null : (ce.electricalInstallationState ?? null),
              canBeImproved: ce.canBeImproved ?? 0,
              cannotBeImproved: ce.cannotBeImproved ?? 0,
              noImprovementNeeded: ce.noImprovementNeeded ?? 0,
              observations: ce.observations ?? null,
            })),
            { transaction: t },
          );
        }
      }

      // 1:N Photos
      if (input.photos !== undefined) {
        await DiagnosticPhotoModel.destroy({
          where: { diagnosticRecordId },
          transaction: t,
        });
        if (input.photos.length > 0) {
          await DiagnosticPhotoModel.bulkCreate(
            input.photos.map((p) => ({
              diagnosticRecordId,
              photoType: p.photoType,
              url: p.url,
              description: p.description ?? null,
            })),
            { transaction: t },
          );
        }
      }

      const refreshed = await DiagnosticRecordModel.findByPk(diagnosticRecordId, {
        include: FULL_RECORD_INCLUDES,
        transaction: t,
      });

      const entity = toDiagnosticRecordEntity(refreshed!);
      if (computedFormNo) entity.formNo = computedFormNo;
      return entity;
    });
  }

  async saveSocial(
    applicationId: string,
    input: SocialDiagnosticInput,
    userId: string,
  ): Promise<DiagnosticRecord> {
    return await sequelize.transaction(async (t: Transaction) => {
      const computedFormNo = await computeApplicationFormNo(applicationId, t);
      let record = await DiagnosticRecordModel.findOne({
        where: { applicationId },
        transaction: t,
      });

      const today = new Date().toISOString().split('T')[0];

      if (!record) {
        record = await DiagnosticRecordModel.create(
          {
            applicationId,
            formNo: computedFormNo ?? input.formNo ?? null,
            evaluationDate: input.evaluationDate || today,
            socialUserId: userId,
            socialCompletedAt: input.isCompleted ? new Date() : null,
            constructionKnowledgeObservations: input.constructionKnowledgeObservations ?? null,
            requiresImprovement: false,
            requiresExpansion: false,
            requiresRenovation: false,
          },
          { transaction: t },
        );
      } else {
        const updateData: Partial<DiagnosticRecordModel> = {
          socialUserId: userId,
          formNo: computedFormNo ?? record.formNo,
        };

        if (input.evaluationDate) updateData.evaluationDate = input.evaluationDate;
        if (input.isCompleted) updateData.socialCompletedAt = new Date();
        if (input.constructionKnowledgeObservations !== undefined) {
          updateData.constructionKnowledgeObservations = input.constructionKnowledgeObservations;
        }

        await record.update(updateData, { transaction: t });
      }

      const diagnosticRecordId = record.id;

      // 1:1 Water Habits
      if (input.waterHabits !== undefined) {
        if (input.waterHabits === null) {
          await WaterConsumptionHabitModel.destroy({
            where: { diagnosticRecordId },
            transaction: t,
          });
        } else {
          await WaterConsumptionHabitModel.upsert(
            {
              diagnosticRecordId,
              waterSource: input.waterHabits.waterSource ?? null,
              containerClean: input.waterHabits.containerClean ?? false,
              containerStatus: input.waterHabits.containerStatus ?? null,
              waterTreatment: input.waterHabits.waterTreatment ?? null,
              otherDetails: input.waterHabits.otherDetails ?? null,
            },
            { transaction: t },
          );
        }
      }

      // 1:1 Housing Hygiene
      if (input.hygiene !== undefined) {
        if (input.hygiene === null) {
          await HousingHygieneModel.destroy({
            where: { diagnosticRecordId },
            transaction: t,
          });
        } else {
          await HousingHygieneModel.upsert(
            {
              diagnosticRecordId,
              greywaterDisposal: input.hygiene.greywaterDisposal ?? null,
              garbageDisposal: input.hygiene.garbageDisposal ?? null,
              cleanlinessStatus: input.hygiene.cleanlinessStatus ?? null,
            },
            { transaction: t },
          );
        }
      }

      // 1:1 Health Conditions
      if (input.health !== undefined) {
        if (input.health === null) {
          await HealthConditionModel.destroy({
            where: { diagnosticRecordId },
            transaction: t,
          });
        } else {
          await HealthConditionModel.upsert(
            {
              diagnosticRecordId,
              prevalentDiseases: input.health.prevalentDiseases ?? null,
              healthCareAction: input.health.healthCareAction ?? null,
            },
            { transaction: t },
          );
        }
      }

      // 1:N Family Members
      if (input.familyMembers !== undefined) {
        await FamilyMemberModel.destroy({
          where: { diagnosticRecordId },
          transaction: t,
        });
        if (input.familyMembers.length > 0) {
          await FamilyMemberModel.bulkCreate(
            input.familyMembers.map((fm) => {
              let computedAge = fm.age ?? null;
              if (fm.birthDate) {
                const [y, m, d] = fm.birthDate.split('-').map(Number);
                if (y && m && d) {
                  const now = new Date();
                  let years = now.getFullYear() - y;
                  const monthDiff = now.getMonth() + 1 - m;
                  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < d)) {
                    years -= 1;
                  }
                  computedAge = Math.max(0, years);
                }
              }
              return {
                diagnosticRecordId,
                personId: fm.personId || null,
                fullName: fm.fullName,
                relationship: fm.relationship,
                documentNo: fm.documentNo || null,
                documentIssuedIn: fm.documentIssuedIn || null,
                sex: fm.sex || null,
                birthDate: fm.birthDate || null,
                age: computedAge,
                occupation: fm.occupation || null,
                hasDisability: fm.hasDisability ?? false,
                disabilityType: fm.disabilityType || null,
                disabilityDocument: fm.disabilityDocument || null,
              };
            }),
            { transaction: t },
          );
        }
      }

      // 1:N Answers
      if (input.answers !== undefined) {
        await DiagnosticAnswerModel.destroy({
          where: { diagnosticRecordId },
          transaction: t,
        });
        if (input.answers.length > 0) {
          await DiagnosticAnswerModel.bulkCreate(
            input.answers.map((a) => ({
              diagnosticRecordId,
              evaluationQuestionId: a.evaluationQuestionId,
              answerBoolean: a.answerBoolean ?? null,
              score: a.answerBoolean === true ? (a.score || null) : null,
            })),
            { transaction: t },
          );
        }
      }

      const refreshed = await DiagnosticRecordModel.findByPk(diagnosticRecordId, {
        include: FULL_RECORD_INCLUDES,
        transaction: t,
      });

      const entity = toDiagnosticRecordEntity(refreshed!);
      if (computedFormNo) entity.formNo = computedFormNo;
      return entity;
    });
  }

  async getEvaluationQuestions(): Promise<EvaluationQuestion[]> {
    const questions = await EvaluationQuestionModel.findAll({
      where: { active: true },
      order: [['id', 'ASC']],
    });

    return questions.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      category: q.category,
      active: q.active,
    }));
  }
}

