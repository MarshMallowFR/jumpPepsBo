'use client';
import { useEffect, useState } from 'react';
import SeasonMembers from './season-members';
import { useSeasonContext } from '@/app/lib/contexts/seasonContext';
import { MemberList, SeasonMemberList } from '@/app/lib/types/climbing';
import AllMembersTable from './all-members-table';
import { useSearchParams } from 'next/navigation';
import DeleteMembers from './delete-members';

export default function MembersManager({
  allMembers,
}: {
  allMembers: MemberList[] | SeasonMemberList[];
}) {
  const searchParams = useSearchParams();
  const seasonId = searchParams.get('seasonId');

  const { selectedSeason, setSelectedSeason } = useSeasonContext();
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]); // A faire autrement, plus propre avec un context??

  useEffect(() => {
    if (seasonId) {
      setSelectedSeason(seasonId);
    }
  }, []);

  const handleSelectionChange = (ids: string[]) => {
    setSelectedMemberIds(ids);
  };

  return (
    <>
      {selectedSeason === 'all' ? (
        <>
          <DeleteMembers ids={selectedMemberIds} />
          <AllMembersTable
            members={allMembers}
            onSelectionChange={handleSelectionChange}
          />
        </>
      ) : (
        <SeasonMembers members={allMembers as SeasonMemberList[]} />
      )}
    </>
  );
}
