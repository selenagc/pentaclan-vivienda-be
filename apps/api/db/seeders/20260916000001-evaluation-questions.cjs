'use strict';

/**
 * Preguntas de evaluacion social para la ficha diagnostico (PV-39).
 * Idempotente: comprueba existencia antes de insertar.
 *
 * @type {import('sequelize-cli').Migration}
 */

const QUESTIONS = [
  { question_text: '¿La familia cuenta con documento de propiedad o posesión del terreno?', category: 'Legal / Tenencia' },
  { question_text: '¿La vivienda sufre riesgos de inundación, riada o deslizamiento?', category: 'Riesgos' },
  { question_text: '¿Existe servicio de recojo de basura regular en la zona?', category: 'Saneamiento' },
  { question_text: '¿Tiene acceso cercano a transporte público (menos de 15 minutos)?', category: 'Accesibilidad' },
  { question_text: '¿Algún miembro del hogar percibe ingresos fijos o jubilación?', category: 'Socioeconómico' },
];

module.exports = {
  async up(queryInterface) {
    for (const q of QUESTIONS) {
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id_evaluation_question FROM evaluation_questions WHERE question_text = :question_text LIMIT 1;`,
        { replacements: { question_text: q.question_text } }
      );

      if (existing.length === 0) {
        await queryInterface.bulkInsert('evaluation_questions', [
          {
            question_text: q.question_text,
            category: q.category,
            active: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ]);
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('evaluation_questions', null, {});
  },
};
