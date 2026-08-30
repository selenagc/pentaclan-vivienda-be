'use strict';

/**
 * Elimina la tabla refresh_tokens: el flujo de autenticacion deja de usar
 * refresh tokens (login devuelve solo accessToken; se quitan /auth/refresh y
 * /auth/logout). down() recrea la tabla identica a su migracion original.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.dropTable('refresh_tokens');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.createTable('refresh_tokens', {
      id: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      token_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
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

    await queryInterface.addIndex('refresh_tokens', ['user_id'], {
      name: 'refresh_tokens_user_id_idx',
    });
    await queryInterface.addIndex('refresh_tokens', ['token_hash'], {
      name: 'refresh_tokens_token_hash_idx',
    });
  },
};
