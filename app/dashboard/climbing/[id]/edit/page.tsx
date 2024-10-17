import Form from '@/app/ui/climbing/edit-form';
import Breadcrumbs from '@/app/ui/common/breadcrumbs';
import { fetchMemberByIdAndSeasonId } from '@/app/lib/data';
import { notFound } from 'next/navigation';

export default async function Page({
  params,
}: {
  params: { id: string; seasonId: string };
}) {
  const { id, seasonId } = params;
  const member = await fetchMemberByIdAndSeasonId(id, seasonId);

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
