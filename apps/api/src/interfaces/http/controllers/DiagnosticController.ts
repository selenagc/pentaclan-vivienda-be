import type { RequestHandler } from 'express';
import { SequelizeDiagnosticRecordRepository } from '../../../infrastructure/repositories/SequelizeDiagnosticRecordRepository.js';
import { SequelizeApplicationRepository } from '../../../infrastructure/repositories/SequelizeApplicationRepository.js';
import { SequelizeProjectAssignmentRepository } from '../../../infrastructure/repositories/SequelizeProjectAssignmentRepository.js';
import { S3StorageAdapter } from '../../../infrastructure/storage/S3StorageAdapter.js';
import { GetDiagnosticRecordUseCase } from '../../../application/diagnostics/GetDiagnosticRecordUseCase.js';
import { SaveTechnicalDiagnosisUseCase } from '../../../application/diagnostics/SaveTechnicalDiagnosisUseCase.js';
import { SaveSocialDiagnosisUseCase } from '../../../application/diagnostics/SaveSocialDiagnosisUseCase.js';
import { GetEvaluationQuestionsUseCase } from '../../../application/diagnostics/GetEvaluationQuestionsUseCase.js';
import { GetPhotoUploadUrlUseCase } from '../../../application/diagnostics/GetPhotoUploadUrlUseCase.js';
import { ConfirmPhotoUploadUseCase } from '../../../application/diagnostics/ConfirmPhotoUploadUseCase.js';
import { GetDiagnosticPhotosUseCase } from '../../../application/diagnostics/GetDiagnosticPhotosUseCase.js';
import { DeleteDiagnosticPhotoUseCase } from '../../../application/diagnostics/DeleteDiagnosticPhotoUseCase.js';
import { asyncHandler } from '../../../shared/http/asyncHandler.js';
import { UnauthorizedError } from '../../../shared/errors/UnauthorizedError.js';
import { ForbiddenError } from '../../../shared/errors/ForbiddenError.js';
import { NotFoundError } from '../../../shared/errors/NotFoundError.js';

const diagnosticRepo = new SequelizeDiagnosticRecordRepository();
const applicationRepo = new SequelizeApplicationRepository();
const assignmentRepo = new SequelizeProjectAssignmentRepository();
const storageAdapter = new S3StorageAdapter();

const getDiagnosticUseCase = new GetDiagnosticRecordUseCase(
  diagnosticRepo,
  applicationRepo,
  storageAdapter,
);
const saveTechnicalUseCase = new SaveTechnicalDiagnosisUseCase(diagnosticRepo, applicationRepo);
const saveSocialUseCase = new SaveSocialDiagnosisUseCase(diagnosticRepo, applicationRepo);
const getQuestionsUseCase = new GetEvaluationQuestionsUseCase(diagnosticRepo);

const getUploadUrlUseCase = new GetPhotoUploadUrlUseCase(applicationRepo, storageAdapter);
const confirmPhotoUseCase = new ConfirmPhotoUploadUseCase(
  diagnosticRepo,
  applicationRepo,
  storageAdapter,
);
const getPhotosUseCase = new GetDiagnosticPhotosUseCase(
  diagnosticRepo,
  applicationRepo,
  storageAdapter,
);
const deletePhotoUseCase = new DeleteDiagnosticPhotoUseCase(
  diagnosticRepo,
  applicationRepo,
  storageAdapter,
);

export const showDiagnostic: RequestHandler = asyncHandler(async (req, res) => {
  const applicationId = req.params.id;
  const application = await applicationRepo.findById(applicationId);
  if (!application) {
    throw new NotFoundError(`Application ${applicationId} not found`);
  }

  if (req.user?.role === 'social_lead' || req.user?.role === 'technical_lead') {
    const isAssigned = await assignmentRepo.isUserAssignedToProject(
      req.user.id,
      application.project.id,
    );
    if (!isAssigned) {
      throw new ForbiddenError('No estás asignado al proyecto de esta postulación.');
    }
  }

  const diagnostic = await getDiagnosticUseCase.execute(applicationId);
  res.status(200).json({ data: diagnostic });
});

