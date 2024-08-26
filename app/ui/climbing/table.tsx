import { fetchFilteredClimbingMembers } from '@/app/lib/data';
import Table from './climbing-table';

export default async function ClimbingTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const members = await fetchFilteredClimbingMembers(query, currentPage);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <Table members={members} />
        </div>
      </div>
    </div>
  );
}
