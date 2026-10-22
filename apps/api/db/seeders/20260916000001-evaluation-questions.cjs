'use strict';

/**
 * Preguntas de evaluacion social para la ficha diagnostico (PV-39).
 * Nivel de conocimiento acerca de construccion de viviendas (16 items).
 * Idempotente: comprueba existencia antes de insertar.
 *
 * @type {import('sequelize-cli').Migration}
 */

const QUESTIONS = [
  { question_text: '1.- CIMIENTOS Y SOBRECIMIENTOS', category: 'Construcción de Viviendas' },
  { question_text: '2.- MURO DE LADRILLO - ADOBE', category: 'Construcción de Viviendas' },
  { question_text: '3.- VIGA CADENA', category: 'Construcción de Viviendas' },
  { question_text: '4.- ARMADO ESTRUCTURA CUBIERTA', category: 'Construcción de Viviendas' },
  { question_text: '5.- TECHADO', category: 'Construcción de Viviendas' },
  { question_text: '6.- CIELO FALSO', category: 'Construcción de Viviendas' },
  { question_text: '7.- REVOQUE INTERIOR DE YESO', category: 'Construcción de Viviendas' },
  { question_text: '8.- EMPEDRADO Y VACIADO DE HORMIGON', category: 'Construcción de Viviendas' },
  { question_text: '9.- REVESTIMIENTO DE PISO DE CERAMICA', category: 'Construcción de Viviendas' },
  { question_text: '10.- REVOQUE EXTERIOR DE CEMENTO', category: 'Construcción de Viviendas' },
  { question_text: '11.- PINTURA INTERIOR', category: 'Construcción de Viviendas' },
  { question_text: '12.- PINTURA EXTERIOR', category: 'Construcción de Viviendas' },
  { question_text: '13.- COLOCADO DE VENTANAS', category: 'Construcción de Viviendas' },
  { question_text: '14.- COLOCADO DE PUERTAS', category: 'Construcción de Viviendas' },
  { question_text: '15.- INSTALACION ELECTRICA', category: 'Construcción de Viviendas' },
  { question_text: '16.- INSTALACION SANITARIA', category: 'Construcción de Viviendas' },
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
