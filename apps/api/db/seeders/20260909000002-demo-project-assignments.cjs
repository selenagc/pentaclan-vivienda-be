'use strict';

require('dotenv').config();
const bcrypt = require('bcrypt');
const crypto = require('node:crypto');

/**
 * Asignaciones de proyectos a evaluadores tecnicos y sociales (PV-35).
 *
 * Crea usuarios de prueba adicionales (Social Lead y Technical Lead),
 * un nuevo proyecto demo en Cochabamba (Sacaba) y registra asignaciones
 * en la tabla intermedia `project_assignments`.
 *
 * Escenarios que cubre para QA / Postman:
 * - Usuario con multiples proyectos asignados (social_lead@pentaclan.com -> 2 proyectos).
 * - Usuario con un solo proyecto asignado (technical_lead@pentaclan.com -> 1 proyecto).
 * - Nuevos evaluadores con proyectos asignados (mariana.social@pentaclan.com, rodrigo.tech@pentaclan.com).
 * - Asignacion inactiva con active=false (patricia.tech@pentaclan.com -> no se devuelve en /api/me/projects).
 * - Usuario sin asignaciones (carlos.social@pentaclan.com -> devuelve arreglo vacio []).
 *
 * @type {import('sequelize-cli').Migration}
 */

const ADDITIONAL_TEST_USERS = [
  {
    name: 'Mariana Soliz (Social Lead 2)',
    email: 'mariana.social@pentaclan.com',
    role: 'social_lead',
  },
  {
    name: 'Carlos Mamani (Social Lead 3 - Sin proyectos)',
    email: 'carlos.social@pentaclan.com',
    role: 'social_lead',
  },
  {
    name: 'Rodrigo Morales (Technical Lead 2)',
    email: 'rodrigo.tech@pentaclan.com',
    role: 'technical_lead',
  },
  {
    name: 'Patricia Flores (Technical Lead 3 - Inactivo)',
    email: 'patricia.tech@pentaclan.com',
    role: 'technical_lead',
  },
];

const NEW_DEMO_PROJECT = {
  contract_no: 'SEED-PV35-001',
  project_name: 'Construccion de Viviendas Cochabamba - Sacaba',
  entity_tax_id: 192310023,
  municipality: { department: 'Cochabamba', province: 'Chapare', name: 'Sacaba' },
};

/** Matriz de asignaciones: [userEmail, projectContractNo, active] */
const ASSIGNMENTS_CONFIG = [
  // Multiples proyectos para social_lead base:
  ['social_lead@pentaclan.com', 'SEED-PV30-001', true],
  ['social_lead@pentaclan.com', 'SEED-PV32-001', true],
  // Un proyecto para technical_lead base:
  ['technical_lead@pentaclan.com', 'SEED-PV30-001', true],
  // Nueva Social Lead asignada al proyecto de Sacaba:
  ['mariana.social@pentaclan.com', 'SEED-PV35-001', true],
  // Nuevo Technical Lead asignado a Viacha y Sacaba:
  ['rodrigo.tech@pentaclan.com', 'SEED-PV32-001', true],
  ['rodrigo.tech@pentaclan.com', 'SEED-PV35-001', true],
  // Technical Lead con asignacion inactiva (para verificar filtro active = true):
  ['patricia.tech@pentaclan.com', 'SEED-PV30-001', false],
  // Nota: carlos.social@pentaclan.com NO se asigna para probar respuesta []
];

async function findOne(queryInterface, sql, replacements) {
  const [rows] = await queryInterface.sequelize.query(sql, { replacements });
  return rows.length ? Object.values(rows[0])[0] : null;
}

