import { DepartmentModel } from './models/DepartmentModel.js';
import { ProvinceModel } from './models/ProvinceModel.js';
import { MunicipalityModel } from './models/MunicipalityModel.js';
import { PublicEntityModel } from './models/PublicEntityModel.js';
import { ProjectModel } from './models/ProjectModel.js';
import { UserModel } from './models/UserModel.js';
import { PropertyModel } from './models/PropertyModel.js';
import { PersonModel } from './models/PersonModel.js';
import { ApplicationModel } from './models/ApplicationModel.js';
import { ProjectAssignmentModel } from './models/ProjectAssignmentModel.js';
import { DiagnosticRecordModel } from './models/DiagnosticRecordModel.js';
import { FamilyMemberModel } from './models/FamilyMemberModel.js';
import { EvaluationQuestionModel } from './models/EvaluationQuestionModel.js';
import { DiagnosticAnswerModel } from './models/DiagnosticAnswerModel.js';
import { WaterConsumptionHabitModel } from './models/WaterConsumptionHabitModel.js';
import { HousingHygieneModel } from './models/HousingHygieneModel.js';
import { HealthConditionModel } from './models/HealthConditionModel.js';
import { LandAccessibilityModel } from './models/LandAccessibilityModel.js';
import { BasicUtilityModel } from './models/BasicUtilityModel.js';
import { HousingCharacteristicModel } from './models/HousingCharacteristicModel.js';
import { ConstructionElementModel } from './models/ConstructionElementModel.js';
import { DiagnosticPhotoModel } from './models/DiagnosticPhotoModel.js';

// Jerarquia del catalogo geografico: Departamento -> Provincia -> Municipio.
// Se declara aqui (y no dentro de cada modelo) para evitar imports circulares.
DepartmentModel.hasMany(ProvinceModel, {
  foreignKey: 'departmentId',
  sourceKey: 'id',
  as: 'provinces',
  onDelete: 'RESTRICT',
});
ProvinceModel.belongsTo(DepartmentModel, {
  foreignKey: 'departmentId',
  targetKey: 'id',
  as: 'department',
});

ProvinceModel.hasMany(MunicipalityModel, {
  foreignKey: 'provinceId',
  sourceKey: 'id',
  as: 'municipalities',
  onDelete: 'RESTRICT',
});
MunicipalityModel.belongsTo(ProvinceModel, {
  foreignKey: 'provinceId',
  targetKey: 'id',
  as: 'province',
});

// Las entidades publicas no cuelgan de un departamento (PV-19): son un catalogo
// nacional. Si mas adelante hace falta cobertura departamental, va en una tabla
// puente, no en una FK aqui.

// Proyectos (PV-21): entidad financiadora y usuario creador. Ambas relaciones
// son RESTRICT, para que no se pueda borrar lo que un proyecto referencia.
PublicEntityModel.hasMany(ProjectModel, {
  foreignKey: 'publicEntityId',
  sourceKey: 'id',
  as: 'projects',
  onDelete: 'RESTRICT',
});
ProjectModel.belongsTo(PublicEntityModel, {
  foreignKey: 'publicEntityId',
  targetKey: 'id',
  as: 'publicEntity',
});

// Ubicacion del proyecto: se resuelve hasta el departamento a traves de la
// jerarquia del catalogo, por eso alcanza con la FK al municipio.
MunicipalityModel.hasMany(ProjectModel, {
  foreignKey: 'municipalityId',
  sourceKey: 'id',
  as: 'projects',
  onDelete: 'RESTRICT',
});
ProjectModel.belongsTo(MunicipalityModel, {
  foreignKey: 'municipalityId',
  targetKey: 'id',
  as: 'municipality',
});

UserModel.hasMany(ProjectModel, {
  foreignKey: 'userId',
  sourceKey: 'id',
  as: 'projects',
  onDelete: 'RESTRICT',
});
ProjectModel.belongsTo(UserModel, {
  foreignKey: 'userId',
  targetKey: 'id',
  as: 'user',
});

// Registro de solicitantes (PV-30).

// Ubicacion del inmueble: igual que el proyecto, la FK llega al municipio y el
// resto de la cadena sale de la jerarquia del catalogo.
MunicipalityModel.hasMany(PropertyModel, {
  foreignKey: 'municipalityId',
  sourceKey: 'id',
  as: 'properties',
  onDelete: 'RESTRICT',
});
PropertyModel.belongsTo(MunicipalityModel, {
  foreignKey: 'municipalityId',
  targetKey: 'id',
  as: 'municipality',
});

// El conyuge es otra persona de la misma tabla. La relacion se declara en un
// solo sentido, del titular al conyuge, que es lo que captura el formulario.
PersonModel.belongsTo(PersonModel, {
  foreignKey: 'spouseId',
  targetKey: 'id',
  as: 'spouse',
});

