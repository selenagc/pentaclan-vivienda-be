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
    taxId: 192310023,
    entity_name: 'Agencia Estatal de Vivienda',
    acronym: 'AEVIVIENDA',
  },
];

module.exports = {
  async up(queryInterface) {
    const pending = [];

    for (const publicEntity of ENTIDADES) {
      const [rows] = await queryInterface.sequelize.query(
        'SELECT id_public_entity AS id FROM public_entities WHERE taxId = :taxId LIMIT 1',
        { replacements: { taxId: publicEntity.taxId } },
      );

      if (rows.length === 0) pending.push(publicEntity);
    }

    if (pending.length > 0) {
      await queryInterface.bulkInsert('public_entities', pending);
    }

    console.log(`[seed:publicEntities-publicas] insertadas ${pending.length} publicEntities.`);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('public_entities', {
      taxId: ENTIDADES.map((e) => e.taxId),
    });
  },
};
