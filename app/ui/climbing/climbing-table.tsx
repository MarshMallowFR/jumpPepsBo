import Table from './table';
import DropdownContextProvider from '@/app/lib/contexts/dropdownmenuContext';
import ToastContextProvider from '@/app/lib/contexts/toastContext';
import SeasonContextProvider from '@/app/lib/contexts/seasonContext';
import MembersManager from './member-management';
import { fetchAllSeasons, fetchAllClimbingMembers } from '@/app/lib/data';

export default async function ClimbingTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const allMembers = await fetchAllClimbingMembers(query, currentPage);
  const seasons = await fetchAllSeasons();

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <ToastContextProvider>
            <SeasonContextProvider seasons={seasons}>
              <MembersManager allMembers={allMembers} />
            </SeasonContextProvider>
          </ToastContextProvider>
        </div>
      </div>
    </div>
  );
}

// const actions = [
//   {
//     label: 'Exporter au format Excel',
//     value: 'export',
//     action: 'export-excel',
//   },
//   {
//     label: 'Suppression multiple',
//     value: 'delete',
//     action: 'delete-many',
//   },
// ];

// return (
//   <div className="mt-6 flow-root">
//     <div className="inline-block min-w-full align-middle">
//       <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
//         <ToastContextProvider>
//           <SeasonContextProvider seasons={seasons}>
//             <DropdownContextProvider actions={actions} members={allMembers}>
//               <Table members={allMembers} />
//             </DropdownContextProvider>
//           </SeasonContextProvider>
//         </ToastContextProvider>
//       </div>
//     </div>
//   </div>
// );
