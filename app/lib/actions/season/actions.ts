'use server';

import { sql } from '@vercel/postgres';
import { randomUUID } from 'crypto';
import { Season } from '../../types/season';

// Official season runs from september to july.
// Current season runs from may to may
// registration_open (for members) goes from june to november

async function createNewSeason(): Promise<void> {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const nextYear = currentYear + 1;

  const seasonName = `${currentYear}-${nextYear}`;

  const registrationOpen =
    currentDate.getMonth() >= 5 && currentDate.getMonth() <= 10; // registration_open (June → November)

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

    const selectSeasonQuery = `SELECT * FROM seasons ORDER BY name ASC`;
    const result = await sql.query(selectSeasonQuery);

    const seasons: Season[] = result.rows.map(
      ({ id, name, registration_open }) => ({
        id,
        name,
        registrationOpen: registration_open,
      }),
    );

    const currentSeason = seasons.find((season) => {
      const [startYear, endYear] = season.name.split('-');
      const startDate = new Date(`${startYear}-05-01`); // current season from may to may
      const endDate = new Date(`${endYear}-04-30`);

      return currentDate >= startDate && currentDate <= endDate;
    });

    if (!currentSeason) {
      // create next/new season only from may to may to avoid mistake.
      await createNewSeason();
      return await getSeasons();
    }

    const currentMonth = currentDate.getMonth();
    const shouldBeOpen = currentMonth >= 5 && currentMonth <= 10; // registration between june to november

    for (const season of seasons) {
      const [startYear, endYear] = season.name.split('-');
      const startDate = new Date(`${startYear}-09-01`); // official season from september to july
      const endDate = new Date(`${endYear}-07-30`);

      const isCurrentSeason =
        currentDate >= startDate && currentDate <= endDate;
      if (isCurrentSeason && season.registrationOpen !== shouldBeOpen) {
        await sql`
          UPDATE seasons
          SET registration_open = ${shouldBeOpen}
          WHERE id = ${season.id}
        `;
        season.registrationOpen = shouldBeOpen;
      }
    }

    return { seasons, currentSeason };
  } catch (error) {
    throw new Error('Erreur lors de la récupération des saisons.');
  }
}
