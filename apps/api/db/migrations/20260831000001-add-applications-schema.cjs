'use strict';

/**
 * Registro de solicitantes (PV-30).
 *
 * Tres tablas nuevas. La idea central: "solicitante" y "beneficiario" no son
 * dos tipos de persona, son dos estados de una postulacion. Por eso no hay
 * tabla `applicants` ni `beneficiaries`: hay `applications` con `status`, y un
 * beneficiario es una postulacion aprobada. Asi los rechazados no desaparecen,
 * que es requisito de auditoria en un programa con fondos publicos.
 *
 *   properties   La vivienda a mejorar. Es el objeto real del programa.
 *   people       Persona (titular o conyuge). Sin roles: el rol lo da la
 *                postulacion, no la persona.
 *   applications Postulacion: quien, que vivienda, a que proyecto, en que estado.
 *
 * Decisiones que conviene no revertir sin releer PV-30:
 *
 *   - `applications.id_property` existe aunque la persona "tenga" una vivienda:
 *     la misma persona puede postular a otro proyecto con otro inmueble, y el
 *     mismo inmueble puede volver con otro dueno. El par (persona, vivienda) es
 *     del momento de postular, no un atributo permanente de ninguno de los dos.
 *     Guardarlo en `people` corromperia el historico al actualizarse.
 *
 *   - Borrado logico (`deleted_at`) en las tres tablas, a diferencia de `users`,
 *     que borra fisico. El de users es utilidad de mantenimiento; estas tablas
 *     sostienen el expediente del tramite.
 *
 *   - Los indices unicos son parciales (`WHERE deleted_at IS NULL`): sin eso, un
 *     registro borrado seguiria reservando el CI o el cupo del inmueble.
 *
 *   - `status` es STRING + CHECK y no ENUM. Un flujo de tramite gana estados con
 *     el tiempo; alterar un enum nativo de Postgres es incomodo, soltar y
 *     recrear un CHECK es una linea. `users.role` si usa ENUM porque los roles
 *     no se mueven.
 *
 * @type {import('sequelize-cli').Migration}
 */

/** Estados de la postulacion. PV-30 solo escribe `pending`; el resto lo usa PV-31. */
const APPLICATION_STATUSES = ['pending', 'under_review', 'approved', 'rejected', 'withdrawn'];

/** Codigos de departamento donde se expide el CI boliviano. */
const ISSUED_IN = ['LP', 'CB', 'SC', 'OR', 'PT', 'TJ', 'CH', 'BE', 'PD'];

/** FK: [tabla, nombre, campo, tabla_destino, campo_destino] */
const FKS = [
  ['properties', 'properties_municipality_fk', 'id_municipality', 'municipalities', 'id_municipality'],
  ['people', 'people_spouse_fk', 'id_spouse', 'people', 'id_person'],
  ['applications', 'applications_person_fk', 'id_person', 'people', 'id_person'],
  ['applications', 'applications_project_fk', 'id_project', 'projects', 'id_project'],
  ['applications', 'applications_property_fk', 'id_property', 'properties', 'id_property'],
  ['applications', 'applications_user_fk', 'id_user', 'users', 'id'],
  ['applications', 'applications_decided_by_fk', 'id_decided_by', 'users', 'id'],
];

/** CHECK: [tabla, nombre, campo, valores_admitidos] */
const CHECKS = [
  ['people', 'people_sex_chk', 'sex', ['M', 'F']],
  ['people', 'people_issued_in_chk', 'document_issued_in', ISSUED_IN],
  ['applications', 'applications_status_chk', 'status', APPLICATION_STATUSES],
];

/** Indices: [tabla, nombre, [columnas], unique, where] */
const INDEXES = [
  // Clave natural de la persona. Parcial para no reservar el CI de un borrado.
  ['people', 'people_document_uq', ['document_no', 'document_issued_in'], true, { deleted_at: null }],
  ['people', 'people_paternal_surname_idx', ['paternal_surname'], false, null],
  ['people', 'people_spouse_idx', ['id_spouse'], false, null],

  ['properties', 'properties_municipality_idx', ['id_municipality'], false, null],

  // Una persona no postula dos veces al mismo proyecto.
  ['applications', 'applications_person_project_uq', ['id_person', 'id_project'], true, { deleted_at: null }],

  // El corazon de la regla anti doble beneficio: una sola postulacion APROBADA
  // por vivienda y proyecto. Marido y esposa pueden postular ambos la misma
  // casa (dos filas `pending`), pero solo una puede terminar aprobada. Es por
  // proyecto y no global porque la vivienda si puede volver a postular a
  // programas posteriores.
  ['applications', 'applications_property_project_approved_uq', ['id_property', 'id_project'], true, { status: 'approved', deleted_at: null }],

  ['applications', 'applications_project_idx', ['id_project'], false, null],
  ['applications', 'applications_person_idx', ['id_person'], false, null],
  ['applications', 'applications_property_idx', ['id_property'], false, null],
  ['applications', 'applications_status_idx', ['status'], false, null],
];

