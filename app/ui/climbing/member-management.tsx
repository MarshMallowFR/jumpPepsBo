'use client';
import { useEffect } from 'react';
import SeasonMembers from './season-members';
import { useSeasonContext } from '@/app/lib/contexts/seasonContext';
import { MemberList, SeasonMemberList } from '@/app/lib/types/climbing';
import AllMembersTable from './all-members-table';
import { useSearchParams } from 'next/navigation';

export default function MembersManager({
  allMembers,
}: {
  allMembers: MemberList[] | SeasonMemberList[];
}) {
  const searchParams = useSearchParams();
  const seasonId = searchParams.get('seasonId');

  const { selectedSeason, setSelectedSeason } = useSeasonContext();

  useEffect(() => {
    if (seasonId) {
      setSelectedSeason(seasonId);
    }
  }, []);

  return (
    <>
      {selectedSeason === 'all' ? (
        <AllMembersTable members={allMembers} />
      ) : (
        <SeasonMembers members={allMembers as SeasonMemberList[]} />
      )}
    </>
  );
}
