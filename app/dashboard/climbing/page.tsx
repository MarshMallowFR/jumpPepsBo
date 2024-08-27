import Pagination from '@/app/ui/common/pagination';
import Search from '@/app/ui/common/search';
import Table from '@/app/ui/climbing/climbing-table';
import { CreateBtn } from '@/app/ui/common/buttons';
import { ClimbingTableSkeleton } from '@/app/ui/common/skeletons';
import { Suspense } from 'react';
import { fetchClimbPages } from '@/app/lib/data';
import Dropdown from '@/app/ui/common/dropdown';

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

  const handleSelect = (value: string) => {
    console.log('Selected:', value);
  };

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
        <Table query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
