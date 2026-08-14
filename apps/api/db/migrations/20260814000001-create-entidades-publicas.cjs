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
      // AEVivienda usa un unico NIT institucional a nivel nacional, por lo que
      // el mismo valor se repite en todos los departamentos: sin UNIQUE (PV-19).
      nit: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      nombre_entidad: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      sigla: {
        type: Sequelize.STRING(50),
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

    // Una sola entidad por sigla y departamento: respalda a nivel de BD la
    // idempotencia del seeder sin restringir el NIT.
    await queryInterface.addIndex('entidades_publicas', ['id_departamento', 'sigla'], {
      name: 'entidades_publicas_departamento_sigla_uq',
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('entidades_publicas');
  },
};
