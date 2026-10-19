import Joi from 'joi';
import { APPLICATION_STATUS_VALUES } from '../../../domain/types/ApplicationStatus.js';
import { DOCUMENT_ISSUED_IN_VALUES } from '../../../domain/types/DocumentIssuedIn.js';
import { SEX_VALUES } from '../../../domain/types/Sex.js';

const uuid = Joi.string().uuid({ version: 'uuidv4' });
const municipalityId = Joi.number().integer().positive();

/**
 * Se valida como string y no con `Joi.date()` a proposito: la columna es
 * DATEONLY y convertirla a Date la ancla a un huso horario, con lo que una
 * fecha de nacimiento boliviana serializada a UTC se corre un dia hacia atras.
 */
const birthDate = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .custom((value: string, helpers) => {
    const parsed = new Date(`${value}T00:00:00Z`);
    if (Number.isNaN(parsed.getTime())) return helpers.error('any.invalid');
    // Nacer en el futuro es error de captura, no un caso limite.
    if (parsed.getTime() > Date.now()) return helpers.error('any.invalid');
    return value;
  })
  .messages({
    'string.pattern.base': '"birthDate" must be a date in YYYY-MM-DD format',
    'any.invalid': '"birthDate" must be a real date, not in the future',
  });

/**
 * Obligatorios el documento, los nombres, la fecha de nacimiento y el sexo: son
 * la base de los cortes demograficos del programa y el dato ya viene en el CI
 * que se esta transcribiendo. Opcionales el apellido materno (hay gente que no
 * lo tiene), el telefono y la ocupacion, que en campo faltan seguido.
 */
const personFields = {
  documentNo: Joi.string().trim().min(1).max(20),
  documentIssuedIn: Joi.string().trim().uppercase().valid(...DOCUMENT_ISSUED_IN_VALUES),
  givenNames: Joi.string().trim().min(1).max(150),
  paternalSurname: Joi.string().trim().min(1).max(100),
  maternalSurname: Joi.string().trim().max(100).allow(null, ''),
  phone: Joi.string().trim().max(30).allow(null, ''),
  occupation: Joi.string().trim().max(120).allow(null, ''),
  birthDate,
  sex: Joi.string().trim().uppercase().valid(...SEX_VALUES),
};

const REQUIRED_PERSON_FIELDS: string[] = [
  'documentNo',
  'documentIssuedIn',
  'givenNames',
  'paternalSurname',
  'birthDate',
  'sex',
];

const personSchema = Joi.object(personFields).fork(REQUIRED_PERSON_FIELDS, (field) =>
  field.required(),
);

/** Para editar: los mismos campos, todos opcionales, pero al menos uno. */
const personPatchSchema = Joi.object(personFields).min(1);

const propertyFields = {
  // Los tres son opcionales porque en area rural la direccion suele ser solo la
  // comunidad, pero al menos uno hace falta para que el buscador sirva.
  community: Joi.string().trim().max(150).allow(null, ''),
  zone: Joi.string().trim().max(150).allow(null, ''),
  address: Joi.string().trim().max(250).allow(null, ''),
  latitude: Joi.number().min(-90).max(90),
  longitude: Joi.number().min(-180).max(180),
  municipalityId,
};

const propertySchema = Joi.object(propertyFields)
  .fork(['latitude', 'longitude', 'municipalityId'], (field) => field.required())
  .or('community', 'address');

const propertyPatchSchema = Joi.object(propertyFields).min(1);

/**
 * El creador y el estado se toman del servidor. Se declaran como `forbidden()`
 * (en vez de dejarlos caer con stripUnknown) para que un cliente que intente
 * fijarlos reciba un 400 explicito en lugar de un exito enganoso. `status` y el
 * bloque de decision se manejan en la aprobacion (PV-32), no aqui.
 */
const serverOwnedFields = {
  userId: Joi.any().forbidden(),
  id: Joi.any().forbidden(),
  status: Joi.any().forbidden(),
  decidedAt: Joi.any().forbidden(),
  decidedBy: Joi.any().forbidden(),
  rejectionReason: Joi.any().forbidden(),
  createdAt: Joi.any().forbidden(),
  updatedAt: Joi.any().forbidden(),
};

