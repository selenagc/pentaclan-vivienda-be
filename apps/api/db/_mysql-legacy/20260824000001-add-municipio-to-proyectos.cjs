'use strict';

/**
 * Ubicacion del proyecto (PV-21): cada proyecto se registra en un municipio.
 *
 * La migracion de creacion (20260814000002) no se edita: ya esta registrada en
 * sequelizemeta. La columna nace nullable para poder rellenar las filas ya
 * existentes y recien despues se fija como NOT NULL.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('proyectos', 'id_municipio', {
      // UNSIGNED obligatorio: debe coincidir con la PK de municipios o MySQL
      // rechaza la FK con errno 3780 (tipos incompatibles).
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
    });

    // Backfill: los proyectos anteriores a este cambio no tienen ubicacion, se
    // les asigna el primer municipio del catalogo para poder cerrar el NOT NULL.
    // Si la tabla esta vacia el UPDATE no toca nada.
    await queryInterface.sequelize.query(
      'UPDATE proyectos SET id_municipio = (SELECT MIN(id_municipio) FROM municipios) WHERE id_municipio IS NULL',
    );

    await queryInterface.changeColumn('proyectos', 'id_municipio', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
    });

    await queryInterface.addConstraint('proyectos', {
      fields: ['id_municipio'],
      type: 'foreign key',
      name: 'proyectos_municipio_fk',
      references: { table: 'municipios', field: 'id_municipio' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addIndex('proyectos', ['id_municipio'], {
      name: 'proyectos_municipio_idx',
    });
  },

  async down(queryInterface) {
    // La FK va primero: MySQL necesita el indice mientras la constraint exista
    // y rechaza el DROP INDEX con "needed in a foreign key constraint".
    await queryInterface.removeConstraint('proyectos', 'proyectos_municipio_fk');
    await queryInterface.removeIndex('proyectos', 'proyectos_municipio_idx');
    await queryInterface.removeColumn('proyectos', 'id_municipio');
  },
};