module.exports = {
  async up(queryInterface) {
    if (process.env.NODE_ENV === 'production') {
      console.log('[seed:assignments] NODE_ENV=production, se omite el seeder de asignaciones.');
      return;
    }

    const now = new Date();
    const password = process.env.SEED_TEST_PASSWORD || 'Test1234!';
    const passwordHash = await bcrypt.hash(password, 10);

    // 1. Crear usuarios de prueba adicionales si no existen
    for (const user of ADDITIONAL_TEST_USERS) {
      const existing = await findOne(
        queryInterface,
        'SELECT id FROM users WHERE email = :email LIMIT 1',
        { email: user.email },
      );

      if (!existing) {
        await queryInterface.bulkInsert('users', [
          {
            id: crypto.randomUUID(),
            name: user.name,
            email: user.email,
            password_hash: passwordHash,
            role: user.role,
            created_at: now,
            updated_at: now,
          },
        ]);
        console.log(`[seed:assignments] creado usuario ${user.email} (${user.role}).`);
      }
    }

    // 2. Buscar o crear el nuevo proyecto demo (Sacaba)
    let idProject35 = await findOne(
      queryInterface,
      'SELECT id_project FROM projects WHERE contract_no = :contractNo LIMIT 1',
      { contractNo: NEW_DEMO_PROJECT.contract_no },
    );

    if (!idProject35) {
      const idMunicipality = await findOne(
        queryInterface,
        `SELECT m.id_municipality
           FROM municipalities m
           JOIN provinces p ON p.id_province = m.id_province
           JOIN departments d ON d.id_department = p.id_department
          WHERE m.municipality_name = :name
            AND p.province_name = :province
            AND d.department_name = :department
          LIMIT 1`,
        NEW_DEMO_PROJECT.municipality,
      );

      const idPublicEntity = await findOne(
        queryInterface,
        'SELECT id_public_entity FROM public_entities WHERE tax_id = :taxId LIMIT 1',
        { taxId: NEW_DEMO_PROJECT.entity_tax_id },
      );

      const idAdmin = await findOne(
        queryInterface,
        `SELECT id FROM users WHERE role = 'admin' LIMIT 1`,
      );

      if (idMunicipality && idPublicEntity && idAdmin) {
        idProject35 = crypto.randomUUID();
        await queryInterface.bulkInsert('projects', [
          {
            id_project: idProject35,
            project_name: NEW_DEMO_PROJECT.project_name,
            contract_no: NEW_DEMO_PROJECT.contract_no,
            id_public_entity: idPublicEntity,
            id_municipality: idMunicipality,
            id_user: idAdmin,
            created_at: now,
            updated_at: now,
          },
        ]);
        console.log(`[seed:assignments] creado proyecto demo: ${NEW_DEMO_PROJECT.contract_no}.`);
      } else {
        console.log('[seed:assignments] no se pudo crear el proyecto demo por falta de datos maestros.');
      }
    }

    // 3. Crear las asignaciones de proyectos
    let creadas = 0;
    for (const [email, contractNo, active] of ASSIGNMENTS_CONFIG) {
      const idUser = await findOne(
        queryInterface,
        'SELECT id FROM users WHERE email = :email LIMIT 1',
        { email },
      );

      const idProject = await findOne(
        queryInterface,
        'SELECT id_project FROM projects WHERE contract_no = :contractNo LIMIT 1',
        { contractNo },
      );

      if (!idUser || !idProject) {
        console.log(`[seed:assignments] advertencia: no se encontro usuario (${email}) o proyecto (${contractNo}).`);
        continue;
      }

      const existingAssignment = await findOne(
        queryInterface,
        'SELECT id_project_assignment FROM project_assignments WHERE id_user = :idUser AND id_project = :idProject LIMIT 1',
        { idUser, idProject },
      );

      if (!existingAssignment) {
        await queryInterface.bulkInsert('project_assignments', [
          {
            id_user: idUser,
            id_project: idProject,
            assigned_at: now,
            active,
            created_at: now,
            updated_at: now,
          },
        ]);
        creadas++;
      }
    }

    console.log(`[seed:assignments] ${creadas} asignaciones registradas correctamente.`);
  },

  async down(queryInterface, Sequelize) {
    const userEmails = [
      ...ADDITIONAL_TEST_USERS.map((u) => u.email),
      'social_lead@pentaclan.com',
      'technical_lead@pentaclan.com',
    ];

    const [users] = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE email IN (:emails)',
      { replacements: { emails: userEmails } },
    );

    if (users.length > 0) {
      const userIds = users.map((u) => u.id);
      await queryInterface.bulkDelete('project_assignments', {
        id_user: { [Sequelize.Op.in]: userIds },
      });
    }

    await queryInterface.bulkDelete('projects', {
      contract_no: NEW_DEMO_PROJECT.contract_no,
    });

    await queryInterface.bulkDelete('users', {
      email: { [Sequelize.Op.in]: ADDITIONAL_TEST_USERS.map((u) => u.email) },
    });
  },
};
