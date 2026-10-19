'use strict';

const crypto = require('node:crypto');

/**
 * Proyecto de demostracion con el padron ya decidido (PV-32).
 *
 * SOLO DESARROLLO, igual que `demo-applications`: son personas inventadas con
 * CI ficticio y decisiones que nadie tomo de verdad.
 *
 * Por que un proyecto aparte y no ampliar el de PV-30: aquel fija el estado de
 * partida del modulo (todo `pending`, nadie decidio nunca) y la coleccion
 * Postman se apoya en eso. Este levanta el estado siguiente, con el tramite ya
 * resuelto, y asi los dos se pueden mirar en paralelo:
 *
 *   SEED-PV30-001  El Alto   solo solicitantes, sin decidir
 *   SEED-PV32-001  Viacha    solicitantes + beneficiarios + un rechazado
 *
 * Estan en municipios distintos a proposito: es lo que hace visible el filtro
 * `municipalityId` del listado, que con un solo municipio no se puede probar.
 *
 * Que deja en la base:
 *
 *   3 `approved`  Los beneficiarios. Un beneficiario no es otra entidad: es
 *                 esta misma fila con `status='approved'`, que es justo lo que
 *                 devuelve GET /applications?status=approved.
 *   3 `pending`   Solicitantes todavia sin decidir. Uno de ellos comparte la
 *                 vivienda con un beneficiario (ver COTITULAR mas abajo).
 *   1 `rejected`  Con su motivo. El rechazado no se borra: poder explicar la
 *                 decision despues es requisito de auditoria del programa.
 *
 * Quien decide no es quien registra: las fichas se atribuyen al lider social y
 * las decisiones al supervisor, que es la separacion que aplica la API
 * (`authorize('admin', 'project_supervisor')` en las rutas de decision).
 *
 * Idempotente: se salta al solicitante cuyo CI ya este registrado.
 *
 * Depende de: geography-bolivia, public-entities y los seeders de usuarios.
 *
 * @type {import('sequelize-cli').Migration}
 */

/** Municipio del proyecto y de todas sus viviendas. */
const MUNICIPALITY = { department: 'La Paz', province: 'Ingavi', name: 'Viacha' };

/** El proyecto que ampara las fichas. Se busca y se crea por `contract_no`. */
const DEMO_PROJECT = {
  contract_no: 'SEED-PV32-001',
  project_name: 'Mejoramiento de Vivienda Viacha - Fase II',
  /** NIT de AEVivienda, la unica entidad del catalogo. */
  entity_tax_id: 192310023,
};

/** Quien levanta las fichas en campo. Se cae a cualquier admin si no esta. */
const REGISTRAR_EMAIL = 'social_lead@pentaclan.com';

/** Quien aprueba o rechaza. Mismo criterio de respaldo. */
const DECIDER_EMAIL = 'project_supervisor@pentaclan.com';

/**
 * CI del beneficiario cuya vivienda comparte un solicitante pendiente. Es el
 * caso que mas se repite en campo: marido y esposa postulan por separado la
 * misma casa. Dos fichas conviven, pero solo una puede terminar aprobada, y
 * `applications_property_project_approved_uq` lo garantiza. Tener el par
 * cargado deja probar ese 409 sin fabricar datos a mano.
 */
const COTITULAR = '5120447';

/**
 * El padron. `days` es hace cuantos dias se presento el formulario y
 * `decidedDays` hace cuantos se decidio: siempre menos, porque una decision no
 * puede anteceder a la ficha que decide.
 *
 * La mezcla es deliberada, como en PV-30: adultos mayores, un titular con
 * conyuge, y varios sin apellido materno, sin telefono o sin ocupacion. Son los
 * casos que la pantalla tiene que aguantar y con datos uniformes no se ven.
 *
 * Orden importante: una entrada con `sharesPropertyWith` tiene que ir despues
 * de aquella a la que apunta.
 */
