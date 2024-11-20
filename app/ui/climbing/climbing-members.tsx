import DropdownContextProvider from '@/app/lib/contexts/dropdownmenuContext';
import { MemberList, SeasonMemberList } from '@/app/lib/types/climbing';
import Table from './table';

export default function ClimbingMembers({
  members,
}: {
  members: SeasonMemberList[] | MemberList[];
}) {
  const actions = [
    {
      label: 'Exporter au format Excel',
      value: 'export',
      action: 'export-excel',
    },
    ...(members.length > 0 && 'hasPaid' in members[0] // vérification qu'il y a bien un élément dans le tableau avant de voir si la propriété hasPaid (différencie les deux types possibles pour members) est présente
      ? [
          {
            label: 'Désinscrire plusieurs membres',
            value: 'remove',
            action: 'remove-many',
          },
        ]
      : [
          {
            label: 'Suppression multiple',
            value: 'delete',
            action: 'delete-many',
          },
        ]),
  ];

  return (
    <DropdownContextProvider actions={actions}>
      <Table members={members} />
    </DropdownContextProvider>
  );
}
