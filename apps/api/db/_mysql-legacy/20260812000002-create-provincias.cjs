'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('provincias', {
      id_provincia: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nombre_provincia: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      id_departamento: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'departamentos', key: 'id_departamento' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
    });

    // El nombre de provincia se repite entre departamentos (p. ej. "Cercado"),
    // por eso la unicidad es por departamento y no global.
    await queryInterface.addIndex('provincias', ['id_departamento', 'nombre_provincia'], {
      name: 'provincias_departamento_nombre_uq',
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('provincias');
  },
};
