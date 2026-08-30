'use strict';

/**
 * Esquema inicial sobre PostgreSQL (PV-23).
 *
 * Consolida en una sola migracion el estado final al que habian llegado las 12
 * migraciones de MySQL/MariaDB, que quedan archivadas en `db/_mysql-legacy/`
 * como referencia historica. No se conservaron porque describian un camino que
 * solo tiene sentido en MySQL: ENUM inline alterado en tres pasos, nombres de
 * FK autogenerados (`proyectos_ibfk_1`) y renames que rodeaban limitaciones de
 * MariaDB 10.4. Reproducir esa cadena sobre Postgres fallaba en cada uno de
 * esos puntos. Los datos se recrean con los seeders, que no cambiaron.
 *
 * Diferencias frente al esquema MySQL, todas obligadas por el motor:
 *   - Sin INTEGER UNSIGNED: Postgres no lo tiene. Las PK de catalogo pasan a
 *     INTEGER con autoIncrement (SERIAL). El rango positivo sigue sobrando.
 *   - El ENUM de `role` se materializa como un tipo `enum_users_role`, que vive
 *     fuera de la tabla y por eso el down() lo borra explicitamente.
 *
 * Toda constraint e indice lleva nombre explicito. En MySQL los nombres
 * autogenerados obligaron a reescribir una migracion entera cuando hubo que
 * soltarlos; aqui se nombran desde el principio para que un removeConstraint
 * futuro sea predecible.
 *
 * @type {import('sequelize-cli').Migration}
 */

const ROLES = ['admin', 'social_lead', 'technical_lead', 'project_supervisor'];

/** FK: [tabla, nombre, campo, tabla_destino, campo_destino] */
const FKS = [
  ['provinces', 'provinces_department_fk', 'id_department', 'departments', 'id_department'],
  ['municipalities', 'municipalities_province_fk', 'id_province', 'provinces', 'id_province'],
  ['projects', 'projects_public_entity_fk', 'id_public_entity', 'public_entities', 'id_public_entity'],
  ['projects', 'projects_municipality_fk', 'id_municipality', 'municipalities', 'id_municipality'],
  ['projects', 'projects_user_fk', 'id_user', 'users', 'id'],
];

/** Indices: [tabla, nombre, [columnas], unique] */
const INDEXES = [
  ['users', 'users_email_unique', ['email'], true],
  ['departments', 'departments_name_uq', ['department_name'], true],
  ['provinces', 'provinces_department_name_uq', ['id_department', 'province_name'], true],
  ['municipalities', 'municipalities_province_name_uq', ['id_province', 'municipality_name'], true],
  ['public_entities', 'public_entities_tax_id_uq', ['tax_id'], true],
  ['projects', 'projects_contract_no_uq', ['contract_no'], true],
  ['projects', 'projects_public_entity_idx', ['id_public_entity'], false],
  ['projects', 'projects_municipality_idx', ['id_municipality'], false],
  ['projects', 'projects_user_idx', ['id_user'], false],
  ['projects', 'projects_name_idx', ['project_name'], false],
];

/** Orden inverso al de creacion, para que el down() no rompa dependencias. */
const TABLES_DOWN = ['projects', 'public_entities', 'municipalities', 'provinces', 'departments', 'users'];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      // La unicidad la aporta el indice users_email_unique, mas abajo.
      email: {
        type: Sequelize.STRING(180),
        allowNull: false,
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM(...ROLES),
        allowNull: false,
        defaultValue: 'social_lead',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Datos maestros de geografia: sin created_at / updated_at a proposito.
    await queryInterface.createTable('departments', {
      id_department: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      department_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
    });

    await queryInterface.createTable('provinces', {
      id_province: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      province_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      id_department: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    });

    await queryInterface.createTable('municipalities', {
      id_municipality: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      municipality_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      id_province: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    });

    await queryInterface.createTable('public_entities', {
      id_public_entity: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      // Clave natural: cada entidad publica tiene un unico NIT a nivel nacional.
      tax_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      entity_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      acronym: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
    });

    await queryInterface.createTable('projects', {
      id_project: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        allowNull: false,
      },
      project_name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      // Un contrato ampara un unico proyecto: el duplicado es error de captura.
      contract_no: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      id_public_entity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      id_municipality: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      // Auditoria: usuario que registro el proyecto. Se toma de la sesion.
      id_user: {
        type: Sequelize.CHAR(36),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
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

    for (const [table, name, fields, unique] of INDEXES) {
      await queryInterface.addIndex(table, fields, { name, unique });
    }
  },

  async down(queryInterface) {
    for (const table of TABLES_DOWN) {
      await queryInterface.dropTable(table);
    }

    // dropTable no arrastra el tipo ENUM: en Postgres es un objeto del esquema,
    // no parte de la columna. Sin esto el up() siguiente falla con "type
    // already exists".
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role"');
  },
};
