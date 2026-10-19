import { AppError } from './AppError.js';

/**
 * 409. El `code` es lo que el cliente traduce: la UI mapea por codigo y nunca
 * muestra el `message`, que va en ingles y es tecnico. Por eso un conflicto
 * que el usuario pueda resolver de forma distinta merece su propio codigo en
 * vez de caer todos en `CONFLICT`, que solo permite un mensaje generico.
 */
export class ConflictError extends AppError {
  constructor(message = 'Resource conflict', code = 'CONFLICT', details?: unknown) {
    super(message, 409, code, details);
  }
}
