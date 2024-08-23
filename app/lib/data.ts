import { sql } from '@vercel/postgres';
import { unstable_noStore as noStore } from 'next/cache';

import { MemberDB, LegalContactDB, Member } from './types/climbing';
import { Section } from './types/section';
import { AdminDB } from './types/admins';

const ITEMS_PER_PAGE = 6;

export async function fetchSections() {
  noStore();

  try {
    const data = await sql<Section>`
      SELECT
        id,
        name
      FROM sections
      ORDER BY name ASC
    `;

    const sections = data.rows.map((section) => ({
      ...section,
      href: `/dashboard/${section.name}`,
    }));
    return sections;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all sections.');
  }
}

export async function fetchClimbPages() {
  noStore();
  try {
    const { rows } = await sql`SELECT id FROM sections WHERE name = 'climbing'`;
    console.log(rows);
    const count = await sql`SELECT COUNT(member_id) AS total_members
    FROM member_section_season
    WHERE season_id = '40c21821-8d67-4f3e-a8a4-e005a4e8078e' AND section_id = ${rows[0].id};
  `;

    return Math.ceil(Number(count.rowCount) / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch members');
  }
}

export async function fetchFilteredClimbingMembers(
  query: string,
  currentPage: number,
) {
  noStore();

  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const members = await sql<MemberDB>`
      SELECT
        *
      FROM members
      WHERE
        members.first_name ILIKE ${`%${query}%`} OR
        members.last_name ILIKE ${`%${query}%`}
      ORDER BY members.last_name ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return members.rows.map((member) => ({
      id: member.id,
      firstName: member.first_name,
      lastName: member.last_name,
      birthDate: member.birth_date,
      email: member.email,
      phoneNumber: member.phone_number,
      street: member.street,
      zipCode: member.zip_code,
      city: member.city,
      picture: member.picture,
      isMediaCompliant: member.is_media_compliant,
      hasPaid: member.has_paid,
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch members.');
  }
}

export async function fetchClimbingMemberById(id: string) {
  noStore();

  try {
    const { rows } = await sql<MemberDB>`
      SELECT
        *
      FROM members
      WHERE members.id = ${id};
    `;

    let legalContact: LegalContactDB | undefined = undefined;

    if (rows[0].legal_contact_id) {
      const dataLegalContact = await sql<LegalContactDB>`
        SELECT
          *
        FROM legal_contacts
        WHERE legal_contacts.id = ${rows[0].legal_contact_id};
      `;

      legalContact = dataLegalContact.rows[0];
    }

    return rows.map((member) => ({
      id: member.id,
      firstName: member.first_name,
      lastName: member.last_name,
      birthDate: member.birth_date,
      email: member.email,
      phoneNumber: member.phone_number,
      street: member.street,
      zipCode: member.zip_code,
      city: member.city,
      picture: member.picture,
      isMediaCompliant: member.is_media_compliant,
      hasPaid: member.has_paid,
      legalContactId: member.legal_contact_id,
      legalContactFirstName: legalContact?.first_name,
      legalContactLastName: legalContact?.last_name,
      legalContactPhoneNumber: legalContact?.phone_number,
    }))[0];
  } catch (error) {
    console.error('Database Error:', error);
  }
}

export async function fetchAdminsPages() {
  noStore();
  try {
    const count = await sql`SELECT COUNT(id) FROM admins`;
    console.log(count);

    return Math.ceil(Number(count.rowCount) / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch members');
  }
}

export async function fetchFilteredAdmins(query: string, currentPage: number) {
  noStore();

  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const admins = await sql<AdminDB>`
      SELECT
        *
      FROM admins
      WHERE
        admins.first_name ILIKE ${`%${query}%`} OR
        admins.last_name ILIKE ${`%${query}%`}
      ORDER BY admins.last_name ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return admins.rows.map((admin) => ({
      id: admin.id,
      firstName: admin.first_name,
      lastName: admin.last_name,
      email: admin.email,
      validated: admin.validated,
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch members.');
  }
}

export async function fetchAdminById(id: string) {
  noStore();

  try {
    const { rows } = await sql<AdminDB>`
      SELECT
        *
      FROM admins
      WHERE admins.id = ${id};
    `;

    console.log({ rows });

    return rows.map((admin) => ({
      id: admin.id,
      firstName: admin.first_name,
      lastName: admin.last_name,
      email: admin.email,
      validated: admin.validated,
    }))[0];
  } catch (error) {
    console.error('Database Error:', error);
  }
}
