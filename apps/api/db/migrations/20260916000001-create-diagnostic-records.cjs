'use strict';

/**
 * Ficha de Diagnostico Tecnico y Social (PV-39).
 *
 * Estructura de evaluacion en campo vinculada a la postulacion (applications).
 * Separa claramente la auditoria y datos del evaluador tecnico (technical_lead)
 * y del evaluador social (social_lead).
 *
 * Tablas:
 *   - diagnostic_records: Cabecera principal vinculada a la postulacion.
 *   - family_members: Composicion familiar y discapacidad (Social).
 *   - evaluation_questions: Banco de preguntas socioeconomicas (Social).
 *   - diagnostic_answers: Respuestas a las preguntas (Social).
 *   - water_consumption_habits: Fuentes y habitos de consumo de agua (Social).
 *   - housing_hygiene: Higiene, manejo de aguas grises y basura (Social).
 *   - health_conditions: Enfermedades prevalentes y atencion de salud (Social).
 *   - land_accessibilities: Topografia, pendiente y accesibilidad (Tecnico).
 *   - basic_utilities: Servicios basicos e instalaciones sanitarias (Tecnico).
 *   - housing_characteristics: Tipologia y tenencia del inmueble (Tecnico).
 *   - construction_elements: Evaluacion de materiales y estado constructivo (Tecnico).
 *   - diagnostic_photos: Registro fotografico de la inspeccion (Tecnico).
 *
 * @type {import('sequelize-cli').Migration}
 */

const FKS = [
  ['diagnostic_records', 'diagnostic_records_application_fk', 'id_application', 'applications', 'id_application', 'CASCADE'],
  ['diagnostic_records', 'diagnostic_records_technical_user_fk', 'id_technical_user', 'users', 'id', 'SET NULL'],
  ['diagnostic_records', 'diagnostic_records_social_user_fk', 'id_social_user', 'users', 'id', 'SET NULL'],
  ['family_members', 'family_members_diagnostic_record_fk', 'id_diagnostic_record', 'diagnostic_records', 'id_diagnostic_record', 'CASCADE'],
  ['diagnostic_answers', 'diagnostic_answers_diagnostic_record_fk', 'id_diagnostic_record', 'diagnostic_records', 'id_diagnostic_record', 'CASCADE'],
  ['diagnostic_answers', 'diagnostic_answers_question_fk', 'id_evaluation_question', 'evaluation_questions', 'id_evaluation_question', 'CASCADE'],
  ['water_consumption_habits', 'water_habits_diagnostic_record_fk', 'id_diagnostic_record', 'diagnostic_records', 'id_diagnostic_record', 'CASCADE'],
  ['housing_hygiene', 'housing_hygiene_diagnostic_record_fk', 'id_diagnostic_record', 'diagnostic_records', 'id_diagnostic_record', 'CASCADE'],
  ['health_conditions', 'health_conditions_diagnostic_record_fk', 'id_diagnostic_record', 'diagnostic_records', 'id_diagnostic_record', 'CASCADE'],
  ['land_accessibilities', 'land_accessibilities_diagnostic_record_fk', 'id_diagnostic_record', 'diagnostic_records', 'id_diagnostic_record', 'CASCADE'],
  ['basic_utilities', 'basic_utilities_diagnostic_record_fk', 'id_diagnostic_record', 'diagnostic_records', 'id_diagnostic_record', 'CASCADE'],
  ['housing_characteristics', 'housing_characteristics_diagnostic_record_fk', 'id_diagnostic_record', 'diagnostic_records', 'id_diagnostic_record', 'CASCADE'],
  ['construction_elements', 'construction_elements_diagnostic_record_fk', 'id_diagnostic_record', 'diagnostic_records', 'id_diagnostic_record', 'CASCADE'],
  ['diagnostic_photos', 'diagnostic_photos_diagnostic_record_fk', 'id_diagnostic_record', 'diagnostic_records', 'id_diagnostic_record', 'CASCADE'],
];

const INDEXES = [
  ['diagnostic_records', 'diagnostic_records_application_uq', ['id_application'], true, { deleted_at: null }],
  ['diagnostic_records', 'diagnostic_records_application_idx', ['id_application'], false, null],
  ['family_members', 'family_members_diagnostic_record_idx', ['id_diagnostic_record'], false, null],
  ['construction_elements', 'construction_elements_diagnostic_record_idx', ['id_diagnostic_record'], false, null],
  ['diagnostic_photos', 'diagnostic_photos_diagnostic_record_idx', ['id_diagnostic_record'], false, null],
];

const TABLES_DOWN = [
  'diagnostic_photos',
  'construction_elements',
  'housing_characteristics',
  'basic_utilities',
  'land_accessibilities',
  'health_conditions',
  'housing_hygiene',
  'water_consumption_habits',
  'diagnostic_answers',
  'evaluation_questions',
  'family_members',
  'diagnostic_records',
];

