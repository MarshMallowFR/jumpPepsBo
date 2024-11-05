import DropdownContextProvider from '@/app/lib/contexts/dropdownmenuContext';
import { useSeasonContext } from '@/app/lib/contexts/seasonContext';
import { MemberWithSeason } from '@/app/lib/types/climbing';
import SeasonTable from './season-table';
import NotFoundMessage from '../common/notFoundMessage';

export default function SeasonMembers({
  members,
  seasonId,
}: {
  members: MemberWithSeason[];
  seasonId: string;
}) {
  const actions = [
    {
      label: 'Exporter au format Excel',
      value: 'export',
      action: 'export-excel',
    },
    {
      label: 'Suppression multiple',
      value: 'delete',
      action: 'delete-many',
    },
  ];

  return (
    <div>
      {members.length === 0 ? (
        <NotFoundMessage message="Aucun membre existant pour cette saison" />
      ) : (
        <DropdownContextProvider actions={actions} members={members}>
          <SeasonTable members={members} seasonId={seasonId} />
        </DropdownContextProvider>
      )}
    </div>
  );
}
