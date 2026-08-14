'use strict';

/**
 * Entidades publicas (PV-19): oficinas departamentales de AEVivienda.
 *
 * La Agencia Estatal de Vivienda opera con un unico NIT institucional a nivel
 * nacional, asi que los 9 registros comparten NIT, nombre y sigla; lo unico que
 * cambia es el departamento.
 *
 * Los id_departamento NO se escriben a mano: se resuelven por nombre contra la
 * tabla `departamentos` (que el seeder de geografia carga con autoincremento,
 * por lo que los IDs no son estables entre entornos).
 *
 * Idempotente: se salta el registro si ya existe una entidad con la misma sigla
 * en ese departamento, asi que se puede re-ejecutar sin duplicar.
 *
 * @type {import('sequelize-cli').Migration}
 */
const NIT = 192310023;
const NOMBRE_ENTIDAD = 'Agencia Estatal de Vivienda';
const SIGLA = 'AEVIVIENDA';

const DEPARTAMENTOS = [
  'Chuquisaca',
  'La Paz',
  'Cochabamba',
  'Oruro',
  'Potosí',
  'Tarija',
  'Santa Cruz',
  'Beni',
  'Pando',
];

async function findId(queryInterface, sql, replacements) {
  const [rows] = await queryInterface.sequelize.query(sql, { replacements });
  return rows.length > 0 ? rows[0].id : null;
}

module.exports = {
  async up(queryInterface) {
    const nuevos = [];
    const faltantes = [];

    for (const nombreDepartamento of DEPARTAMENTOS) {
      const idDepartamento = await findId(
        queryInterface,
        'SELECT id_departamento AS id FROM departamentos WHERE nombre_departamento = :nombre LIMIT 1',
        { nombre: nombreDepartamento },
      );

      // Solo departamentos existentes: si falta, se reporta y se sigue.
      if (idDepartamento === null) {
        faltantes.push(nombreDepartamento);
        continue;
      }

      const idEntidad = await findId(
        queryInterface,
        'SELECT id_entidad_publica AS id FROM entidades_publicas WHERE sigla = :sigla AND id_departamento = :idDepartamento LIMIT 1',
        { sigla: SIGLA, idDepartamento },
      );

      if (idEntidad === null) {
        nuevos.push({
          nit: NIT,
          nombre_entidad: NOMBRE_ENTIDAD,
          sigla: SIGLA,
          id_departamento: idDepartamento,
        });
      }
    }

    if (nuevos.length > 0) {
      await queryInterface.bulkInsert('entidades_publicas', nuevos);
    }

    console.log(`[seed:entidades-publicas] insertadas ${nuevos.length} entidades (${SIGLA}).`);
    if (faltantes.length > 0) {
      console.warn(
        `[seed:entidades-publicas] departamentos no encontrados, omitidos: ${faltantes.join(', ')}. ` +
          'Ejecuta antes el seeder de geografia.',
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('entidades_publicas', { sigla: SIGLA });
  },
};
