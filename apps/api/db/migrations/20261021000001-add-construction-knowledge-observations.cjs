'use strict';

/**
 * Observaciones generales de la seccion "Nivel de conocimiento del solicitante
 * acerca de construccion de viviendas" (PV-39). Una por ficha diagnostico.
 *
 * @type {import('sequelize-cli').Migration}
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('diagnostic_records', 'construction_knowledge_observations', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('diagnostic_records', 'construction_knowledge_observations');
  },
};