/** Orden inverso al de creacion, para que el down() no rompa dependencias. */
const TABLES_DOWN = ['applications', 'people', 'properties'];

const timestamps = (Sequelize) => ({
  created_at: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  updated_at: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  // Borrado logico (`paranoid` en Sequelize). NULL = vigente.
  deleted_at: {
    type: Sequelize.DATE,
    allowNull: true,
  },
});

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('properties', {
      id_property: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        allowNull: false,
      },
      // Los tres son opcionales porque en area rural la direccion suele ser solo
      // la comunidad. El front debe exigir al menos uno para que el buscador de
      // inmuebles sirva de algo.
      community: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      zone: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      address: {
        type: Sequelize.STRING(250),
        allowNull: true,
      },
      // Obligatorias: al no haber codigo catastral, la ubicacion es lo unico que
      // identifica fisicamente la vivienda, y ademas se necesita para planificar
      // y supervisar la obra. numeric(9,6) cubre Bolivia con precision de ~10cm.
      latitude: {
        type: Sequelize.DECIMAL(9, 6),
        allowNull: false,
      },
      longitude: {
        type: Sequelize.DECIMAL(9, 6),
        allowNull: false,
      },
      id_municipality: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      ...timestamps(Sequelize),
    });

    await queryInterface.createTable('people', {
      id_person: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        allowNull: false,
      },
      // CI + expedido: la unicidad la aporta people_document_uq, mas abajo.
      document_no: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      document_issued_in: {
        type: Sequelize.CHAR(2),
        allowNull: false,
      },
      given_names: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      paternal_surname: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      // Hay gente que no lo tiene.
      maternal_surname: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },
      occupation: {
        type: Sequelize.STRING(120),
        allowNull: true,
      },
      // Obligatorios pese a que en campo tiente dejarlos opcionales: son la base
      // de los cortes demograficos del programa (adulto mayor, entre otros) y el
      // dato ya viene en el CI que se esta transcribiendo. Se guarda la fecha y
      // nunca la edad, que se desactualiza sola.
      birth_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      sex: {
        type: Sequelize.CHAR(1),
        allowNull: false,
      },
      // Conyuge como persona completa y no como cuatro varchars sueltos: hace
      // falta su fecha de nacimiento para los mismos cortes, y ademas permite
      // detectar que el conyuge postulo por su cuenta.
      id_spouse: {
        type: Sequelize.CHAR(36),
        allowNull: true,
      },
      ...timestamps(Sequelize),
    });

    await queryInterface.createTable('applications', {
      id_application: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        allowNull: false,
      },
      id_person: {
        type: Sequelize.CHAR(36),
        allowNull: false,
      },
      id_project: {
        type: Sequelize.CHAR(36),
        allowNull: false,
      },
      // La vivienda a mejorar. Ver nota de cabecera: no se deriva de la persona.
      id_property: {
        type: Sequelize.CHAR(36),
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'pending',
      },
      // Fecha del formulario en campo, que no siempre es la de captura.
      submitted_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      // Auditoria: usuario que registro la postulacion. Se toma de la sesion.
      id_user: {
        type: Sequelize.CHAR(36),
        allowNull: false,
      },
      // Los tres quedan nulos en PV-30: los llena la aprobacion (PV-31). Se
      // crean desde ahora para que ese ticket no arranque con una migracion.
      // `id_decided_by` se aparta del patron `id_<entidad>` porque ya hay otra
      // FK a users en la tabla y el nombre tiene que decir cual es cual.
      decided_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      id_decided_by: {
        type: Sequelize.CHAR(36),
        allowNull: true,
      },
      rejection_reason: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      ...timestamps(Sequelize),
    });

    for (const [table, name, field, target, targetField] of FKS) {
      await queryInterface.addConstraint(table, {
        fields: [field],
        type: 'foreign key',
        name,
        references: { table: target, field: targetField },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      });
    }

    for (const [table, name, field, values] of CHECKS) {
      await queryInterface.addConstraint(table, {
        fields: [field],
        type: 'check',
        name,
        where: { [field]: values },
      });
    }

    for (const [table, name, fields, unique, where] of INDEXES) {
      await queryInterface.addIndex(table, fields, {
        name,
        unique,
        ...(where ? { where } : {}),
      });
    }
  },

  async down(queryInterface) {
    for (const table of TABLES_DOWN) {
      await queryInterface.dropTable(table);
    }
  },
};
