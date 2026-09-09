'use strict';

/**
 * PV-10 — Modificar Roles (BE)
 * Reemplaza los roles ('admin', 'user') por los 4 roles del negocio:
 *   admin, social_lead, technical_lead, project_supervisor.
 *
 * En MySQL/MariaDB el ENUM se almacena inline en la columna, por lo que se
 * altera en 3 pasos para no truncar las filas existentes:
 *   1. Ampliar el ENUM para que acepte valores viejos y nuevos.
 *   2. Migrar los datos ('user' -> 'social_lead').
 *   3. Reducir el ENUM a los 4 valores finales y fijar el nuevo defaultValue.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. ENUM ampliado (viejos + nuevos) para permitir el UPDATE de datos.
    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM('admin', 'user', 'social_lead', 'technical_lead', 'project_supervisor'),
      allowNull: false,
      defaultValue: 'user',
    });

    // 2. Migrar usuarios existentes.
    await queryInterface.sequelize.query(
      "UPDATE users SET role = 'social_lead' WHERE role = 'user'",
    );

    // 3. ENUM final (4 valores) + nuevo default.
    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM('admin', 'social_lead', 'technical_lead', 'project_supervisor'),
      allowNull: false,
      defaultValue: 'social_lead',
    });
  },

  async down(queryInterface, Sequelize) {
    // 1. ENUM ampliado (nuevos + viejos) para permitir el UPDATE inverso.
    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM('admin', 'user', 'social_lead', 'technical_lead', 'project_supervisor'),
      allowNull: false,
      defaultValue: 'social_lead',
    });

    // 2. Revertir todos los roles nuevos no-admin a 'user'.
    await queryInterface.sequelize.query(
      "UPDATE users SET role = 'user' WHERE role IN ('social_lead', 'technical_lead', 'project_supervisor')",
    );

    // 3. ENUM original.
    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM('admin', 'user'),
      allowNull: false,
      defaultValue: 'user',
    });
  },
};
