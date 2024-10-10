'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

import { Season } from '../types/season';
import SelectDropdown from '@/app/ui/common/selectDropdown';
import { MemberWithSeason } from '../types/climbing';

interface SeasonContextProps {
  selectedSeason: string | null;
  members: MemberWithSeason[];
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
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [members, setMembers] = useState<MemberWithSeason[]>([]);

  // const handleSelectSeason = async (seasonId: string) => {
  //   setSelectedSeason(seasonId);
  //   try {
  //     const response = await fetch(`/api/membersBySeason?seasonId=${seasonId}`);
  //     if (!response.ok) {
  //       throw new Error('Failed to fetch members');
  //     }
  //     const membersData = await response.json();
  //     setMembers(membersData);
  //     console.log('seasonContext:', membersData);
  //   } catch (error) {
  //     console.error('Error fetching members:', error);
  //   }
  // };

  //
  const handleSelectSeason = async (seasonId: string | null) => {
    setSelectedSeason(seasonId);
    if (seasonId === null) {
      setMembers([]);
      return;
    }
    try {
      const response = await fetch(`/api/membersBySeason?seasonId=${seasonId}`);
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 404) {
          console.warn(errorData.error);
          setMembers([]);
          return;
        }
        throw new Error('Failed to fetch members');
      }
      const membersData = await response.json();
      setMembers(membersData);

      if (membersData.length === 0) {
        console.warn(`Aucun membre trouvé pour la saison sélectionnée`);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const value = {
    selectedSeason,
    members,
    setSelectedSeason,
  };

  return (
    <SeasonContext.Provider value={value}>
      <SelectDropdown
        label="Choisissez la saison"
        options={seasons}
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
