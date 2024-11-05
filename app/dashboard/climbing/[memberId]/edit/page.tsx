import Form from '@/app/ui/climbing/edit-form';
import Breadcrumbs from '@/app/ui/common/breadcrumbs';
import { fetchMemberByIdAndSeasonId } from '@/app/lib/data';
import { notFound } from 'next/navigation';

// export const revalidate = 0; // Disable caching for this page to get updated data

export default async function Page({
  params,
  searchParams,
}: {
  params: { memberId: string };
  searchParams: { seasonId: string };
}) {
  const { memberId } = params;
  const { seasonId } = searchParams;
  const member = await fetchMemberByIdAndSeasonId(memberId, seasonId);

  if (!member) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Membres', href: '/dashboard/climbing' },
          {
            label: 'Editer un membre',
            href: `/dashboard/climbing/${member.id}/edit?seasonId=${seasonId}`,
            active: true,
          },
        ]}
      />
      <Form member={member} />
    </main>
  );
}
