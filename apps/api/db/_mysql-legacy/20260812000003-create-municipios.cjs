'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('municipios', {
      id_municipio: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nombre_municipio: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      id_provincia: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'provincias', key: 'id_provincia' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
    });

    await queryInterface.addIndex('municipios', ['id_provincia', 'nombre_municipio'], {
      name: 'municipios_provincia_nombre_uq',
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('municipios');
  },
};