const APPLICANTS = [
  {
    days: 45,
    decidedDays: 12,
    status: 'approved',
    person: {
      document_no: COTITULAR,
      document_issued_in: 'LP',
      given_names: 'Gregoria',
      paternal_surname: 'Chambi',
      maternal_surname: 'Layme',
      phone: '71554488',
      occupation: 'Tejedora',
      birth_date: '1951-03-14',
      sex: 'F',
    },
    // Unico caso con conyuge: cubre la FK people_spouse_fk y los cortes
    // demograficos, que necesitan la fecha de nacimiento de ambos.
    spouse: {
      document_no: '5120448',
      document_issued_in: 'LP',
      given_names: 'Feliciano',
      paternal_surname: 'Ticona',
      maternal_surname: null,
      phone: null,
      occupation: 'Agricultor',
      birth_date: '1949-08-02',
      sex: 'M',
    },
    property: {
      community: 'Comunidad Contorno Bajo',
      zone: null,
      address: 'Camino a Achica Arriba km 2',
      latitude: -16.6538,
      longitude: -68.2942,
    },
  },
  {
    days: 41,
    decidedDays: 12,
    status: 'approved',
    person: {
      document_no: '5233190',
      document_issued_in: 'LP',
      given_names: 'Basilio',
      paternal_surname: 'Quenta',
      maternal_surname: 'Mamani',
      phone: '69887744',
      occupation: 'Albanil',
      birth_date: '1968-12-01',
      sex: 'M',
    },
    spouse: null,
    property: {
      community: null,
      zone: 'Zona Central',
      address: 'Calle Ballivian nro 118',
      latitude: -16.6551,
      longitude: -68.2775,
    },
  },
  {
    days: 38,
    decidedDays: 9,
    status: 'approved',
    person: {
      document_no: '5347802',
      document_issued_in: 'LP',
      given_names: 'Martha Elena',
      paternal_surname: 'Poma',
      maternal_surname: null,
      phone: null,
      occupation: null,
      birth_date: '1979-06-27',
      sex: 'F',
    },
    spouse: null,
    property: {
      community: 'Comunidad Villa Santiago',
      zone: 'Zona Sur',
      address: null,
      latitude: -16.6712,
      longitude: -68.3011,
    },
  },
  {
    days: 34,
    decidedDays: 7,
    status: 'rejected',
    // El motivo es la contraparte del rechazo: sin el, seis meses despues nadie
    // puede explicar la decision. La API lo exige, el seeder tambien.
    rejection_reason: 'La vivienda esta fuera del radio de intervencion de la fase II',
    person: {
      document_no: '5401256',
      document_issued_in: 'LP',
      given_names: 'Remigio',
      paternal_surname: 'Callisaya',
      maternal_surname: 'Huanca',
      phone: '77012345',
      occupation: 'Transportista',
      birth_date: '1985-01-19',
      sex: 'M',
    },
    spouse: null,
    property: {
      community: 'Comunidad Chama',
      zone: null,
      address: 'Camino a Guaqui km 11',
      latitude: -16.7104,
      longitude: -68.3387,
    },
  },
  {
    days: 20,
    status: 'pending',
    person: {
      document_no: '5518903',
      document_issued_in: 'LP',
      given_names: 'Nicolasa',
      paternal_surname: 'Apaza',
      maternal_surname: 'Colque',
      phone: '72309811',
      occupation: 'Comerciante',
      birth_date: '1957-10-05',
      sex: 'F',
    },
    spouse: null,
    property: {
      community: null,
      zone: 'Villa Bolivar',
      address: 'Av. 6 de Marzo nro 47',
      latitude: -16.6489,
      longitude: -68.2861,
    },
  },
  {
    days: 14,
    status: 'pending',
    person: {
      document_no: '5602741',
      document_issued_in: 'LP',
      given_names: 'Eusebio',
      paternal_surname: 'Mamani',
      maternal_surname: 'Cussi',
      phone: null,
      occupation: 'Jubilado',
      birth_date: '1943-04-30',
      sex: 'M',
    },
    spouse: null,
    property: {
      community: 'Comunidad Achica Arriba',
      zone: null,
      address: null,
      latitude: -16.6903,
      longitude: -68.2604,
    },
  },
  {
    days: 6,
    status: 'pending',
    /**
     * El conyuge de Gregoria postulando por su cuenta la misma casa. Queda
     * `pending` y tiene que quedarse asi: aprobarlo devuelve 409 por
     * `applications_property_project_approved_uq`, que es la regla anti doble
     * beneficio del programa.
     */
    sharesPropertyWith: COTITULAR,
    person: {
      document_no: '5120448',
      document_issued_in: 'LP',
      given_names: 'Feliciano',
      paternal_surname: 'Ticona',
      maternal_surname: null,
      phone: null,
      occupation: 'Agricultor',
      birth_date: '1949-08-02',
      sex: 'M',
    },
    spouse: null,
    property: null,
  },
];

/** Todos los CI que toca el seeder, titulares y conyuges. Lo usa el down(). */
const ALL_DOCUMENTS = [
  ...new Set(
    APPLICANTS.flatMap((applicant) =>
      [applicant.person, applicant.spouse].filter(Boolean).map((person) => person.document_no),
    ),
  ),
];

/** Devuelve la primera columna de la primera fila, o null si no hay filas. */
async function findOne(queryInterface, sql, replacements) {
  const [rows] = await queryInterface.sequelize.query(sql, { replacements });
  if (rows.length === 0) return null;
  return Object.values(rows[0])[0];
}

