'use strict';

/**
 * Catalogo de entidades publicas.
 *
 * Cada entidad se registra una sola vez: el NIT es su clave natural y es unico
 * a nivel nacional. AEVivienda es la primera entrada del catalogo; en el futuro
 * pueden sumarse otras entidades a esta misma lista.
 *
 * La cobertura departamental de cada entidad NO se modela aqui: si mas adelante
 * hace falta, se agrega en una tabla puente sin tocar esta.
 *
 * Idempotente: se salta la entidad si ya existe una con el mismo NIT, asi que
 * se puede re-ejecutar sin duplicar.
 *
 * @type {import('sequelize-cli').Migration}
 */
const ENTIDADES = [
  {
    nit: 192310023,
    nombre_entidad: 'Agencia Estatal de Vivienda',
    sigla: 'AEVIVIENDA',
  },
];

module.exports = {
  async up(queryInterface) {
    const nuevas = [];

    for (const entidad of ENTIDADES) {
      const [rows] = await queryInterface.sequelize.query(
        'SELECT id_entidad_publica AS id FROM entidades_publicas WHERE nit = :nit LIMIT 1',
        { replacements: { nit: entidad.nit } },
      );

      if (rows.length === 0) nuevas.push(entidad);
    }

    if (nuevas.length > 0) {
      await queryInterface.bulkInsert('entidades_publicas', nuevas);
    }

    console.log(`[seed:entidades-publicas] insertadas ${nuevas.length} entidades.`);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('entidades_publicas', {
      nit: ENTIDADES.map((e) => e.nit),
    });
  },
};
