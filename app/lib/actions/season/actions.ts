'use server';

import { sql } from '@vercel/postgres';
import { randomUUID } from 'crypto';
import { Season } from '../../types/season';

export async function createNewSeason(): Promise<void> {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const nextYear = currentYear + 1;

  const seasonName = `${currentYear}-${nextYear}`;

  // registrations should be open between June to November
  const registrationOpen =
    currentDate.getMonth() >= 5 && currentDate.getMonth() <= 10;

  try {
    const existingSeason = await sql`
      SELECT id FROM seasons WHERE name = ${seasonName}
    `;
    if (existingSeason.rows.length > 0) {
      return;
    }

    const seasonId = randomUUID();
    await sql`
      INSERT INTO seasons (id, name, registration_open)
      VALUES (${seasonId}, ${seasonName}, ${registrationOpen})
    `;
  } catch (error) {
    throw new Error('Erreur lors de la création de la saison.');
  }
}

export async function getSeasons(): Promise<{
  seasons: Season[];
  currentSeason: Season | undefined;
}> {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();

    const selectSeasonQuery = `SELECT * FROM seasons ORDER BY name ASC`;
    const result = await sql.query(selectSeasonQuery);

    const seasons: Season[] = result.rows.map(
      ({ id, name, registration_open }) => ({
        id,
        name,
        registrationOpen: registration_open,
      }),
    );

    // registrations should be open between June to November
    const shouldBeOpen = currentMonth >= 5 && currentMonth <= 10;

    // Update registration_open status if needed
    for (const season of seasons) {
      const [startYear, endYear] = season.name.split('-');
      const startDate = new Date(`${startYear}-09-01`);
      const endDate = new Date(`${endYear}-07-30`);

      const isCurrentSeason =
        currentDate >= startDate && currentDate <= endDate;
      if (isCurrentSeason && season.registrationOpen !== shouldBeOpen) {
        await sql`
          UPDATE seasons
          SET registration_open = ${shouldBeOpen}
          WHERE id = ${season.id}
        `;
        // Reflect the change locally in the seasons array
        season.registrationOpen = shouldBeOpen;
      }
    }

    const currentSeason = seasons.find((season) => {
      const [startYear, endYear] = season.name.split('-');
      const startDate = new Date(`${startYear}-09-01`);
      const endDate = new Date(`${endYear}-07-30`);
      return currentDate >= startDate && currentDate <= endDate;
    });

    return { seasons, currentSeason };
  } catch (error) {
    throw new Error('Erreur lors de la récupération des saisons.');
  }
}
