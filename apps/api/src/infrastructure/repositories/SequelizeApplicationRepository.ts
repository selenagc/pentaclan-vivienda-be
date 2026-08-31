import { Op, type Includeable, type Order, type Transaction, type WhereOptions } from 'sequelize';
import { sequelize } from '../database/sequelize.js';
import { ApplicationModel } from '../database/models/ApplicationModel.js';
import { PersonModel } from '../database/models/PersonModel.js';
import { PropertyModel } from '../database/models/PropertyModel.js';
import { PROPERTY_INCLUDE, toPropertyEntity } from './SequelizePropertyRepository.js';
import type { Application } from '../../domain/entities/Application.js';
import type { Person, PersonData } from '../../domain/entities/Person.js';
import type {
  ApplicationRepository,
  ListApplicationsQuery,
  PersonInput,
  RegisterApplicationInput,
  UpdateApplicationInput,
} from '../../domain/repositories/ApplicationRepository.js';
import type { DocumentIssuedIn } from '../../domain/types/DocumentIssuedIn.js';
import type { PageResult } from '../../domain/types/Pagination.js';

/** Columnas propias de la tabla. `applicantName` se resuelve aparte. */
const SORTABLE_FIELDS_MAP: Record<string, string> = {
  submittedAt: 'submitted_at',
  status: 'status',
  createdAt: 'created_at',
};

const PROJECT_INCLUDE: Includeable = {
  association: 'project',
  attributes: ['id', 'name', 'contractNo'],
};

const AUDIT_INCLUDES: Includeable[] = [
  { association: 'user', attributes: ['name'] },
  { association: 'decidedBy', attributes: ['name'] },
];

/** El conyuge se anida un solo nivel: su propio conyuge no interesa. */
const PERSON_INCLUDE: Includeable = {
  association: 'person',
  include: [{ association: 'spouse' }],
};

const APPLICATION_INCLUDE: Includeable = {
  association: 'property',
  include: [PROPERTY_INCLUDE],
};

const INCLUDE_RELATIONS: Includeable[] = [
  PERSON_INCLUDE,
  APPLICATION_INCLUDE,
  PROJECT_INCLUDE,
  ...AUDIT_INCLUDES,
];

function toPersonData(model: PersonModel): PersonData {
  return {
    id: model.id,
    documentNo: model.documentNo,
    documentIssuedIn: model.documentIssuedIn,
    givenNames: model.givenNames,
    paternalSurname: model.paternalSurname,
    maternalSurname: model.maternalSurname,
    phone: model.phone,
    occupation: model.occupation,
    birthDate: model.birthDate,
    sex: model.sex,
  };
}