// La postulacion ata persona, vivienda y proyecto. Las tres son RESTRICT: si la
// postulacion existe, nada de lo que referencia se puede borrar por debajo.
PersonModel.hasMany(ApplicationModel, {
  foreignKey: 'personId',
  sourceKey: 'id',
  as: 'applications',
  onDelete: 'RESTRICT',
});
ApplicationModel.belongsTo(PersonModel, {
  foreignKey: 'personId',
  targetKey: 'id',
  as: 'person',
});

PropertyModel.hasMany(ApplicationModel, {
  foreignKey: 'propertyId',
  sourceKey: 'id',
  as: 'applications',
  onDelete: 'RESTRICT',
});
ApplicationModel.belongsTo(PropertyModel, {
  foreignKey: 'propertyId',
  targetKey: 'id',
  as: 'property',
});

ProjectModel.hasMany(ApplicationModel, {
  foreignKey: 'projectId',
  sourceKey: 'id',
  as: 'applications',
  onDelete: 'RESTRICT',
});
ApplicationModel.belongsTo(ProjectModel, {
  foreignKey: 'projectId',
  targetKey: 'id',
  as: 'project',
});

// Dos FK a users en la misma tabla, por eso los alias explicitos. Del lado de
// users solo se declara la inversa de `user` (quien registro): "las
// postulaciones que este usuario decidio" no la consulta nadie.
UserModel.hasMany(ApplicationModel, {
  foreignKey: 'userId',
  sourceKey: 'id',
  as: 'applications',
  onDelete: 'RESTRICT',
});
ApplicationModel.belongsTo(UserModel, {
  foreignKey: 'userId',
  targetKey: 'id',
  as: 'user',
});
ApplicationModel.belongsTo(UserModel, {
  foreignKey: 'decidedById',
  targetKey: 'id',
  as: 'decidedBy',
});

// Asignacion de evaluadores a proyectos (PV-35).
// Tabla intermedia N:M con cascade delete en ambas direcciones.
ProjectAssignmentModel.belongsTo(UserModel, {
  foreignKey: 'userId',
  targetKey: 'id',
  as: 'user',
  onDelete: 'CASCADE',
});
ProjectAssignmentModel.belongsTo(ProjectModel, {
  foreignKey: 'projectId',
  targetKey: 'id',
  as: 'project',
  onDelete: 'CASCADE',
});

UserModel.hasMany(ProjectAssignmentModel, {
  foreignKey: 'userId',
  sourceKey: 'id',
  as: 'assignments',
  onDelete: 'CASCADE',
});
ProjectModel.hasMany(ProjectAssignmentModel, {
  foreignKey: 'projectId',
  sourceKey: 'id',
  as: 'assignments',
  onDelete: 'CASCADE',
});

UserModel.belongsToMany(ProjectModel, {
  through: ProjectAssignmentModel,
  foreignKey: 'userId',
  otherKey: 'projectId',
  as: 'assignedProjects',
});
ProjectModel.belongsToMany(UserModel, {
  through: ProjectAssignmentModel,
  foreignKey: 'projectId',
  otherKey: 'userId',
  as: 'assignedUsers',
});

// Ficha Diagnostico (PV-39)
// 1:1 con la postulacion (id_application)
ApplicationModel.hasOne(DiagnosticRecordModel, {
  foreignKey: 'applicationId',
  sourceKey: 'id',
  as: 'diagnosticRecord',
  onDelete: 'CASCADE',
});
DiagnosticRecordModel.belongsTo(ApplicationModel, {
  foreignKey: 'applicationId',
  targetKey: 'id',
  as: 'application',
});

// Evaluadores tecnico y social
UserModel.hasMany(DiagnosticRecordModel, {
  foreignKey: 'technicalUserId',
  sourceKey: 'id',
  as: 'technicalEvaluations',
  onDelete: 'SET NULL',
});
DiagnosticRecordModel.belongsTo(UserModel, {
  foreignKey: 'technicalUserId',
  targetKey: 'id',
  as: 'technicalUser',
});

UserModel.hasMany(DiagnosticRecordModel, {
  foreignKey: 'socialUserId',
  sourceKey: 'id',
  as: 'socialEvaluations',
  onDelete: 'SET NULL',
});
DiagnosticRecordModel.belongsTo(UserModel, {
  foreignKey: 'socialUserId',
  targetKey: 'id',
  as: 'socialUser',
});

