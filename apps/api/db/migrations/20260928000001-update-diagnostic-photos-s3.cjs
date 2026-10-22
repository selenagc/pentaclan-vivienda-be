'use strict';

/**
 * Actualiza la tabla diagnostic_photos para soporte de AWS S3 y auditoria antifraude.
 * Agrega s3_key, category ('technical' | 'social'), captured_at, coordenadas GPS
 * y metadatos tecnicos de la imagen. Permite url nula (sustituida por s3_key).
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('diagnostic_photos', 'category', {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'technical',
    });

    await queryInterface.addColumn('diagnostic_photos', 's3_key', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });

    // Backfill s3_key si existen registros previos con url
    await queryInterface.sequelize.query(
      `UPDATE diagnostic_photos SET s3_key = COALESCE(url, '') WHERE s3_key IS NULL`
    );

    await queryInterface.addColumn('diagnostic_photos', 'captured_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    });

    await queryInterface.addColumn('diagnostic_photos', 'capture_latitude', {
      type: Sequelize.NUMERIC(10, 7),
      allowNull: true,
    });

    await queryInterface.addColumn('diagnostic_photos', 'capture_longitude', {
      type: Sequelize.NUMERIC(10, 7),
      allowNull: true,
    });

    await queryInterface.addColumn('diagnostic_photos', 'mime_type', {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'image/jpeg',
    });

    await queryInterface.addColumn('diagnostic_photos', 'file_size_bytes', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.changeColumn('diagnostic_photos', 'url', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });

    await queryInterface.addIndex('diagnostic_photos', ['id_diagnostic_record', 'category'], {
      name: 'diagnostic_photos_record_category_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('diagnostic_photos', 'diagnostic_photos_record_category_idx');

    await queryInterface.changeColumn('diagnostic_photos', 'url', {
      type: Sequelize.STRING(500),
      allowNull: false,
      defaultValue: '',
    });

    await queryInterface.removeColumn('diagnostic_photos', 'file_size_bytes');
    await queryInterface.removeColumn('diagnostic_photos', 'mime_type');
    await queryInterface.removeColumn('diagnostic_photos', 'capture_longitude');
    await queryInterface.removeColumn('diagnostic_photos', 'capture_latitude');
    await queryInterface.removeColumn('diagnostic_photos', 'captured_at');
    await queryInterface.removeColumn('diagnostic_photos', 's3_key');
    await queryInterface.removeColumn('diagnostic_photos', 'category');
  },
};