export const applicationIdParamsSchema = Joi.object({
  id: uuid.required(),
});

/**
 * El inmueble entra de dos formas y solo una a la vez: `propertyId` cuando el
 * operador lo eligio del buscador, `property` cuando lo levanto en campo. El
 * `xor` de Joi rechaza tanto mandar los dos como no mandar ninguno.
 */
export const registerApplicationSchema = Joi.object({
  projectId: uuid.required(),
  person: personSchema.required(),
  spouse: personSchema.allow(null).default(null),
  propertyId: uuid,
  property: propertySchema,
  submittedAt: Joi.date().iso().max('now').default(() => new Date()),
  ...serverOwnedFields,
}).xor('propertyId', 'property');

export const updateApplicationSchema = Joi.object({
  person: personPatchSchema,
  // `null` desvincula al conyuge sin borrar a esa persona.
  spouse: personSchema.allow(null),
  propertyId: uuid,
  property: propertyPatchSchema,
  submittedAt: Joi.date().iso().max('now'),
  ...serverOwnedFields,
})
  .min(1)
  .oxor('propertyId', 'property');

/**
 * En la decision (PV-32) el estado y su auditoria los pone el servidor: quien
 * decide sale del token y la hora del reloj del servidor. Se prohiben explicito
 * por lo mismo que en el alta: un 400 claro antes que un exito enganoso.
 *
 * `rejectionReason` no esta aqui porque es el unico campo del bloque que el
 * cliente si manda, y solo al rechazar.
 */
const decisionServerOwnedFields = {
  status: Joi.any().forbidden(),
  decidedAt: Joi.any().forbidden(),
  decidedBy: Joi.any().forbidden(),
};

/** Aprobar no lleva cuerpo: quien y cuando salen del servidor. */
export const approveApplicationSchema = Joi.object({
  // Prohibido tambien al aprobar: un beneficiario con motivo de rechazo
  // colgado es un dato que despues nadie sabe leer.
  rejectionReason: Joi.any().forbidden(),
  ...decisionServerOwnedFields,
});

/**
 * El motivo es obligatorio: un rechazo sin explicacion es una fila que nadie
 * puede justificar en una auditoria. 500 es el largo de la columna.
 */
export const rejectApplicationSchema = Joi.object({
  rejectionReason: Joi.string().trim().min(1).max(500).required(),
  ...decisionServerOwnedFields,
});

/**
 * Filtro de estado: uno solo (`?status=approved`) o varios, separados por coma
 * (`?status=pending,rejected`) o repitiendo el parametro. Siempre normaliza a
 * un array, para que el repositorio tenga una sola forma que manejar.
 *
 * Acepta varios porque las dos pestanas del padron se piden con este mismo
 * endpoint: los beneficiarios son `approved`, y los solicitantes son todos los
 * demas. Con un unico valor, esa segunda lista habria que armarla filtrando en
 * el cliente, y el total y las paginas —que los cuenta el servidor— quedarian
 * descuadrados.
 */
const statusFilter = Joi.any()
  .custom((value: unknown, helpers) => {
    const raw = Array.isArray(value) ? value : String(value).split(',');
    const values = raw.map((item) => String(item).trim()).filter(Boolean);

    if (values.length === 0) return helpers.error('any.invalid');
    if (values.some((item) => !APPLICATION_STATUS_VALUES.includes(item as never))) {
      return helpers.error('any.invalid');
    }

    // Repetir un estado no cambia el resultado, pero ensucia el IN.
    return [...new Set(values)];
  })
  .messages({
    'any.invalid': `"status" must be one or more of: ${APPLICATION_STATUS_VALUES.join(', ')}`,
  });

export const listApplicationsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string()
    .valid('submittedAt', 'status', 'createdAt', 'applicantName')
    .default('submittedAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  /** Busca por nombres, apellidos o numero de documento del titular. */
  search: Joi.string().trim().max(200),
  projectId: uuid,
  status: statusFilter,
  municipalityId,
});