// Relaciones 1:N de la ficha
DiagnosticRecordModel.hasMany(FamilyMemberModel, {
  foreignKey: 'diagnosticRecordId',
  sourceKey: 'id',
  as: 'familyMembers',
  onDelete: 'CASCADE',
});
FamilyMemberModel.belongsTo(DiagnosticRecordModel, {
  foreignKey: 'diagnosticRecordId',
  targetKey: 'id',
  as: 'diagnosticRecord',
});
FamilyMemberModel.belongsTo(PersonModel, {
  foreignKey: 'personId',
  targetKey: 'id',
  as: 'person',
  onDelete: 'SET NULL',
});

DiagnosticRecordModel.hasMany(DiagnosticAnswerModel, {
  foreignKey: 'diagnosticRecordId',
  sourceKey: 'id',
  as: 'answers',
  onDelete: 'CASCADE',
});
DiagnosticAnswerModel.belongsTo(DiagnosticRecordModel, {
  foreignKey: 'diagnosticRecordId',
  targetKey: 'id',
  as: 'diagnosticRecord',
});

EvaluationQuestionModel.hasMany(DiagnosticAnswerModel, {
  foreignKey: 'evaluationQuestionId',
  sourceKey: 'id',
  as: 'answers',
  onDelete: 'RESTRICT',
});
DiagnosticAnswerModel.belongsTo(EvaluationQuestionModel, {
  foreignKey: 'evaluationQuestionId',
  targetKey: 'id',
  as: 'question',
});

DiagnosticRecordModel.hasMany(ConstructionElementModel, {
  foreignKey: 'diagnosticRecordId',
  sourceKey: 'id',
  as: 'constructionElements',
  onDelete: 'CASCADE',
});
ConstructionElementModel.belongsTo(DiagnosticRecordModel, {
  foreignKey: 'diagnosticRecordId',
  targetKey: 'id',
  as: 'diagnosticRecord',
});

DiagnosticRecordModel.hasMany(DiagnosticPhotoModel, {
  foreignKey: 'diagnosticRecordId',
  sourceKey: 'id',
  as: 'photos',
  onDelete: 'CASCADE',
});
DiagnosticPhotoModel.belongsTo(DiagnosticRecordModel, {
  foreignKey: 'diagnosticRecordId',
  targetKey: 'id',
  as: 'diagnosticRecord',
});

// Relaciones 1:1 de la ficha
DiagnosticRecordModel.hasOne(WaterConsumptionHabitModel, {
  foreignKey: 'diagnosticRecordId',
  sourceKey: 'id',
  as: 'waterHabits',
  onDelete: 'CASCADE',
});
WaterConsumptionHabitModel.belongsTo(DiagnosticRecordModel, {
  foreignKey: 'diagnosticRecordId',
  targetKey: 'id',
  as: 'diagnosticRecord',
});

DiagnosticRecordModel.hasOne(HousingHygieneModel, {
  foreignKey: 'diagnosticRecordId',
  sourceKey: 'id',
  as: 'hygiene',
  onDelete: 'CASCADE',
});
HousingHygieneModel.belongsTo(DiagnosticRecordModel, {
  foreignKey: 'diagnosticRecordId',
  targetKey: 'id',
  as: 'diagnosticRecord',
});

DiagnosticRecordModel.hasOne(HealthConditionModel, {
  foreignKey: 'diagnosticRecordId',
  sourceKey: 'id',
  as: 'health',
  onDelete: 'CASCADE',
});
HealthConditionModel.belongsTo(DiagnosticRecordModel, {
  foreignKey: 'diagnosticRecordId',
  targetKey: 'id',
  as: 'diagnosticRecord',
});

DiagnosticRecordModel.hasOne(LandAccessibilityModel, {
  foreignKey: 'diagnosticRecordId',
  sourceKey: 'id',
  as: 'landAccessibility',
  onDelete: 'CASCADE',
});
LandAccessibilityModel.belongsTo(DiagnosticRecordModel, {
  foreignKey: 'diagnosticRecordId',
  targetKey: 'id',
  as: 'diagnosticRecord',
});

DiagnosticRecordModel.hasOne(BasicUtilityModel, {
  foreignKey: 'diagnosticRecordId',
  sourceKey: 'id',
  as: 'basicUtilities',
  onDelete: 'CASCADE',
});
BasicUtilityModel.belongsTo(DiagnosticRecordModel, {
  foreignKey: 'diagnosticRecordId',
  targetKey: 'id',
  as: 'diagnosticRecord',
});

DiagnosticRecordModel.hasOne(HousingCharacteristicModel, {
  foreignKey: 'diagnosticRecordId',
  sourceKey: 'id',
  as: 'housingCharacteristics',
  onDelete: 'CASCADE',
});
HousingCharacteristicModel.belongsTo(DiagnosticRecordModel, {
  foreignKey: 'diagnosticRecordId',
  targetKey: 'id',
  as: 'diagnosticRecord',
});