/** Fecha de hace N dias, para escalonar `submitted_at` y `decided_at`. */
function daysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

/**
 * Usuario por email, con respaldo a cualquier admin. El UNION ALL da los
 * candidatos en orden de preferencia y el LIMIT 1 se queda con el primero.
 */
function findUser(queryInterface, email) {
  return findOne(
    queryInterface,
    `SELECT id FROM users WHERE email = :email
      UNION ALL
     SELECT id FROM users WHERE role = 'admin'
     LIMIT 1`,
    { email },
  );
}

module.exports = {
  async up(queryInterface) {
    if (process.env.NODE_ENV === 'production') {
      console.log('[seed:approved] NODE_ENV=production, se omite el padron de demo.');
      return;
    }

    const now = new Date();

    const idMunicipality = await findOne(
      queryInterface,
      `SELECT m.id_municipality
         FROM municipalities m
         JOIN provinces p ON p.id_province = m.id_province
         JOIN departments d ON d.id_department = p.id_department
        WHERE m.municipality_name = :name
          AND p.province_name = :province
          AND d.department_name = :department
        LIMIT 1`,
      MUNICIPALITY,
    );

    if (idMunicipality === null) {
      console.log(
        `[seed:approved] no existe el municipio ${MUNICIPALITY.name}; ` +
          'corre antes el seeder de geografia. Se omite.',
      );
      return;
    }

    const idPublicEntity = await findOne(
      queryInterface,
      'SELECT id_public_entity FROM public_entities WHERE tax_id = :taxId LIMIT 1',
      { taxId: DEMO_PROJECT.entity_tax_id },
    );

    if (idPublicEntity === null) {
      console.log(
        '[seed:approved] no existe la entidad publica del proyecto demo; ' +
          'corre antes el seeder de entidades. Se omite.',
      );
      return;
    }

    const idUser = await findUser(queryInterface, REGISTRAR_EMAIL);
    if (idUser === null) {
      console.log('[seed:approved] no hay usuario al que atribuir las fichas. Se omite.');
      return;
    }

    const idDecider = await findUser(queryInterface, DECIDER_EMAIL);
    if (idDecider === null) {
      console.log('[seed:approved] no hay usuario al que atribuir las decisiones. Se omite.');
      return;
    }

    if (idDecider === idUser) {
      console.log(
        '[seed:approved] quien registra y quien decide son el mismo usuario: ' +
          'falta el seeder de usuarios de prueba (20260607000002). El padron se ' +
          'carga igual, pero no ilustra la separacion de funciones.',
      );
    }

    let idProject = await findOne(
      queryInterface,
      'SELECT id_project FROM projects WHERE contract_no = :contractNo LIMIT 1',
      { contractNo: DEMO_PROJECT.contract_no },
    );

    if (idProject === null) {
      idProject = crypto.randomUUID();
      await queryInterface.bulkInsert('projects', [
        {
          id_project: idProject,
          project_name: DEMO_PROJECT.project_name,
          contract_no: DEMO_PROJECT.contract_no,
          id_public_entity: idPublicEntity,
          id_municipality: idMunicipality,
          id_user: idUser,
          created_at: now,
          updated_at: now,
        },
      ]);
      console.log(`[seed:approved] proyecto demo creado: ${DEMO_PROJECT.contract_no}.`);
    }

    const cuenta = { approved: 0, pending: 0, rejected: 0 };

    for (const applicant of APPLICANTS) {
      const { document_no: documentNo, document_issued_in: issuedIn } = applicant.person;

      // El indice unico people_document_uq es parcial (WHERE deleted_at IS
      // NULL): un CI dado de baja no bloquea, y aqui se replica ese criterio.
      const existing = await findOne(
        queryInterface,
        `SELECT id_person FROM people
          WHERE document_no = :documentNo
            AND document_issued_in = :issuedIn
            AND deleted_at IS NULL
          LIMIT 1`,
        { documentNo, issuedIn },
      );

      // El co-titular es la excepcion: su persona ya existe porque se inserto
      // como conyuge del beneficiario. Lo que se comprueba en su caso es si ya
      // tiene ficha propia en este proyecto.
      const yaTieneFicha =
        existing !== null && applicant.sharesPropertyWith
          ? await findOne(
              queryInterface,
              `SELECT id_application FROM applications
                WHERE id_person = :idPerson AND id_project = :idProject
                LIMIT 1`,
              { idPerson: existing, idProject },
            )
          : existing;

      if (yaTieneFicha !== null) {
        console.log(`[seed:approved] el CI ${documentNo} ${issuedIn} ya tiene ficha, se omite.`);
        continue;
      }

      // La vivienda: propia, o la del beneficiario al que acompana. Se resuelve
      // contra la base y no contra un mapa en memoria para que funcione tambien
      // cuando el titular se inserto en una corrida anterior.
      let idProperty;
      if (applicant.sharesPropertyWith) {
        idProperty = await findOne(
          queryInterface,
          `SELECT a.id_property
             FROM applications a
             JOIN people p ON p.id_person = a.id_person
            WHERE p.document_no = :documentNo
              AND a.id_project = :idProject
              AND a.deleted_at IS NULL
            LIMIT 1`,
          { documentNo: applicant.sharesPropertyWith, idProject },
        );

        if (idProperty === null) {
          console.log(
            `[seed:approved] no se encontro la vivienda del CI ${applicant.sharesPropertyWith}; ` +
              `se omite el co-titular ${documentNo}.`,
          );
          continue;
        }
      } else {
        idProperty = crypto.randomUUID();
        await queryInterface.bulkInsert('properties', [
          {
            id_property: idProperty,
            ...applicant.property,
            id_municipality: idMunicipality,
            created_at: now,
            updated_at: now,
            deleted_at: null,
          },
        ]);
      }

      // El conyuge va primero porque el titular lo apunta con id_spouse. El
      // vinculo es de una sola via, igual que lo escribe la API.
      let idSpouse = null;
      if (applicant.spouse) {
        idSpouse = crypto.randomUUID();
        await queryInterface.bulkInsert('people', [
          {
            id_person: idSpouse,
            ...applicant.spouse,
            id_spouse: null,
            created_at: now,
            updated_at: now,
            deleted_at: null,
          },
        ]);
      }

      const idPerson = existing ?? crypto.randomUUID();
      if (existing === null) {
        await queryInterface.bulkInsert('people', [
          {
            id_person: idPerson,
            ...applicant.person,
            id_spouse: idSpouse,
            created_at: now,
            updated_at: now,
            deleted_at: null,
          },
        ]);
      }

      const decidida = applicant.status !== 'pending';
      await queryInterface.bulkInsert('applications', [
        {
          id_application: crypto.randomUUID(),
          id_person: idPerson,
          id_project: idProject,
          id_property: idProperty,
          status: applicant.status,
          submitted_at: daysAgo(applicant.days),
          id_user: idUser,
          // Los tres van juntos: una ficha decidida a la que le falte alguno no
          // le sirve a la auditoria, y una pendiente los tiene todos en null.
          decided_at: decidida ? daysAgo(applicant.decidedDays) : null,
          id_decided_by: decidida ? idDecider : null,
          rejection_reason: applicant.rejection_reason ?? null,
          created_at: now,
          updated_at: now,
          deleted_at: null,
        },
      ]);

      cuenta[applicant.status] += 1;
    }

    console.log(
      `[seed:approved] ${cuenta.approved} beneficiarios, ${cuenta.pending} solicitantes ` +
        `y ${cuenta.rejected} rechazados en ${DEMO_PROJECT.contract_no}.`,
    );
  },

  async down(queryInterface) {
    const idProject = await findOne(
      queryInterface,
      'SELECT id_project FROM projects WHERE contract_no = :contractNo LIMIT 1',
      { contractNo: DEMO_PROJECT.contract_no },
    );

    if (idProject === null) return;

    const [properties] = await queryInterface.sequelize.query(
      'SELECT DISTINCT id_property FROM applications WHERE id_project = :idProject',
      { replacements: { idProject } },
    );

    // Orden inverso al alta: las FK son ON DELETE RESTRICT, no hay cascada.
    await queryInterface.sequelize.query(
      'DELETE FROM applications WHERE id_project = :idProject',
      { replacements: { idProject } },
    );

    // Se corta el vinculo antes de borrar: people_spouse_fk apunta a la misma
    // tabla y RESTRICT se evalua fila por fila, asi que borrar titular y
    // conyuge en un solo DELETE puede fallar segun el orden que elija el motor.
    await queryInterface.sequelize.query(
      'UPDATE people SET id_spouse = NULL WHERE document_no IN (:documents)',
      { replacements: { documents: ALL_DOCUMENTS } },
    );

    await queryInterface.sequelize.query('DELETE FROM people WHERE document_no IN (:documents)', {
      replacements: { documents: ALL_DOCUMENTS },
    });

    if (properties.length > 0) {
      await queryInterface.sequelize.query('DELETE FROM properties WHERE id_property IN (:ids)', {
        replacements: { ids: properties.map((row) => row.id_property) },
      });
    }

    await queryInterface.sequelize.query('DELETE FROM projects WHERE id_project = :idProject', {
      replacements: { idProject },
    });
  },
};
