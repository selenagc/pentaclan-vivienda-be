'use strict';

/**
 * Agrega la columna change_history (JSONB) a la tabla diagnostic_records (PV-43).
 * Almacena el historial y los diffs de modificaciones realizadas por líderes
 * técnicos y sociales sin crear tablas adicionales.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('diagnostic_records', 'change_history', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('diagnostic_records', 'change_history');
  },
};
