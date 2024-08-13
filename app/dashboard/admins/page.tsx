import Pagination from '@/app/ui/common/pagination';
import Search from '@/app/ui/common/search';
import Table from '@/app/ui/admins/table';
import { CreateBtn } from '@/app/ui/common/buttons';
import { AdminTableSkeleton } from '@/app/ui/common/skeletons';
import { Suspense } from 'react';
import { fetchAdminsPages } from '@/app/lib/data';

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

  const totalPages = await fetchAdminsPages();

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl">Admins</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Rechercher des admins" />
        <CreateBtn href="/dashboard/admins/create" text="Créer admin" />
      </div>
      <Suspense key={query + currentPage} fallback={<AdminTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
