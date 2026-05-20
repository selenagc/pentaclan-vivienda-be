'use strict';

require('dotenv').config();
const bcrypt = require('bcrypt');
const crypto = require('node:crypto');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const name = process.env.ADMIN_NAME;
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!name || !email || !password) {
      throw new Error(
        'Admin seeder requires ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD environment variables',
      );
    }

    const [existing] = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE email = :email LIMIT 1',
      { replacements: { email } },
    );

    if (existing.length > 0) {
      console.log(`[seed:admin] User with email ${email} already exists, skipping.`);
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date();

    await queryInterface.bulkInsert('users', [
      {
        id: crypto.randomUUID(),
        name,
        email,
        password_hash: passwordHash,
        role: 'admin',
        created_at: now,
        updated_at: now,
      },
    ]);

    console.log(`[seed:admin] Admin user created: ${email}`);
  },

  async down(queryInterface) {
    const email = process.env.ADMIN_EMAIL;
    if (!email) return;
    await queryInterface.bulkDelete('users', { email });
  },
};