function toPersonEntity(model: PersonModel): Person {
  return {
    ...toPersonData(model),
    spouse: model.spouse ? toPersonData(model.spouse) : null,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}

function toEntity(model: ApplicationModel): Application {
  const person = model.person;
  const property = model.property;
  const project = model.project;
  const user = model.user;

  // Falla ruidosamente en desarrollo en vez de devolver datos vacios.
  if (!person) {
    throw new Error('SequelizeApplicationRepository: missing `person` include');
  }
  if (!property) {
    throw new Error('SequelizeApplicationRepository: missing `property` include');
  }
  if (!project) {
    throw new Error('SequelizeApplicationRepository: missing `project` include');
  }
  if (!user) {
    throw new Error('SequelizeApplicationRepository: missing `user` include');
  }

  return {
    id: model.id,
    status: model.status,
    submittedAt: model.submittedAt,
    person: toPersonEntity(person),
    property: toPropertyEntity(property),
    project: { id: project.id, name: project.name, contractNo: project.contractNo },
    userName: user.name,
    decidedAt: model.decidedAt,
    // Nulo mientras nadie haya decidido; lo llena PV-31.
    decidedByName: model.decidedBy?.name ?? null,
    rejectionReason: model.rejectionReason,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}

/**
 * Crea la persona o reutiliza la que ya tenga ese CI, y en ambos casos deja sus
 * datos como los trae el formulario: el operador de campo llena siempre lo
 * mismo sin tener que saber si esa persona ya estaba registrada.
 *
 * `spouseId` se escribe siempre, incluido `null`, para que un titular que dejo
 * de declarar conyuge quede efectivamente desvinculado.
 */
async function upsertPerson(
  input: PersonInput,
  spouseId: string | null,
  tx: Transaction,
): Promise<PersonModel> {
  const existing = await PersonModel.findOne({
    where: { documentNo: input.documentNo, documentIssuedIn: input.documentIssuedIn },
    transaction: tx,
  });

  if (existing) {
    await existing.update({ ...input, spouseId }, { transaction: tx });
    return existing;
  }

  return PersonModel.create({ ...input, spouseId }, { transaction: tx });
}

export class SequelizeApplicationRepository implements ApplicationRepository {
  async register(input: RegisterApplicationInput): Promise<Application> {
    const id = await sequelize.transaction(async (tx) => {
      // El conyuge primero: el titular necesita su id para vincularlo.
      const spouse = input.spouse ? await upsertPerson(input.spouse, null, tx) : null;
      const person = await upsertPerson(input.person, spouse?.id ?? null, tx);

      let propertyId = input.propertyId;
      if (!propertyId) {
        if (!input.property) {
          throw new Error('SequelizeApplicationRepository: register needs propertyId or property');
        }
        const created = await PropertyModel.create({ ...input.property }, { transaction: tx });
        propertyId = created.id;
      }

      const application = await ApplicationModel.create(
        {
          personId: person.id,
          projectId: input.projectId,
          propertyId,
          userId: input.userId,
          submittedAt: input.submittedAt,
          status: 'pending',
        },
        { transaction: tx },
      );

      return application.id;
    });

    const found = await this.findById(id);
    if (!found) {
      throw new Error('SequelizeApplicationRepository: application not found right after register');
    }
    return found;
  }

  async findById(id: string): Promise<Application | null> {
    const found = await ApplicationModel.findByPk(id, { include: INCLUDE_RELATIONS });
    return found ? toEntity(found) : null;
  }

  async findByDocumentAndProject(
    documentNo: string,
    documentIssuedIn: DocumentIssuedIn,
    projectId: string,
  ): Promise<Application | null> {
    const found = await ApplicationModel.findOne({
      where: { projectId },
      include: [
        // `required: true` para que el documento filtre y no solo se anide.
        { ...(PERSON_INCLUDE as object), required: true, where: { documentNo, documentIssuedIn } },
        APPLICATION_INCLUDE,
        PROJECT_INCLUDE,
        ...AUDIT_INCLUDES,
      ],
    });
    return found ? toEntity(found) : null;
  }

  async update(id: string, input: UpdateApplicationInput): Promise<Application | null> {
    const found = await ApplicationModel.findByPk(id);
    if (!found) return null;

    await sequelize.transaction(async (tx) => {
      if (input.person) {
        await PersonModel.update(input.person, {
          where: { id: found.personId },
          transaction: tx,
        });
      }

      // `undefined` es "no tocar"; `null` es "desvincular". Desvincular no borra
      // a la persona: puede ser titular de su propia postulacion.
      if (input.spouse !== undefined) {
        const spouse = input.spouse ? await upsertPerson(input.spouse, null, tx) : null;
        await PersonModel.update(
          { spouseId: spouse?.id ?? null },
          { where: { id: found.personId }, transaction: tx },
        );
      }

      // Apuntar a otro inmueble y corregir el actual son cosas distintas: lo
      // primero cambia la postulacion, lo segundo corrige el dato de campo.
      if (input.propertyId === undefined && input.property) {
        await PropertyModel.update(input.property, {
          where: { id: found.propertyId },
          transaction: tx,
        });
      }

      const patch: { propertyId?: string; submittedAt?: Date } = {};
      if (input.propertyId !== undefined) patch.propertyId = input.propertyId;
      if (input.submittedAt !== undefined) patch.submittedAt = input.submittedAt;
      if (Object.keys(patch).length > 0) {
        await found.update(patch, { transaction: tx });
      }
    });

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    // Con `paranoid: true`, destroy escribe deleted_at en vez de borrar la fila.
    const deleted = await ApplicationModel.destroy({ where: { id } });
    return deleted > 0;
  }

  async list(query: ListApplicationsQuery): Promise<PageResult<Application>> {
    const conditions: WhereOptions[] = [];

    if (query.projectId) {
      conditions.push({ projectId: query.projectId });
    }
    if (query.status) {
      conditions.push({ status: query.status });
    }

    const where: WhereOptions = conditions.length ? { [Op.and]: conditions } : {};

    // La busqueda cae sobre la persona, no sobre la postulacion: se busca por
    // nombre o CI del solicitante. `required: true` convierte el LEFT JOIN en
    // INNER para que filtre de verdad.
    const personInclude: Includeable = query.search
      ? {
          ...(PERSON_INCLUDE as object),
          required: true,
          where: {
            [Op.or]: [
              { givenNames: { [Op.iLike]: `%${query.search}%` } },
              { paternalSurname: { [Op.iLike]: `%${query.search}%` } },
              { maternalSurname: { [Op.iLike]: `%${query.search}%` } },
              { documentNo: { [Op.iLike]: `%${query.search}%` } },
            ],
          },
        }
      : PERSON_INCLUDE;

    // El municipio es del inmueble: "postulaciones cuya vivienda esta aqui".
    const propertyInclude: Includeable =
      query.municipalityId !== undefined
        ? {
            ...(APPLICATION_INCLUDE as object),
            required: true,
            where: { municipalityId: query.municipalityId },
          }
        : APPLICATION_INCLUDE;

    const direction = query.sort.sortOrder.toUpperCase();
    const order: Order =
      query.sort.sortBy === 'applicantName'
        ? [[{ model: PersonModel, as: 'person' }, 'paternal_surname', direction]]
        : [[SORTABLE_FIELDS_MAP[query.sort.sortBy] ?? 'submitted_at', direction]];

    const { rows, count } = await ApplicationModel.findAndCountAll({
      where,
      include: [personInclude, propertyInclude, PROJECT_INCLUDE, ...AUDIT_INCLUDES],
      limit: query.pagination.limit,
      offset: query.pagination.offset,
      order,
      // Cuenta postulaciones y no filas del join. Hoy todos los include son
      // belongsTo y no multiplican, pero el dia que entre un hasMany el total
      // se inflaria en silencio.
      distinct: true,
    });

    return {
      data: rows.map(toEntity),
      total: count,
    };
  }
}
