import { sql } from '@vercel/postgres';
import { unstable_noStore as noStore } from 'next/cache';

import {
  MemberDB,
  MemberWithSeason,
  MemberSeasonDB,
  MemberWithContactsDB,
  MemberWithContactsAndSeasonBD,
} from './types/climbing';
import { SeasonDB } from './types/season';
import { Section } from './types/section';
import { AdminDB } from './types/admins';

const ITEMS_PER_PAGE = 6;

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
    console.error('Database Error:', err);
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

    return Math.ceil(Number(count.rowCount) / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch members');
  }
}

export async function fetchAllSeasons() {
  try {
    const seasons = await sql<SeasonDB>`
      SELECT * FROM seasons
      ORDER BY start_date ASC;  
    `;

    return seasons.rows.map((season) => ({
      id: season.id,
      name: season.name,
      startDate: season.start_date,
      endDate: season.end_date,
      registrationOpen: season.registration_open,
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch seasons');
  }
}
// export async function fetchAllClimbingMembers(
//   query: string,
//   currentPage: number,
// ) {
//   noStore();

//   const offset = (currentPage - 1) * ITEMS_PER_PAGE;

//   try {
//     const members = await sql<MemberDB>`
//       SELECT
//         members.*
//       FROM members
//       WHERE
//         members.first_name ILIKE ${`%${query}%`} OR
//         members.last_name ILIKE ${`%${query}%`}
//       ORDER BY members.last_name ASC
//       LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
//     `;

//     return members.rows.map((member) => ({
//       id: member.id,
//       picture: member.picture,
//       lastName: member.last_name,
//       firstName: member.first_name,
//       birthDate: member.birth_date,
//       gender: member.gender,
//       nationality: member.nationality,
//       street: member.street,
//       additionalAddressInformation: member.additional_address_information,
//       zipCode: member.zip_code,
//       city: member.city,
//       country: member.country,
//       email: member.email,
//       phoneNumber: member.phone_number,
//       phoneNumber2: member.phone_number2,
//       birthTown: member.birth_town,
//       birthDepartement: member.birth_departement,
//     }));
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch members.');
//   }
// }

export async function fetchAllClimbingMembers(
  query: string,
  currentPage: number,
) {
  noStore();

  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const members = await sql<MemberWithContactsDB>`
      SELECT
        members.*,
        mc.first_contact_id,
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
        c2.email AS contact2_email
      FROM members
      LEFT JOIN member_contact mc ON mc.member_id = members.id
      LEFT JOIN contacts c1 ON mc.first_contact_id = c1.id  
      LEFT JOIN contacts c2 ON mc.second_contact_id = c2.id 
      WHERE
        members.first_name ILIKE ${`%${query}%`} OR
        members.last_name ILIKE ${`%${query}%`}
      ORDER BY members.last_name ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    if (members.rows.length === 0) {
      throw new Error(`No members found`);
    }

    return members.rows.map((row) => {
      const {
        id,
        picture,
        last_name,
        first_name,
        birth_date,
        gender,
        nationality,
        street,
        additional_address_information,
        zip_code,
        city,
        country,
        email,
        phone_number,
        phone_number2,
        birth_town,
        birth_departement,
        first_contact_id,
        contact_link,
        contact_first_name,
        contact_last_name,
        contact_phone_number,
        contact_email,
        second_contact_id,
        contact2_link,
        contact2_first_name,
        contact2_last_name,
        contact2_phone_number,
        contact2_email,
      } = row;

      return {
        id,
        picture,
        lastName: last_name,
        firstName: first_name,
        birthDate: birth_date,
        gender,
        nationality,
        street,
        additionalAddressInformation: additional_address_information,
        zipCode: zip_code,
        city,
        country,
        email,
        phoneNumber: phone_number,
        phoneNumber2: phone_number2,
        birthTown: birth_town,
        birthDepartement: birth_departement,
        // Contact Information
        contactId: first_contact_id,
        contactLink: contact_link,
        contactLastName: contact_last_name,
        contactFirstName: contact_first_name,
        contactPhoneNumber: contact_phone_number,
        contactEmail: contact_email,
        contact2Id: second_contact_id ?? undefined,
        contact2Link: contact2_link ?? undefined,
        contact2FirstName: contact2_first_name ?? undefined,
        contact2LastName: contact2_last_name ?? undefined,
        contact2PhoneNumber: contact2_phone_number ?? undefined,
        contact2Email: contact2_email ?? undefined,
      };
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch members. ${error}`);
  }
}

export async function fetchMembersWithContactsBySeason(seasonId: string) {
  try {
    const members = await sql<MemberWithContactsAndSeasonBD>`
      SELECT
        members.id,
        members.picture,
        members.last_name,
        members.first_name,
        members.birth_date,
        members.gender,
        members.nationality,
        members.street,
        members.additional_address_information,
        members.zip_code,
        members.city,
        members.country,
        members.email,
        members.phone_number,
        members.phone_number2,
        members.birth_town,
        members.birth_departement,
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
        mss.has_paid,
        mc.first_contact_id,
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
        c2.email AS contact2_email
      FROM members
      JOIN member_section_season mss ON mss.member_id = members.id
      LEFT JOIN member_contact mc ON members.id = mc.member_id
      LEFT JOIN contacts c1 ON mc.first_contact_id = c1.id
      LEFT JOIN contacts c2 ON mc.second_contact_id = c2.id
      WHERE mss.season_id = ${seasonId}
    `;

    return members.rows.map((row) => {
      const {
        id,
        picture,
        last_name,
        first_name,
        birth_date,
        gender,
        nationality,
        street,
        additional_address_information,
        zip_code,
        city,
        country,
        email,
        phone_number,
        phone_number2,
        birth_town,
        birth_departement,
        license,
        license_type,
        insurance,
        supplemental_insurance,
        assault_protection_option,
        ski_option,
        slackline_option,
        trail_running_option,
        mountain_biking_option,
        is_media_compliant,
        has_paid,
        first_contact_id,
        contact_link,
        contact_first_name,
        contact_last_name,
        contact_phone_number,
        contact_email,
        second_contact_id,
        contact2_link,
        contact2_first_name,
        contact2_last_name,
        contact2_phone_number,
        contact2_email,
      } = row;

      return {
        id,
        picture,
        lastName: last_name,
        firstName: first_name,
        birthDate: birth_date,
        gender,
        nationality,
        street,
        additionalAddressInformation: additional_address_information,
        zipCode: zip_code,
        city,
        country,
        email,
        phoneNumber: phone_number,
        phoneNumber2: phone_number2,
        birthTown: birth_town,
        birthDepartement: birth_departement,
        // About season
        license,
        licenseType: license_type,
        insurance,
        supplementalInsurance: supplemental_insurance,
        assaultProtectionOption: assault_protection_option,
        skiOption: ski_option,
        slacklineOption: slackline_option,
        trailRunningOption: trail_running_option,
        mountainBikingOption: mountain_biking_option,
        isMediaCompliant: is_media_compliant,
        hasPaid: has_paid,
        // Contact Information
        contactId: first_contact_id,
        contactLink: contact_link,
        contactLastName: contact_last_name,
        contactFirstName: contact_first_name,
        contactPhoneNumber: contact_phone_number,
        contactEmail: contact_email,
        contact2Id: second_contact_id,
        contact2Link: contact2_link,
        contact2FirstName: contact2_first_name,
        contact2LastName: contact2_last_name,
        contact2PhoneNumber: contact2_phone_number,
        contact2Email: contact2_email,
      };
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(
      `Failed to fetch members for the given season. Details: ${error}`,
    );
  }
}

export async function fetchMembersBySeason(seasonId: string) {
  try {
    const members = await sql<MemberSeasonDB>`
      SELECT
        members.id,
        members.picture,
        members.last_name,
        members.first_name,
        members.birth_date,
        members.gender,
        members.nationality,
        members.street,
        members.additional_address_information,
        members.zip_code,
        members.city,
        members.country,
        members.email,
        members.phone_number,
        members.phone_number2,
        members.birth_town,
        members.birth_departement,
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
      FROM members
      JOIN member_section_season mss ON mss.member_id = members.id
      WHERE mss.season_id = ${seasonId}
    `;

    if (members.rows.length === 0) {
      throw new Error(`No members found for season ID: ${seasonId}`);
    }

    return members.rows.map((row) => {
      const {
        id,
        picture,
        last_name,
        first_name,
        birth_date,
        gender,
        nationality,
        street,
        additional_address_information,
        zip_code,
        city,
        country,
        email,
        phone_number,
        phone_number2,
        birth_town,
        birth_departement,
        license,
        license_type,
        insurance,
        supplemental_insurance,
        assault_protection_option,
        ski_option,
        slackline_option,
        trail_running_option,
        mountain_biking_option,
        is_media_compliant,
        has_paid,
      } = row;

      return {
        id,
        picture,
        lastName: last_name,
        firstName: first_name,
        birthDate: birth_date,
        gender,
        nationality,
        street,
        additionalAddressInformation: additional_address_information,
        zipCode: zip_code,
        city,
        country,
        email,
        phoneNumber: phone_number,
        phoneNumber2: phone_number2,
        birthTown: birth_town,
        birthDepartement: birth_departement,
        // About season
        license,
        licenseType: license_type,
        insurance,
        supplementalInsurance: supplemental_insurance,
        assaultProtectionOption: assault_protection_option,
        skiOption: ski_option,
        slacklineOption: slackline_option,
        trailRunningOption: trail_running_option,
        mountainBikingOption: mountain_biking_option,
        isMediaCompliant: is_media_compliant,
        hasPaid: has_paid,
      };
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(
      `Failed to fetch members for the given season. Details: ${error}`,
    );
  }
}
//0278ebd1-d7bc-4098-ab3a-2c359a028603 // Paloma
//0fe72af5-f2db-4565-b750-e4a7371728d0 // Charlie
// 849a1c71-5ebe-46b4-8b89-e1ee22cface2 // Este (avec les 2 contact bien enregistrés dans la table)
export async function fetchMemberById(memberId: string) {
  try {
    const result = await sql<MemberWithContactsDB>`
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
        c2.link AS contact_link,
        c2.first_name AS contact2_first_name,
        c2.last_name AS contact2_last_name,
        c2.phone_number AS contact2_phone_number,
        c2.email AS contact2_email
      FROM members m
      LEFT JOIN member_contact mc ON m.id = mc.member_id
      LEFT JOIN contacts c1 ON mc.first_contact_id = c1.id
      LEFT JOIN contacts c2 ON mc.second_contact_id = c2.id
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
    };

    return member;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(
      `Failed to fetch member by ID: ${memberId}. Details: ${error}`,
    );
  }
}

export async function fetchAdminsPages() {
  noStore();
  try {
    const count = await sql`SELECT COUNT(id) FROM admins`;

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
