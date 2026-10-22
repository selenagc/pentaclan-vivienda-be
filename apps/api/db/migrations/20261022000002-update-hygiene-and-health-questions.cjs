'use strict';

/**
 * Higiene y salud familiar de la ficha diagnostico social (PV-39):
 *   - Renombra cleanliness_status a rooms_cleanliness_status (dormitorios y
 *     cocina) y agrega yard_cleanliness_status (patio de la casa).
 *   - Convierte los valores guardados al nuevo catalogo de opciones; los que no
 *     tienen equivalente quedan en null. El down revierte la estructura, no la
 *     conversion.
 *
 * @type {import('sequelize-cli').Migration}
 */

const VALUE_MAPS = {
  housing_hygiene: {
    greywater_disposal: {
      'Al patio o huerto': 'PATIO DE CASA',
      'A la calle / acequia / río': 'RIO O ACEQUIA',
    },
    garbage_disposal: {
      'Servicio público de recojo': 'CARRO BASURERO',
      'La entierra': 'LA ENTIERRAN',
      'La bota al río / quebrada / baldío': 'EN EL RIO',
    },
    rooms_cleanliness_status: {},
  },
  health_conditions: {
    prevalent_diseases: {},
    health_care_action: {
      'Centro de Salud / Hospital público': 'LO(S) LLEVAN AL MEDICO DEL CENTRO DE SALUD',
      'Posta Sanitaria / Puesto de salud': 'LO(S) LLEVAN AL MEDICO DEL CENTRO DE SALUD',
      'Medicina tradicional / Naturista': 'ACUDEN A LA MEDICINA TRADICIONAL',
    },
  },
};

const VALID_VALUES = {
  greywater_disposal: ['PATIO DE CASA', 'CAMPO ABIERTO', 'RIO O ACEQUIA'],
  garbage_disposal: ['PATIO DE LA CASA', 'CAMPO ABIERTO', 'EN EL RIO', 'CARRO BASURERO', 'LA ENTIERRAN'],
  rooms_cleanliness_status: ['LIMPIO', 'SUCIO CON BASURA', 'SUCIO CON HECES Y BASURA'],
  prevalent_diseases: [
    'DOLOR DE BARRIGA',
    'DIARREA O VOMITOS',
    'PARASITOS INTESTINALES',
    'RASCA O SARNA',
    'ENFERMEDADES RESPIRATORIAS',
    'ENFERMEDADES OCULARES',
  ],
  health_care_action: [
    'NADA HASTA QUE SE LE PASE',
    'PREPARAN REMEDIO CASERO',
    'ACUDEN A LA MEDICINA TRADICIONAL',
    'LO(S) LLEVAN AL MEDICO DEL CENTRO DE SALUD',
  ],
};

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('housing_hygiene', 'cleanliness_status', 'rooms_cleanliness_status');
    await queryInterface.addColumn('housing_hygiene', 'yard_cleanliness_status', {
      type: Sequelize.STRING(150),
      allowNull: true,
    });

    const run = (sql, replacements) => queryInterface.sequelize.query(sql, { replacements });

    for (const [table, columns] of Object.entries(VALUE_MAPS)) {
      for (const [column, map] of Object.entries(columns)) {
        for (const [from, to] of Object.entries(map)) {
          await run(`UPDATE ${table} SET ${column} = :to WHERE ${column} = :from`, { from, to });
        }
        await run(`UPDATE ${table} SET ${column} = NULL WHERE ${column} NOT IN (:valid)`, {
          valid: VALID_VALUES[column],
        });
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('housing_hygiene', 'yard_cleanliness_status');
    await queryInterface.renameColumn('housing_hygiene', 'rooms_cleanliness_status', 'cleanliness_status');
  },
};
