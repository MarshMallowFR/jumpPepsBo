import DropdownContextProvider from '@/app/lib/contexts/dropdownmenuContext';
import { MemberList, SeasonMemberList } from '@/app/lib/types/climbing';
import Table from './table';

export default function ClimbingMembers({
  members,
}: {
  members: SeasonMemberList[] | MemberList[];
}) {
  const actions =
    Array.isArray(members) && members.length > 0 && 'hasPaid' in members[0]
      ? [
          {
            label: 'Exporter au format Excel',
            value: 'export',
            action: 'export-excel',
          },
          {
            label: 'Désinscrire plusieurs membres',
            value: 'remove',
            action: 'remove-many',
          },
        ]
      : [
          {
            label: 'Exporter au format Excel',
            value: 'export',
            action: 'export-excel',
          },
          {
            label: 'Supprimer plusieurs membres',
            value: 'delete',
            action: 'delete-many',
          },
        ];

  return (
    <DropdownContextProvider actions={actions}>
      <Table members={members} />
    </DropdownContextProvider>
  );
}