export const saveTechnical: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw new UnauthorizedError();

  const applicationId = req.params.id;
  const application = await applicationRepo.findById(applicationId);
  if (!application) {
    throw new NotFoundError(`Application ${applicationId} not found`);
  }

  if (req.user.role === 'technical_lead') {
    const isAssigned = await assignmentRepo.isUserAssignedToProject(
      req.user.id,
      application.project.id,
    );
    if (!isAssigned) {
      throw new ForbiddenError('No estás asignado al proyecto de esta postulación.');
    }
  }

  const updated = await saveTechnicalUseCase.execute(applicationId, req.body, req.user.id);
  res.status(200).json({ data: updated, message: 'Ficha técnica guardada exitosamente' });
});

export const saveSocial: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw new UnauthorizedError();

  const applicationId = req.params.id;
  const application = await applicationRepo.findById(applicationId);
  if (!application) {
    throw new NotFoundError(`Application ${applicationId} not found`);
  }

  if (req.user.role === 'social_lead') {
    const isAssigned = await assignmentRepo.isUserAssignedToProject(
      req.user.id,
      application.project.id,
    );
    if (!isAssigned) {
      throw new ForbiddenError('No estás asignado al proyecto de esta postulación.');
    }
  }

  const updated = await saveSocialUseCase.execute(applicationId, req.body, req.user.id);
  res.status(200).json({ data: updated, message: 'Ficha social guardada exitosamente' });
});

export const getQuestions: RequestHandler = asyncHandler(async (_req, res) => {
  const questions = await getQuestionsUseCase.execute();
  res.status(200).json({ data: questions });
});

export const getPhotoUploadUrl: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw new UnauthorizedError();

  const applicationId = req.params.id;
  const application = await applicationRepo.findById(applicationId);
  if (!application) {
    throw new NotFoundError(`Application ${applicationId} not found`);
  }

  if (req.user.role === 'social_lead' || req.user.role === 'technical_lead') {
    const isAssigned = await assignmentRepo.isUserAssignedToProject(
      req.user.id,
      application.project.id,
    );
    if (!isAssigned) {
      throw new ForbiddenError('No estás asignado al proyecto de esta postulación.');
    }
  }

  const result = await getUploadUrlUseCase.execute(applicationId, req.body, req.user.role);
  res.status(200).json({ data: result });
});

export const confirmPhotoUpload: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw new UnauthorizedError();

  const applicationId = req.params.id;
  const application = await applicationRepo.findById(applicationId);
  if (!application) {
    throw new NotFoundError(`Application ${applicationId} not found`);
  }

  if (req.user.role === 'social_lead' || req.user.role === 'technical_lead') {
    const isAssigned = await assignmentRepo.isUserAssignedToProject(
      req.user.id,
      application.project.id,
    );
    if (!isAssigned) {
      throw new ForbiddenError('No estás asignado al proyecto de esta postulación.');
    }
  }

  const photo = await confirmPhotoUseCase.execute(
    applicationId,
    req.body,
    req.user.id,
    req.user.role,
  );
  res.status(201).json({ data: photo, message: 'Fotografía registrada exitosamente' });
});

export const listPhotos: RequestHandler = asyncHandler(async (req, res) => {
  const applicationId = req.params.id;
  const application = await applicationRepo.findById(applicationId);
  if (!application) {
    throw new NotFoundError(`Application ${applicationId} not found`);
  }

  if (req.user?.role === 'social_lead' || req.user?.role === 'technical_lead') {
    const isAssigned = await assignmentRepo.isUserAssignedToProject(
      req.user.id,
      application.project.id,
    );
    if (!isAssigned) {
      throw new ForbiddenError('No estás asignado al proyecto de esta postulación.');
    }
  }

  const category = req.query.category as 'technical' | 'social' | undefined;
  const photos = await getPhotosUseCase.execute(applicationId, category);
  res.status(200).json({ data: photos });
});

export const deletePhoto: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw new UnauthorizedError();

  const applicationId = req.params.id;
  const photoId = Number(req.params.photoId);
  const application = await applicationRepo.findById(applicationId);
  if (!application) {
    throw new NotFoundError(`Application ${applicationId} not found`);
  }

  if (req.user.role === 'social_lead' || req.user.role === 'technical_lead') {
    const isAssigned = await assignmentRepo.isUserAssignedToProject(
      req.user.id,
      application.project.id,
    );
    if (!isAssigned) {
      throw new ForbiddenError('No estás asignado al proyecto de esta postulación.');
    }
  }

  await deletePhotoUseCase.execute(applicationId, photoId, req.user.role);
  res.status(200).json({ message: 'Fotografía eliminada exitosamente' });
});
