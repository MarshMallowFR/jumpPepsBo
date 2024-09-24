import { fetchFilteredClimbingMembers } from '@/app/lib/data';
import Table from './table';
import DropdownContextProvider from '@/app/lib/contexts/dropdownmenuContext';
import ToastContextProvider from '@/app/lib/contexts/toastContext';

export default async function ClimbingTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const members = await fetchFilteredClimbingMembers(query, currentPage);

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
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <DropdownContextProvider actions={actions} members={members}>
            <ToastContextProvider>
              <Table members={members} />
            </ToastContextProvider>
          </DropdownContextProvider>
        </div>
      </div>
    </div>
  );
}
