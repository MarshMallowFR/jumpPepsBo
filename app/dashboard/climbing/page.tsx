import Pagination from '@/app/ui/common/pagination';
import Search from '@/app/ui/common/search';
import ClimbingTable from '@/app/ui/climbing/climbing-table';
import { CreateBtn } from '@/app/ui/common/buttons';
import { ClimbingTableSkeleton } from '@/app/ui/common/skeletons';
import { Suspense } from 'react';
import { fetchAllClimbingMembers, fetchClimbPages } from '@/app/lib/data';
import { Member } from '@/app/lib/types/climbing';

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;

  const totalPages = await fetchClimbPages();

  let allMembers: Member[];
  try {
    allMembers = await fetchAllClimbingMembers(query, currentPage);
  } catch (error) {
    console.error(error);
    allMembers = [];
  }

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl">Escalade</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Rechercher des membres..." />
        <CreateBtn href="/dashboard/climbing/create" text="Créer membre" />
      </div>

      <Suspense key={query + currentPage} fallback={<ClimbingTableSkeleton />}>
        <div className="w-full">
          <ClimbingTable allMembers={allMembers} />
        </div>
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
