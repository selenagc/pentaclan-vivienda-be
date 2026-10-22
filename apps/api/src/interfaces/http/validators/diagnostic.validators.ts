import Joi from 'joi';

const dateString = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .messages({
    'string.pattern.base': 'Must be a date in YYYY-MM-DD format',
  });

export const technicalDiagnosticSchema = Joi.object({
  formNo: Joi.string().trim().max(100).allow(null, ''),
  evaluationDate: dateString.optional(),
  requiresImprovement: Joi.boolean().optional(),
  requiresExpansion: Joi.boolean().optional(),
  requiresRenovation: Joi.boolean().optional(),
  roomsToImprove: Joi.string().trim().max(255).allow(null, ''),
  bedroomSuggestion: Joi.string().trim().max(255).allow(null, ''),
  livingRoomSuggestion: Joi.string().trim().max(255).allow(null, ''),
  kitchenSuggestion: Joi.string().trim().max(255).allow(null, ''),
  bathroomSuggestion: Joi.string().trim().max(255).allow(null, ''),
  generalObservations: Joi.string().trim().allow(null, ''),
  isCompleted: Joi.boolean().optional(),

  landAccessibility: Joi.object({
    slopePercentage: Joi.number().precision(2).min(0).max(100).allow(null),
    pedestrianMinutes: Joi.number().integer().min(0).allow(null),
    abcStandard: Joi.string().trim().max(150).allow(null, ''),
    accessibilityType: Joi.string().trim().max(150).allow(null, ''),
    landCondition: Joi.string().trim().max(150).allow(null, ''),
  })
    .allow(null)
    .optional(),

  basicUtilities: Joi.object({
    waterAccess: Joi.string().trim().max(150).allow(null, ''),
    electricityService: Joi.string().trim().max(150).allow(null, ''),
    sharedBathroom: Joi.boolean().optional(),
    privateBathroom: Joi.boolean().optional(),
    bathroomType: Joi.string().trim().max(150).allow(null, ''),
    sharedKitchen: Joi.boolean().optional(),
    privateKitchen: Joi.boolean().optional(),
    adequateKitchen: Joi.boolean().optional(),
    kitchenType: Joi.string().trim().max(150).allow(null, ''),
  })
    .allow(null)
    .optional(),

  housingCharacteristics: Joi.object({
    housingTypology: Joi.string().trim().max(150).allow(null, ''),
    tenureStatus: Joi.string().trim().max(150).allow(null, ''),
    observations: Joi.string().trim().allow(null, ''),
  })
    .allow(null)
    .optional(),

  constructionElements: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().integer().optional(),
        constructionNumber: Joi.number().integer().min(1).optional(),
        usageType: Joi.string().trim().max(100).allow(null, ''),
        foundationMaterial: Joi.string().trim().max(100).allow(null, ''),
        foundationState: Joi.string().trim().max(50).allow(null, ''),
        wallsMaterial: Joi.string().trim().max(100).allow(null, ''),
        wallsState: Joi.string().trim().max(50).allow(null, ''),
        roofMaterial: Joi.string().trim().max(100).allow(null, ''),
        roofState: Joi.string().trim().max(50).allow(null, ''),
        exteriorPlasterMaterial: Joi.string().trim().max(100).allow(null, ''),
        exteriorPlasterState: Joi.string().trim().max(50).allow(null, ''),
        interiorPlasterMaterial: Joi.string().trim().max(100).allow(null, ''),
        interiorPlasterState: Joi.string().trim().max(50).allow(null, ''),
        ceilingPlasterMaterial: Joi.string().trim().max(100).allow(null, ''),
        ceilingPlasterState: Joi.string().trim().max(50).allow(null, ''),
        floorsMaterial: Joi.string().trim().max(100).allow(null, ''),
        floorsState: Joi.string().trim().max(50).allow(null, ''),
        doorsMaterial: Joi.string().trim().max(100).allow(null, ''),
        doorsState: Joi.string().trim().max(50).allow(null, ''),
        windowsMaterial: Joi.string().trim().max(100).allow(null, ''),
        windowsState: Joi.string().trim().max(50).allow(null, ''),
        electricalInstallation: Joi.string().trim().max(100).allow(null, ''),
        electricalInstallationState: Joi.string().trim().max(50).allow(null, ''),
        canBeImproved: Joi.number().integer().min(0).max(10).optional(),
        cannotBeImproved: Joi.number().integer().min(0).max(10).optional(),
        noImprovementNeeded: Joi.number().integer().min(0).max(10).optional(),
        observations: Joi.string().trim().allow(null, ''),
      }),
    )
    .optional(),

  photos: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().integer().optional(),
        photoType: Joi.string().trim().max(100).required(),
        url: Joi.string().trim().max(500).required(),
        description: Joi.string().trim().max(255).allow(null, ''),
      }),
    )
    .optional(),
});

export const socialDiagnosticSchema = Joi.object({
  formNo: Joi.string().trim().max(100).allow(null, ''),
  evaluationDate: dateString.optional(),
  isCompleted: Joi.boolean().optional(),

  familyMembers: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().integer().optional(),
        personId: Joi.string().trim().max(36).allow(null, '').optional(),
        fullName: Joi.string().trim().min(1).max(150).required(),
        relationship: Joi.string().trim().min(1).max(100).required(),
        documentNo: Joi.string().trim().max(30).allow(null, '').optional(),
        documentIssuedIn: Joi.string().trim().max(50).allow(null, '').optional(),
        sex: Joi.string().trim().valid('M', 'F').allow(null, '').optional(),
        birthDate: dateString.allow(null, '').optional(),
        age: Joi.number().integer().min(0).max(130).allow(null).optional(),
        occupation: Joi.string().trim().max(150).allow(null, ''),
        hasDisability: Joi.boolean().optional(),
        disabilityType: Joi.string().trim().max(150).allow(null, ''),
        disabilityDocument: Joi.string().trim().max(150).allow(null, ''),
      }),
    )
    .optional(),

  answers: Joi.array()
    .items(
      Joi.object({
        evaluationQuestionId: Joi.number().integer().positive().required(),
        answerBoolean: Joi.boolean().allow(null).optional(),
        score: Joi.string()
          .trim()
          .valid('MUY BIEN', 'BIEN', 'REGULAR')
          .allow(null, '')
          .optional(),
      }),
    )
    .optional(),

  constructionKnowledgeObservations: Joi.string().trim().allow(null, ''),

  waterHabits: Joi.object({
    waterSource: Joi.string().trim().max(150).allow(null, ''),
    containerClean: Joi.boolean().optional(),
    containerStatus: Joi.string().trim().max(150).allow(null, ''),
    waterTreatment: Joi.string().trim().max(150).allow(null, ''),
    otherDetails: Joi.string().trim().max(255).allow(null, ''),
  })
    .allow(null)
    .optional(),

  hygiene: Joi.object({
    greywaterDisposal: Joi.string().trim().max(150).allow(null, ''),
    garbageDisposal: Joi.string().trim().max(150).allow(null, ''),
    cleanlinessStatus: Joi.string().trim().max(150).allow(null, ''),
  })
    .allow(null)
    .optional(),

  health: Joi.object({
    prevalentDiseases: Joi.string().trim().max(150).allow(null, ''),
    healthCareAction: Joi.string().trim().max(150).allow(null, ''),
  })
    .allow(null)
    .optional(),
});
