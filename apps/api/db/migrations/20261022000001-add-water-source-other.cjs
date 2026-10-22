'use strict';

/**
 * Uso y consumo de agua de la ficha diagnostico social (PV-39):
 *   - Agrega water_source_other: detalle cuando la fuente es "OTROS".
 *   - Convierte los valores guardados al nuevo catalogo de opciones. Los que no
 *     tienen equivalente pasan a "OTROS" (fuente) o quedan en null (estado y
 *     tratamiento). El down solo quita la columna: la conversion no se revierte.
 *
 * @type {import('sequelize-cli').Migration}
 */

const WATER_SOURCE_MAP = {
  'Red pública dentro de la vivienda': 'RED PUBLICA',
  'Red pública fuera de la vivienda': 'RED PUBLICA',
  'Pila o grifo público': 'PILETA PUBLICA',
  'Cosecha de agua de lluvia': 'COSECHA DE LLUVIA',
};

const WATER_TREATMENT_MAP = {
  'Filtra el agua': 'FILTRAN EL AGUA',
  'Hierve el agua': 'HIERVEN EL AGUA',
  'Aplica cloro / lavandina': 'CLORAN',
};

const WATER_SOURCES = ['VERTIENTE', 'ARROYO/QUEBRADA', 'COSECHA DE LLUVIA', 'PILETA PUBLICA', 'RIOS', 'RED PUBLICA', 'OTROS'];
const CONTAINER_STATUSES = ['ESTAN CUBIERTOS', 'ESTAN TAPADOS', 'ESTAN LIMPIOS', 'MAS/MENOS LIMPIOS', 'SUCIOS'];
const WATER_TREATMENTS = ['FILTRAN EL AGUA', 'HIERVEN EL AGUA', 'CLORAN'];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('water_consumption_habits', 'water_source_other', {
      type: Sequelize.STRING(150),
      allowNull: true,
    });

    const run = (sql, replacements) => queryInterface.sequelize.query(sql, { replacements });

    await run("UPDATE water_consumption_habits SET water_source = NULL WHERE TRIM(water_source) = ''");
    for (const [from, to] of Object.entries(WATER_SOURCE_MAP)) {
      await run('UPDATE water_consumption_habits SET water_source = :to WHERE water_source = :from', { from, to });
    }
    await run(
      `UPDATE water_consumption_habits
         SET water_source_other = water_source, water_source = 'OTROS'
       WHERE water_source IS NOT NULL AND water_source NOT IN (:valid)`,
      { valid: WATER_SOURCES },
    );

    await run(
      'UPDATE water_consumption_habits SET container_status = NULL WHERE container_status NOT IN (:valid)',
      { valid: CONTAINER_STATUSES },
    );

    for (const [from, to] of Object.entries(WATER_TREATMENT_MAP)) {
      await run('UPDATE water_consumption_habits SET water_treatment = :to WHERE water_treatment = :from', { from, to });
    }
    await run(
      'UPDATE water_consumption_habits SET water_treatment = NULL WHERE water_treatment NOT IN (:valid)',
      { valid: WATER_TREATMENTS },
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('water_consumption_habits', 'water_source_other');
  },
};
