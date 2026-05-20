import { AppError } from './AppError.js';

export class ValidationError extends AppError {
  constructor(message = 'Invalid request data', details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}
