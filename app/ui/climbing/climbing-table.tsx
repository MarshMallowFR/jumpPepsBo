import { fetchFilteredClimbingMembers } from '@/app/lib/data';
import Table from './table';
import DropdownContextProvider from '@/app/lib/contexts/dropdownmenuContext';
import { deleteSeveralMembers } from '@/app/lib/actions/climbing/actions';

export default async function ClimbingTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const members = await fetchFilteredClimbingMembers(query, currentPage);

  const handleDeleteMany = async () => {
    const selectedMembers = members
      .filter((member) => selectedStates[member.id])
      .map((member) => ({
        id: member.id,
        imageUrl: member.picture,
      }));

    await deleteSeveralMembers(selectedMembers);
  };

  const actions = [
    {
      label: 'Exporter au format Excel',
      value: 'export',
      action: 'export-pdf',
    },
    {
      label: 'Suppression multiple',
      value: 'delete',
      action: handleDeleteMany,
    },
  ];

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <DropdownContextProvider actions={actions}>
            <Table members={members} />
          </DropdownContextProvider>
        </div>
      </div>
    </div>
  );
}
