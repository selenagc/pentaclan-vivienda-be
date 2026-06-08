'use strict';

require('dotenv').config();
const bcrypt = require('bcrypt');
const crypto = require('node:crypto');

/**
 * Usuarios de prueba (uno por cada rol no-admin de PV-10), para probar
 * login/me con cada rol. SOLO desarrollo: comparten una contrasena debil,
 * por eso se omite en produccion.
 *
 * Contrasena: SEED_TEST_PASSWORD (env) o 'Test1234!' por defecto.
 * Idempotente: salta los usuarios que ya existan (por email).
 *
 * @type {import('sequelize-cli').Migration}
 */
const TEST_USERS = [
  { name: 'Social Lead', email: 'social_lead@pentaclan.com', role: 'social_lead' },
  { name: 'Technical Lead', email: 'technical_lead@pentaclan.com', role: 'technical_lead' },
  { name: 'Project Supervisor', email: 'project_supervisor@pentaclan.com', role: 'project_supervisor' },
];

module.exports = {
  async up(queryInterface) {
    if (process.env.NODE_ENV === 'production') {
      console.log('[seed:test-users] NODE_ENV=production, se omiten los usuarios de prueba.');
      return;
    }

    const password = process.env.SEED_TEST_PASSWORD || 'Test1234!';
    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date();

    for (const user of TEST_USERS) {
      const [existing] = await queryInterface.sequelize.query(
        'SELECT id FROM users WHERE email = :email LIMIT 1',
        { replacements: { email: user.email } },
      );

      if (existing.length > 0) {
        console.log(`[seed:test-users] ${user.email} ya existe, se omite.`);
        continue;
      }

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

      console.log(`[seed:test-users] creado ${user.email} (${user.role}).`);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: { [Sequelize.Op.in]: TEST_USERS.map((u) => u.email) },
    });
  },
};
