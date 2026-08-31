'use strict';

const crypto = require('node:crypto');

/**
 * Postulaciones de demostracion (PV-30): 5 solicitantes con su vivienda.
 *
 * SOLO DESARROLLO. Son personas inventadas con CI ficticio, igual que
 * `test-role-users`: en produccion no tiene sentido tener fichas de un tramite
 * que nadie presento, asi que el seeder se omite.
 *
 * Por que crea un proyecto: `applications.id_project` es NOT NULL y no hay
 * seeder de proyectos (el alta va por POST /projects). Sin un proyecto las
 * fichas no pueden existir, asi que se levanta uno propio identificado por su
 * `contract_no` en vez de colgarse de un proyecto real que el equipo haya
 * cargado a mano. Asi el down() sabe exactamente que borrar.
 *
 * Las 5 viviendas estan en el mismo municipio que el proyecto porque esa es la
 * regla del programa (ver RegisterApplicationUseCase): solo se mejoran
 * viviendas del municipio donde se ejecuta la obra. Mover el municipio del
 * proyecto sin mover el de las viviendas deja datos que la API rechazaria.
 *
 * Todas nacen en `pending`: en PV-30 no hay forma de aprobar. Los estados
 * `approved`/`rejected` los escribe PV-31, y la coleccion Postman documenta
 * que hoy el filtro de beneficiarios devuelve vacio.
 *
 * Idempotente: se salta al solicitante cuyo CI ya este registrado, asi que se
 * puede re-ejecutar sin duplicar.
 *
 * Depende de: geography-bolivia, public-entities y los seeders de usuarios.
 *
 * @type {import('sequelize-cli').Migration}
 */

/** Municipio del proyecto y de las 5 viviendas. */
const MUNICIPALITY = { department: 'La Paz', province: 'Murillo', name: 'El Alto' };

/** El proyecto que ampara las fichas. Se busca y se crea por `contract_no`. */
const DEMO_PROJECT = {
  contract_no: 'SEED-PV30-001',
  project_name: 'Mejoramiento de Vivienda El Alto - Distrito 5',
  /** NIT de AEVivienda, la unica entidad del catalogo. */
  entity_tax_id: 192310023,
};

/**
 * Usuario al que se atribuyen las fichas. En campo el registro es trabajo del
 * lider social; si ese usuario no esta, se cae a cualquier admin.
 */
const REGISTRAR_EMAIL = 'social_lead@pentaclan.com';

/**
 * Los 5 solicitantes. `days` es hace cuantos dias se presento el formulario:
 * escalonarlos hace visible el orden por `submitted_at` (el default del
 * listado), que con cinco fechas iguales seria un empate.
 *
 * La mezcla es deliberada: dos adultos mayores, un titular con conyuge, y
 * varios sin apellido materno, sin telefono o sin ocupacion. Son los casos que
 * el formulario tiene que aguantar y con datos uniformes no se ven.
 */
const APPLICANTS = [
  {
    days: 21,
    person: {
      document_no: '4567123',
      document_issued_in: 'LP',
      given_names: 'Rosa Maria',
      paternal_surname: 'Condori',
      maternal_surname: 'Apaza',
      phone: '71234567',
      occupation: 'Agricultora',
      birth_date: '1948-07-09',
      sex: 'F',
    },
    // Unico caso con conyuge: cubre la FK people_spouse_fk y los cortes
    // demograficos que necesitan la fecha de nacimiento de ambos.
    spouse: {
      document_no: '3891044',
      document_issued_in: 'LP',
      given_names: 'Pedro',
      paternal_surname: 'Huanca',
      maternal_surname: 'Quispe',
      phone: null,
      occupation: 'Albanil',
      birth_date: '1945-02-18',
      sex: 'M',
    },
    property: {
      community: 'Comunidad Alto Lima',
      zone: 'Zona Norte',
      address: 'Calle 5 s/n',
      latitude: -16.4921,
      longitude: -68.1784,
    },
  },
  {
    days: 17,
    person: {
      document_no: '3210984',
      document_issued_in: 'LP',
      given_names: 'Juana',
      paternal_surname: 'Mamani',
      maternal_surname: 'Quispe',
      phone: '76543210',
      occupation: 'Comerciante',
      birth_date: '1962-11-23',
      sex: 'F',
    },
    spouse: null,
    property: {
      community: null,
      zone: 'Villa Adela',
      address: 'Av. Litoral nro 240',
      latitude: -16.5298,
      longitude: -68.1927,
    },
  },
  {
    days: 12,
    person: {
      document_no: '2874509',
      document_issued_in: 'LP',
      given_names: 'Felix',
      paternal_surname: 'Choque',
      // Sin apellido materno: hay gente que no lo tiene y la columna lo admite.
      maternal_surname: null,
      phone: '69871234',
      occupation: 'Chofer',
      birth_date: '1955-03-14',
      sex: 'M',
    },
    spouse: null,
    // Direccion rural: solo la comunidad, que es el minimo que exige el
    // formulario (community o address, al menos uno).
    property: {
      community: 'Comunidad Tacachira',
      zone: null,
      address: null,
      latitude: -16.5483,
      longitude: -68.2156,
    },
  },
  {
    days: 6,
    person: {
      document_no: '6103882',
      document_issued_in: 'LP',
      given_names: 'Gregoria',
      paternal_surname: 'Vargas',
      maternal_surname: 'Limachi',
      // Sin telefono: en campo falta seguido.
      phone: null,
      occupation: 'Tejedora',
      birth_date: '1970-09-02',
      sex: 'F',
    },
    property: {
      community: null,
      zone: 'Rio Seco',
      address: 'Calle 12, casa 8',
      latitude: -16.4705,
      longitude: -68.1839,
    },
    spouse: null,
  },
  {
    days: 2,
    person: {
      document_no: '1957640',
      document_issued_in: 'LP',
      given_names: 'Santiago',
      paternal_surname: 'Ramos',
      maternal_surname: 'Callisaya',
      phone: '72004455',
      occupation: null,
      birth_date: '1943-12-27',
      sex: 'M',
    },
    spouse: null,
    property: {
      community: 'Comunidad Villa Ingenio',
      zone: 'Zona Este',
      address: 'Camino a Laja km 3',
      latitude: -16.4632,
      longitude: -68.1511,
    },
  },
];

