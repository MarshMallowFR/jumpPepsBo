'use client';
import { useState, useEffect } from 'react';
import AllMembers from './all-members';
import SeasonMembers from './season-members';
import { useSeasonContext } from '@/app/lib/contexts/seasonContext';
import { MemberWithSeason, Member } from '@/app/lib/types/climbing';

export default function MembersManager({
  allMembers,
}: {
  allMembers: Member[];
}) {
  const { selectedSeason } = useSeasonContext();
  const [members, setMembers] = useState<MemberWithSeason[]>([]);

  useEffect(() => {
    const fetchMembersBySeason = async () => {
      if (selectedSeason === 'all') {
        // convert allMembers to type MemberWithSeason[]
        const allMembersWithSeason: MemberWithSeason[] = allMembers.map(
          (member) => ({
            ...member,
            license: '',
            licenseType: '',
            insurance: '',
            supplementalInsurance: '',
            assaultProtectionOption: false,
            skiOption: false,
            slacklineOption: false,
            trailRunningOption: false,
            mountainBikingOption: false,
            isMediaCompliant: false,
            hasPaid: false,
          }),
        );

        setMembers(allMembersWithSeason);
      } else if (selectedSeason) {
        try {
          const response = await fetch(
            `/api/membersBySeason?seasonId=${selectedSeason}`,
          );
          if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 404) {
              console.warn(errorData.error);
              setMembers([]);
              return;
            }
            throw new Error('Failed to fetch members');
          }
          const membersData: MemberWithSeason[] = await response.json();
          setMembers(membersData);

          if (membersData.length === 0) {
            console.warn(`Aucun membre trouvé pour la saison sélectionnée`);
          }
        } catch (error) {
          console.error('Error fetching members:', error);
        }
      }
    };

    fetchMembersBySeason();
  }, [selectedSeason, allMembers]);

  return (
    <>
      {selectedSeason === 'all' ? (
        <AllMembers allMembers={members} />
      ) : (
        selectedSeason && (
          <SeasonMembers members={members} seasonId={selectedSeason} />
        )
      )}
    </>
  );
}
