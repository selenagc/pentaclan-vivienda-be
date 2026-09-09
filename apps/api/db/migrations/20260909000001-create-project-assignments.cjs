'use strict';

/**
 * Tabla intermedia de asignacion de evaluadores a proyectos (PV-35).
 *
 * Permite asignar multiples evaluadores (Tecnicos o Sociales) a un proyecto
 * especifico (relacion N:M). Restricciones ON DELETE CASCADE en ambas FK.
 *
 * @type {import('sequelize-cli').Migration}
 */

const FKS = [
  ['project_assignments', 'project_assignments_user_fk', 'id_user', 'users', 'id'],
  ['project_assignments', 'project_assignments_project_fk', 'id_project', 'projects', 'id_project'],
];

const INDEXES = [
  ['project_assignments', 'project_assignments_user_idx', ['id_user'], false],
  ['project_assignments', 'project_assignments_project_idx', ['id_project'], false],
  ['project_assignments', 'project_assignments_user_project_uq', ['id_user', 'id_project'], true],
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('project_assignments', {
      id_project_assignment: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_user: {
        type: Sequelize.CHAR(36),
        allowNull: false,
      },
      id_project: {
        type: Sequelize.CHAR(36),
        allowNull: false,
      },
      assigned_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    for (const [table, name, field, target, targetField] of FKS) {
      await queryInterface.addConstraint(table, {
        fields: [field],
        type: 'foreign key',
        name,
        references: { table: target, field: targetField },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }

    for (const [table, name, fields, unique] of INDEXES) {
      await queryInterface.addIndex(table, fields, { name, unique });
    }

    // Vista de compatibilidad en espanol (para consultas o validaciones con nombre de ticket).
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW asignacion_proyecto AS
      SELECT
        id_project_assignment AS id_asignacion,
        id_user AS id_usuario,
        id_project AS id_proyecto,
        assigned_at AS fecha_asignacion,
        active AS activo,
        created_at,
        updated_at
      FROM project_assignments;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS asignacion_proyecto;');
    await queryInterface.dropTable('project_assignments');
  },
};
