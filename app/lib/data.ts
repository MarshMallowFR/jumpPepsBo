import { sql } from '@vercel/postgres';
import { unstable_noStore as noStore } from 'next/cache';

import {
  MemberWithContactsAndSeasonBD,
  MemberList,
  MemberDB,
  SeasonMemberList,
} from './types/climbing';
import { Section } from './types/section';
import { AdminDB } from './types/admins';

const ITEMS_PER_PAGE = 15;

export async function getSectionIdByName(name: string, row?: any) {
  try {
    if (row) {
      return row.id;
    }
    const sectionId = await sql`SELECT id FROM sections WHERE name = ${name};`;
    return sectionId.rows[0]?.id;
  } catch (error) {
    console.error('Error retrieving the sectionId:', error);
  }
}

export async function getSeasonIdByName(name: string, row?: any) {
  try {
    if (row) {
      return row.id;
    }
    const seasonId = await sql`SELECT id FROM seasons WHERE name = ${name};`;
    return seasonId.rows[0]?.id;
  } catch (error) {
    console.error('Error retrieving the season:', error);
  }
}

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
    throw new Error('Failed to fetch all sections.');
  }
}

export async function fetchClimbPages() {
  noStore();
  try {
    const sectionRow = await getSectionIdByName('climbing');
    const count = await sql`SELECT COUNT(member_id) AS total_members
    FROM member_section_season
    WHERE section_id = ${sectionRow};
  `;
    const totalMembers = parseInt(count.rows[0]?.total_members, 10) || 0;
    const totalPages = Math.ceil(totalMembers / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    throw new Error('Failed to fetch members');
  }
}

export async function fetchAllClimbingMembers(
  query: string,
  currentPage: number,
): Promise<MemberList[]> {
  noStore();

  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const members = await sql<MemberDB>`
      SELECT id, picture, last_name, first_name, email
      FROM members
      WHERE
        members.first_name ILIKE ${`%${query}%`} OR
        members.last_name ILIKE ${`%${query}%`}
      ORDER BY members.last_name ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return members.rows.map((member) => ({
      id: member.id,
      picture: member.picture,
      lastName: member.last_name,
      firstName: member.first_name,
      email: member.email,
    }));
  } catch (error) {
    throw new Error(`Failed to fetch members. ${error}`);
  }
}

export async function fetchMembersBySeasonId(
  seasonId: string,
): Promise<SeasonMemberList[]> {
  try {
    const members = await sql<MemberWithContactsAndSeasonBD>`
      SELECT 
        members.id,
        members.picture,
        members.last_name,
        members.first_name,
        members.email,
        mss.has_paid 
      FROM members
      JOIN member_section_season mss ON mss.member_id = members.id
      WHERE mss.season_id = ${seasonId}
    `;

    return members.rows.map((member) => ({
      id: member.id,
      picture: member.picture,
      lastName: member.last_name,
      firstName: member.first_name,
      email: member.email,
      hasPaid: member.has_paid,
    }));
  } catch (error) {
    throw new Error(
      `Failed to fetch members for the given season. Details: ${error}`,
    );
  }
}

export async function fetchMemberByIdAndSeasonId(
  memberId: string,
  seasonId: string,
) {
  try {
    const result = await sql<MemberWithContactsAndSeasonBD>`
      SELECT
        m.id,
        m.picture,
        m.last_name,
        m.first_name,
        m.birth_date,
        m.gender,
        m.nationality,
        m.street,
        m.additional_address_information,
        m.zip_code,
        m.city,
        m.country,
        m.email,
        m.phone_number,
        m.phone_number2,
        m.birth_town,
        m.birth_departement,
        c1.id AS first_contact_id,
        c1.link AS contact_link,
        c1.first_name AS contact_first_name,
        c1.last_name AS contact_last_name,
        c1.phone_number AS contact_phone_number,
        c1.email AS contact_email,
        mc.second_contact_id,
        c2.link AS contact2_link,
        c2.first_name AS contact2_first_name,
        c2.last_name AS contact2_last_name,
        c2.phone_number AS contact2_phone_number,
        c2.email AS contact2_email,
        mss.license,
        mss.license_type,
        mss.insurance,
        mss.supplemental_insurance,
        mss.assault_protection_option,
        mss.ski_option,
        mss.slackline_option,
        mss.trail_running_option,
        mss.mountain_biking_option,
        mss.is_media_compliant,
        mss.has_paid
      FROM members m
      LEFT JOIN member_contact mc ON m.id = mc.member_id
      LEFT JOIN contacts c1 ON mc.first_contact_id = c1.id
      LEFT JOIN contacts c2 ON mc.second_contact_id = c2.id
      LEFT JOIN member_section_season mss 
        ON m.id = mss.member_id 
        AND mss.season_id = ${seasonId}
      WHERE m.id = ${memberId}
    `;
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    const member = {
      id: row.id,
      picture: row.picture,
      lastName: row.last_name,
      firstName: row.first_name,
      birthDate: row.birth_date,
      gender: row.gender,
      nationality: row.nationality,
      street: row.street,
      additionalAddressInformation: row.additional_address_information,
      zipCode: row.zip_code,
      city: row.city,
      country: row.country,
      email: row.email,
      phoneNumber: row.phone_number,
      phoneNumber2: row.phone_number2,
      birthTown: row.birth_town,
      birthDepartement: row.birth_departement,
      contactId: row.first_contact_id,
      contactLink: row.contact_link,
      contactLastName: row.contact_last_name,
      contactFirstName: row.contact_first_name,
      contactPhoneNumber: row.contact_phone_number,
      contactEmail: row.contact_email,
      contact2Id: row.second_contact_id,
      contact2Link: row.contact2_link,
      contact2FirstName: row.contact2_first_name,
      contact2LastName: row.contact2_last_name,
      contact2PhoneNumber: row.contact2_phone_number,
      contact2Email: row.contact2_email,
      license: row.license,
      licenseType: row.license_type,
      insurance: row.insurance,
      supplementalInsurance: row.supplemental_insurance,
      assaultProtectionOption: row.assault_protection_option,
      skiOption: row.ski_option,
      slacklineOption: row.slackline_option,
      trailRunningOption: row.trail_running_option,
      mountainBikingOption: row.mountain_biking_option,
      isMediaCompliant: row.is_media_compliant,
      hasPaid: row.has_paid,
    };
    return member;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(
      `Failed to fetch member by ID and Season ID: ${memberId}. Details: ${error}`,
    );
  }
}

export async function fetchAdminsPages() {
  noStore();
  try {
    const count = await sql`SELECT COUNT(id) AS total_admins FROM admins`;

    const totalAdmins = parseInt(count.rows[0]?.total_admins, 10) || 0;
    const totalPages = Math.ceil(totalAdmins / ITEMS_PER_PAGE);

    return totalPages;
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
