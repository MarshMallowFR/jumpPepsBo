import { sql } from '@vercel/postgres';

export async function getSectionIdByName(name: string) {
  try {
    const sectionId = await sql`SELECT id FROM sections WHERE name = ${name};`;
    return sectionId;
  } catch (error) {
    console.error('Error retrieving the sectionId:', error);
  }
}

export async function getSeasonIdByName(name: string) {
  try {
    const seasonId = await sql`SELECT id FROM seasons WHERE name = ${name};`;
    return seasonId;
  } catch (error) {
    console.error('Error retrieving the season:', error);
  }
}
