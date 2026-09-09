'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('projects', {
      id: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('active', 'paused', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'active',
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      client_id: {
        type: Sequelize.CHAR(36),
        allowNull: true,
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

    await queryInterface.addIndex('projects', ['status'], { name: 'projects_status_idx' });
    await queryInterface.addIndex('projects', ['client_id'], { name: 'projects_client_id_idx' });
    await queryInterface.addIndex('projects', ['name'], { name: 'projects_name_idx' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('projects');
  },
};