const timestamps = (Sequelize) => ({
  created_at: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
  updated_at: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
});

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. diagnostic_records
    await queryInterface.createTable('diagnostic_records', {
      id_diagnostic_record: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        allowNull: false,
      },
      id_application: {
        type: Sequelize.CHAR(36),
        allowNull: false,
      },
      form_no: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      evaluation_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      id_technical_user: {
        type: Sequelize.CHAR(36),
        allowNull: true,
      },
      technical_completed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      id_social_user: {
        type: Sequelize.CHAR(36),
        allowNull: true,
      },
      social_completed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      requires_improvement: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      requires_expansion: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      requires_renovation: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      rooms_to_improve: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      bedroom_suggestion: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      living_room_suggestion: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      kitchen_suggestion: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      bathroom_suggestion: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      general_observations: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      ...timestamps(Sequelize),
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // 2. family_members
    await queryInterface.createTable('family_members', {
      id_family_member: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_diagnostic_record: {
        type: Sequelize.CHAR(36),
        allowNull: false,
      },
      full_name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      relationship: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      age: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      occupation: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      has_disability: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      disability_type: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      disability_document: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      ...timestamps(Sequelize),
    });

    // 3. evaluation_questions
    await queryInterface.createTable('evaluation_questions', {
      id_evaluation_question: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      question_text: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      category: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      ...timestamps(Sequelize),
    });

    // 4. diagnostic_answers
    await queryInterface.createTable('diagnostic_answers', {
      id_diagnostic_record: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        allowNull: false,
      },
      id_evaluation_question: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      answer_boolean: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      score: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      ...timestamps(Sequelize),
    });

    // 5. water_consumption_habits
    await queryInterface.createTable('water_consumption_habits', {
      id_diagnostic_record: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        allowNull: false,
      },
      water_source: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      container_clean: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      container_status: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      water_treatment: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      other_details: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      ...timestamps(Sequelize),
    });

    // 6. housing_hygiene
    await queryInterface.createTable('housing_hygiene', {
      id_diagnostic_record: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        allowNull: false,
      },
      greywater_disposal: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      garbage_disposal: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      cleanliness_status: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      ...timestamps(Sequelize),
    });

    // 7. health_conditions
    await queryInterface.createTable('health_conditions', {
      id_diagnostic_record: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        allowNull: false,
      },
      prevalent_diseases: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      health_care_action: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      ...timestamps(Sequelize),
    });

    // 8. land_accessibilities
    await queryInterface.createTable('land_accessibilities', {
      id_diagnostic_record: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        allowNull: false,
      },
      slope_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      pedestrian_minutes: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      abc_standard: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      accessibility_type: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      land_condition: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      ...timestamps(Sequelize),
    });

    // 9. basic_utilities
    await queryInterface.createTable('basic_utilities', {
      id_diagnostic_record: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        allowNull: false,
      },
      water_access: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      electricity_service: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      shared_bathroom: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      private_bathroom: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      bathroom_type: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      shared_kitchen: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      private_kitchen: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      adequate_kitchen: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      kitchen_type: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      ...timestamps(Sequelize),
    });

    // 10. housing_characteristics
    await queryInterface.createTable('housing_characteristics', {
      id_diagnostic_record: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        allowNull: false,
      },
      housing_typology: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      tenure_status: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      observations: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      ...timestamps(Sequelize),
    });

    // 11. construction_elements
    await queryInterface.createTable('construction_elements', {
      id_construction_element: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_diagnostic_record: {
        type: Sequelize.CHAR(36),
        allowNull: false,
      },
      construction_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      usage_type: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      foundation_material: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      foundation_state: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      walls_material: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      walls_state: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      roof_material: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      roof_state: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      exterior_plaster_material: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      exterior_plaster_state: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      interior_plaster_material: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      interior_plaster_state: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      ceiling_plaster_material: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      ceiling_plaster_state: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      floors_material: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      floors_state: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      doors_material: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      doors_state: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      windows_material: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      windows_state: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      electrical_installation: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      electrical_installation_state: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      can_be_improved: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      cannot_be_improved: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      no_improvement_needed: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      observations: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      ...timestamps(Sequelize),
    });

    // 12. diagnostic_photos
    await queryInterface.createTable('diagnostic_photos', {
      id_diagnostic_photo: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_diagnostic_record: {
        type: Sequelize.CHAR(36),
        allowNull: false,
      },
      photo_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      url: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      ...timestamps(Sequelize),
    });

    // Foreign keys
    for (const [table, name, field, target, targetField, onDelete] of FKS) {
      await queryInterface.addConstraint(table, {
        fields: [field],
        type: 'foreign key',
        name,
        references: { table: target, field: targetField },
        onDelete: onDelete || 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }

    // Indexes
    for (const [table, name, fields, unique, where] of INDEXES) {
      await queryInterface.addIndex(table, fields, {
        name,
        unique,
        ...(where ? { where } : {}),
      });
    }
  },

  async down(queryInterface) {
    for (const table of TABLES_DOWN) {
      await queryInterface.dropTable(table);
    }
  },
};