/** Todos los CI que toca el seeder, titulares y conyuges. Lo usa el down(). */
const ALL_DOCUMENTS = APPLICANTS.flatMap((applicant) =>
  [applicant.person, applicant.spouse].filter(Boolean).map((person) => person.document_no),
);

/** Devuelve la primera columna de la primera fila, o null si no hay filas. */
async function findOne(queryInterface, sql, replacements) {
  const [rows] = await queryInterface.sequelize.query(sql, { replacements });
  if (rows.length === 0) return null;
  return Object.values(rows[0])[0];
}

/** Fecha de hace N dias, para escalonar los `submitted_at`. */
function daysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

module.exports = {
  async up(queryInterface) {
    if (process.env.NODE_ENV === 'production') {
      console.log('[seed:applications] NODE_ENV=production, se omiten las fichas de demo.');
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
        `[seed:applications] no existe el municipio ${MUNICIPALITY.name}; ` +
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
        '[seed:applications] no existe la entidad publica del proyecto demo; ' +
          'corre antes el seeder de entidades. Se omite.',
      );
      return;
    }

    // El lider social es quien registra en campo. El UNION ALL da la lista de
    // candidatos en orden de preferencia y el LIMIT 1 se queda con el primero.
    const idUser = await findOne(
      queryInterface,
      `SELECT id FROM users WHERE email = :email
        UNION ALL
       SELECT id FROM users WHERE role = 'admin'
       LIMIT 1`,
      { email: REGISTRAR_EMAIL },
    );

    if (idUser === null) {
      console.log('[seed:applications] no hay usuario al que atribuir las fichas. Se omite.');
      return;
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
      console.log(`[seed:applications] proyecto demo creado: ${DEMO_PROJECT.contract_no}.`);
    }

    let insertadas = 0;

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

      if (existing !== null) {
        console.log(`[seed:applications] el CI ${documentNo} ${issuedIn} ya existe, se omite.`);
        continue;
      }

      const idProperty = crypto.randomUUID();
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

      const idPerson = crypto.randomUUID();
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

      await queryInterface.bulkInsert('applications', [
        {
          id_application: crypto.randomUUID(),
          id_person: idPerson,
          id_project: idProject,
          id_property: idProperty,
          status: 'pending',
          submitted_at: daysAgo(applicant.days),
          id_user: idUser,
          // Los llena la aprobacion (PV-31).
          decided_at: null,
          id_decided_by: null,
          rejection_reason: null,
          created_at: now,
          updated_at: now,
          deleted_at: null,
        },
      ]);

      insertadas += 1;
    }

    console.log(`[seed:applications] insertadas ${insertadas} postulaciones.`);
  },

  async down(queryInterface) {
    const idProject = await findOne(
      queryInterface,
      'SELECT id_project FROM projects WHERE contract_no = :contractNo LIMIT 1',
      { contractNo: DEMO_PROJECT.contract_no },
    );

    if (idProject === null) return;

    const [properties] = await queryInterface.sequelize.query(
      'SELECT id_property FROM applications WHERE id_project = :idProject',
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
