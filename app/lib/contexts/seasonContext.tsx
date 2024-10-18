'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Season } from '../types/season';
import SelectDropdown from '@/app/ui/common/selectDropdown';

interface SeasonContextProps {
  selectedSeason: string | null;
  setSelectedSeason: (seasonId: string | null) => void;
}

const SeasonContext = createContext<SeasonContextProps | undefined>(undefined);

const SeasonContextProvider = ({
  seasons,
  children,
}: {
  seasons: Season[];
  children: ReactNode;
}) => {
  const [selectedSeason, setSelectedSeason] = useState<string | null>('all');

  const handleSelectSeason = (seasonId: string | null) => {
    setSelectedSeason(seasonId);
  };

  const options = [
    { id: 'all', name: 'Voir tous les membres' },
    ...seasons.map((season) => ({ id: season.id, name: season.name })),
  ];

  const value = {
    selectedSeason,
    setSelectedSeason,
  };

  return (
    <SeasonContext.Provider value={value}>
      <SelectDropdown
        label="Choisissez la saison"
        options={options}
        onSelect={handleSelectSeason}
      />
      {children}
    </SeasonContext.Provider>
  );
};

export const useSeasonContext = () => {
  const value = useContext(SeasonContext);
  if (!value) {
    throw new Error(
      'useSeasonContext must be used within a SeasonContextProvider',
    );
  }
  return value;
};

export default SeasonContextProvider;
