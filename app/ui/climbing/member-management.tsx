'use client';
import AllMembersTable from './all-members-table';
import SeasonMembers from './season-members';
import { useSeasonContext } from '@/app/lib/contexts/seasonContext';
import { MemberWithSeason, Member } from '@/app/lib/types/climbing';

export default async function MembersManager({
  allMembers,
}: {
  allMembers: Member[];
}) {
  const { selectedSeason, members } = useSeasonContext();

  return (
    <>
      {selectedSeason ? (
        <SeasonMembers members={members as MemberWithSeason[]} />
      ) : (
        <AllMembersTable allMembers={allMembers} />
      )}
    </>
  );
}
