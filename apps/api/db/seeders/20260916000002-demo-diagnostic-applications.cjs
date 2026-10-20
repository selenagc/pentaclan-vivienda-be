'use strict';

const crypto = require('node:crypto');

/**
 * Seeder de demostración para Ficha de Diagnóstico (PV-39 / PV-40).
 *
 * Crea:
 * - 1 Proyecto: 'SEED-PV39-DIAG-001' (El Alto - Distrito 8).
 * - Asignación en `project_assignments` para `social_lead@pentaclan.com` y `technical_lead@pentaclan.com`.
 * - 10 Postulaciones (Solicitantes con su persona y vivienda):
 *   - 5 postulaciones con AMBOS diagnósticos realizados (técnico y social completos con todos sus hijos).
 *   - 2 postulaciones con SOLO el diagnóstico técnico realizado.
 *   - 2 postulaciones con SOLO el diagnóstico social realizado.
 *   - 1 postulación SIN ningún diagnóstico (pendiente de evaluación).
 *
 * @type {import('sequelize-cli').Migration}
 */

const MUNICIPALITY = { department: 'La Paz', province: 'Murillo', name: 'El Alto' };

const DEMO_PROJECT = {
  contract_no: 'SEED-PV39-DIAG-001',
  project_name: 'Mejoramiento Habitacional Integral El Alto - Distrito 8',
  entity_tax_id: 192310023, // AEVivienda
};

const APPLICANTS_DATA = [
  // 1-5: Ambos diagnósticos realizados
  {
    doc: '9100001',
    issued: 'LP',
    given: 'Gonzalo',
    paternal: 'Aruquipa',
    maternal: 'Quispe',
    sex: 'M',
    birth: '1982-04-15',
    phone: '71512341',
    occupation: 'Albañil independiente',
    address: 'Av. 6 de Marzo #450, Z. Senkata',
    diagType: 'both',
  },
  {
    doc: '9100002',
    issued: 'LP',
    given: 'Beatriz',
    paternal: 'Condori',
    maternal: 'Mamani',
    sex: 'F',
    birth: '1988-11-20',
    phone: '72098712',
    occupation: 'Comerciante minorista',
    address: 'Calle Incahuasi #120, Z. Tarapacá',
    diagType: 'both',
  },
  {
    doc: '9100003',
    issued: 'CB',
    given: 'Ramiro',
    paternal: 'Torrico',
    maternal: 'Vargas',
    sex: 'M',
    birth: '1975-08-03',
    phone: '73044551',
    occupation: 'Carpintero',
    address: 'Calle Litoral #88, Z. Puente Vela',
    diagType: 'both',
  },
  {
    doc: '9100004',
    issued: 'LP',
    given: 'Sonia',
    paternal: 'Flores',
    maternal: 'Apaza',
    sex: 'F',
    birth: '1991-02-28',
    phone: '74123399',
    occupation: 'Costurera',
    address: 'Av. Arica #512, Z. Ventilla',
    diagType: 'both',
  },
  {
    doc: '9100005',
    issued: 'OR',
    given: 'Felix',
    paternal: 'Choque',
    maternal: 'Colque',
    sex: 'M',
    birth: '1980-09-12',
    phone: '76589901',
    occupation: 'Chofer de transporte público',
    address: 'Calle Murillo #304, Z. Senkata',
    diagType: 'both',
  },

  // 6-7: Solo diagnóstico técnico
  {
    doc: '9100006',
    issued: 'LP',
    given: 'Marcos',
    paternal: 'Limachi',
    maternal: 'Ticona',
    sex: 'M',
    birth: '1985-06-19',
    phone: '71900112',
    occupation: 'Electricista',
    address: 'Calle 5 #77, Z. Tarapacá',
    diagType: 'tech_only',
  },
  {
    doc: '9100007',
    issued: 'LP',
    given: 'Elena',
    paternal: 'Huanca',
    maternal: 'Ramos',
    sex: 'F',
    birth: '1979-12-05',
    phone: '72533441',
    occupation: 'Agricultora periurbana',
    address: 'Av. Panamericana #890, Z. Senkata',
    diagType: 'tech_only',
  },

  // 8-9: Solo diagnóstico social
  {
    doc: '9100008',
    issued: 'PT',
    given: 'Víctor',
    paternal: 'Mendoza',
    maternal: 'Cruz',
    sex: 'M',
    birth: '1971-03-30',
    phone: '73988112',
    occupation: 'Obrero de construcción',
    address: 'Calle Los Pinos #14, Z. Puente Vela',
    diagType: 'social_only',
  },
  {
    doc: '9100009',
    issued: 'LP',
    given: 'Juana',
    paternal: 'Yujra',
    maternal: 'Tancara',
    sex: 'F',
    birth: '1986-07-22',
    phone: '75011993',
    occupation: 'Venta de alimentos',
    address: 'Calle Porvenir #205, Z. Ventilla',
    diagType: 'social_only',
  },

  // 10: Sin ningún diagnóstico
  {
    doc: '9100010',
    issued: 'LP',
    given: 'Néstor',
    paternal: 'Chambi',
    maternal: 'Quisbert',
    sex: 'M',
    birth: '1993-10-10',
    phone: '76822119',
    occupation: 'Mecánico automotriz',
    address: 'Av. Tiwanaku #99, Z. Senkata',
    diagType: 'none',
  },
];

