'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('entidades_publicas', {
      id_entidad_publica: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      // Clave natural de la entidad: cada entidad publica tiene un unico NIT institucional a nivel nacional.
      nit: {
        type: Sequelize.BIGINT,
        allowNull: false,
        unique: true,
      },
      nombre_entidad: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      sigla: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('entidades_publicas');
  },
};
