const { db } = require('@vercel/postgres');
const {
  invoices,
  customers,
  revenue,
  users,
} = require('../app/lib/placeholder-data.js');
const bcrypt = require('bcrypt');

async function createSection(client) {
  try {
    return await client.sql`
      CREATE TABLE sections (
        id SERIAL PRIMARY KEY,
        name VARCHAR
      );
    `;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}
async function createMembers(client) {
  try {
    return await client.sql`
    CREATE TABLE members (
      id SERIAL PRIMARY KEY,
      last_name VARCHAR,
      first_name VARCHAR,
      birth_date TIMESTAMP,
      email VARCHAR,
      phone_number VARCHAR,
      street VARCHAR,
      zip_code VARCHAR(5),
      city VARCHAR,
      picture VARCHAR,
      is_media_compliant BOOLEAN,
      has_paid BOOLEAN,
      legal_contact_id INTEGER REFERENCES legalContacts(id)
    );
    `;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}
async function createLegalContact(client) {
  try {
    return await client.sql`
    CREATE TABLE legalContacts (
      id SERIAL PRIMARY KEY,
      last_name VARCHAR,
      first_name VARCHAR,
      phone_number INTEGER
    );
    `;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}
async function createSeasons(client) {
  try {
    return await client.sql`
    CREATE TABLE seasons (
      id SERIAL PRIMARY KEY,
      name VARCHAR
    );
    `;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}
async function createAdmins(client) {
  try {
    return await client.sql`
    CREATE TABLE admins (
      id SERIAL PRIMARY KEY,
      last_name VARCHAR,
      first_name VARCHAR,
      email VARCHAR,
      password VARCHAR
    );
    `;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}
async function createRights(client) {
  try {
    return await client.sql`
    CREATE TABLE rights (
      id SERIAL PRIMARY KEY,
      section_name VARCHAR
    );
    `;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}
async function createPaymentTypes(client) {
  try {
    return await client.sql`
    CREATE TABLE payment_type (
      id SERIAL PRIMARY KEY,
      name VARCHAR,
      split_payment_number INTEGER
    );
    `;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}
async function createLiaisons(client) {
  try {
    return await client.sql`
      CREATE TABLE admin_right (
        admin_id INTEGER REFERENCES admins(id),
        right_id INTEGER REFERENCES rights(id)
      );

      CREATE TABLE member_section_season (
        section_id INTEGER REFERENCES sections(id),
        season_id INTEGER REFERENCES seasons(id),
        member_id INTEGER REFERENCES members(id)
      );

      CREATE TABLE season_member_payment (
        season_id INTEGER REFERENCES seasons(id),
        member_id INTEGER REFERENCES members(id),
        payment_type INTEGER REFERENCES payment_type(id)
      );
    `;
  } catch (error) {
    console.error('Error creating liaisons:', error);
    throw error;
  }
}

async function main() {
  const client = await db.connect();

  await createSection(client);
  await createLegalContact(client);
  await createMembers(client);
  await createSeasons(client);
  await createAdmins(client);
  await createRights(client);
  await createPaymentTypes(client);
  await createLiaisons(client);

  await client.end();
}

main().catch((err) => {
  console.error(
    'An error occurred while attempting to seed the database:',
    err,
  );
});
