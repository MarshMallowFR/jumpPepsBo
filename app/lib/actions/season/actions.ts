// Interface Season
export interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  registrationOpen: boolean;
}

// Simuler une base de données des saisons existantes
const seasons: Season[] = [
  // Exemples de saisons déjà existantes
  {
    id: '1',
    name: '2022-2023',
    startDate: new Date('2022-09-01').toISOString(),
    endDate: new Date('2023-06-30').toISOString(),
    registrationOpen: false,
  },
  {
    id: '2',
    name: '2023-2024',
    startDate: new Date('2023-09-01').toISOString(),
    endDate: new Date('2024-06-30').toISOString(),
    registrationOpen: true,
  },
];

/**
 * Crée une nouvelle saison si elle n'existe pas déjà.
 * @returns {Season | null} - La saison nouvellement créée ou null si elle existe déjà.
 */
function createSeasonIfNotExists(): Season | null {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const nextYear = currentYear + 1;

  // Le nom de la nouvelle saison doit être au format "année courante - année suivante"
  const seasonName = `${currentYear}-${nextYear}`;

  // Vérifier si une saison avec ce nom existe déjà
  const existingSeason = seasons.find((season) => season.name === seasonName);
  if (existingSeason) {
    console.log(`Une saison avec le nom ${seasonName} existe déjà.`);
    return null;
  }

  // Dates de la saison : de septembre année courante à juin année suivante
  const startDate = new Date(`${currentYear}-09-01`);
  const endDate = new Date(`${nextYear}-06-30`);

  // Vérifier si les inscriptions sont ouvertes (de juin à novembre de l'année courante)
  const registrationOpen =
    currentDate.getMonth() >= 5 && currentDate.getMonth() <= 10; // 5 = Juin, 10 = Novembre

  const newSeason: Season = {
    id: generateUniqueId(),
    name: seasonName,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    registrationOpen: registrationOpen,
  };

  // Ajouter la saison à la base de données (simulée)
  seasons.push(newSeason);

  console.log('Nouvelle saison créée :', newSeason);
  return newSeason;
}

/**
 * Génère un ID unique pour la saison.
 * @returns {string} - Un ID unique.
 */
function generateUniqueId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Simulation d'une connexion
const newSeason = createSeasonIfNotExists();

if (newSeason) {
  console.log(`Saison créée avec succès : ${newSeason.name}`);
} else {
  console.log('Aucune nouvelle saison créée.');
}