async function findOne(queryInterface, sql, replacements) {
  const [rows] = await queryInterface.sequelize.query(sql, { replacements });
  if (!rows || rows.length === 0) return null;
  const first = rows[0];
  const keys = Object.keys(first);
  return first[keys[0]];
}

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // 1. Resolver municipio
    const idMunicipality = await findOne(
      queryInterface,
      `SELECT m.id_municipality
         FROM municipalities m
         JOIN provinces p ON p.id_province = m.id_province
         JOIN departments d ON d.id_department = p.id_department
        WHERE d.department_name = :department
          AND p.province_name = :province
          AND m.municipality_name = :name
        LIMIT 1`,
      MUNICIPALITY,
    );

    if (!idMunicipality) {
      console.log('[seed:diag-apps] Municipio no encontrado. Se omite.');
      return;
    }

    // 2. Resolver entidad pública
    const idPublicEntity = await findOne(
      queryInterface,
      'SELECT id_public_entity FROM public_entities WHERE tax_id = :taxId LIMIT 1',
      { taxId: DEMO_PROJECT.entity_tax_id },
    );

    if (!idPublicEntity) {
      console.log('[seed:diag-apps] Entidad pública no encontrada. Se omite.');
      return;
    }

    // 3. Resolver evaluadores
    const idSocialUser = await findOne(
      queryInterface,
      "SELECT id FROM users WHERE email = 'social_lead@pentaclan.com' LIMIT 1",
    );

    const idTechUser = await findOne(
      queryInterface,
      "SELECT id FROM users WHERE email = 'technical_lead@pentaclan.com' LIMIT 1",
    );

    const idAdminUser = await findOne(
      queryInterface,
      "SELECT id FROM users WHERE role = 'admin' LIMIT 1",
    );

    const projectCreatorId = idAdminUser || idSocialUser || idTechUser;

    // 4. Crear o buscar Proyecto
    let idProject = await findOne(
      queryInterface,
      'SELECT id_project FROM projects WHERE contract_no = :contractNo LIMIT 1',
      { contractNo: DEMO_PROJECT.contract_no },
    );

    if (!idProject) {
      idProject = crypto.randomUUID();
      await queryInterface.bulkInsert('projects', [
        {
          id_project: idProject,
          project_name: DEMO_PROJECT.project_name,
          contract_no: DEMO_PROJECT.contract_no,
          id_public_entity: idPublicEntity,
          id_municipality: idMunicipality,
          id_user: projectCreatorId,
          created_at: now,
          updated_at: now,
        },
      ]);
      console.log(`[seed:diag-apps] Proyecto creado: ${DEMO_PROJECT.contract_no}`);
    }

    // 5. Asignar evaluadores al proyecto en project_assignments
    if (idSocialUser) {
      const existingSocialAssoc = await findOne(
        queryInterface,
        'SELECT id_project_assignment FROM project_assignments WHERE id_project = :idProject AND id_user = :idUser LIMIT 1',
        { idProject, idUser: idSocialUser },
      );
      if (!existingSocialAssoc) {
        await queryInterface.bulkInsert('project_assignments', [
          {
            id_project: idProject,
            id_user: idSocialUser,
            active: true,
            created_at: now,
            updated_at: now,
          },
        ]);
      }
    }

    if (idTechUser) {
      const existingTechAssoc = await findOne(
        queryInterface,
        'SELECT id_project_assignment FROM project_assignments WHERE id_project = :idProject AND id_user = :idUser LIMIT 1',
        { idProject, idUser: idTechUser },
      );
      if (!existingTechAssoc) {
        await queryInterface.bulkInsert('project_assignments', [
          {
            id_project: idProject,
            id_user: idTechUser,
            active: true,
            created_at: now,
            updated_at: now,
          },
        ]);
      }
    }

    // 6. Obtener preguntas de evaluación existentes
    const [evalQuestions] = await queryInterface.sequelize.query(
      'SELECT id_evaluation_question FROM evaluation_questions WHERE active = true ORDER BY id_evaluation_question ASC',
    );

    let createdCount = 0;

    for (let i = 0; i < APPLICANTS_DATA.length; i++) {
      const appData = APPLICANTS_DATA[i];

      // Verificar si la persona ya existe
      let idPerson = await findOne(
        queryInterface,
        'SELECT id_person FROM people WHERE document_no = :doc AND document_issued_in = :issued AND deleted_at IS NULL LIMIT 1',
        { doc: appData.doc, issued: appData.issued },
      );

      if (!idPerson) {
        idPerson = crypto.randomUUID();
        await queryInterface.bulkInsert('people', [
          {
            id_person: idPerson,
            document_no: appData.doc,
            document_issued_in: appData.issued,
            given_names: appData.given,
            paternal_surname: appData.paternal,
            maternal_surname: appData.maternal,
            phone: appData.phone,
            occupation: appData.occupation,
            birth_date: appData.birth,
            sex: appData.sex,
            id_spouse: null,
            created_at: now,
            updated_at: now,
            deleted_at: null,
          },
        ]);
      }

      // Crear vivienda (property)
      const idProperty = crypto.randomUUID();
      await queryInterface.bulkInsert('properties', [
        {
          id_property: idProperty,
          id_municipality: idMunicipality,
          community: 'Distrito 8',
          address: appData.address,
          latitude: -16.5400 - i * 0.005,
          longitude: -68.1800 - i * 0.005,
          created_at: now,
          updated_at: now,
          deleted_at: null,
        },
      ]);

      // Crear postulación (application)
      // Si tiene diagnóstico, pasa a 'under_review' (Preseleccionado). Si no, 'pending'.
      const appStatus = appData.diagType === 'none' ? 'pending' : 'under_review';
      const idApplication = crypto.randomUUID();
      const submittedDate = new Date();
      submittedDate.setDate(submittedDate.getDate() - (15 - i));

      await queryInterface.bulkInsert('applications', [
        {
          id_application: idApplication,
          status: appStatus,
          id_person: idPerson,
          id_property: idProperty,
          id_project: idProject,
          submitted_at: submittedDate,
          id_user: projectCreatorId,
          created_at: now,
          updated_at: now,
          deleted_at: null,
        },
      ]);

      // 7. Crear Ficha de Diagnóstico según la configuración
      if (appData.diagType !== 'none') {
        const idDiag = crypto.randomUUID();
        const formNumber = `FICHA-DIAG-${String(i + 1).padStart(3, '0')}`;
        const hasTech = appData.diagType === 'both' || appData.diagType === 'tech_only';
        const hasSocial = appData.diagType === 'both' || appData.diagType === 'social_only';

        await queryInterface.bulkInsert('diagnostic_records', [
          {
            id_diagnostic_record: idDiag,
            id_application: idApplication,
            form_no: formNumber,
            evaluation_date: '2026-09-10',
            id_technical_user: hasTech ? idTechUser : null,
            technical_completed_at: hasTech ? now : null,
            id_social_user: hasSocial ? idSocialUser : null,
            social_completed_at: hasSocial ? now : null,
            requires_improvement: hasTech,
            requires_expansion: false,
            requires_renovation: false,
            rooms_to_improve: hasTech ? 'Dormitorio principal y cocina' : null,
            bedroom_suggestion: hasTech ? 'Revoque de yeso interior y cambio de piso' : null,
            kitchen_suggestion: hasTech ? 'Mesón de HºCº y revestimiento cerámico' : null,
            bathroom_suggestion: hasTech ? 'Instalación de inodoro y ducha' : null,
            general_observations: hasTech ? 'Vivienda precaria apta para mejoramiento habitacional.' : null,
            created_at: now,
            updated_at: now,
          },
        ]);

        // Si tiene módulo social:
        if (hasSocial) {
          // Composición familiar
          await queryInterface.bulkInsert('family_members', [
            {
              id_diagnostic_record: idDiag,
              full_name: `${appData.given} ${appData.paternal}`,
              relationship: 'Jefe(a) de Hogar',
              age: 42,
              occupation: appData.occupation,
              has_disability: false,
              disability_type: null,
              disability_document: null,
              created_at: now,
              updated_at: now,
            },
            {
              id_diagnostic_record: idDiag,
              full_name: `Rosa ${appData.paternal} Mamani`,
              relationship: 'Cónyuge / Conviviente',
              age: 39,
              occupation: 'Labores de casa',
              has_disability: false,
              disability_type: null,
              disability_document: null,
              created_at: now,
              updated_at: now,
            },
            {
              id_diagnostic_record: idDiag,
              full_name: `Kevin ${appData.paternal}`,
              relationship: 'Hijo(a)',
              age: 12,
              occupation: 'Estudiante',
              has_disability: i === 1, // El 2do solicitante con un hijo con discapacidad
              disability_type: i === 1 ? 'Discapacidad física motriz' : null,
              disability_document: i === 1 ? 'CARNET-CONALPEDIS-4491' : null,
              created_at: now,
              updated_at: now,
            },
          ]);

          // Respuestas al cuestionario
          if (evalQuestions.length > 0) {
            const answersToInsert = evalQuestions.map((q, idx) => ({
              id_diagnostic_record: idDiag,
              id_evaluation_question: q.id_evaluation_question,
              answer_boolean: idx % 2 === 0,
              score: String((idx + 1) * 5),
              created_at: now,
              updated_at: now,
            }));
            await queryInterface.bulkInsert('diagnostic_answers', answersToInsert);
          }

          // Hábitos de agua
          await queryInterface.bulkInsert('water_consumption_habits', [
            {
              id_diagnostic_record: idDiag,
              water_source: 'Red pública dentro de la vivienda',
              container_clean: true,
              container_status: 'Bueno (Limpio y con tapa)',
              water_treatment: 'Hierve el agua',
              other_details: 'Tanque de polietileno de 500 litros protegido',
              created_at: now,
              updated_at: now,
            },
          ]);

          // Higiene
          await queryInterface.bulkInsert('housing_hygiene', [
            {
              id_diagnostic_record: idDiag,
              greywater_disposal: 'Red de alcantarillado',
              garbage_disposal: 'Servicio público de recojo',
              cleanliness_status: 'Bueno',
              created_at: now,
              updated_at: now,
            },
          ]);

          // Salud
          await queryInterface.bulkInsert('health_conditions', [
            {
              id_diagnostic_record: idDiag,
              prevalent_diseases: 'Infecciones respiratorias leves en temporada de invierno',
              health_care_action: 'Centro de Salud / Hospital público',
              created_at: now,
              updated_at: now,
            },
          ]);
        }

        // Si tiene módulo técnico:
        if (hasTech) {
          // Terreno y accesibilidad
          await queryInterface.bulkInsert('land_accessibilities', [
            {
              id_diagnostic_record: idDiag,
              slope_percentage: 4.5,
              pedestrian_minutes: 5,
              abc_standard: 'FUERA DE LOS 50 mts DEL EJE DE VIA',
              accessibility_type: 'CARRETERA DE TIERRA',
              land_condition: 'SECO',
              created_at: now,
              updated_at: now,
            },
          ]);

          // Servicios básicos
          await queryInterface.bulkInsert('basic_utilities', [
            {
              id_diagnostic_record: idDiag,
              water_access: 'POR CAÑERIA',
              electricity_service: 'DE RED',
              shared_bathroom: false,
              private_bathroom: true,
              bathroom_type: 'DESCARGA AGUA',
              shared_kitchen: false,
              private_kitchen: true,
              adequate_kitchen: false,
              kitchen_type: 'A GAS',
              created_at: now,
              updated_at: now,
            },
          ]);

          // Características de la vivienda
          await queryInterface.bulkInsert('housing_characteristics', [
            {
              id_diagnostic_record: idDiag,
              housing_typology: 'Casa unifamiliar independiente',
              tenure_status: 'Propietario(a) con Folio Real',
              observations: 'Terreno saneado con registro catastral municipal.',
              created_at: now,
              updated_at: now,
            },
          ]);

          // Bloques constructivos
          await queryInterface.bulkInsert('construction_elements', [
            {
              id_diagnostic_record: idDiag,
              construction_number: 1,
              usage_type: 'Dormitorio principal',
              foundation_material: 'Piedra con barro',
              foundation_state: 'Regular',
              walls_material: 'Adobe',
              walls_state: 'Regular',
              roof_material: 'Calamina',
              roof_state: 'Regular',
              exterior_plaster_material: 'Barro',
              exterior_plaster_state: 'Malo',
              interior_plaster_material: 'Yeso',
              interior_plaster_state: 'Regular',
              ceiling_plaster_material: 'Sin cielo raso',
              ceiling_plaster_state: 'Inexistente',
              floors_material: 'Tierra apisonada',
              floors_state: 'Malo',
              doors_material: 'Madera rústica',
              doors_state: 'Regular',
              windows_material: 'Fierro / Sin vidrio',
              windows_state: 'Regular',
              electrical_installation: 'Sobrepuesta precaria',
              electrical_installation_state: 'Malo',
              can_be_improved: 1,
              cannot_be_improved: 0,
              no_improvement_needed: 0,
              observations: 'Requiere contrapiso de cemento y revoques interiores.',
              created_at: now,
              updated_at: now,
            },
            {
              id_diagnostic_record: idDiag,
              construction_number: 2,
              usage_type: 'Cocina familiar',
              foundation_material: 'Piedra con barro',
              foundation_state: 'Regular',
              walls_material: 'Ladrillo gambote',
              walls_state: 'Bueno',
              roof_material: 'Calamina',
              roof_state: 'Bueno',
              exterior_plaster_material: 'Cemento',
              exterior_plaster_state: 'Bueno',
              interior_plaster_material: 'Yeso',
              interior_plaster_state: 'Regular',
              ceiling_plaster_material: 'Cielo raso yeso',
              ceiling_plaster_state: 'Bueno',
              floors_material: 'Cemento frotachado',
              floors_state: 'Regular',
              doors_material: 'Placa',
              doors_state: 'Bueno',
              windows_material: 'Aluminio con vidrio',
              windows_state: 'Bueno',
              electrical_installation: 'Empotrada',
              electrical_installation_state: 'Bueno',
              can_be_improved: 1,
              cannot_be_improved: 0,
              no_improvement_needed: 0,
              observations: 'Requiere mesón y grifería.',
              created_at: now,
              updated_at: now,
            },
          ]);

          // Fotos de campo
          await queryInterface.bulkInsert('diagnostic_photos', [
            {
              id_diagnostic_record: idDiag,
              photo_type: 'Fachada Principal',
              url: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=800',
              description: 'Vista frontal del acceso y fachada exterior',
              created_at: now,
              updated_at: now,
            },
            {
              id_diagnostic_record: idDiag,
              photo_type: 'Dormitorio(s)',
              url: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef2?w=800',
              description: 'Interior del ambiente principal con piso de tierra',
              created_at: now,
              updated_at: now,
            },
          ]);
        }
      }

      createdCount++;
    }

    console.log(`[seed:diag-apps] Creadas exitosamente ${createdCount} postulaciones con sus diagnósticos.`);
  },

  async down(queryInterface) {
    const idProject = await findOne(
      queryInterface,
      'SELECT id_project FROM projects WHERE contract_no = :contractNo LIMIT 1',
      { contractNo: DEMO_PROJECT.contract_no },
    );

    if (!idProject) return;

    // Obtener postulaciones asociadas al proyecto
    const [apps] = await queryInterface.sequelize.query(
      'SELECT id_application, id_property FROM applications WHERE id_project = :idProject',
      { replacements: { idProject } },
    );

    const appIds = apps.map((a) => a.id_application);
    const propIds = apps.map((a) => a.id_property);

    if (appIds.length > 0) {
      // Diagnostic records y cascada
      await queryInterface.sequelize.query(
        'DELETE FROM diagnostic_records WHERE id_application IN (:appIds)',
        { replacements: { appIds } },
      );

      await queryInterface.sequelize.query(
        'DELETE FROM applications WHERE id_application IN (:appIds)',
        { replacements: { appIds } },
      );
    }

    if (propIds.length > 0) {
      await queryInterface.sequelize.query(
        'DELETE FROM properties WHERE id_property IN (:propIds)',
        { replacements: { propIds } },
      );
    }

    const docs = APPLICANTS_DATA.map((a) => a.doc);
    await queryInterface.sequelize.query(
      'DELETE FROM people WHERE document_no IN (:docs)',
      { replacements: { docs } },
    );

    await queryInterface.sequelize.query(
      'DELETE FROM project_assignments WHERE id_project = :idProject',
      { replacements: { idProject } },
    );

    await queryInterface.sequelize.query(
      'DELETE FROM projects WHERE id_project = :idProject',
      { replacements: { idProject } },
    );
  },
};
