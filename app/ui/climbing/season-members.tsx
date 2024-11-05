import DropdownContextProvider from '@/app/lib/contexts/dropdownmenuContext';
import { SeasonMemberList } from '@/app/lib/types/climbing';
import SeasonTable from './season-table';
import NotFoundMessage from '../common/notFoundMessage';

export default function SeasonMembers({
  members,
}: {
  members: SeasonMemberList[];
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

  if (members.length === 0) {
    return (
      <NotFoundMessage message="Aucun membre existant pour cette saison" />
    );
  }

  return (
    <DropdownContextProvider actions={actions}>
      <SeasonTable members={members} />
    </DropdownContextProvider>
  );
}
