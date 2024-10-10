import DropdownContextProvider from '@/app/lib/contexts/dropdownmenuContext';
import { useSeasonContext } from '@/app/lib/contexts/seasonContext';
import { MemberWithSeason } from '@/app/lib/types/climbing';
import Table from './table';

export default function SeasonMembers({
  members,
}: {
  members: MemberWithSeason[];
}) {
  //const { members } = useSeasonContext();
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
        <p>Aucun membre existant pour la saison choisie</p>
      ) : (
        <DropdownContextProvider actions={actions} members={members}>
          <Table members={members} />
        </DropdownContextProvider>
      )}
    </div>
  );
}
