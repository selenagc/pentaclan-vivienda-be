'use strict';

/**
 * Modulo de Proyectos (PV-21).
 *
 * Reemplaza la tabla `projects` creada fuera de orden, cuyo modelo (estado,
 * fechas, client_id) no corresponde al negocio. La migracion original no se
 * edita: ya esta registrada en sequelizemeta, asi que aqui se elimina la tabla
 * y se crea la definitiva.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.dropTable('projects');

    await queryInterface.createTable('proyectos', {
      id_proyecto: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        allowNull: false,
      },
      nombre_proyecto: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      // Un contrato ampara un unico proyecto: el duplicado es error de captura.
      nro_contrato: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      // UNSIGNED obligatorio: debe coincidir con la PK de entidades_publicas o
      // MySQL rechaza la FK con errno 3780 (tipos incompatibles).
      id_entidad_publica: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'entidades_publicas', key: 'id_entidad_publica' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      // Auditoria: usuario que registro el proyecto. Se toma de la sesion.
      id_usuario: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
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

    await queryInterface.addIndex('proyectos', ['id_entidad_publica'], {
      name: 'proyectos_entidad_publica_idx',
    });
    await queryInterface.addIndex('proyectos', ['id_usuario'], {
      name: 'proyectos_usuario_idx',
    });
    await queryInterface.addIndex('proyectos', ['nombre_proyecto'], {
      name: 'proyectos_nombre_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('proyectos');

    // Se restaura `projects` tal como la dejo 20260520000003 para que el
    // historial de migraciones siga siendo reversible.
    await queryInterface.createTable('projects', {
      id: { type: Sequelize.CHAR(36), primaryKey: true, allowNull: false },
      name: { type: Sequelize.STRING(200), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      status: {
        type: Sequelize.ENUM('active', 'paused', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'active',
      },
      start_date: { type: Sequelize.DATEONLY, allowNull: true },
      end_date: { type: Sequelize.DATEONLY, allowNull: true },
      client_id: { type: Sequelize.CHAR(36), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('projects', ['status'], { name: 'projects_status_idx' });
    await queryInterface.addIndex('projects', ['client_id'], { name: 'projects_client_id_idx' });
    await queryInterface.addIndex('projects', ['name'], { name: 'projects_name_idx' });
  },
};
